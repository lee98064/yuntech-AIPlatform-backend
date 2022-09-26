const { Student } = require("../models");
module.exports = async function (req, res, next) {
  const student = await Student.findOne({
    where: {
      id: req.tokenInfo.id,
    },
  });

  if (student.GroupId == null) {
    return next();
  }

  return res.status(409).json({
    status: false,
    message: "您已報名過，無法重複報名！",
  });
};
