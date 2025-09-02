export function getLocalizedMonth(date: Date, t: (key: string) => string): string {
  const monthIndex = date.getMonth();
  return t(`common.months.${monthIndex}`);
}