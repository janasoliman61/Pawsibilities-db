// services/notificationService.js
const Notification = require('../models/Notification');
const fcm = require('./firebase');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

async function sendNotification({ toUserId, type, title, body, data }) {
  // 1) persist in DB
  const notif = await Notification.create({ to: toUserId, type, title, body, data });

  // 2) push via FCM
  const user = await User.findById(toUserId);
  if (user.deviceTokens?.length) {
    const messages = user.deviceTokens.map(dt => ({
      token: dt.token,
      notification: { title, body },
      data: data || {}
    }));
    await fcm.sendAll(messages);
  }

  // 3) optional: send email
  if (type === 'match') {
    await sendEmail({
      to: user.email,
      subject: `New match! 🐾`,
      text: body
    });
  }

  return notif;
}

module.exports = { sendNotification };
