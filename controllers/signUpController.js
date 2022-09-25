const express = require("express");
const router = express.Router();
const { Student, Group } = require("../models");

router.get("/signUp", async (req, res) => {
  const tokenInfo = req.tokenInfo;
  const student = await Student.findOne({
    where: { id: tokenInfo.id },
    attributes: {
      exclude: ["password", "GroupId"],
    },
    include: [
      {
        model: Group,
      },
    ],
  });

  return res.json(student);
});

module.exports = router;
