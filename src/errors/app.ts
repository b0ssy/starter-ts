// Generic application error
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
