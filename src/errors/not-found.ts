import { AppError } from "./app";

export class NotFoundError extends AppError {
  constructor(message?: string, code = "not_found") {
    super(404, code, message);
  }
}
