const nodemailer = require("nodemailer");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  sendMail(to, subject, content) {
    this.transporter
      .sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html: content,
      })
      .then((info) => {
        console.log({ info });
      })
      .catch(console.error);
  }
}

module.exports = Mailer;
