export class AppError extends Error {
  status: number;
  code: string;
  codeMessage?: string; // Can't name it as "message", so use codeMesssage

  constructor(status: number, code: string, message?: string) {
    super(
      `${code.toLowerCase()}${message !== undefined ? `: ${message}` : ""}`
    );

    this.status = status;
    this.code = code.toLowerCase();
    this.codeMessage = message;
  }
}

export class BadRequestError extends AppError {
  constructor(message?: string, code = "bad_request") {
    super(400, code, message);
  }
}

export class NotAuthorizedError extends AppError {
  constructor(
    message = "Please authenticate before running operation",
    code = "not_authorized"
  ) {
    super(401, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string, code = "not_found") {
    super(404, code, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message?: string, code = "too_many_requests") {
    super(429, code, message);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "Internal server error",
    code = "internal_server_error"
  ) {
    super(500, code, message);
  }
}

export class NotImplementedError extends InternalServerError {
  constructor(message = "Operation not implemented yet") {
    super(message, "not_implemented");
  }
}

export class UnsupportedOperationError extends BadRequestError {
  constructor(message = "Operation is unsupported") {
    super(message, "unsupported_operation");
  }
}
