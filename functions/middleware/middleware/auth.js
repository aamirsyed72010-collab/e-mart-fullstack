const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({msg: 'Not authenticated'});
};

const ensureRole = (role) => (req, res, next) => {
  if (req.isAuthenticated() && req.user && (req.user.role === role || req.user.role === 'admin')) {
    return next();
  }
  res.status(403).json({msg: `Forbidden: Requires ${role} role`});
};

module.exports = {
  ensureAuthenticated,
  ensureRole,
};
