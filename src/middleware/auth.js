const jwt = require("jsonwebtoken");
const UsersController = require("../controllers/users.js");
const User = new UsersController();

const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

const optionalAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      req.user = decoded;
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
};

module.exports = { authenticateToken, optionalAuth };
