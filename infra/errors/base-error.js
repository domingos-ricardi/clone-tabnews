export class BaseError extends Error {
  constructor(message, cause) {
    super(message, { cause });
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
