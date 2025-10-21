//  middleware/performanceMonitor.js
const jiraService = require("../services/jiraService.js");

const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const isSlow = duration > 3000; // 3 seconds threshold

    if (isSlow) {
      console.log(
        ` SLOW API: ${req.method} ${req.url} - ${duration}ms`
      );

      // Chỉ log vào Jira ở production/staging
      if (["production", "staging"].includes(process.env.NODE_ENV)) {
        const bugData = {
          title: `[PERFORMANCE] Slow API: ${req.method} ${req.url}`,
          description: `API took too long to respond\n\n**Details:**\n- Response Time: ${duration}ms\n- Threshold: 3000ms\n- Endpoint: ${
            req.method
          } ${
            req.url
          }\n- Timestamp: ${new Date().toISOString()}\n- Environment: ${
            process.env.NODE_ENV
          }`,
          severity: "Medium",
          environment: process.env.NODE_ENV,
          endpoint: req.url,
          method: req.method,
        };

        jiraService.createBug(bugData).catch((err) => {
          console.error(
            "Failed to log performance issue to Jira:",
            err.message
          );
        });
      }
    } else {
      console.log(
        ` Fast API: ${req.method} ${req.url} - ${duration}ms`
      );
    }
  });

  next();
};

module.exports = performanceMonitor;
