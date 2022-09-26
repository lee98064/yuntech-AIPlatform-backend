const express = require("express");
const router = express.Router();
const { Student, Group } = require("../models");

router.get("/user", async (req, res) => {
  const tokenInfo = req.tokenInfo;
  const student = await Student.findOne({
    where: { id: tokenInfo.id },
    attributes: {
      exclude: ["password", "GroupId", "isLeader"],
    },
  });

  return res.json(student);
});

router.get("/user/group", async (req, res) => {
  const tokenInfo = req.tokenInfo;
  const student = await Student.findOne({
    where: { id: tokenInfo.id },
  });

  if (student == null || student.GroupId == null) {
    return res.status(404).json({
      message: "目前沒有組別！",
    });
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

  return res.json(group);
});

module.exports = router;
