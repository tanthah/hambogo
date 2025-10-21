
const rateLimit = require("express-rate-limit");

// 🔒 RATE LIMITER CHO SQLMAP/ATTACKS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests/15 phút
  message: {
    status: "Error",
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // 🎯 SKIP CHO LOCALHOST (development)
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  },
  
  // 🚨 LOG KHI BỊ RATE LIMIT
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded: ${req.ip} - ${req.path}`);
    
    res.status(429).json({
      status: "Error",
      statusCode: 429,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

// 🔥 STRICT LIMITER CHO LOGIN/REGISTER (chống brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Chỉ 5 lần đăng nhập/15 phút
  skipSuccessfulRequests: true, // Không đếm request thành công
  message: {
    status: "Error",
    statusCode: 429,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
});

module.exports = { apiLimiter, authLimiter };