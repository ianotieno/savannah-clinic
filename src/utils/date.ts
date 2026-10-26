
export function formatDate(date: string): string {
  if (!date) return "";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
