const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const authController = new AuthController();

// ===== GET ROUTES - Hiển thị trang =====
router.get("/register", (req, res) => {
  res.render("public/register", {
    csrfToken: req.csrfToken(),
    messages: req.flash() || {},
  });
});

router.get("/login", (req, res) => {
  res.render("public/login", {
    csrfToken: req.csrfToken(),
    messages: req.flash() || {},
  });
});

router.get("/profile", authMiddleware, authController.getProfile);

// ===== POST ROUTES - Xử lý action =====
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/reset-password", authController.changePassword);
router.post(
  "/change-password",
  authMiddleware,
  authController.changePassword
);
router.post("/logout", authMiddleware, authController.logout);

// ===== PUT ROUTES =====
router.put("/profile", authMiddleware, authController.updateProfile);

module.exports = router;
