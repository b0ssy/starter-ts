import { InternalServerError } from "./internal-server";

export class NotImplementedError extends InternalServerError {
  constructor(message = "Operation not implemented yet") {
    super(message, "not_implemented");
  }
}
