const { Op } = require("sequelize");
const { Student } = require("../models");

module.exports = async function (req, res, next) {
  const { members } = req.body;
  const tokenInfo = req.tokenInfo;

  if (
    members.length > parseInt(process.env.GROUP_MEMBER_MAX) ||
    members.length == 0
  ) {
    return res.status(400).json({
      status: false,
      message: `超過人數上限，每隊上限${process.env.GROUP_MEMBER_MAX}人！`,
    });
  }

  let studentList = [];
  for (let [index, member] of members.entries()) {
    if (index == 0 && member.studentID != tokenInfo.studentID) {
      return res.status(403).json({
        status: false,
        message: "請勿幫他人報名！",
      });
    }

    member.studentID = member.studentID.toUpperCase();
    // 檢查是否送來一樣的學生
    if (studentList.includes(member.studentID)) {
      return res.status(409).json({
        status: false,
        message: "組員清單中有重複的學號！！",
      });
    }
    studentList.push(member.studentID);

    const emailIsExisted = await Student.count({
      where: {
        email: member.email,
        [Op.not]: {
          studentID: member.studentID,
        },
      },
    });

    if (emailIsExisted) {
      return res.status(409).json({
        status: false,
        message: "組員清單中有人Email已被他人使用！！",
      });
    }

    const student = await Student.findOne({
      where: {
        studentID: member.studentID,
      },
    });

    if (student == null) {
      continue;
    }

    if (student.GroupId != null) {
      return res.status(409).json({
        status: false,
        message: "組員清單中有人已有組別！！",
      });
    }
  }
  return next();
};
