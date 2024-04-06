import { set } from 'date-fns';

export function getDateFromTimeString(
  timeString: string,
  date: Date | undefined | null = new Date(),
) {
  const [timeHour, timeMin] = timeString.split(':');
  const dateTime = set(date, {
    hours: +timeHour,
    minutes: +timeMin,
    seconds: 0,
  });

  return dateTime;
}
