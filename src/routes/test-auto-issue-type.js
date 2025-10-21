// 📁 routes/test-auto-issue-type.js
const express = require("express");
const router = express.Router();
const jiraService = require("../services/jiraService.js");

router.get("/test-auto-issue-type", async (req, res) => {
  try {
    console.log("🧪 Testing with auto issue type detection...");

    const bugData = {
      title:
        "TEST: Auto Issue Type - " + new Date().toLocaleTimeString(),
      severity: "medium",
      environment: process.env.NODE_ENV,
      stack_trace: "Test stack trace",
      endpoint: "/test/test-auto-issue-type",
      method: "GET",
    };

    // 🎯 THÊM ENVIRONMENT CHECK TRỰC TIẾP TRONG ROUTE
    const allowedEnvironments = ["production", "staging"];
    const currentEnv = process.env.NODE_ENV || "development";

    console.log(`🔧 Current Environment: ${currentEnv}`);

    let result;
    if (!allowedEnvironments.includes(currentEnv)) {
      console.log(
        `🛠️ [${currentEnv.toUpperCase()}] SKIPPING Jira - Development environment`
      );
      console.log(
        `🛠️ [${currentEnv.toUpperCase()}] Would create: ${
          bugData.title
        }`
      );

      // Trả về mock data thay vì thực sự tạo bug
      result = {
        key: `MOCK-${Date.now()}`,
        message: "Mock - Development environment",
      };
    } else {
      // ✅ CHỈ tạo Jira bug ở production/staging
      result = await jiraService.createBug(bugData);
    }

    res.json({
      success: true,
      message: allowedEnvironments.includes(currentEnv)
        ? "🎉 Jira issue created successfully!"
        : "🛠️ [DEV] Mock - Would create Jira issue in production",
      issueKey: result.key,
      link: allowedEnvironments.includes(currentEnv)
        ? `${process.env.JIRA_BASE_URL}/browse/${result.key}`
        : "https://example.com/mock-issue",
      project: process.env.JIRA_PROJECT_KEY,
      environment: currentEnv,
      note: allowedEnvironments.includes(currentEnv)
        ? "Real Jira issue created"
        : "Mock issue - Development environment",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create Jira issue",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
