const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../services/jwt");
const { Op } = require("sequelize");
const { Student } = require("../models");

router.post("/auth/login", async (req, res) => {
  const { account, password } = req.body;

  let isExisted = await Student.count({
    where: { account },
  });

  // 檢查帳號是否存在
  if (isExisted) {
    let student = await Student.findOne({
      where: { account },
    });

    // 比對密碼
    let result = await bcrypt.compare(password, student.password);

    const { id, studentID, email, phone, lineID } = student;

    if (result) {
      return res.json({
        status: true,
        token: JWT.generate_token({
          id,
          studentID,
          email,
          account,
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
  const { studentID, email, name, account, password, phone, lineID } = req.body;

  // 檢查是否存在
  let isExisted = await Student.count({
    where: {
      [Op.or]: {
        email,
        studentID,
        account,
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
    account,
    password: password_hash,
    phone,
  });

  return res.json({ status: true, message: "註冊成功，請前往收信確認！" });
});

module.exports = router;
