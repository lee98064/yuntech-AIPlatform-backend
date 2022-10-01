const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Student, Group } = require("../../models");

router.post("/student/search", async (req, res) => {
  const { keyword } = req.body;

  const student = await Student.findOne({
    where: {
      studentID: keyword.toUpperCase(),
    },
    include: [
      {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        model: Group,
      },
    ],
  });

  if (student == null) {
    return res.status(404).json({
      status: false,
      message: "找不到此學生！",
    });
  }

  return res.json(student);
});

module.exports = router;
