import { ValidationError } from '../../../shared/domain/errors/domain-errors';
import { ValueObject } from '../../../shared/domain/value-objects/value-object';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {

  get value(): string {
    return this.props.value;
  }

  public static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  constructor(email: string) {
    if (!Email.isValid(email)) {
      throw new ValidationError('Formato de email inválido');
    }

    super({ value: email });
  }

  public toString(): string {
    return this.props.value;
  }
}
