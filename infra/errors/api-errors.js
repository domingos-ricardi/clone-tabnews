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

export class NotFoundError extends BaseError {
  constructor(message, action) {
    super(message ?? "Não foi possível encontrar o usuário.");
    this.name = "NotFoundError";
    this.action = action ?? "Verifique os dados informados e tente novamente.";
    this.statusCode = 404;
  }
}

export class UnauthorizedError extends BaseError {
  constructor() {
    super("Dados de autenticação não conferem.");
    this.name = "UnauthorizedError";
    this.action = "Verifique se os dados enviados estão corretos.";
    this.statusCode = 401;
  }
}

export class NotMatchError extends BaseError {
  constructor() {
    super("Dados de autenticação não conferem.");
    this.name = "NotMatchError";
    this.action = "Verifique se os dados enviados estão corretos.";
    this.statusCode = 401;
  }
}

export class ForbiddenError extends BaseError {
  constructor(values) {
    super(values?.message || "Você não tem permissão para acessar este recurso.");
    this.name = "ForbiddenError";
    this.action =
      values?.action || "Verifique as features necessárias antes de continuar.";
    this.statusCode = 403;
  }
}
