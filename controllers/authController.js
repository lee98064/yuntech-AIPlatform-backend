const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../services/jwt");
const { Op } = require("sequelize");
const { Student, PasswordReset } = require("../models");
const authentication = require("../middlewares/authentication");

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
        studentID,
      },
    },
  });

  if (isExisted) {
    return res
      .status(409)
      .json({ status: false, message: "帳號，學號，Email重複註冊！" });
  }

  // hash Password
  let password_hash = await bcrypt.hash(password, 10);
  const student = await Student.create({
    studentID,
    email,
    name,
    password: password_hash,
    lineID,
    phone,
  });

  return res.json({ status: true, message: "註冊成功，請前往收信確認！" });
});

router.post("/auth/resetPassword", async (req, res) => {
  const { token, password } = req.body;
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
