const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../services/jwt");
const { Op } = require("sequelize");
const { Student, PasswordReset } = require("../models");
const authentication = require("../middlewares/authentication");
const Mailer = require("../services/mailer");
const RandomString = require("../services/randomString");
const db = require("../models");
const requestIp = require("request-ip");

router.post("/auth/login", async (req, res) => {
  var { studentID, password } = req.body;

  if (password == "") {
    return res.status(401).json({
      status: false,
      message: "登入失敗！請檢查帳號或密碼！",
    });
  }

  // 把學號第一碼大寫
  studentID = studentID.toUpperCase();

  // 檢查帳號是否存在
  let isExisted = await Student.count({
    where: { studentID },
  });

  // 檢查帳號是否存在
  if (isExisted) {
    let student = await Student.findOne({
      where: { studentID },
    });

    // 比對密碼
    let result = await bcrypt.compare(password, student.password);

    const { id, email, phone, lineID } = student;

    // 如果比對正確
    if (result) {
      mgdb.collection("auth").insertOne({
        method: "login",
        status: true,
        account: studentID,
        datetime: new Date(),
        ip: requestIp.getClientIp(req),
      });
      return res.json({
        status: true,
        token: JWT.generate_token({
          type: "student",
          id,
          studentID,
          email,
          phone,
          lineID,
        }),
      });
    }
  }

  mgdb.collection("auth").insertOne({
    method: "login",
    status: false,
    account: studentID,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  return res.status(401).json({
    status: false,
    message: "登入失敗！請檢查帳號或密碼！",
  });
});

router.post("/auth/register", async (req, res) => {
  const { studentID, email, name, password, phone, lineID } = req.body;

  // 檢查是否存在
  let isExisted = await Student.count({
    where: {
      [Op.or]: {
        email,
        studentID: studentID.toUpperCase(),
      },
    },
  });

  if (isExisted) {
    mgdb.collection("auth").insertOne(
      {
        method: "register",
        status: false,
        account: studentID.toUpperCase(),
        email,
        name,
        lineID,
        phone,
        datetime: new Date(),
        ip: requestIp.getClientIp(req),
      },
      (err, result) => {
        if (err) console.log(err);
        return res
          .status(409)
          .json({ status: false, message: "帳號，學號，Email重複註冊！" });
      }
    );
  }

  // hash Password
  let password_hash = await bcrypt.hash(password, 10);
  const student = await Student.create({
    studentID: studentID.toUpperCase(),
    email,
    name,
    password: password_hash,
    lineID,
    phone,
  });

  mgdb.collection("auth").insertOne({
    method: "register",
    status: true,
    account: studentID.toUpperCase(),
    email,
    name,
    lineID,
    phone,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  return res.json({ status: true, message: "註冊成功，請前往收信確認！" });
});

router.post("/auth/forget", async (req, res) => {
  const { studentID, email } = req.body;

  const student = await Student.findOne({
    where: {
      studentID: studentID.toUpperCase(),
      email,
    },
  });

  if (student == null) {
    return res
      .status(404)
      .json({ status: false, message: "此學號和Email不存在！" });
  }

  let token = "";
  while (true) {
    token = RandomString.generateRandomString(30);

    const isExisted = await PasswordReset.count({
      where: {
        token,
      },
    });

    if (!isExisted) {
      break;
    }
  }

  // 刪除舊Token
  await PasswordReset.destroy({
    where: {
      StudentId: student.id,
    },
  });

  const passwordReset = await PasswordReset.create({
    token,
    StudentId: student.id,
  });

  let content = `
        您好,${student.name} 同學： <br>
        我們已收到您要求重設密碼，以下是重設網址：<br>
        <a href="${process.env.FRONTEND_DOMAIN}/auth/resetPassword?token=${passwordReset.token}">點我前往重設密碼</a><br>
        <h3 color="red">請注意！如果非本人操作請勿理會！</h3>
      `;

  const mailer = new Mailer();
  mailer.sendMail(student.email, "AI 報名平台報名資料", content);

  mgdb.collection("auth").insertOne({
    method: "forget",
    status: true,
    account: studentID.toUpperCase(),
    email,
    resetToken: passwordReset.token,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  return res.json({
    status: true,
    message: "已送出重設信，請前往收信！",
  });
});

router.post("/auth/resetPassword", async (req, res) => {
  const { token, password } = req.body;

  if (password == undefined || password == null || password == "") {
    return res.status(403).json({ status: false, message: "密碼不可為空！" });
  }

  const passwordReset = await PasswordReset.findOne({
    where: {
      token,
    },
  });

  if (passwordReset == null) {
    return res
      .status(404)
      .json({ status: false, message: "此Token失效或不存在，請重新申請！" });
  }

  // 檢查是否超過一天
  createDate = Date.parse(passwordReset.createdAt);
  nowDate = Date.parse(new Date());
  iDays = parseInt(Math.abs(nowDate - createDate) / 1000 / 60 / 60 / 24);
  if (iDays > 1) {
    await passwordReset.destroy();
    return res
      .status(404)
      .json({ status: false, message: "此Token失效或不存在，請重新申請！" });
  }

  // hash Password
  let password_hash = await bcrypt.hash(password, 10);
  const student = await Student.update(
    {
      password: password_hash,
    },
    {
      where: {
        id: passwordReset.StudentId,
      },
    }
  );
  await passwordReset.destroy();

  mgdb.collection("auth").insertOne({
    method: "resetpassword",
    status: true,
    resetToken,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  return res.json({
    status: true,
    message: "密碼設定成功！",
  });
});

router.get("/auth/isLogin", authentication, async (req, res) => {
  return res.json({
    status: true,
  });
});

module.exports = router;
