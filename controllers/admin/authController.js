const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const JWT = require("../../services/jwt");
const { Op } = require("sequelize");
const { User } = require("../../models");
const adminAuthentication = require("../../middlewares/adminAuthentication");

router.post("/auth/login", async (req, res) => {
  const { account, password } = req.body;
  const user = await User.findOne({
    where: {
      account,
    },
  });

  if (user == null) {
    return res.status(401).json({
      status: false,
      message: "帳號或密碼錯誤！",
    });
  }

  let result = await bcrypt.compare(password, user.password);

  if (result) {
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
