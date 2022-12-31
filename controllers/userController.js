const express = require("express");
const router = express.Router();
const fs = require("fs");
const { Student, Group } = require("../models");
const requestIp = require("request-ip");

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

function getExtension(filename) {
  var i = filename.lastIndexOf(".");
  return i < 0 ? "" : filename.substr(i);
}

router.post("/user/upload", async (req, res) => {
  const tokenInfo = req.tokenInfo;

  const student = await Student.findOne({
    where: {
      id: tokenInfo.id,
    },
  });

  try {
    if (!req.files) {
      return res.status(500).send({
        status: false,
        message: "沒有上傳檔案！！",
      });
    }

    //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
    let image = req.files.image;

    //Use the mv() method to place the file in the upload directory (i.e. "uploads")
    let path = `./uploads/${student.studentID}${getExtension(image.name)}`;
    image.mv(path);

    if (student.studentImg != null) {
      fs.unlinkSync(student.studentImg);
    }

    student.studentImg = path;
    student.isVerify = false;

    await student.save();

    await Group.update(
      {
        isVerify: false,
      },
      {
        where: {
          id: student.GroupId,
        },
      }
    );

    mgdb.collection("student").insertOne({
      method: "uploadFile",
      path: student.studentImg,
      filename: `${student.studentID}${getExtension(image.name)}`,
      student: student.studentID,
      studentName: student.name,
      datetime: new Date(),
      ip: requestIp.getClientIp(req),
    });

    //send response
    res.send({
      status: true,
      message: "上傳成功！",
      data: {
        name: image.name,
        mimetype: image.mimetype,
        size: image.size,
      },
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/user/studentImg", async (req, res) => {
  const tokenInfo = req.tokenInfo;

  const student = await Student.findOne({
    where: {
      id: tokenInfo.id,
    },
  });

  if (student.studentImg == null) {
    return res.sendStatus(404);
  }

  res.download(student.studentImg); // Set disposition and send it.
});

router.patch("/user/edit", async (req, res) => {
  const tokenInfo = req.tokenInfo;
  const { email, name, phone, lineID } = req.body;

  const student = await Student.update(
    {
      email,
      name,
      phone,
      lineID,
    },
    {
      where: {
        id: tokenInfo.id,
      },
    }
  )
    .then((result) => {})
    .catch((err) => {
      return res.status(500).json({
        status: false,
        message: "更新失敗，請檢查欄位是否都有填上！",
      });
    });
  mgdb.collection("student").insertOne({
    method: "updateUserData",
    student: tokenInfo.studentID,
    studentName: name,
    email,
    phone,
    lineID,
    datetime: new Date(),
    ip: requestIp.getClientIp(req),
  });
  return res.json({
    status: true,
    message: "更新成功！",
  });
});

module.exports = router;
