// 📁 services/jiraService.js
const axios = require("axios");

class JiraService {
  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL;
    this.auth = {
      username: process.env.JIRA_EMAIL,
      password: process.env.JIRA_API_TOKEN,
    };
    this.projectKey = process.env.JIRA_PROJECT_KEY;
    this.issueType = "Task"; // ← SỬA THÀNH "Task"
  }

  async createBug(bugData) {
    try {
      console.log("🚀 Creating Jira issue...");

      const issueData = {
        fields: {
          project: {
            key: this.projectKey,
          },
          summary: bugData.title.substring(0, 100),
          description: this.formatDescription(bugData),
          issuetype: {
            name: this.issueType, // ← DÙNG "Task"
          },
          labels: [
            "expressjs",
            "auto-reported",
            process.env.NODE_ENV,
          ],
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        issueData,
        {
          auth: this.auth,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log(`✅ Jira issue created: ${response.data.key}`);
      console.log(`🔗 ${this.baseUrl}/browse/${response.data.key}`);
      return response.data;
    } catch (error) {
      console.error("❌ Jira API Error:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      throw error;
    }
  }

  formatDescription(bugData) {
    return {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `🚨 BUG REPORT - Auto-reported from ExpressJS application`,
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `Environment: ${bugData.environment}`,
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `Endpoint: ${bugData.method} ${bugData.endpoint}`,
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `Timestamp: ${new Date().toISOString()}`,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "javascript" },
          content: [
            {
              type: "text",
              text: bugData.stack_trace || "No stack trace available",
            },
          ],
        },
      ],
    };
  }
}

module.exports = new JiraService();
