const express = require("express");
const router = express.Router();
const fs = require("fs");
const { Op } = require("sequelize");
const { Student, Group } = require("../../models");
const Mailer = require("../../services/mailer");
const requestIp = require("request-ip");

router.get("/verify", async (req, res) => {
  const students = await Student.findAll({
    where: {
      isVerify: false,
      GroupId: {
        [Op.ne]: null,
      },
      studentImg: {
        [Op.ne]: null,
      },
    },
    attributes: {
      exclude: ["password", "createdAt", "updatedAt"],
    },
    include: [
      {
        attributes: {
          exclude: ["inviteCode", "isVerify", "createdAt", "updatedAt"],
        },
        model: Group,
      },
    ],
  });
  return res.json(students);
});

router.post("/verify/pass", async (req, res) => {
  const { studentID } = req.body;
  const student = await Student.findOne({
    where: {
      id: studentID,
    },
  });

  if (student == null) {
    return res.status(404).json({
      status: false,
      message: "不存在此學生！",
    });
  }

  student.isVerify = true;
  await student.save();

  if (student.GroupId == null) {
    return res.status(200).json({ status: true });
  }

  const group = await Group.findOne({
    where: { id: student.GroupId },
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

  let allVerify = true;
  for (const std of group.Students) {
    if (!std.isVerify) {
      allVerify = false;
      break;
    }
  }

  if (allVerify) {
    group.isVerify = true;
    await group.save();
  }

  let content = `
        您好,${student.name} 同學： <br>
        您的學生證審核結果為：通過審核<br>
        感謝您報名參加競賽，後續最新消息將公佈在網頁上！
        <a href="${process.env.FRONTEND_DOMAIN}/">點我前往網頁</a><br>
      `;

  const mailer = new Mailer();
  mailer.sendMail(student.email, "AI 賽車報名平台", content);
  
  mgdb.collection("admin").insertOne({
    method: "verify",
    status: true,
    studentID: student.studentID,
    studentName: student.name,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });

  return res.status(200).json({ status: true });
});

router.post("/verify/unpass", async (req, res) => {
  const { studentID, reason } = req.body;
  const student = await Student.findOne({
    where: {
      id: studentID,
    },
  });

  fs.unlinkSync(student.studentImg);

  student.studentImg = null;
  await student.save();

  let content = `
        您好,${student.name} 同學： <br>
        您的學生證審核結果為：未通過審核<br>
        原因：${reason} <br>
        <a href="${process.env.FRONTEND_DOMAIN}/">點我前往重新上傳</a><br>
      `;

  const mailer = new Mailer();
  mailer.sendMail(student.email, "AI 賽車報名平台", content);

  mgdb.collection("admin").insertOne({
    method: "verify",
    status: false,
    studentID: student.studentID,
    studentName: student.name,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  
  return res.status(200).json({ status: true });
});

router.get("/verify/studentImg/:id", async (req, res) => {
  const student = await Student.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (student.studentImg == null) {
    return res.sendStatus(404);
  }

  res.download(student.studentImg);
});

module.exports = router;
