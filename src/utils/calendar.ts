import { UI_CONFIG } from "@/lib/config";

const CALENDAR_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
  timeZone: UI_CONFIG.businessTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ja-JP-u-ca-gregory", {
  timeZone: UI_CONFIG.businessTimeZone,
  weekday: "short",
});

function getCalendarPart(
  date: Date,
  part: "year" | "month" | "day",
): string {
  const value = CALENDAR_PARTS_FORMATTER.formatToParts(date).find(
    ({ type }) => type === part,
  )?.value;

  if (value === undefined) {
    throw new RangeError(`Missing ${part} in calendar date`);
  }

  return value;
}

export function getBusinessCalendarMonthIndex(date: Date): number {
  return Number(getCalendarPart(date, "month")) - 1;
}

export function getBusinessCalendarYearMonth(date: Date): string {
  return `${getCalendarPart(date, "year")}-${getCalendarPart(date, "month")}`;
}

export function getBusinessCalendarDate(date: Date): string {
  return `${getBusinessCalendarYearMonth(date)}-${getCalendarPart(date, "day")}`;
}

export function getBusinessCalendarWeekStartDate(date: Date): string {
  const calendarDate = new Date(
    Date.UTC(
      Number(getCalendarPart(date, "year")),
      Number(getCalendarPart(date, "month")) - 1,
      Number(getCalendarPart(date, "day")),
    ),
  );
  calendarDate.setUTCDate(
    calendarDate.getUTCDate() - calendarDate.getUTCDay(),
  );
  return calendarDate.toISOString().slice(0, 10);
}

export function getBusinessCalendarMonthsAgo(date: Date, months: number): string {
  const targetMonth = new Date(
    Date.UTC(
      Number(getCalendarPart(date, "year")),
      Number(getCalendarPart(date, "month")) - 1 - Math.trunc(months),
      1,
    ),
  );
  const lastDayOfTargetMonth = new Date(
    Date.UTC(
      targetMonth.getUTCFullYear(),
      targetMonth.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();
  const day = Math.min(Number(getCalendarPart(date, "day")), lastDayOfTargetMonth);

  return `${targetMonth.getUTCFullYear()}-${String(
    targetMonth.getUTCMonth() + 1,
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getBusinessCalendarWeekday(date: Date): string {
  return WEEKDAY_FORMATTER.format(date);
}

export function formatDateInBusinessTimeZone(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    calendar: "gregory",
    timeZone: UI_CONFIG.businessTimeZone,
  }).format(date);
}
