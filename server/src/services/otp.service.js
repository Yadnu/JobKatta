import axios from 'axios';
import db from '../config/database.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (mobile, purpose, userId = null) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.otpRecord.create({ data: { mobile, otp, purpose, expiresAt, userId } });

  if (process.env.NODE_ENV === 'production') {
    await axios.get('https://api.msg91.com/api/v5/otp', {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${mobile}`,
        otp,
        sender: process.env.MSG91_SENDER_ID || 'JOBKTA',
      },
    });
  } else {
    console.log(`[OTP DEV] Mobile: ${mobile} | OTP: ${otp} | Purpose: ${purpose}`);
  }

  return otp;
};

export const verifyOtp = async (mobile, otp, purpose) => {
  const record = await db.otpRecord.findFirst({
    where: { mobile, otp, purpose, isUsed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return false;
  await db.otpRecord.update({ where: { id: record.id }, data: { isUsed: true } });
  return true;
};
