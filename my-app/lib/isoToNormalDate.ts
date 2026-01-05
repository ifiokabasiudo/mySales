export function formatDate(date: string | number | Date) {
  const d = new Date(date);

  if (isNaN(d.getTime())) return "—";

  const time = d.toLocaleTimeString("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const day = d.toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    // weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return `${time} • ${day}`;
}
