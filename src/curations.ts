// Curations: tools and references I keep going back to.
//
// To add a new item: append an entry to `ITEMS` below. The banner uses the
// site's own og:image (high-res, usually 1200×630), so make sure the URL
// renders cleanly on the source side. Use a category from `CATEGORIES`, or
// add a new one to that list first.

import "./favicon-spin.ts";
import "./online-status.ts";

// ─────────────────────────────────────────────────────────
// Types & data

type CategoryId =
    | "inspiration"
    | "fonts"
    | "tools"
    | "components"
    | "color";

type Category = {
    id: CategoryId;
    label: string;
};

type Item = {
    title: string;
    source: string;
    url: string;
    category: CategoryId;
    description: string;
    // og:image URL — fetched on the target site at scrape-time. If the source
    // changes the path or blocks hotlinking, swap to a self-hosted copy in
    // /public/curations/ and point here.
    ogImage: string;
};

const CATEGORIES: readonly Category[] = [
    { id: "inspiration", label: "Inspiration" },
    { id: "components", label: "Components" },
    { id: "fonts", label: "Fonts" },
    { id: "color", label: "Color" },
    { id: "tools", label: "Tools" },
];

const ITEMS: readonly Item[] = [
    {
        title: "Best Designs on X",
        source: "bestdesignsonx.com",
        url: "https://bestdesignsonx.com/?ref=uigoodies.com",
        category: "inspiration",
        description:
            "Hand-picked design inspiration from top creatives on X — logos, UI, and branding, refreshed hourly.",
        ogImage: "https://bestdesignsonx.com/og-image.png",
    },
    {
        title: "Viewport UI",
        source: "viewport-ui.design",
        url: "https://viewport-ui.design/",
        category: "inspiration",
        description:
            "A running feed of curated UI experiments. Good for snapping out of a stale visual loop.",
        ogImage: "https://viewport-ui.design/images/meta-image.jpg",
    },
];

// ─────────────────────────────────────────────────────────
// Rendering

const tabsEl = document.getElementById("category-tabs") as HTMLElement;
const gridEl = document.getElementById("curations-grid") as HTMLElement;
const emptyEl = document.getElementById("empty-state") as HTMLElement;

let activeCategory: CategoryId | "all" = "all";

function renderTabs(): void {
    const counts: Record<string, number> = { all: ITEMS.length };
    for (const item of ITEMS) {
        counts[item.category] = (counts[item.category] ?? 0) + 1;
    }

    const tabs: { id: CategoryId | "all"; label: string; count: number }[] = [
        { id: "all", label: "All", count: counts.all ?? 0 },
        ...CATEGORIES.map((c) => ({
            id: c.id,
            label: c.label,
            count: counts[c.id] ?? 0,
        })),
    ];

    tabsEl.innerHTML = "";
    for (const t of tabs) {
        if (t.count === 0) continue;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tab" + (t.id === activeCategory ? " is-active" : "");
        btn.dataset.cat = t.id;
        btn.setAttribute("aria-pressed", t.id === activeCategory ? "true" : "false");
        btn.innerHTML =
            '<span class="tab-label">' + t.label + "</span>" +
            '<span class="tab-count tnum">' + t.count + "</span>";
        btn.addEventListener("click", () => {
            activeCategory = t.id;
            renderTabs();
            renderGrid();
        });
        tabsEl.appendChild(btn);
    }
}

function renderGrid(): void {
    const filtered =
        activeCategory === "all"
            ? ITEMS
            : ITEMS.filter((i) => i.category === activeCategory);

    gridEl.innerHTML = "";

    if (filtered.length === 0) {
        emptyEl.style.display = "block";
        gridEl.style.display = "none";
        return;
    }
    emptyEl.style.display = "none";
    gridEl.style.display = "grid";

    for (const item of filtered) {
        const card = document.createElement("a");
        card.className = "curation-card";
        card.href = item.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        card.innerHTML =
            '<div class="curation-banner">' +
                '<img ' +
                    'src="' + item.ogImage + '" ' +
                    'alt="' + escapeAttr(item.title) + '" ' +
                    'loading="lazy" ' +
                    'decoding="async" ' +
                    'referrerpolicy="no-referrer" ' +
                    'onerror="this.closest(\'.curation-card\').classList.add(\'banner-failed\')" />' +
            "</div>" +
            '<div class="curation-meta">' +
                '<div class="curation-text">' +
                    '<h3 class="curation-title">' + escapeText(item.title) + "</h3>" +
                    '<span class="curation-source-label">' + escapeText(item.source) + "</span>" +
                "</div>" +
                '<svg class="curation-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
                    '<path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                "</svg>" +
            "</div>";

        gridEl.appendChild(card);
    }
}

function escapeText(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function escapeAttr(s: string): string {
    return escapeText(s).replace(/"/g, "&quot;");
}

renderTabs();
renderGrid();
