import { BaseError } from "./base-error";

export class MethodNotAllowedError extends BaseError {
  constructor() {
    super("Método não permitido para este endpoint");
    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é válido para este endpoit";
    this.statusCode = 405;
  }
}

export class InternalServerError extends BaseError {
  constructor({ cause }) {
    super("Um erro interno não esperado ocorreu", cause);
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte";
    this.statusCode = cause?.statusCode || 500;
  }
}

export class ValidationError extends BaseError {
  constructor() {
    super("Não foi possível registrar dados do usuário.");
    this.name = "ValidationError";
    this.action = "Verifique os dados informados e tente novamente.";
    this.statusCode = 400;
  }
}
