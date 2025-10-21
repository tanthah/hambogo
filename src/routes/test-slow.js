// 📁 routes/test-slow.js
const express = require("express");
const router = express.Router();

// API cố tình chậm để test performance monitoring
router.get("/test-slow", async (req, res) => {
  console.log("🐌 Simulating slow API (4000ms delay)...");

  // Tạo delay 4 giây (vượt threshold 3s)
  await new Promise((resolve) => setTimeout(resolve, 4000));

  res.json({
    message: "This is a slow API response",
    duration: "4000ms",
    note: "Should trigger performance monitoring and create Jira bug",
  });
});

module.exports = router;
