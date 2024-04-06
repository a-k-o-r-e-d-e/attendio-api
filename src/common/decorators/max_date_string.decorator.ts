import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  minDate,
  isDateString,
} from 'class-validator';
import { formatISO } from 'date-fns';

export function MinDateString(
  property: Date,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'minDateString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        defaultMessage(args: ValidationArguments) {
          const [relatedValue] = args.constraints;
          return `Min allowed date is ${formatISO(relatedValue, { representation: 'date' })}`;
        },
        validate(value: any, args: ValidationArguments) {
          const [relatedValue] = args.constraints;
          return (
            typeof value === 'string' &&
            isDateString(value) &&
            relatedValue instanceof Date &&
            minDate(
              new Date(value),
              new Date(formatISO(relatedValue, { representation: 'date' })),
            )
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
