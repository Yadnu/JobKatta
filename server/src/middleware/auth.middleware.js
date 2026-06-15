import { verifyAccessToken } from '../utils/jwt.util.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    req.user = { id: decoded.id, role: decoded.role };
  } catch {
    // invalid token — proceed as unauthenticated
  }
  next();
};
