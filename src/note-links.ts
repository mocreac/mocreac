import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'sonner';
import './note-links.css';

// Rim motion adapted from Board UI's Composer Loader:
// https://www.boardui.com/components/composer-loader
export function attachNoteLink(card: HTMLElement, id: string): void {
    card.id = id;
    const heading = card.querySelector('h2, h3');
    if (!heading || heading.querySelector('[data-section-link]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.sectionLink = '';
    button.className = 'note-title-link';
    button.textContent = heading.textContent;
    button.setAttribute('aria-label', `Copy link to ${heading.textContent}`);
    heading.replaceChildren(button);
    button.addEventListener('click', async () => {
        const url = new URL(location.href);
        url.hash = id;
        try {
            await navigator.clipboard.writeText(url.href);
            announce('Section link copied');
        } catch {
            announce(`Copy this section link: ${url.href}`);
        }
    });
}

const toasterHost = document.createElement('div');
document.body.append(toasterHost);
createRoot(toasterHost).render(createElement(Toaster, {
    position: 'bottom-center',
    toastOptions: {
        duration: 3000,
        style: { fontFamily: 'Onest, sans-serif', background: '#fff', color: '#191919', borderColor: '#e5e5e5', borderRadius: '12px' },
    },
}));
function announce(message: string): void {
    toast(message, { id: 'section-link' });
}

let cleanup: (() => void) | undefined;
export function highlightNote(card: HTMLElement): void {
    cleanup?.();
    const overlay = document.createElement('span');
    overlay.className = 'note-link-rim';
    overlay.setAttribute('aria-hidden', 'true');
    const uid = `rim-${card.id}`;
    const draw = () => {
        const w = card.clientWidth, h = card.clientHeight;
        const r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 22;
        // Punch out the same rounded rectangle traced by the moving strokes.
        // Keep a 48px exterior canvas for the outward bloom.
        const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 96}" height="${h + 96}"><path fill="white" fill-rule="evenodd" d="M0 0H${w + 96}V${h + 96}H0Z M${48 + r} 48H${48 + w - r}A${r} ${r} 0 0 1 ${48 + w} ${48 + r}V${48 + h - r}A${r} ${r} 0 0 1 ${48 + w - r} ${48 + h}H${48 + r}A${r} ${r} 0 0 1 48 ${48 + h - r}V${48 + r}A${r} ${r} 0 0 1 ${48 + r} 48Z"/></svg>`;
        const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(mask)}")`;
        overlay.style.maskImage = maskUrl;
        overlay.style.webkitMaskImage = maskUrl;
        const perimeter = Math.max(1, 2 * (w + h) - 8 * r + 2 * Math.PI * r);
        const band = 100 / 3;
        const layers = [[32, 14, .3, band * .9, 32], [8, 6, .65, band * .95, 10]];
        overlay.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs>${[14,6,.5].map(blur => `<filter id="${uid}-${blur}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`).join('')}</defs>${layers.map(([width,blur,opacity,len,back]) => `<rect width="${w}" height="${h}" rx="${r}" pathLength="100" fill="none" stroke="rgba(0,0,0,0.48)" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${len} ${100-len}" filter="url(#${uid}-${blur})" style="opacity:${opacity};stroke-dashoffset:${len-band+back*100/perimeter}"/>`).join('')}</svg>`;
    };
    let inView = false;
    let ready = false;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const waitForScroll = () => {
        if (started) return;
        ready = false;
        clearTimeout(settleTimer);
        if (!inView || document.visibilityState !== 'visible') return;
        settleTimer = setTimeout(() => { ready = true; syncVisibility(); }, 200);
    };
    let started = false;
    let finishing = false;
    let animations: Animation[] = [];
    const duration = 1200;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const syncVisibility = () => {
        const visible = inView && document.visibilityState === 'visible';
        if (visible && ready && !started) {
            started = true;
            draw();
            card.append(overlay);
            card.classList.add('is-link-highlighted');
            const reveal = overlay.animate([{ opacity: 0 }, { opacity: 1, offset: 180 / duration }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration, easing: 'ease-in-out', fill: 'forwards' });
            animations = [...overlay.querySelectorAll('rect')].map(rect => {
                const offset = Number(rect.style.strokeDashoffset);
                return rect.animate(reducedMotion ? [{ opacity: rect.style.opacity }, { opacity: rect.style.opacity }] : [
                    { strokeDashoffset: String(offset) },
                    { strokeDashoffset: String(offset - 100) },
                ], { duration, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' });
            });
            animations.push(reveal);
            void Promise.all(animations.map(animation => animation.finished)).then(() => {
                if (finishing) return;
                finishing = true;
                card.classList.remove('is-link-highlighted');
                dispose();
            }).catch(() => {});
        }
        if (started && !finishing) {
            overlay.style.visibility = visible ? 'visible' : 'hidden';
            card.classList.toggle('is-link-highlighted', visible);
            animations.forEach(animation => visible ? animation.play() : animation.pause());
        }
    };
    // Require the title/upper part of even a tall card to be on screen.
    const target = card.querySelector('h2, h3') ?? card;
    const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .75;
        waitForScroll();
        syncVisibility();
    }, { threshold: [0, .75, 1] });
    const dispose = () => {
        finishing = true;
        animations.forEach(animation => animation.cancel());
        observer.disconnect();
        clearTimeout(settleTimer);
        window.removeEventListener('scroll', waitForScroll);
        window.removeEventListener('scrollend', waitForScroll);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        overlay.remove();
        card.classList.remove('is-link-highlighted');
        if (cleanup === dispose) cleanup = undefined;
    };
    cleanup = dispose;
    const onVisibilityChange = () => { waitForScroll(); syncVisibility(); };
    window.addEventListener('scroll', waitForScroll, { passive: true });
    window.addEventListener('scrollend', waitForScroll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    observer.observe(target);
}
