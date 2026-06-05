import bcrypt from 'bcryptjs';

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
export const hashToken = (token) => bcrypt.hash(token, 10);
export const compareToken = (token, hash) => bcrypt.compare(token, hash);
