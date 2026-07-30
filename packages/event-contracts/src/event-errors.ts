export class EventContractValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "EventContractValidationError";
    this.field = field;
  }
}
