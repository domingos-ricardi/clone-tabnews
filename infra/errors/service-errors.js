import { BaseError } from "./base-error";

export class ServiceError extends BaseError {
  constructor({ cause, message }) {
    super(message || "Serviço indisponível no momento.", { cause });
    this.name = "ServiceError";
    this.action = "Verifique a disponibilidade do serviço";
    this.statusCode = 503;
  }
}
