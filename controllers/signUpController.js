const express = require("express");
const router = express.Router();
const { Student, Group, PasswordReset } = require("../models");
const verifySignUpData = require("../middlewares/verifySignUpData");
const notSignUp = require("../middlewares/notSignUp");
const Mailer = require("../services/mailer");
const RandomString = require("../services/randomString");

router.post("/signUp/createGroup", async (req, res) => {
  const tokenInfo = req.tokenInfo;
  const { groupName } = req.body;

  const student = await Student.findOne({
    where: {
      id: tokenInfo.id,
    },
  });

  if (student.GroupId != null) {
    return res.status(409).json({
      status: false,
      message: "您已經有組別！無法建立組別！",
    });
  }

  let inviteCode;
  while (true) {
    inviteCode = RandomString.generateRandomString(5);

    const isExisted = await Group.count({
      where: {
        inviteCode,
      },
    });

    if (!isExisted) {
      break;
    }
  }

  // const groupLast = await Group.findOne({
  //   attributes: ["id"],
  //   order: [["id", "DESC"]],
  // });

  // let groupLastId = 1;
  // if (groupLast != null) {
  //   groupLastId = groupLast.id + 1;
  // }

  // 建立組別
  const group = await Group.create({
    // id: groupLastId,
    // name: `${process.env.GROUP_NAME_PREFIX}${groupLastId}`,
    name: groupName,
    inviteCode,
  });

  student.isLeader = true;
  student.GroupId = group.id;

  await student.save();

  return res.json({
    status: true,
    message: "組別建立成功！",
  });
});

router.post("/signUp/joinGroup", async (req, res) => {
  const { inviteCode } = req.body;
  const tokenInfo = req.tokenInfo;

  const group = await Group.findOne({
    where: {
      inviteCode,
    },
    include: [
      {
        attributes: {
          exclude: [
            "studentImg",
            "password",
            "GroupId",
            "createdAt",
            "updatedAt",
          ],
        },
        model: Student,
      },
    ],
  });

  if (group == null) {
    return res.status(404).json({
      status: false,
      message: "邀請碼不存在！",
    });
  }

  if (group.Students.length >= parseInt(process.env.GROUP_MEMBER_MAX)) {
    return res.status(403).json({
      status: false,
      message: "該隊已滿人！",
    });
  }

  const student = await Student.findOne({
    where: {
      id: tokenInfo.id,
    },
  });

  student.GroupId = group.id;
  student.isLeader = false;
  await student.save();

  return res.json({
    status: true,
    message: "成功加入團隊！",
  });
});

router.get("/signUp/isInGroup", async (req, res) => {
  const tokenInfo = req.tokenInfo;

  const student = await Student.findOne({
    where: {
      id: tokenInfo.id,
    },
  });

  if (student.GroupId == null) {
    return res.json({
      status: true,
      isInGroup: false,
      message: "尚未加入任何組別！",
    });
  }

  return res.json({
    status: true,
    isInGroup: true,
    message: "已有組別！",
  });
});

// router.post("/signUp", notSignUp, verifySignUpData, async (req, res) => {
//   const { members } = req.body;
//   const tokenInfo = req.tokenInfo;
//   const groupLast = await Group.findOne({
//     attributes: ["id"],
//     order: [["id", "DESC"]],
//   });

//   let groupLastId = 1;
//   if (groupLast != null) {
//     groupLastId = groupLast.id + 1;
//   }

//   // 建立組別
//   const group = await Group.create({
//     id: groupLastId,
//     name: `${process.env.GROUP_NAME_PREFIX}${groupLastId}`,
//   });

//   for (let [index, member] of members.entries()) {
//     member.studentID = member.studentID.toUpperCase();
//     const student = await Student.findOne({
//       where: { studentID: member.studentID },
//     }).then(function (obj) {
//       // update
//       if (obj) {
//         return obj.update({
//           GroupId: group.id,
//           isLeader: tokenInfo.studentID == member.studentID && index == 0,
//         });
//       }

//       // insert
//       return Student.create({
//         studentID: member.studentID,
//         GroupId: group.id,
//         name: member.name,
//         email: member.email,
//       });
//     });

//     let content = "";
//     if (student.password == null) {
//       let token = "";
//       while (true) {
//         token = RandomString.generateRandomString(30);

//         const isExisted = await PasswordReset.count({
//           where: {
//             token,
//           },
//         });

//         if (!isExisted) {
//           break;
//         }
//       }

//       const passwordReset = await PasswordReset.create({
//         token,
//         StudentId: student.id,
//       });

//       content = `
//         您好,${student.name} 同學： <br>
//         我們已收到您的報名資訊，以下是登入網址，請先前往設定密碼後，再上傳您的學生證與相關資料：<br>
//         <a href="${process.env.FRONTEND_DOMAIN}/auth/passwordReset?token=${passwordReset.token}">點我前往設定密碼</a>
//       `;
//     } else {
//       content = `
//         您好,${student.name} 同學： <br>
//         我們已收到您的報名資訊，以下是登入網址，請前往上傳您的學生證與相關資料：<br>
//         <a href="${process.env.FRONTEND_DOMAIN}">點我前往填寫相關資料</a>
//       `;
//     }

//     const mailer = new Mailer();
//     mailer.sendMail("lee98064@gmail.com", "AI 報名平台報名資料", content);
//   }

//   return res.json({
//     status: true,
//     message: "報名成功！",
//   });
// });

// router.get("/test", async (req, res) => {
//   return res.send(RandomString.generateRandomString(30));
// });

// router.get("/signUp/isSignUp", async (req, res) => {
//   const tokenInfo = req.tokenInfo;
//   const student = await Student.findOne({
//     where: {
//       id: tokenInfo.id,
//     },
//   });

//   if (student.GroupId == null) {
//     return res.json({
//       status: true,
//       isSignUp: false,
//       message: "尚未報名！",
//     });
//   }

//   return res.status(409).json({
//     status: false,
//     isSignUp: true,
//     message: "您已報名過！",
//   });
// });

// router.get("/signUp/checkStudentId", notSignUp, async (req, res) => {
//   const { studentID } = req.body;

//   const student = await Student.findOne({
//     where: {
//       studentID,
//     },
//   });

//   // 沒註冊過
//   if (student == null) {
//     return res.sendStatus(404);
//   }

//   // 註冊過也是其他組組員
//   if (student.GroupId != null) {
//     return res.sendStatus(409);
//   }

//   // 有註冊過但不屬於任何一組
//   return res.sendStatus(200);
// });

module.exports = router;
