// 📁 common/app-error/app-error.js
const { responseError } = require("../../helpers/response.helper.js");
const jwt = require("jsonwebtoken");
const jiraService = require("../../services/jiraService.js");

const appError = async (err, req, res, next) => {
  // 401 => logout
  // 403 => api refresh-token
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(403).json(responseError("Token expired", 403));
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json(responseError("Invalid token", 401));
  }

  // Log 500 errors to Jira
  if (err?.status >= 500 || err?.code >= 500 || !err?.status) {
    try {
      await logToJira(err, req);
    } catch (jiraError) {
      console.error("Failed to log to Jira:", jiraError);
    }
  }

  const resData = responseError(err?.message, err?.code, err?.stack);
  res.status(resData.statusCode).json(resData);
};

async function logToJira(error, request) {
  // Chỉ log ở production/staging
  if (!["production", "staging"].includes(process.env.NODE_ENV)) {
    console.log(" [DEV] Would create Jira bug:", error.message);
    console.log(" [DEV] SKIPPING Jira creation in development");
    return; //  KHÔNG tạo bug trong Jira ở development
  }

  console.log(" PRODUCTION/STAGING: Creating Jira bug...");

  const bugData = {
    title: `[${process.env.NODE_ENV?.toUpperCase()}] ${
      error.message
    }`.substring(0, 255),
    environment: process.env.NODE_ENV,
    stack_trace: error.stack,
    endpoint: request.url,
    method: request.method,
  };

  await jiraService.createBug(bugData);
}

module.exports = { appError };
