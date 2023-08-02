import { AppError } from "./app";

export class BadRequestError extends AppError {
  constructor(message?: string, code = "bad_request") {
    super(400, code, message);
  }
}
