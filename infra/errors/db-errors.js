export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um erro interno não esperado ocorreu", { cause });
    this.name = "IternalServerError";
    this.action = "Entre em contato com o suporte";
    this.statusCode = cause?.statusCode || 500;
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
