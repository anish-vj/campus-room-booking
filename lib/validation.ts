export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
