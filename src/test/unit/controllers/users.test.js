const UsersController = require("../../../controllers/users");
const jwt = require("jsonwebtoken");

// Mock các dependencies
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

// Mock mysql2
jest.mock("mysql2", () => ({
  createConnection: jest.fn(),
}));

describe("UsersController", () => {
  let usersController;
  let mockConnection;

  beforeEach(() => {
    // Tạo mock connection
    mockConnection = {
      query: jest.fn(),
      execute: jest.fn(),
      end: jest.fn(),
    };

    // Mock mysql.createConnection trả về mock connection
    require("mysql2").createConnection.mockReturnValue(
      mockConnection
    );

    usersController = new UsersController();

    // Mock environment variables
    process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

    jest.clearAllMocks();
  });

  describe("generateAccessToken", () => {
    it("should generate access token with correct payload and expiration", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        user_type: "customer",
      };

      // Mock jwt.sign trả về token
      jwt.sign.mockReturnValue("mocked-access-token");

      const token = usersController.generateAccessToken(user);

      expect(token).toBe("mocked-access-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, email: user.email, user_type: user.user_type },
        "test-access-secret",
        { expiresIn: "15m" }
      );
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate refresh token with user id and longer expiration", () => {
      const user = { id: 1 };

      jwt.sign.mockReturnValue("mocked-refresh-token");

      const token = usersController.generateRefreshToken(user);

      expect(token).toBe("mocked-refresh-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id },
        "test-refresh-secret",
        { expiresIn: "7d" }
      );
    });
  });

  describe("saveRefreshToken", () => {
    it("should save refresh token to database successfully", async () => {
      const userId = 1;
      const refreshToken = "test-refresh-token";

      // Mock database query success
      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, { affectedRows: 1 });
        }
      );

      await expect(
        usersController.saveRefreshToken(userId, refreshToken)
      ).resolves.toBeUndefined();

      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?",
        [
          userId,
          refreshToken,
          expect.any(Date),
          refreshToken,
          expect.any(Date),
        ],
        expect.any(Function)
      );
    });

    it("should reject when database error occurs", async () => {
      const userId = 1;
      const refreshToken = "test-refresh-token";

      // Mock database error
      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(new Error("Database connection failed"));
        }
      );

      await expect(
        usersController.saveRefreshToken(userId, refreshToken)
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when email exists", async () => {
      const testEmail = "test@example.com";
      const mockUser = {
        id: 1,
        name: "Test User",
        email: testEmail,
        password: "hashedpassword",
        user_type: "customer",
      };

      // Mock database trả về user
      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, [mockUser]);
        }
      );

      const result = await usersController.getUserByEmail(testEmail);

      expect(result).toEqual(mockUser);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "SELECT * FROM `users` WHERE `email` = ?",
        [testEmail],
        expect.any(Function)
      );
    });

    it("should reject when email does not exist", async () => {
      const testEmail = "nonexistent@example.com";

      // Mock database trả về empty array
      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, []);
        }
      );

      await expect(
        usersController.getUserByEmail(testEmail)
      ).rejects.toThrow("No user with that email");
    });

    it("should reject on database connection error", async () => {
      const testEmail = "test@example.com";

      // Mock database error
      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(new Error("Connection timeout"));
        }
      );

      await expect(
        usersController.getUserByEmail(testEmail)
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("getUserById", () => {
    it("should return user when id exists", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        name: "Test User",
        email: "test@example.com",
        user_type: "customer",
      };

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, [mockUser]);
        }
      );

      const result = await usersController.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "SELECT * FROM `users` WHERE `id` = ?",
        [userId],
        expect.any(Function)
      );
    });

    it("should reject when user id does not exist", async () => {
      const userId = 999;

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, []);
        }
      );

      await expect(
        usersController.getUserById(userId)
      ).rejects.toThrow("No user with that id");
    });
  });

  describe("save", () => {
    it("should save user and return insert ID", async () => {
      const userData = {
        name: "New User",
        email: "new@example.com",
        password: "hashedpassword",
        user_type: "customer",
      };
      const insertId = 5;

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, { insertId });
        }
      );

      const result = await usersController.save(userData);

      expect(result).toBe(insertId);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "INSERT INTO users SET ?",
        [userData],
        expect.any(Function)
      );
    });

    it("should reject on database error during save", async () => {
      const userData = {
        name: "New User",
        email: "new@example.com",
        password: "hashedpassword",
      };

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(new Error("Duplicate email"));
        }
      );

      await expect(usersController.save(userData)).rejects.toThrow(
        "Database connection error"
      );
    });
  });

  describe("deleteRefreshToken", () => {
    it("should delete refresh token from database", async () => {
      const refreshToken = "old-refresh-token";

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, { affectedRows: 1 });
        }
      );

      await expect(
        usersController.deleteRefreshToken(refreshToken)
      ).resolves.toBeUndefined();

      expect(mockConnection.query).toHaveBeenCalledWith(
        "DELETE FROM user_tokens WHERE token = ?",
        [refreshToken],
        expect.any(Function)
      );
    });
  });

  describe("getUserByRefreshToken", () => {
    it("should return user when valid refresh token provided", async () => {
      const refreshToken = "valid-refresh-token";
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
      };

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, [mockUser]);
        }
      );

      const result = await usersController.getUserByRefreshToken(
        refreshToken
      );

      expect(result).toEqual(mockUser);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "SELECT u.* FROM users u JOIN user_tokens ut ON u.id = ut.user_id WHERE ut.token = ? AND ut.expires_at > NOW()",
        [refreshToken],
        expect.any(Function)
      );
    });

    it("should reject when refresh token is invalid or expired", async () => {
      const refreshToken = "invalid-refresh-token";

      mockConnection.query.mockImplementation(
        (query, params, callback) => {
          callback(null, []);
        }
      );

      await expect(
        usersController.getUserByRefreshToken(refreshToken)
      ).rejects.toThrow("Invalid refresh token");
    });
  });
});
