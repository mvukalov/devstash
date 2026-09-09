const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * "Jan 15" — fixed locale and time zone so the server and client render the
 * same string.
 */
export function formatShortDate(isoDate: string): string {
  return SHORT_DATE.format(new Date(isoDate));
}
