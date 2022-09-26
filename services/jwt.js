const jwt = require("jsonwebtoken");

class JWT {
  static generate_token(data) {
    return jwt.sign(data, process.env.JWT_SIGN_SECRET, {
      expiresIn: "18000s",
    });
  }

  static verify_token(token) {
    try {
      return [true, jwt.verify(token, process.env.JWT_SIGN_SECRET)];
    } catch {
      return [false, "Error!"];
    }
  }
}

module.exports = JWT;
