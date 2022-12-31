const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../../services/jwt");
const { Op } = require("sequelize");
const { User } = require("../../models");
const adminAuthentication = require("../../middlewares/adminAuthentication");
const requestIp = require("request-ip");

router.post("/auth/login", async (req, res) => {
  const { account, password } = req.body;
  const user = await User.findOne({
    where: {
      account,
    },
  });

  if (user == null) {
    mgdb.collection("auth").insertOne({
      method: "adminlogin",
      status: false,
      account,
      datetime: new Date(),
      ip: requestIp.getClientIp(req),
    });
    return res.status(401).json({
      status: false,
      message: "帳號或密碼錯誤！",
    });
  }

  let result = await bcrypt.compare(password, user.password);

  if (result) {
    mgdb.collection("auth").insertOne({
      method: "adminlogin",
      status: true,
      account,
      datetime: new Date(),
      ip: requestIp.getClientIp(req),
    });
    return res.json({
      status: true,
      token: JWT.generate_token({
        type: "admin",
        id: user.id,
        account: user.account,
        email: user.email,
      }),
    });
  }

  mgdb.collection("auth").insertOne({
    method: "adminlogin",
    status: false,
    account,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  return res.status(401).json({
    status: false,
    message: "帳號或密碼錯誤！",
  });
});

router.get("/auth/isLogin", adminAuthentication, async (req, res) => {
  return res.json({
    status: true,
  });
});

module.exports = router;
