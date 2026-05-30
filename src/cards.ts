// Homepage cards — touch interaction.
//
// On desktop the cards reveal their description + CTA on hover (pure CSS).
// On touch devices there's no hover, and each card is otherwise a link that
// would navigate on the very first tap. Instead we want the first tap to
// *expand* the card (mirroring the desktop hover) and only a tap on the card's
// CTA to perform the action. Desktop behaviour is left untouched.

function initCardExpand(): void {
    const hoverNone = window.matchMedia("(hover: none)");
    const cards = Array.from(
        document.querySelectorAll<HTMLElement>(".cards-row .card"),
    );
    if (!cards.length) return;

    const collapseAll = (except?: HTMLElement) => {
        cards.forEach((c) => {
            if (c !== except) c.classList.remove("is-expanded");
        });
    };

    cards.forEach((card) => {
        card.addEventListener("click", (e) => {
            // Desktop (real hover): leave links alone — hover handles the
            // reveal and a click should navigate immediately.
            if (!hoverNone.matches) return;

            const onCta = (e.target as Element).closest?.(".card-cta");
            const isExpanded = card.classList.contains("is-expanded");

            // Expanded + tapped the CTA → let the action (link) go through.
            if (isExpanded && onCta) return;

            // Any other tap on a collapsed-or-open card stays on the page:
            // first tap opens it, taps elsewhere on an open card do nothing.
            e.preventDefault();
            if (!isExpanded) {
                collapseAll(card);
                card.classList.add("is-expanded");
            }
        });
    });

    // Tapping outside the cards closes whichever one is open.
    document.addEventListener("click", (e) => {
        if (!hoverNone.matches) return;
        const target = e.target as Element | null;
        if (target?.closest?.(".cards-row .card")) return;
        collapseAll();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCardExpand);
} else {
    initCardExpand();
}
