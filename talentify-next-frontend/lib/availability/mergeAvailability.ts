import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export type IsoDateString = `${number}-${number}-${number}`;

export type MergeAvailabilityParams = {
  defaultMode: 'default_ok' | 'default_ng';
  dates: Record<IsoDateString, 'ok' | 'ng'>;
  from: Date;
  to: Date;
};

export type MergedAvailabilityEntry = {
  date: IsoDateString;
  status: 'ok' | 'ng';
};

export type MergedAvailability = MergedAvailabilityEntry[];

const TOKYO_TZ = 'Asia/Tokyo';

dayjs.extend(utc);
dayjs.extend(timezone);

export const mergeAvailability = ({
  defaultMode,
  dates,
  from,
  to,
}: MergeAvailabilityParams): MergedAvailability => {
  const defaultStatus: 'ok' | 'ng' = defaultMode === 'default_ok' ? 'ok' : 'ng';
  const start = dayjs(from).tz(TOKYO_TZ).startOf('day');
  const end = dayjs(to).tz(TOKYO_TZ).startOf('day');

  const merged: MergedAvailability = [];

  for (let current = start; !current.isAfter(end, 'day'); current = current.add(1, 'day')) {
    const dateKey = current.format('YYYY-MM-DD') as IsoDateString;
    const status = dates[dateKey] ?? defaultStatus;

    merged.push({
      date: dateKey,
      status,
    });
  }

  return merged;
};

export default mergeAvailability;
