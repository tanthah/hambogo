const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller.js");

const authController = new AuthController();

// GET /login2 - Hiển thị trang login
router.get("/login2", (req, res) => {
  res.render("public/login2", {
    // Thêm 'public/' nếu view nằm trong thư mục public
    csrfToken: req.csrfToken(),
    messages: req.flash() || {}, // Thêm flash messages nếu có
  });
});

// POST /login2 - Xử lý đăng nhập
router.post("/login2", authController.login);

// GET /register2 - Hiển thị trang đăng ký
router.get("/register2", (req, res) => {
  res.render("public/register2", {
    csrfToken: req.csrfToken(),
    messages: req.flash() || {},
  });
});

// POST /register2 - Xử lý đăng ký
router.post("/register2", authController.register);

// Refresh token route
router.post("/refresh-token", authController.refreshToken);

// Logout route
router.post("/logout2", authController.logout);

module.exports = router;
