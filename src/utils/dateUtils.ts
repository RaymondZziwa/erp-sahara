// dateUtils.js
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
};

export function toMySQLDateTime(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}