const { ROLES } = require("../utils/constants");
const jwt = require("jsonwebtoken");

module.exports = {
  verifyUser: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== ROLES.USER) return res.status(403).json({ message: "Unauthorized" });
    req.user = payload;
    next();
  },
  verifyOfficer: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== ROLES.OFFICER) return res.status(403).json({ message: "Unauthorized" });
    req.user = payload;
    next();
  },
  verifyAdmin: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== ROLES.ADMIN) return res.status(403).json({ message: "Unauthorized" });
    req.user = payload;
    next();
  },
  verifyUserOrAdmin: (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "No token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  }
};
