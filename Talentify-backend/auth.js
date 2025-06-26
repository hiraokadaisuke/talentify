const jwt = require('jsonwebtoken');

// Middleware factory to verify JWT from the "access" cookie.
// Optionally restricts access to users with allowed roles.
// Usage: app.get('/path', auth(), handler)
//        app.get('/admin', auth(['store']), handler)
module.exports = function auth(allowedRoles = []) {
  return function (req, res, next) {
    try {
      const token = req.cookies?.access;
      if (!token) {
        return res.status(401).json({ message: '認証トークンがありません' });
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = { id: payload.userId, role: payload.role };
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ message: '権限がありません' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'トークンが無効です' });
    }
  };
};
