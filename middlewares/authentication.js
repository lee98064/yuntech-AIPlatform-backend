const JWT = require("../services/jwt");

module.exports = function (req, res, next) {
  const { token } = req.body;
  const [status, data] = JWT.verify_token(token);

  if (status) {
    return next();
  }

  return res.status(403).json({
    status: false,
    message: "請先登入!",
  });
};
