import {
  formatDateInBusinessTimeZone,
  getBusinessCalendarDate,
  getBusinessCalendarMonthsAgo,
  getBusinessCalendarMonthIndex,
  getBusinessCalendarWeekday,
  getBusinessCalendarWeekStartDate,
  getBusinessCalendarYearMonth,
} from "./calendar";

describe("business calendar", () => {
  it("uses the configured timezone for calendar boundaries and display", () => {
    const monthBoundary = new Date("2024-03-31T16:00:00.000Z");
    const weekdayBoundary = new Date("2025-05-24T20:00:00.000Z");
    const dateOnly = new Date("2026-01-15T00:00:00.000Z");

    expect(getBusinessCalendarYearMonth(monthBoundary)).toBe("2024-04");
    expect(getBusinessCalendarMonthIndex(monthBoundary)).toBe(3);
    expect(getBusinessCalendarDate(monthBoundary)).toBe("2024-04-01");
    expect(getBusinessCalendarWeekday(weekdayBoundary)).toBe("日");
    expect(getBusinessCalendarWeekStartDate(weekdayBoundary)).toBe("2025-05-25");
    expect(
      getBusinessCalendarMonthsAgo(new Date("2026-03-31T15:00:00.000Z"), 1),
    ).toBe("2026-03-01");
    expect(
      getBusinessCalendarMonthsAgo(new Date("2026-03-30T15:00:00.000Z"), 1),
    ).toBe("2026-02-28");
    expect(formatDateInBusinessTimeZone(dateOnly, "ja-JP")).toBe("2026/1/15");
  });
});
