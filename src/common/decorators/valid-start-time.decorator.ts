import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isMilitaryTime,
} from 'class-validator';
import { isBefore } from 'date-fns';
import { getDateFromTimeString } from '../../utils/get_date_from_time_string';

export function isValidStartTime(startTime: string, endTime: string) {
  return (
    isMilitaryTime(startTime) &&
    isMilitaryTime(endTime) &&
    isBefore(getDateFromTimeString(startTime), getDateFromTimeString(endTime))
  );
}

export function IsValidStartTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidStartTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        defaultMessage() {
          return `Start Time should be earlier than End time`;
        },
        validate(value: any, args: ValidationArguments) {
          const end_time = (args.object as any).end_time;
          return (
            typeof value === 'string' &&
            typeof end_time === 'string' &&
            isValidStartTime(value, end_time)
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
