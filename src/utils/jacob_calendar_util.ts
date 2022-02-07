export class JacobCalendarUtil {
  static YEAR189 = 1644197709445;
  static ONEYEAR = 372 * 20 * 60 * 1000;

  static monthStrings = [
    "Early Spring",
    "Spring",
    "Late Spring",
    "Early Summer",
    "Summer",
    "Late Summer",
    "Early Autumn",
    "Autumn",
    "Late Autumn",
    "Early Winter",
    "Winter",
    "Late Winter",
  ];

  static getTimestamp(year: number, dayofyear: number): number {
    return this.YEAR189 + ((year - 189) * 372 + dayofyear) * 20 * 60 * 1000;
  }

  static getDayOfEvent(eventId: number): number {
    return eventId * 3 + 2;
  }

  static getDayOfMonth(dayofyear: number): number {
    return dayofyear % 31;
  }

  static getMonth(dayofyear: number): number {
    return Math.floor(dayofyear / 31);
  }

  static getMonthString(month: number): string {
    return this.monthStrings[month];
  }

  static getDayNow(): number {
    return Math.floor(
      (Date.now() % JacobCalendarUtil.YEAR189) / 20 / 60 / 1000,
    );
  }

  static getYearNow(): number {
    return Math.floor(189 + (Date.now() - this.YEAR189) / this.ONEYEAR);
  }

  static getNextEventId(): number {
    return Math.floor(this.getDayNow() / 3);
  }

  static getFormattedTimeUntilTimestamp(timestamp: number): string {
    if (timestamp < Date.now()) return "LIVE";
    const diffInSec = Math.round((timestamp - Date.now()) / 1000);
    const hour = Math.floor(diffInSec / 3600);
    const min = Math.floor((diffInSec % 3600) / 60);
    const sec = Math.round(diffInSec % 60);
    return `${hour > 0 ? hour + "h" : ""} ${min}m ${sec}s`;
  }
}
