// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:     +process.env.SMTP_PORT,
  secure:   true, // true if port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = ({ to, subject, text, html }) =>
  transporter.sendMail({
    from: `"Pawsibilities" <${process.env.SMTP_FROM}>`,
    to, subject, text, html
  });
