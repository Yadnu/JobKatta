import axios from 'axios';
import { getCache, setCache, deleteCache } from '../utils/cache.util.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const otpKey = (mobile, purpose) => `otp:${mobile}:${purpose}`;

export const sendOtp = async (mobile, purpose) => {
  const otp = generateOtp();

  await setCache(otpKey(mobile, purpose), otp, 600);

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
  const stored = await getCache(otpKey(mobile, purpose));
  if (!stored || stored !== otp) return false;
  await deleteCache(otpKey(mobile, purpose));
  return true;
};
