const mailer = require("nodemailer");

const sendEmail = async options => {
  const transport = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASSWORD
    }
  });

  const message = {
    form: `${process.env.FROM_NAME}<${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.message
  };
  const info = await transporter.sendMail(message);
};
module.exports = sendEmail;
