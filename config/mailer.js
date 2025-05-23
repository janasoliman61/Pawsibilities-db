// config/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_PASS, // an App Password, not your normal login
  },
});

// export a sendMail helper for your controllers to use
module.exports.sendMail = (mailOptions) => transporter.sendMail(mailOptions);
