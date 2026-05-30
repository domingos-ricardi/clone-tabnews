import { BaseError } from "./base-error";

export class ServiceError extends BaseError {
  constructor({ cause, message, action, context }) {
    super(message || "Serviço indisponível no momento.", { cause });
    this.name = "ServiceError";
    this.action = action || "Verifique a disponibilidade do serviço";
    this.statusCode = 503;
    this.context = context;
  }
}
