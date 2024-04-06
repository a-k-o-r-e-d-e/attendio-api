import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isDateString,
} from 'class-validator';
import { isBefore } from 'date-fns';

export function IsValidStartDate(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidStartDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        defaultMessage() {
          return `Start Date should be earlier than end date`;
        },
        validate(value: any, args: ValidationArguments) {
          const end_date = (args.object as any).end_date;
          return (
            typeof value === 'string' &&
            isDateString(value) &&
            typeof end_date === 'string' &&
            isDateString(end_date) &&
            isBefore(
              value,
              end_date,
            )
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
