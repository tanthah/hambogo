// 📄 router.js
const config = require("../config/app-config.js");
const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const { appError } = require("../common/app-error/app-error.js");

// HTTPS
const https = require("https");
const fs = require("fs");
const path = require("path");

// 1. MIDDLEWARE
app.set("view engine", "ejs");
app.use(helmet());
app.use(express.static(config.root));

// 2. ALL ROUTES
app.use("/", require("./main.js"));
app.use("/login", require("./login.js"));
app.use("/dashboard", require("./dashboard.js"));
app.use("/ajax", require("./ajax.js"));
app.use("/test", require("./test-auto-issue-type.js"));

// 3. ERROR HANDLER - MUST BE LAST
app.use(appError);

// SSL options - đường dẫn đến thư mục ssl
const keyPath = path.join(__dirname, "../../ssl/key.pem");
const certPath = path.join(__dirname, "../../ssl/cert.pem");
// console.log("🔍 Debug SSL Paths:");
// console.log("Key path:", keyPath);
// console.log("Cert path:", certPath);
// console.log("Key exists:", fs.existsSync(keyPath));
// console.log("Cert exists:", fs.existsSync(certPath));
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "../../ssl/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../../ssl/cert.pem")),
};

// ✅ CREATE HTTPS SERVER
const server = https.createServer(sslOptions, app);

// ✅ SERVER START VỚI HTTPS
const PORT = process.env.APP_PORT || 3443;
server.listen(PORT, () => {
  console.log(
    `✅ HTTPS Server is running at https://localhost:${PORT}`
  );
  console.log(
    `⚠️  Browser sẽ cảnh báo SSL - Đây là bình thường với self-signed certificate`
  );
  console.log(
    `📝 Click "Advanced" → "Proceed to localhost" để tiếp tục`
  );
});

// app.listen(process.env.APP_PORT, () =>
//   console.log("Server is running at http://localhost:3000")
// );
