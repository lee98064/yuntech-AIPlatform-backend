module.exports = async function (req, res, next) {
  const now = new Date();
  const startData = new Date(process.env.CONTEST_START);
  const endData = new Date(process.env.CONTEST_END);

  if (now >= startData && now <= endData) {
    return next();
  }

  return res.status(403).json({
    status: false,
    message: "目前不是報名期間！！",
  });
};
