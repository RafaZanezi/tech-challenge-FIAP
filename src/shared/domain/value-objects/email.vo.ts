import { ValueObject } from '../../../shared/domain/value-objects/value-object';
import { ValidationError } from '../../../shared/domain/errors/domain-errors';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  constructor(email: string) {
    if (!Email.isValid(email)) {
      throw new ValidationError('Invalid email format');
    }
    
    super({ value: email });
  }

  get value(): string {
    return this.props.value;
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.props.value;
  }
}
