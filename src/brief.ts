// Multi-step Brand Identity Brief form. Mirrors the original inline script
// in brief/index.html, just typed and split out for Vite to bundle.

// Favicon spin runs as a side-effect import — Vite collapses multiple
// <script type="module"> entries in one HTML into a single page bundle,
// so we pull this in here rather than tagging it separately in the HTML.
import "./favicon-spin.ts";

// ─────────────────────────────────────────────────────────
// Configuration
const STORAGE_KEY = "mocreac:brief:v1";
const ASSOCIATIONS: readonly string[] = [
    "Approachability", "Authenticity", "Boldness", "Calm", "Clarity", "Confidence", "Craft", "Creativity",
    "Elegance", "Energy", "Heritage", "Innovation", "Intelligence", "Luxury", "Minimalism", "Modernity",
    "Optimism", "Playfulness", "Power", "Precision", "Quality", "Simplicity", "Sophistication", "Sustainability",
    "Trust", "Warmth", "Wisdom", "Wit",
];

// ─────────────────────────────────────────────────────────
// State
let currentStep = 1;
const TOTAL_STEPS = 4;

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

// ─────────────────────────────────────────────────────────
// Associations chips
const assocGrid = document.getElementById("associations-grid") as HTMLElement;
const assocInput = document.getElementById("f-associations") as HTMLInputElement;
const selectedAssoc = new Set<string>();

ASSOCIATIONS.forEach((word) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = word;
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", () => {
        if (selectedAssoc.has(word)) {
            selectedAssoc.delete(word);
            chip.classList.remove("is-selected");
            chip.setAttribute("aria-pressed", "false");
        } else {
            selectedAssoc.add(word);
            chip.classList.add("is-selected");
            chip.setAttribute("aria-pressed", "true");
        }
        updateAssoc();
        saveDraft();
    });
    assocGrid.appendChild(chip);
});

function updateAssoc(): void {
    assocInput.value = Array.from(selectedAssoc).join(", ");
}

// ─────────────────────────────────────────────────────────
// Radio option cards (Yes / No)
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
        saveDraft();
    });
});

// ─────────────────────────────────────────────────────────
// Step navigation
function goToStep(n: number, opts: { silent?: boolean } = {}): void {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, n));
    steps.forEach((s) => s.classList.remove("is-active"));
    const target = document.querySelector<HTMLElement>(`.step[data-step="${currentStep}"]`);
    target?.classList.add("is-active");

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
            valid = selectedAssoc.size > 0;
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
    data["__assoc"] = Array.from(selectedAssoc);
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
        const assocList = data["__assoc"];
        if (Array.isArray(assocList)) {
            assocList.forEach((w) => {
                if (typeof w === "string") selectedAssoc.add(w);
            });
            document.querySelectorAll<HTMLElement>(".chip").forEach((c) => {
                if (c.textContent && selectedAssoc.has(c.textContent)) {
                    c.classList.add("is-selected");
                    c.setAttribute("aria-pressed", "true");
                }
            });
            updateAssoc();
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
    t.style.height = Math.min(t.scrollHeight, 400) + "px";
}
document.querySelectorAll<HTMLTextAreaElement>(".textarea").forEach((t) => {
    t.addEventListener("input", () => autoresize(t));
    requestAnimationFrame(() => autoresize(t));
});

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
    const brandEl = document.getElementById("f-brand") as HTMLInputElement;
    const subjectEl = document.getElementById("email-subject") as HTMLInputElement;
    const fromEl = document.getElementById("email-from") as HTMLInputElement;
    const name = nameEl.value.trim();
    const brand = brandEl.value.trim();
    const subject = brand ? `New brief · ${brand}` : "New brief · mocreac.com";
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
            form.style.display = "none";
            document.querySelector(".step-nav")?.remove();
            successScreen.style.display = "block";
            progressSegs.forEach((s) => {
                s.classList.remove("is-current");
                s.classList.add("is-done");
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
            const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
            if (gtag) gtag("event", "brief_submitted", { event_category: "form" });
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
