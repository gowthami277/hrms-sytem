const jwt = require("jsonwebtoken");

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    // Support "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = authMiddleware;
