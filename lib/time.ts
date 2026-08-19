/ All booking dates/hours are interpreted in a single fixed campus timezone
// (APP_TIMEZONE). There is no per-user timezone conversion in v1.

const DEFAULT_TZ = process.env.APP_TIMEZONE || 'Asia/Kolkata';

function getDatePartsInTz(date: Date, timeZone: string) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    let hour = get('hour');
    if (hour === '24') hour = '00';
    return {
          dateStr: `${get('year')}-${get('month')}-${get('day')}`,
          hour: parseInt(hour, 10),
    };
}

export function getCampusNow(timeZone: string = DEFAULT_TZ) {
    return getDatePartsInTz(new Date(), timeZone);
}

export function addDaysToDateStr(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString().slice(0, 10);
}

export function isDateInBookingWindow(dateStr: string, timeZone: string = DEFAULT_TZ): boolean {
    const { dateStr: today } = getCampusNow(timeZone);
    const maxDate = addDaysToDateStr(today, 6);
    // YYYY-MM-DD strings compare correctly lexicographically.
  return dateStr >= today && dateStr <= maxDate;
}
