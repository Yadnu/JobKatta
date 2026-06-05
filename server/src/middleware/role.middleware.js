export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  next();
};

export const requireAdmin = requireRole('ADMIN');
export const requireEmployer = requireRole('EMPLOYER');
export const requireCandidate = requireRole('CANDIDATE');
