import { AppError } from "./app";

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", code = "internal_server_error") {
    super(500, code, message);
  }
}
