const AuthService = require("../services/auth.service.js");
const { responseSuccess } = require("../helpers/response.helper.js");

class AuthController {
  constructor() {
    this.authService = new AuthService();
    console.log("AuthController initialized");
  }

  register = async (req, res, next) => {
    console.log("Register controller called");
    try {
      const result = await this.authService.register(req);

      if (req.accepts("html")) {
        req.flash(
          "success",
          "Registration successful! Please login."
        );
        return res.redirect("/auth/login");
      }

      const response = responseSuccess(
        result,
        "Register successfully"
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Register controller error:", error);
      if (req.accepts("html")) {
        req.flash("error", error.message);
        return res.redirect("/auth/register");
      }
      next(error);
    }
  };

  login = async (req, res, next) => {
    console.log("Login controller called");
    try {
      const result = await this.authService.login(req);

      if (req.accepts("html")) {
        // Lưu thông tin user vào session
        req.session.user = result;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return next(err);
          }
          console.log("Session saved, redirecting...");
          req.flash("success", "Login successful!");
          return res.redirect("/");
        });
        return;
      }

      const response = responseSuccess(result, "Login successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Login controller error:", error);
      if (req.accepts("html")) {
        req.flash("error", error.message);
        return res.redirect("/auth/login");
      }
      next(error);
    }
  };

  // ... other methods
}

module.exports = AuthController;
