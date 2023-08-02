import { AppError } from "./app";

export class NotAuthorizedError extends AppError {
  constructor(
    message = "Please authenticate before running operation",
    code = "not_authorized"
  ) {
    super(401, code, message);
  }
}
