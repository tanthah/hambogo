const bcrypt = require("bcrypt");
const UserRepository = require("../repositories/UserRepository.js");
const {
  ConflictException,
  BadRequestException,
} = require("../common/app-error/exception.helper.js");

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    console.log("AuthService initialized");
  }

  async register(req) {
    console.log("Register called with body:", req.body);
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        throw new BadRequestException("All fields are required");
      }

      console.log("Checking if user exists:", email);
      const userExists = await this.userRepository.getUserByEmail(
        email
      );
      if (userExists) {
        console.log("User already exists:", email);
        throw new ConflictException("Account already registered");
      }

      console.log("Hashing password...");
      const passwordHash = bcrypt.hashSync(password, 10);

      const userData = {
        name: name,
        email: email,
        password: passwordHash,
      };

      console.log("Saving user:", userData);
      await this.userRepository.save(userData);
      console.log("User saved successfully");

      return true;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  async login(req) {
    console.log("Login called with body:", req.body);
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new BadRequestException(
          "Email and password are required"
        );
      }

      console.log("Finding user by email:", email);
      let userExists;
      try {
        userExists = await this.userRepository.getUserByEmail(email);
        console.log("User found:", userExists);
      } catch (error) {
        console.log("User not found:", error.message);
        if (error.message.includes("User not found")) {
          throw new BadRequestException("User not found");
        }
        throw error;
      }

      console.log("Comparing passwords...");
      const isPasswordValid = bcrypt.compareSync(
        password,
        userExists.password
      );
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        throw new BadRequestException("Incorrect password");
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = userExists;
      console.log(
        "Login successful for user:",
        userWithoutPassword.email
      );

      return userWithoutPassword;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // ... other methods
}

module.exports = AuthService;
