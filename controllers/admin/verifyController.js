const express = require("express");
const router = express.Router();
const fs = require("fs");
const { Op } = require("sequelize");
const { Student, Group } = require("../../models");

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
