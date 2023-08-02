import { BadRequestError } from "./bad-request";

export class UnsupportedOperationError extends BadRequestError {
  constructor(message = "Operation is unsupported") {
    super(message, "unsupported_operation");
  }
}
