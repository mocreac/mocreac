// Live online/offline badge.
// Working hours are 08:00–23:59 Europe/Helsinki time. Updates every
// .online-status element on the page (sets data-status="online"|"offline"
// and fills the inner .online-status-text). When online it shows the local
// time; when offline it counts down to the next 08:00 ("Will be online in
// X hours"). Auto-paints on import and re-paints every minute so it stays
// current.

const ONLINE_START_HOUR = 8; // 08:00 Helsinki

export function paintOnlineStatus(): void {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date());
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const isOnline = parseInt(hh, 10) >= ONLINE_START_HOUR && parseInt(hh, 10) <= 23;
    const status = isOnline ? "online" : "offline";

    let text: string;
    if (isOnline) {
        text = `Usually Online • ${hh}:${mm}`;
    } else {
        const minutesUntil = ONLINE_START_HOUR * 60 - (parseInt(hh, 10) * 60 + parseInt(mm, 10));
        if (minutesUntil <= 60) {
            text = "Will be online within the hour";
        } else {
            const hours = Math.round(minutesUntil / 60);
            text = `Will be online in ${hours} hour${hours === 1 ? "" : "s"}`;
        }
    }

    document.querySelectorAll<HTMLElement>(".online-status").forEach((badge) => {
        badge.setAttribute("data-status", status);
        const t = badge.querySelector<HTMLElement>(".online-status-text");
        if (t) t.textContent = text;
    });
}

paintOnlineStatus();
setInterval(paintOnlineStatus, 60_000);
