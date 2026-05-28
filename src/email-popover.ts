// Email pill → morphs into a dropdown with Gmail / iCloud / Outlook deep
// links + a Copy address button. Trigger and panel cross-fade via a single
// data-state on the .email-popover root; CSS handles the rest.

function initEmailPopover(): void {
    const root = document.querySelector<HTMLElement>(".email-popover");
    if (!root) return;
    const trigger = root.querySelector<HTMLButtonElement>(".email-trigger");
    const panel = root.querySelector<HTMLElement>(".email-panel");
    if (!trigger || !panel) return;

    let copyTimeoutId: number | undefined;

    const open = () => {
        root.dataset.state = "open";
        trigger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
        if (root.dataset.state !== "open") return;
        root.dataset.state = "closed";
        trigger.setAttribute("aria-expanded", "false");
    };
    const toggle = () => (root.dataset.state === "open" ? close() : open());

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
    });

    document.addEventListener("click", (e) => {
        if (root.dataset.state !== "open") return;
        const target = e.target as Node | null;
        if (target && root.contains(target)) return;
        close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && root.dataset.state === "open") {
            close();
            trigger.focus();
        }
    });

    // Each provider link closes the menu after picking — the new tab takes
    // over focus anyway, but on same-tab mailto the dropdown shouldn't linger.
    panel.querySelectorAll<HTMLAnchorElement>("a.email-option").forEach((link) => {
        link.addEventListener("click", () => {
            window.setTimeout(close, 120);
        });
    });

    const copyBtn = panel.querySelector<HTMLButtonElement>(".email-option-copy");
    copyBtn?.addEventListener("click", async () => {
        const value = copyBtn.dataset.copy ?? "";
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = value;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.top = "-1000px";
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); } catch { /* noop */ }
            document.body.removeChild(ta);
        }
        copyBtn.dataset.copied = "true";
        window.clearTimeout(copyTimeoutId);
        copyTimeoutId = window.setTimeout(() => {
            delete copyBtn.dataset.copied;
            close();
        }, 1200);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEmailPopover);
} else {
    initEmailPopover();
}
