const express = require("express");
const router = express.Router();
const { Student, Group } = require("../models");
const verifySignUpData = require("../middlewares/verifySignUpData");
const notSignUp = require("../middlewares/notSignUp");
const Mailer = require("../services/mailer");

router.post("/signUp", notSignUp, verifySignUpData, async (req, res) => {
  const { members } = req.body;
  const tokenInfo = req.tokenInfo;
  const groupLast = await Group.findOne({
    attributes: ["id"],
    order: [["id", "DESC"]],
  });

  let groupLastId = 1;
  if (groupLast != null) {
    groupLastId = groupLast.id + 1;
  }

  // 建立組別
  const group = await Group.create({
    id: groupLastId,
    name: `${process.env.GROUP_NAME_PREFIX}${groupLastId}`,
  });

  for (let [index, member] of members.entries()) {
    const student = await Student.findOne({
      where: { studentID: member.studentID },
    }).then(function (obj) {
      // update
      if (obj) {
        return obj.update({
          GroupId: group.id,
          isLeader: tokenInfo.studentID == member.studentID && index == 0,
        });
      }

      // insert
      return Student.create({
        studentID: member.studentID,
        GroupId: group.id,
        name: member.name,
        email: member.email,
      });
    });

    let content = "";
    if (student.password == null) {
      content = `
        您好,${student.name} 同學： <br>
        我們已收到您的報名資訊，以下是登入網址，請先前往設定密碼後，再上傳您的學生證與相關資料：<br>
        <a href="${process.env.DOMAIN}">點我前往設定密碼</a>
      `;
    } else {
      content = `
        您好,${student.name} 同學： <br>
        我們已收到您的報名資訊，以下是登入網址，請前往上傳您的學生證與相關資料：<br>
        <a href="${process.env.DOMAIN}">點我前往填寫相關資料</a>
      `;
    }

    const mailer = new Mailer();
    mailer.sendMail("lee98064@gmail.com", "AI 報名平台報名資料", content);
  }

  return res.json({
    status: true,
    message: "報名成功！",
  });
});

router.get("/signUp/isSignUp", async (req, res) => {
  const tokenInfo = req.tokenInfo;
  const student = await Student.findOne({
    where: {
      id: tokenInfo.id,
    },
  });

  if (student.GroupId == null) {
    return res.json({
      status: true,
      isSignUp: false,
      message: "尚未報名！",
    });
  }

  return res.status(409).json({
    status: false,
    isSignUp: true,
    message: "您已報名過！",
  });
});

router.get("/signUp/checkStudentId", notSignUp, async (req, res) => {
  const { studentID } = req.body;

  const student = await Student.findOne({
    where: {
      studentID,
    },
  });

  // 沒註冊過
  if (student == null) {
    return res.sendStatus(404);
  }

  // 註冊過也是其他組組員
  if (student.GroupId != null) {
    return res.sendStatus(409);
  }

  // 有註冊過但不屬於任何一組
  return res.sendStatus(200);
});

module.exports = router;
