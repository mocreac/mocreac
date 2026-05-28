// Live "Usually Online" / "Usually Offline" badge.
// Working hours are 08:00–23:59 Europe/Helsinki time. Updates every
// .online-status element on the page (sets data-status="online"|"offline"
// and fills the inner .online-status-text). Auto-paints on import and
// re-paints every minute so the local-time portion stays current.

export function paintOnlineStatus(): void {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date());
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const isOnline = parseInt(hh, 10) >= 8 && parseInt(hh, 10) <= 23;
    const text = isOnline
        ? `Usually Online • ${hh}:${mm}`
        : `Usually Offline • ${hh}:${mm}`;
    const status = isOnline ? "online" : "offline";

    document.querySelectorAll<HTMLElement>(".online-status").forEach((badge) => {
        badge.setAttribute("data-status", status);
        const t = badge.querySelector<HTMLElement>(".online-status-text");
        if (t) t.textContent = text;
    });
}

paintOnlineStatus();
setInterval(paintOnlineStatus, 60_000);
