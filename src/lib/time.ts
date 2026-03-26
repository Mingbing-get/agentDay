export function getProjectTimezone() {
  return process.env.AGENT_DAY_TIMEZONE ?? process.env.TZ ?? "Asia/Shanghai";
}

export function getDefaultProjectDate(date: Date, timezone = getProjectTimezone()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(date);
}
