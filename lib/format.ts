export function formatDateStr(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
    });
}

export function formatHour(hour: number): string {
    const period = hour < 12 ? 'AM' : 'PM';
    let h = hour % 12;
    if (h === 0) h = 12;
    return `${h}:00 ${period}`;
}

export function formatHourRange(hour: number): string {
    const start = formatHour(hour);
    const end = formatHour((hour + 1) % 24);
    return `${start} – ${end}`;
}
