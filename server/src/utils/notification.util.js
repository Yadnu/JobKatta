import db from '../config/database.js';

export const createNotification = ({ userId, type, title, message, link }) =>
  db.notification
    .create({ data: { userId, type, title, message, link } })
    .catch(() => {});
