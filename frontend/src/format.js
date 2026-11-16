export const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function formatTime(ts) {
  return time.format(new Date(ts));
}
