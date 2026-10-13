// Dates are plain "YYYY-MM-DD" strings; parse as UTC so DST never changes the night count.
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = (Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000;
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
}

export const today = () => new Date().toISOString().slice(0, 10);
