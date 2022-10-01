const JWT = require("../services/jwt");

module.exports = function (req, res, next) {
  let token = req.cookies.adminToken;

  if (token == undefined) {
    token = req.body.adminToken;
  }

  const [status, data] = JWT.verify_token(token);

  if (!status || data.type != "admin") {
    return res.status(403).json({
      status: false,
      message: "請先登入!",
    });
  }

  req.tokenInfo = data;
  return next();
};
