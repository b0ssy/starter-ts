import { AppError } from "./app";

export class TooManyRequestsError extends AppError {
  constructor(message?: string, code = "too_many_requests") {
    super(429, code, message);
  }
}
