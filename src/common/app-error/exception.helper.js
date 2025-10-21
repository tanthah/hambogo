const { statusCodes } = require("../../helpers/status-code.helper");

class BadRequestException extends Error {
  constructor(message = "BadRequestException") {
    super(message);
    this.code = statusCodes.BAD_REQUEST;
    this.statusCode = statusCodes.BAD_REQUEST;
  }
}

class ForbiddenException extends Error {
  constructor(message = "ForbiddenException") {
    super(message);
    this.code = statusCodes.FORBIDDEN;
    this.statusCode = statusCodes.FORBIDDEN;
  }
}

class UnauthorizedException extends Error {
  constructor(message = "UnauthorizedException") {
    super(message);
    this.code = statusCodes.UNAUTHORIZED;
    this.statusCode = statusCodes.UNAUTHORIZED;
  }
}

class ConflictException extends Error {
  constructor(message = "ConflictException") {
    super(message);
    this.name = "ConflictException";
    this.code = statusCodes.CONFLICT;
    this.statusCode = statusCodes.CONFLICT;
  }
}

class NotFoundException extends Error {
  constructor(message = "NotFoundException") {
    super(message);
    this.code = statusCodes.NOT_FOUND;
    this.statusCode = statusCodes.NOT_FOUND;
  }
}

module.exports = {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
};
