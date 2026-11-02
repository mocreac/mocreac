import { attachNoteLink, highlightNote } from './note-links.ts';
// Notes: formulas, snippets, and references for better interfaces.

import "./favicon-spin.ts";
import { shadowWidget } from "./shadow-widget.ts";
import { frequencyCard, isFrequencyPinned } from "./frequency-player.ts";
import "./online-status.ts";
import { phosphorIcon } from "./phosphor-icons.ts";

// ─────────────────────────────────────────────────────────
// Types & data

type CategoryId =
    | "formulas"
    | "snippets"
    | "resources"
    | "inspiration"
    | "fonts"
    | "tools"
    | "components"
    | "color"
    | "audio";

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
    // Existing resource previews can use their original OG images.
    ogImage?: string;
    kind?: "formula" | "snippet" | "audio" | "shadow" | "skills";
    preview?: string;
};

const CATEGORIES: readonly Category[] = [
    { id: "audio", label: "Audio" },
    { id: "formulas", label: "Formulas" },
    { id: "snippets", label: "Snippets" },
    { id: "resources", label: "Resources" },
    { id: "inspiration", label: "Inspiration" },
    { id: "components", label: "Components" },
    { id: "fonts", label: "Fonts" },
    { id: "color", label: "Color" },
    { id: "tools", label: "Tools" },
];

const ITEMS: readonly Item[] = [
    { title: "Frequencies", source: "Personal listening", url: "", category: "audio", kind: "audio", description: "Three binaural background sessions." },

    {
        title: "Consistent Radii Beyond 90°", source: "Geometry", url: "", category: "formulas", kind: "formula",
        description: "Keep the same distance from the vertex to where the curve meets each edge. Start with a 90° radius r, then find the circular radius R for an interior angle θ.",
    },
    {
        kind: "shadow", title: "Shadow Elevation Generator", source: "codepen.io · jshmllr", url: "https://codepen.io/jshmllr/pen/LERqgQa", category: "resources", ogImage: "https://shots.codepen.io/username/pen/LERqgQa-800.jpg?version=1776435755",
        description: "A saved CodePen by jshmllr. Open the pen to explore the demo and its source.",
    },
    {
        title: "Quiet Scrollbars", source: "Rauno Freiberg", url: "https://x.com/raunofreiberg/status/2048057305439039535", category: "snippets", kind: "snippet",
        description: "A small CSS detail. Copy the prompt and give it to your coding agent.",
    },
    {
        title: "Bencho Finds", source: "bencho.dev", url: "https://bencho.dev/finds", category: "inspiration",
        description: "A curated collection of interfaces, interactions, animations, and small design details.",
        ogImage: "https://bencho.dev/share-cover-ring.png",
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
    {
        title: "Cue", source: "cuedesign.space", url: "https://www.cuedesign.space/", category: "inspiration",
        description: "Hand-picked UI component references with AI prompts for building distinctive interfaces.",
        ogImage: "https://cuedesign.space/og-image.png",
    },
    {
        title: "Skills", source: "Agent skills", url: "", category: "snippets", kind: "skills",
        description: "Install agent skills from Benji, Emil, and Jakub.",
    },
    {
        title: "Transitions", source: "transitions.dev", url: "https://transitions.dev/", category: "resources",
        ogImage: "https://transitions.dev/assets/og-main.jpg",
        description: "UI transitions and motion resources.",
    },
    {
        title: "Craft", source: "craft.gustavofior.com", url: "https://craft.gustavofior.com/", category: "resources", ogImage: "https://craft.gustavofior.com/og/index",
        description: "Short design engineering guides by Gustavo Fior, covering typography, layout, color, and motion.",
    },
    {
        title: "Interface Cheat Sheet", source: "interfaces.dev", url: "https://interfaces.dev/cheat-sheet", category: "resources", ogImage: "https://ho1jr3x2dcwdu3t5.public.blob.vercel-storage.com/og-image.png",
        description: "An interactive reference for interface details, from concentric corners to animation and typography.",
    },
    {
        title: "Sonner", source: "sonner.emilkowal.ski", url: "https://sonner.emilkowal.ski/", category: "resources",
        description: "An opinionated toast component for React by Emil Kowalski.",
        ogImage: "https://sonner.emilkowal.ski/opengraph-image.png?d5e368c2f1b9b507",
    },
    {
        title: "Best Designs on X",
        source: "bestdesignsonx.com",
        url: "https://bestdesignsonx.com/?ref=uigoodies.com",
        category: "inspiration",
        description:
            "Hand-picked design inspiration from top creatives on X: logos, UI, and branding, refreshed hourly.",
        ogImage: "https://bestdesignsonx.com/og-image.png",
    },
];

// ─────────────────────────────────────────────────────────
// Rendering

const tabsEl = document.getElementById("category-tabs") as HTMLElement;
const gridEl = document.getElementById("notes-grid") as HTMLElement;
const emptyEl = document.getElementById("empty-state") as HTMLElement;

let activeCategory: CategoryId | "all" = "all";
const cards = new Map<Item, HTMLElement>();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateTabs(): void {
    for (const button of tabsEl.querySelectorAll<HTMLButtonElement>("button")) {
        const active = button.dataset.cat === activeCategory;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
    }
}

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
            '<span class="tab-count">' + t.count + "</span>";
        btn.addEventListener("click", () => {
            if (activeCategory === t.id) return;
            activeCategory = t.id;
            updateTabs();
            renderGrid(true);
        });
        tabsEl.appendChild(btn);
    }
}

function renderGrid(animate = false): void {
    const previous = new Map(
        [...gridEl.children].map(card => [card, card.getBoundingClientRect()]),
    );
    const previousHeight = gridEl.getBoundingClientRect().height;
    gridEl.getAnimations().forEach(animation => animation.cancel());
    for (const card of cards.values()) {
        card.getAnimations().forEach(animation => animation.cancel());
    }
    const filtered =
        activeCategory === "all"
            ? ITEMS
            : ITEMS.filter((i) => i.category === activeCategory);

    masonryObserver.disconnect();
    gridEl.innerHTML = "";

    if (filtered.length === 0) {
        emptyEl.style.display = "block";
        gridEl.style.display = "none";
        return;
    }
    emptyEl.style.display = "none";
    gridEl.style.display = "grid";

    const ordered = [...filtered].sort((a, b) => {
        if (isFrequencyPinned()) {
            const pinned = Number(b.kind === "audio") - Number(a.kind === "audio");
            if (pinned) return pinned;
        }
        return Number(Boolean(b.kind)) - Number(Boolean(a.kind));
    });
    for (const item of ordered) {
        if (item.kind === "shadow") {
            const shadow = shadowWidget();
            attachNoteLink(shadow, sectionId(item));
            gridEl.appendChild(shadow);
            masonryObserver.observe(shadow);
            continue;
        }
        if (item.kind === "audio") {
            const audio = frequencyCard();
            attachNoteLink(audio, sectionId(item));
            gridEl.appendChild(audio);
            masonryObserver.observe(audio);
            continue;
        }
        const cached = cards.get(item);
        if (cached) {
            gridEl.appendChild(cached);

            continue;
        }
        if (item.kind) {
            const note = renderNote(item);
            attachNoteLink(note, sectionId(item));
            cards.set(item, note);
            gridEl.appendChild(note);
            continue;
        }
        const card = document.createElement("article");
        card.className = "curation-card";

        card.innerHTML =
            (item.ogImage
                ? '<div class="curation-banner"><img src="' + escapeAttr(item.ogImage) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></div>'
                : '<div class="curation-banner resource-preview"><strong>' + escapeText(item.preview ?? item.title) + '</strong></div>') +
            '<div class="curation-meta">' +
                '<div class="curation-text">' +
                    '<h3 class="curation-title">' + escapeText(item.title) + "</h3>" +
                    '<span class="curation-source-label">' + escapeText(item.source) + "</span>" +
                "</div>" +
                phosphorIcon("external", 14, "curation-arrow") +
            "</div>";

        card.querySelector("img")?.addEventListener("error", () => {
            const banner = card.querySelector(".curation-banner")!;
            banner.classList.add("resource-preview");
            banner.textContent = item.title;
        });
        const banner = card.querySelector('.curation-banner')!;
        const external = document.createElement('a');
        external.className = 'curation-banner-link';
        external.href = item.url; external.target = '_blank'; external.rel = 'noopener noreferrer';
        external.setAttribute('aria-label', `Visit ${item.title}`);
        banner.replaceWith(external); external.append(banner);
        const source = card.querySelector('.curation-source-label')!;
        const sourceLink = external.cloneNode(false) as HTMLAnchorElement;
        sourceLink.className = ''; sourceLink.textContent = item.source;
        source.replaceChildren(sourceLink);
        attachNoteLink(card, sectionId(item));
        gridEl.appendChild(card);
        cards.set(item, card);
    }

    // Resolve every row span before painting the newly filtered grid.
    const visible = [...gridEl.children] as HTMLElement[];
    const heights = visible.map(card => card.getBoundingClientRect().height);
    visible.forEach((card, index) => {
        card.style.gridRowEnd = `span ${Math.ceil(heights[index] + 16)}`;
        masonryObserver.observe(card);
    });

    if (animate && !reduceMotion.matches) {
        const options = { duration: 280, easing: "cubic-bezier(.22, 1, .36, 1)" };
        const nextHeight = gridEl.getBoundingClientRect().height;
        gridEl.animate({ height: [`${previousHeight}px`, `${nextHeight}px`] }, options);
        for (const card of visible) {
            const before = previous.get(card);
            const after = card.getBoundingClientRect();
            card.animate(before ? {
                translate: [`${before.left - after.left}px ${before.top - after.top}px`, "0px 0px"],
            } : {
                opacity: [0, 1],
                translate: ["0px 8px", "0px 0px"],
            }, options);
        }
    }
}

const SCROLLBAR_PROMPT = `Use thin gray native scrollbars with transparent tracks on the page and all scrollable containers. Apply:

scrollbar-width: thin;
scrollbar-color: gray transparent;`;

function syncDiagram(current: Node, next: Node): void {
    const existing = [...current.childNodes];
    const incoming = [...next.childNodes];
    incoming.forEach((node, index) => {
        const old = existing[index];
        if (!old) { current.appendChild(node.cloneNode(true)); return; }
        if (old.nodeName !== node.nodeName || old.nodeType !== node.nodeType) {
            current.replaceChild(node.cloneNode(true), old);
            return;
        }
        if (old instanceof Element && node instanceof Element) {
            for (const attribute of [...old.attributes]) {
                if (!node.hasAttribute(attribute.name)) old.removeAttribute(attribute.name);
            }
            for (const attribute of [...node.attributes]) {
                if (old.getAttribute(attribute.name) !== attribute.value) old.setAttribute(attribute.name, attribute.value);
            }
            syncDiagram(old, node);
        } else if (old.nodeValue !== node.nodeValue) old.nodeValue = node.nodeValue;
    });
    existing.slice(incoming.length).forEach(node => current.removeChild(node));
}

function cornerDiagram(angle: number, setback: number, label: string, interactive = false, held = false, displayScale = 1, activeSymbol = ""): string {
    const theta = angle * Math.PI / 180;
    // Both diagrams share one scale, including the resultant radius circle.
    setback *= displayScale;
    const radius = setback * Math.tan(theta / 2);
    const x = 35, y = 76;
    const tx = x + setback * Math.sin(theta), ty = y + setback * Math.cos(theta);
    const rayLength = Math.cos(theta) < 0 ? Math.min(100, (y - 8) / -Math.cos(theta)) : 100;
    const railRadius = radius;
    const centerX = x + radius, centerY = y + setback;
    const arcSpan = Math.PI + theta;
    // Keep nodes stable. End ticks shrink away as spacing gets tight.
    const tickCount = 31, selectedTick = 15;
    const availableHalf = Math.min(15, railRadius * arcSpan * .88 / 12);
    const ticks = Array.from({ length: tickCount }, (_, i) => {
        const delta = i - selectedTick;
        const density = i === selectedTick ? 1 : Math.max(0, Math.min(1, availableHalf + .5 - Math.abs(delta)));
        const fraction = .5 + Math.max(-.44, Math.min(.44, delta * .44 / Math.max(.001, availableHalf)));
        const radians = Math.PI - fraction * arcSpan;
        const degrees = radians * 180 / Math.PI;
        const px = centerX + (railRadius + .5) * Math.cos(radians);
        const py = centerY + (railRadius + .5) * Math.sin(radians);
        const scale = held ? 1 + .8 * Math.exp(-delta * delta / 7) : 1;
        const isHandle = i === selectedTick;
        return `<g class="tick-slot" transform="translate(${px} ${py}) rotate(${degrees - 90})" ${isHandle ? `data-angle-handle tabindex="0" role="slider" aria-label="Interior angle" aria-valuemin="1" aria-valuemax="179" aria-valuenow="${angle}" aria-valuetext="${angle} degrees"` : 'aria-hidden="true"'}>
            <path class="angle-tick${held && isHandle ? " is-selected" : ""}" data-visible="${density > 0}" style="--tick-scale:${scale};--tick-density:${density}" d="M 0 0 V 4" fill="none" stroke="var(${held && isHandle ? "--sand-800" : "--sand-400"})" stroke-width="1.4" stroke-linecap="butt" />
            ${isHandle ? '<path class="angle-hit" d="M 0 -14 V 24" fill="none" stroke="transparent" stroke-width="32" />' : ''}
        </g>`;
    }).join("");
    const dial = interactive ? `<g class="angle-dial">
        <circle class="angle-rail" cx="${centerX}" cy="${centerY}" r="${railRadius}" fill="none" stroke="var(--sand-400)" stroke-width="1" />
        ${ticks}
    </g>` : "";
    const arcMiddle = Math.PI + (Math.PI - theta) / 2;
    const ux = -Math.cos(arcMiddle), uy = -Math.sin(arcMiddle);
    const radiusStartX = x + radius - radius * ux;
    const radiusStartY = y + setback - radius * uy;
    // Long radii continue beyond this small illustration; show a short radius ray.
    const radiusLength = radius;
    const labelX = Math.max(x + 16, radiusStartX + radiusLength * ux / 2 - uy * 14);
    let labelY = radiusStartY + radiusLength * uy / 2 + ux * 14 + 7;
    // Tiny circles cannot contain a math label; place R clear below the guide.
    if (radius < 20) labelY = centerY + radius + 20;
    if (angle < 90) {
        const overlapLeft = Math.max(labelX - 7, tx);
        const overlapRight = Math.min(labelX + 7, x + rayLength * Math.sin(theta));
        if (overlapLeft <= overlapRight) {
            const rayTop = y + (overlapLeft - x) / Math.tan(theta);
            const rayBottom = y + (overlapRight - x) / Math.tan(theta);
            if (labelY + 3 >= rayTop && labelY - 16 <= rayBottom) labelY = Math.min(175, rayBottom + 21);
        }
    }
    const explanations: Record<string, string> = { r: "Radius at 90°", θ: "Interior angle", R: "Radius at this angle" };
    const mathLabel = (symbol: string, px: number, py: number, anchor = "middle") => `<text class="diagram-math${activeSymbol === symbol || (symbol === "θ" && held) ? " is-active" : ""}" x="${px}" y="${py}" text-anchor="${anchor}"><title>${explanations[symbol]}</title>${symbol}</text>`;
    const resultRadius = interactive ? `<path class="result-radius-line" d="M ${radiusStartX} ${radiusStartY} L ${radiusStartX + radiusLength * ux} ${radiusStartY + radiusLength * uy}" fill="none" stroke="var(--sand-400)" stroke-width="1.3" stroke-linecap="butt" />` : "";
    const circle = !interactive ? `<circle cx="${x + setback}" cy="${y + setback}" r="${setback}" fill="none" stroke="var(--sand-400)" stroke-width="1" />
        <path d="M ${x} ${y + setback} H ${x + setback}" stroke="var(--sand-400)" stroke-width="1" />
        <circle cx="${x + setback}" cy="${y + setback}" r="2" fill="var(--sand-400)" />` : "";
    const radiusLabel = interactive ? mathLabel("R", labelX, labelY) : mathLabel("r", x + 2 * setback + 9, y + Math.max(setback + 5, 24), "start");
    const clipId = interactive ? "result-corner-interior" : "reference-corner-interior";
    // Close the exact filleted boundary far beyond the viewBox. Gray guides
    // remain inside both edges at every supported angle, including 1° and 179°.
    const far = 100000;
    const interior = `M ${x} ${y + far} V ${y + setback} A ${radius} ${radius} 0 0 1 ${tx} ${ty} L ${x + far * Math.sin(theta)} ${y + far * Math.cos(theta)} L ${x + far * Math.sin(theta)} ${y + far * Math.cos(theta) + far} Z`;
    // Keep the vertex anchored while the ray rotates and the radius changes.
    const offsetX = 5;
    const offsetY = 0;
    return `<svg data-origin-x="${x + offsetX}" data-origin-y="${y + offsetY}" viewBox="0 0 180 190" ${interactive ? 'data-angle-dial' : `role="img" aria-label="${escapeAttr(label)}"`}>
        <g data-diagram-art transform="translate(${offsetX} ${offsetY})">
        <defs><clipPath id="${clipId}"><path d="${interior}" /></clipPath></defs>
        <g clip-path="url(#${clipId})">
        ${circle}
        ${resultRadius}
        ${dial}
        </g>
        ${radiusLabel}
        <path class="corner-stroke" d="M ${x} 162 V ${y + setback} A ${radius} ${radius} 0 0 1 ${tx} ${ty} L ${x + rayLength * Math.sin(theta)} ${y + rayLength * Math.cos(theta)}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="butt" />
        </g>
    </svg>`;
}

function renderNote(item: Item): HTMLElement {
    const card = document.createElement("article");
    card.className = "curation-card";
    const heading = `<div class="note-content"><span class="note-kind">${item.kind === "formula" ? "Formula" : item.kind === "skills" ? "Snippet" : "Prompt"}</span><h2>${escapeText(item.title)}</h2>`;
    if (item.kind === "skills") {
        const commands = [
            { name: 'Emil', command: 'npx skills@latest add emilkowalski/skills' },
            { name: 'Jakub', command: 'npx skills add jakubkrehel/skills' },
            { name: 'Benji', command: 'npx skills add benjitaylor/skills --skill stageshow' },
        ];
        card.classList.add('skills-card');
        card.innerHTML = heading + `<div class="skills-tabs" role="tablist" aria-label="Skill author">${commands.map((entry, index) => `<button type="button" class="tab${index === 0 ? ' is-active' : ''}" role="tab" id="skill-tab-${index}" aria-controls="skill-command" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${entry.name}</button>`).join('')}</div>
            <pre class="code-block" role="tabpanel" id="skill-command" aria-labelledby="skill-tab-0" tabindex="0"><code></code></pre>
            <div class="note-actions"><button type="button" class="copy-button" data-copy-skill style="min-width:110px">Copy Skill</button></div>
            <p class="copy-feedback" role="status"></p></div>`;
        let selected = 0;
        const tabs = [...card.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
        const code = card.querySelector('code')!;
        const panel = card.querySelector('[role="tabpanel"]')!;
        const copy = card.querySelector<HTMLButtonElement>('[data-copy-skill]')!;
        let reset: ReturnType<typeof setTimeout>;
        const select = (index: number) => {
            selected = index;
            clearTimeout(reset);
            copy.textContent = 'Copy Skill';
            code.textContent = commands[index].command;
            panel.setAttribute('aria-labelledby', `skill-tab-${index}`);
            tabs.forEach((tab, i) => { tab.classList.toggle('is-active', i === index); tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
        };
        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => select(i));
            tab.addEventListener('keydown', event => {
                const index = event.key === 'ArrowRight' ? (i + 1) % 3 : event.key === 'ArrowLeft' ? (i + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1;
                if (index < 0) return;
                event.preventDefault(); select(index); tabs[index].focus();
            });
        });
        copy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(commands[selected].command);
                copy.textContent = 'Copied!';
                reset = setTimeout(() => { copy.textContent = 'Copy Skill'; }, 2000);
            } catch { card.querySelector('.copy-feedback')!.textContent = 'Select and copy the command above.'; }
        });
        select(0);
        return card;
    }
    if (item.kind === "formula") {
        card.innerHTML = heading + `
            <div class="formula" role="math" aria-label="R equals r times tangent of theta over two"><span><i title="Radius at this angle">R</i> = <i title="Radius at 90°">r</i> · tan(</span><span class="fraction"><span title="Interior angle">θ</span><span>2</span></span><span>)</span></div>
            </div>
            <div class="corner-diagrams"></div>
            <div class="note-content">
                <div class="note-controls">
                    <div class="number-field"><button class="scrub-handle" type="button" aria-label="Drag to adjust radius" title="Radius at 90° · Drag to adjust"><i class="math-handle" aria-hidden="true">r</i></button><input inputmode="decimal" type="number" min="1" max="100" step="0.01" value="16" aria-label="90 degree reference radius in pixels" /><span>px</span></div>
                    <div class="number-field"><button class="scrub-handle" type="button" aria-label="Drag to adjust angle" title="Interior angle · Drag to adjust"><i class="math-handle" aria-hidden="true">θ</i></button><input inputmode="decimal" type="number" min="1" max="179" step="1" value="120" aria-label="Interior angle in degrees" /><span>°</span></div>
                    <div class="number-field"><button class="scrub-handle" type="button" aria-label="Drag to adjust result radius" title="Radius at this angle · Drag to adjust"><i class="math-handle" aria-hidden="true">R</i></button><input inputmode="decimal" type="number" step="0.1" aria-label="Result radius in pixels" /><span>px</span></div>
                </div>
            </div>`;
        const reference = card.querySelectorAll<HTMLInputElement>("input")[0];
        const angle = card.querySelectorAll<HTMLInputElement>("input")[1];
        const resultInput = card.querySelectorAll<HTMLInputElement>("input")[2];
        const inputs = [reference, angle, resultInput];
        const sizeInputs = () => {
            for (const input of inputs) {
                input.style.width = `${Math.max(1, Math.min(7, input.value.length)) * .92 + .08}ch`;
            }
        };
        // Keep full precision internally while the companion input shows two decimals.
        let referenceRadius = Number(reference.value);
        let dialHeld = false;
        let activeSymbol = "";
        const update = () => {
            const theta = Number(angle.value), r = referenceRadius;
            const factor = Math.tan(theta * Math.PI / 360);
            const result = r * factor;
            resultInput.min = String(factor);
            resultInput.max = String(100 * factor);
            resultInput.step = "any";
            resultInput.value = result.toFixed(2);
            resultInput.title = String(result);
            sizeInputs();
            const displayScale = Math.min(1, 40 / r, 52 / result);
            const diagrams = card.querySelector(".corner-diagrams")!;
            const template = document.createElement("template");
            template.innerHTML = cornerDiagram(90, r, `90°`, false, false, displayScale, activeSymbol) + cornerDiagram(theta, r, "", true, dialHeld, displayScale, activeSymbol);
            // Preserve SVG nodes so tick scale transitions can animate in both directions.
            syncDiagram(diagrams, template.content);

        };
        const clamp = (input: HTMLInputElement, value: number) => Math.max(Number(input.min), Math.min(Number(input.max), value));
        const snapAngle = (value: number) => value <= 1 ? 1 : value >= 179 ? 179 : clamp(angle, Math.round(value / 5) * 5);
        const snapValue = (input: HTMLInputElement, value: number) => clamp(input, input === angle ? Math.round(value) : Number(value.toFixed(2)));
        const draggedValue = (input: HTMLInputElement, value: number) => {
            const min = Math.ceil(Number(input.min)), max = Math.floor(Number(input.max));
            return min <= max ? Math.max(min, Math.min(max, Math.round(value))) : clamp(input, value);
        };
        const applyValue = (input: HTMLInputElement) => {
            if (input === resultInput) {
                const factor = Math.tan(Number(angle.value) * Math.PI / 360);
                referenceRadius = clamp(reference, Number(resultInput.value) / factor);
                reference.value = String(Number(referenceRadius.toFixed(2)));
            } else if (input === reference) {
                referenceRadius = Number(reference.value);
            }
            update();
        };
        for (const input of inputs) {
            input.addEventListener("input", () => {
                sizeInputs();
                if (input.value !== "" && input.validity.valid) {
                    // Keep the result editable while updating the source radius.
                    const typed = input.value;
                    applyValue(input);
                    if (input === resultInput) { input.value = typed; sizeInputs(); }
                }
            });
            input.addEventListener("change", () => {
                input.value = String(snapValue(input, Number(input.value) || Number(input.min)));
                applyValue(input);
            });

        }
        card.querySelectorAll<HTMLButtonElement>(".scrub-handle").forEach((handle, index) => {
            const input = inputs[index];
            let startX = 0, startValue = 0;
            handle.addEventListener("pointerdown", (event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                handle.focus();
                startX = event.clientX;
                startValue = Number(input.value);
                handle.setPointerCapture(event.pointerId);
                activeSymbol = ["r", "θ", "R"][index];
                update();
            });
            handle.addEventListener("pointermove", (event) => {
                if (!handle.hasPointerCapture(event.pointerId)) return;
                input.value = String(draggedValue(input, startValue + (event.clientX - startX) * (event.shiftKey ? .1 : .5)));
                applyValue(input);
            });
            const finishScrub = () => {
                if (activeSymbol !== ["r", "θ", "R"][index]) return;
                activeSymbol = "";
                update();
            };
            handle.addEventListener("lostpointercapture", finishScrub);
            handle.addEventListener("pointercancel", finishScrub);
            handle.addEventListener("pointerup", (event) => {
                if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
            });
            handle.addEventListener("keydown", (event) => {
                if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
                event.preventDefault();
                input.value = String(draggedValue(input, Number(input.value) + (["ArrowRight", "ArrowUp"].includes(event.key) ? 1 : -1)));
                applyValue(input);
            });
        });
        const diagrams = card.querySelector<HTMLElement>(".corner-diagrams")!;
        let dialBounds: DOMRect | null = null;
        let dialStartAngle = 0;
        let dialStartPointer = 0;
        let dialOriginX = 35, dialOriginY = 76;
        const moveDial = (event: PointerEvent) => {
            if (!dialBounds) return;
            const px = (event.clientX - dialBounds.left) * 180 / dialBounds.width - dialOriginX;
            const py = (event.clientY - dialBounds.top) * 190 / dialBounds.height - dialOriginY;
            const degrees = Math.atan2(px, py) * 180 / Math.PI;
            // The selected tick sits on the bisector and follows the pointer.
            angle.value = String(snapAngle(dialStartAngle + 2 * (degrees - dialStartPointer)));
            update();
        };
        diagrams.addEventListener("pointerdown", (event) => {
            const handle = (event.target as Element).closest("[data-angle-handle]");
            const svg = handle?.closest<SVGSVGElement>("[data-angle-dial]");
            if (!handle || !svg || event.button !== 0) return;
            event.preventDefault();
            dialBounds = svg.getBoundingClientRect();
            dialOriginX = Number(svg.dataset.originX);
            dialOriginY = Number(svg.dataset.originY);
            dialHeld = true;
            dialStartAngle = Number(angle.value);
            const px = (event.clientX - dialBounds.left) * 180 / dialBounds.width - dialOriginX;
            const py = (event.clientY - dialBounds.top) * 190 / dialBounds.height - dialOriginY;
            dialStartPointer = Math.atan2(px, py) * 180 / Math.PI;
            diagrams.setPointerCapture(event.pointerId);
            update();
        });
        diagrams.addEventListener("pointermove", (event) => {
            if (diagrams.hasPointerCapture(event.pointerId)) moveDial(event);
        });
        const finishDial = () => {
            if (!dialHeld) return;
            dialBounds = null;
            dialHeld = false;
            update();
            diagrams.querySelector<SVGGElement>("[data-angle-handle]")?.focus();
        };
        diagrams.addEventListener("pointerup", finishDial);
        diagrams.addEventListener("pointercancel", finishDial);
        diagrams.addEventListener("lostpointercapture", finishDial);
        diagrams.addEventListener("keydown", (event) => {
            if (!(event.target as Element).matches("[data-angle-handle]")) return;
            const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
            if (!(event.key in steps) && event.key !== "Home" && event.key !== "End") return;
            event.preventDefault();
            angle.value = String(event.key === "Home" ? 1 : event.key === "End" ? 179 : clamp(angle, Number(angle.value) + steps[event.key]));
            update();
            diagrams.querySelector<SVGGElement>("[data-angle-handle]")?.focus();
        });
        update();
    } else {
        card.classList.add("prompt-card");
        card.innerHTML = heading + `
                <p class="note-description">${escapeText(SCROLLBAR_PROMPT.split("\n\n")[0])}</p>
                <pre class="code-block"><code>scrollbar-width: thin;
scrollbar-color: gray transparent;</code></pre>
                <div class="note-actions"><button type="button" class="copy-button">Copy Prompt</button></div>
                <p class="copy-feedback" role="status"></p>
            </div>`;
        const button = card.querySelector("button")!;
        button.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(SCROLLBAR_PROMPT);
                button.textContent = "Copied!";
                card.querySelector(".copy-feedback")!.textContent = "";
                window.setTimeout(() => { button.textContent = "Copy Prompt"; }, 2000);
            } catch {
                card.querySelector(".copy-feedback")!.textContent = "Copy unavailable. Select and copy the prompt and CSS above.";
            }
        });
    }
    return card;
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

const masonryObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        const card = entry.target as HTMLElement;
        card.style.gridRowEnd = `span ${Math.ceil(card.getBoundingClientRect().height + 16)}`;
    }
});

gridEl.addEventListener("frequency-pin-change", () => {
    const audio = frequencyCard();
    if (isFrequencyPinned()) gridEl.prepend(audio);
    else {
        const first = [...gridEl.children].find(child => child !== audio);
        if (first) first.after(audio);
    }
    audio.querySelector<HTMLButtonElement>("[data-pin]")?.focus({ preventScroll: true });
});
renderTabs();
renderGrid();

function sectionId(item: Item): string {
    if (item.kind === 'shadow') return 'shadow-elevation';
    return item.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
async function openSection(): Promise<void> {
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!ITEMS.some(item => sectionId(item) === id)) return;
    if (!document.getElementById(id)) { activeCategory = 'all'; renderTabs(); renderGrid(); }
    await document.fonts.ready;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const card = document.getElementById(id);
        if (!card) return;
        card.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        highlightNote(card);
    }));
}
window.addEventListener('hashchange', openSection);
void openSection();
