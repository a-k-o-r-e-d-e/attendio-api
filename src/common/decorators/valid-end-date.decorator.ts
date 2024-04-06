import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isDateString,
} from 'class-validator';
import { isAfter } from 'date-fns';

export function IsValidEndDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidEndDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        defaultMessage() {
          return `End Date cannot be earlier than Start date`;
        },
        validate(end_date: any, args: ValidationArguments) {
          const start_date = (args.object as any).start_date;
          return (
            typeof end_date === 'string' &&
            isDateString(end_date) &&
            typeof start_date === 'string' &&
            isDateString(start_date) &&
            isAfter(end_date, start_date)
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
