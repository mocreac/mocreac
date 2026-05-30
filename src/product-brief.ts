// Multi-step Product Design Brief form. Mirrors src/brief.ts (brand identity
// brief) — same step machine, validation, autosave, and submit flow — with a
// different chip vocabulary ("what needs designing" instead of brand
// associations) and its own storage key so the two briefs don't share drafts.
// Unlike brief.ts, submitting here does not persist a "submitted" flag —
// refreshing the page after success returns to a fresh form so the user can
// send another brief without a manual reset button.

import "./favicon-spin.ts";
import "./email-popover.ts";
import { paintOnlineStatus } from "./online-status.ts";
import confetti from "canvas-confetti";

// ─────────────────────────────────────────────────────────
// Configuration
const STORAGE_KEY = "mocreac:product-brief:v1";
const DELIVERABLES: readonly string[] = [
    "Product flow", "Design system", "Mobile app", "Web app", "Dashboard", "Marketing site",
    "Landing page", "Onboarding", "Pricing page", "New feature", "Redesign", "Audit / review",
    "Email design", "Pitch deck", "Icons / illustration", "Microcopy",
];

// ─────────────────────────────────────────────────────────
// State
let currentStep = 1;
const TOTAL_STEPS = 5;

// ─────────────────────────────────────────────────────────
// DOM refs
const form = document.getElementById("brief-form") as HTMLFormElement;
const steps = document.querySelectorAll<HTMLElement>(".step");
const progressSegs = document.querySelectorAll<HTMLElement>(".progress-seg");
const btnBack = document.getElementById("btn-back") as HTMLButtonElement;
const btnNext = document.getElementById("btn-next") as HTMLButtonElement;
const btnSubmit = document.getElementById("btn-submit") as HTMLButtonElement;
const submitLabel = document.getElementById("submit-label") as HTMLSpanElement;
const homeLink = document.getElementById("home-link") as HTMLAnchorElement;
const errorToast = document.getElementById("error-toast") as HTMLDivElement;
const successScreen = document.getElementById("success") as HTMLElement;
const stepNav = document.querySelector<HTMLElement>(".step-nav");

// ─────────────────────────────────────────────────────────
// Deliverables chips
const delivGrid = document.getElementById("deliverables-grid") as HTMLElement;
const delivInput = document.getElementById("f-deliverables") as HTMLInputElement;
const selectedDeliv = new Set<string>();

DELIVERABLES.forEach((word) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = word;
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", () => {
        if (selectedDeliv.has(word)) {
            selectedDeliv.delete(word);
            chip.classList.remove("is-selected");
            chip.setAttribute("aria-pressed", "false");
        } else {
            selectedDeliv.add(word);
            chip.classList.add("is-selected");
            chip.setAttribute("aria-pressed", "true");
        }
        if (selectedDeliv.size > 0) chip.closest<HTMLElement>(".field")?.classList.remove("has-error");
        updateDeliv();
        saveDraft();
    });
    delivGrid.appendChild(chip);
});

function updateDeliv(): void {
    delivInput.value = Array.from(selectedDeliv).join(", ");
}

// ─────────────────────────────────────────────────────────
// Radio option cards (budget brackets)
document.querySelectorAll<HTMLLabelElement>(".option-card").forEach((card) => {
    const input = card.querySelector<HTMLInputElement>("input");
    if (!input) return;
    card.addEventListener("click", () => {
        const group = card.closest<HTMLElement>(".option-row");
        if (group) {
            group.querySelectorAll(".option-card").forEach((c) => c.classList.remove("is-selected"));
        }
        card.classList.add("is-selected");
        input.checked = true;
        card.closest<HTMLElement>(".field")?.classList.remove("has-error");
        saveDraft();
    });
});

// ─────────────────────────────────────────────────────────
// Step navigation
function goToStep(n: number, opts: { silent?: boolean } = {}): void {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, n));
    steps.forEach((s) => {
        s.classList.remove("is-active");
        s.setAttribute("inert", "");
    });
    const target = document.querySelector<HTMLElement>(`.step[data-step="${currentStep}"]`);
    target?.classList.add("is-active");
    target?.removeAttribute("inert");

    progressSegs.forEach((seg, i) => {
        seg.classList.remove("is-current", "is-done");
        if (i + 1 < currentStep) seg.classList.add("is-done");
        if (i + 1 === currentStep) seg.classList.add("is-current");
    });
    btnBack.style.display = currentStep === 1 ? "none" : "inline-flex";
    homeLink.style.display = currentStep === 1 ? "inline-flex" : "none";

    if (currentStep === TOTAL_STEPS) {
        btnNext.style.display = "none";
        btnSubmit.style.display = "inline-flex";
    } else {
        btnNext.style.display = "inline-flex";
        btnSubmit.style.display = "none";
    }

    if (!opts.silent) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// ─────────────────────────────────────────────────────────
// Validation
function validateStep(n: number): boolean {
    const stepEl = document.querySelector<HTMLElement>(`.step[data-step="${n}"]`);
    if (!stepEl) return true;
    let ok = true;
    const fields = stepEl.querySelectorAll<HTMLElement>("[data-required]");
    fields.forEach((f) => {
        f.classList.remove("has-error");
        let valid = false;
        if (f.dataset.radio !== undefined) {
            const checked = f.querySelector<HTMLInputElement>("input[type=radio]:checked");
            valid = !!checked;
        } else if (f.dataset.chips !== undefined) {
            valid = selectedDeliv.size > 0;
        } else {
            const input = f.querySelector<HTMLInputElement | HTMLTextAreaElement>(".input, .textarea");
            valid = !!input && input.value.trim().length > 0;
        }
        if (!valid) {
            f.classList.add("has-error");
            ok = false;
        }
    });
    return ok;
}

btnNext.addEventListener("click", () => {
    if (!validateStep(currentStep)) {
        const firstError = document.querySelector<HTMLElement>(`.step[data-step="${currentStep}"] .has-error`);
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }
    goToStep(currentStep + 1);
});

btnBack.addEventListener("click", () => goToStep(currentStep - 1));

// ─────────────────────────────────────────────────────────
// Keyboard navigation — see src/brief.ts for the full rationale.
function attemptAdvance(): void {
    if (currentStep === TOTAL_STEPS) {
        if (!btnSubmit.disabled) btnSubmit.click();
    } else {
        btnNext.click();
    }
}

document.addEventListener("keydown", (e) => {
    if (successScreen.style.display === "flex") return;

    const target = e.target as HTMLElement | null;
    const isTextarea = target instanceof HTMLTextAreaElement;
    const isTextInput = target instanceof HTMLInputElement && target.type === "text";
    const isRadio = target instanceof HTMLInputElement && target.type === "radio";
    const isInteractive = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        attemptAdvance();
        return;
    }

    if (e.key === "Enter" && !isTextarea && !isInteractive) {
        e.preventDefault();
        attemptAdvance();
        return;
    }

    if (isTextarea || isTextInput || isRadio) return;

    if (e.key === "ArrowRight") {
        e.preventDefault();
        attemptAdvance();
    } else if (e.key === "ArrowLeft" && currentStep > 1) {
        e.preventDefault();
        goToStep(currentStep - 1);
    }
});

// Remove error state once user starts typing
form.addEventListener("input", (e) => {
    const target = e.target as HTMLElement | null;
    const field = target?.closest<HTMLElement>(".field");
    if (field) field.classList.remove("has-error");
    saveDraft();
});

// ─────────────────────────────────────────────────────────
// Draft autosave
type DraftData = Record<string, string | string[] | number>;

function saveDraft(): void {
    const data: DraftData = {};
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(".input, .textarea, input[type=hidden]").forEach((el) => {
        if (el.name && el.name !== "access_key" && el.name !== "botcheck") {
            data[el.name] = el.value;
        }
    });
    form.querySelectorAll<HTMLInputElement>("input[type=radio]:checked").forEach((el) => {
        data[el.name] = el.value;
    });
    data["__deliv"] = Array.from(selectedDeliv);
    data["__step"] = currentStep;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        /* localStorage may be unavailable in private mode; ignore */
    }
}

function loadDraft(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw) as DraftData;
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(".input, .textarea").forEach((el) => {
            const v = data[el.name];
            if (el.name && typeof v === "string") {
                el.value = v;
            }
        });
        form.querySelectorAll<HTMLInputElement>("input[type=radio]").forEach((el) => {
            if (data[el.name] === el.value) {
                el.checked = true;
                const card = el.closest<HTMLElement>(".option-card");
                if (card) card.classList.add("is-selected");
            }
        });
        const delivList = data["__deliv"];
        if (Array.isArray(delivList)) {
            delivList.forEach((w) => {
                if (typeof w === "string") selectedDeliv.add(w);
            });
            document.querySelectorAll<HTMLElement>(".chip").forEach((c) => {
                if (c.textContent && selectedDeliv.has(c.textContent)) {
                    c.classList.add("is-selected");
                    c.setAttribute("aria-pressed", "true");
                }
            });
            updateDeliv();
        }
        // __step intentionally not restored. Always start at 1.
    } catch {
        /* malformed JSON or unavailable storage; ignore */
    }
}
loadDraft();

// ─────────────────────────────────────────────────────────
// Auto-resize textareas
function autoresize(t: HTMLTextAreaElement): void {
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 600) + "px";
}
document.querySelectorAll<HTMLTextAreaElement>(".textarea").forEach((t) => {
    t.addEventListener("input", () => autoresize(t));
    requestAnimationFrame(() => autoresize(t));
});

// ─────────────────────────────────────────────────────────
// Success state — not persisted across refreshes. Reloading after submit
// returns the user to a fresh form so they can send another brief.
function showSuccessState(opts: { celebrate?: boolean } = {}): void {
    form.style.display = "none";
    if (stepNav) stepNav.style.display = "none";
    successScreen.style.display = "flex";
    paintOnlineStatus();
    progressSegs.forEach((s) => {
        s.classList.remove("is-current");
        s.classList.add("is-done");
    });
    if (opts.celebrate) fireConfetti();
}

// ─────────────────────────────────────────────────────────
// Reward burst on successful submit
function fireConfetti(): void {
    const colors = ["#0B0B0B", "#FF2E01", "#A3A3A3", "#FAFAFA"];
    const base = { origin: { y: 0.6 }, colors, disableForReducedMotion: true };
    confetti({ ...base, particleCount: 50, spread: 26, startVelocity: 55 });
    confetti({ ...base, particleCount: 40, spread: 60 });
    confetti({ ...base, particleCount: 70, spread: 100, decay: 0.91, scalar: 0.8 });
    confetti({ ...base, particleCount: 20, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    confetti({ ...base, particleCount: 20, spread: 120, startVelocity: 45 });
}

// ─────────────────────────────────────────────────────────
// Submit
type GtagFn = (event: string, action: string, params?: Record<string, unknown>) => void;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(TOTAL_STEPS)) {
        const firstError = document.querySelector<HTMLElement>(`.step[data-step="${TOTAL_STEPS}"] .has-error`);
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        if (!validateStep(i)) {
            goToStep(i);
            return;
        }
    }

    btnSubmit.disabled = true;
    submitLabel.textContent = "Sending…";

    const nameEl = document.getElementById("f-name") as HTMLInputElement;
    const productEl = document.getElementById("f-product") as HTMLInputElement;
    const subjectEl = document.getElementById("email-subject") as HTMLInputElement;
    const fromEl = document.getElementById("email-from") as HTMLInputElement;
    const name = nameEl.value.trim();
    const product = productEl.value.trim();
    const subject = product ? `New product brief · ${product}` : "New product brief · mocreac.com";
    subjectEl.value = subject;
    if (name) fromEl.value = name;

    const fd = new FormData(form);

    try {
        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: fd,
        });
        const json = (await res.json()) as { success?: boolean; message?: string };
        if (json.success) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {
                /* ignore */
            }
            showSuccessState({ celebrate: true });
            window.scrollTo({ top: 0, behavior: "smooth" });
            const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
            if (gtag) gtag("event", "product_brief_submitted", { event_category: "form" });
        } else {
            throw new Error(json.message || "Submission failed");
        }
    } catch {
        btnSubmit.disabled = false;
        submitLabel.textContent = "Send";
        errorToast.textContent = "Couldn't send the brief. Please try again, or email mocreacgeorge@gmail.com directly.";
        errorToast.style.display = "block";
    }
});

// Initialise step UI
goToStep(1, { silent: true });
