const express = require("express");
const router = express.Router();
const { Student, Group } = require("../models");
const verifySignUpData = require("../middlewares/verifySignUpData");
const notSignUp = require("../middlewares/notSignUp");

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
      if (obj)
        return obj.update({
          GroupId: group.id,
          isLeader: tokenInfo.studentID == member.studentID && index == 0,
        });

      // insert
      return Student.create({
        studentID: member.studentID,
        GroupId: group.id,
        name: member.name,
        email: member.email,
      });
    });
  }
  return res.json({
    status: true,
    message: "報名成功！",
  });
});

router.get("/signUp/checkStudentId", async (req, res) => {
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
