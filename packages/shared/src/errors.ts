export type ErrorCode =
  | "DOMAIN_ERROR"
  | "AUTH_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "SYSTEM_ERROR";

export interface ErrorDetails {
  [key: string]: unknown;
}

export class BaseAppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetails;

  constructor(code: ErrorCode, message: string, details?: ErrorDetails) {
    super(message);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DomainError extends BaseAppError {
  constructor(message: string, details?: ErrorDetails) {
    super("DOMAIN_ERROR", message, details);
  }
}

export class AuthError extends BaseAppError {
  constructor(message = "Unauthorized", details?: ErrorDetails) {
    super("AUTH_ERROR", message, details);
  }
}

export class ValidationError extends BaseAppError {
  constructor(message: string, details?: ErrorDetails) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class NotFoundError extends BaseAppError {
  constructor(message: string, details?: ErrorDetails) {
    super("NOT_FOUND", message, details);
  }
}

export class SystemError extends BaseAppError {
  constructor(message = "Internal server error", details?: ErrorDetails) {
    super("SYSTEM_ERROR", message, details);
  }
}

export function toHttpStatus(code: ErrorCode): number {
  switch (code) {
    case "AUTH_ERROR":
      return 401;
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "DOMAIN_ERROR":
      return 422;
    case "SYSTEM_ERROR":
    default:
      return 500;
  }
}

export function isAppError(error: unknown): error is BaseAppError {
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}
