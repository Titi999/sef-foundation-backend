export function getTimeDifference(dateStamp: Date): number {
  const createdAtInMs = new Date(dateStamp).getTime();
  const createAtInMinutes = createdAtInMs / 1000 / 60;
  const nowInMs = new Date().getTime();
  const nowInMinutes = nowInMs / 1000 / 60;
  return nowInMinutes - createAtInMinutes;
}
