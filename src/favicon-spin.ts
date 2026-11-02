// Rotates the favicon 90° per second using cached PNG frames.
// Static file icons remain available before JavaScript and for crawlers.

const PATH_D =
    "M315.79,61.98h0c0-8.68,0-13.02-.51-16.66-3.27-23.26-21.55-41.54-44.8-44.8-3.64-.51-7.98-.51-16.66-.51H84.21c-29.48,0-44.22,0-55.47,5.74-9.9,5.05-17.96,13.1-23,23C0,40,0,54.73,0,84.21v147.37c0,29.48,0,44.22,5.74,55.47,5.05,9.9,13.1,17.96,23,23,11.26,5.74,26,5.74,55.47,5.74h147.37c29.48,0,44.22,0,55.47-5.74,9.9-5.05,17.96-13.1,23-23,5.74-11.26,5.74-26,5.74-55.47v-20.46c0-29.48,0-44.22-5.74-55.47-5.05-9.9-13.1-17.96-23-23-11.26-5.74-26-5.74-55.47-5.74h-75.02l25.69,30.99-25.67,30.98h71.13c9.83,0,14.74,0,18.49,1.91,3.3,1.68,5.99,4.37,7.67,7.67,1.91,3.75,1.91,8.67,1.91,18.49v8.79c0,9.83,0,14.74-1.91,18.49-1.68,3.3-4.37,5.99-7.67,7.67-3.75,1.91-8.67,1.91-18.49,1.91H88.08c-9.83,0-14.74,0-18.49-1.91-3.3-1.68-5.99-4.37-7.67-7.67-1.91-3.75-1.91-8.67-1.91-18.49v-9.05c0-3.97,0-5.95.4-7.84.35-1.68.94-3.3,1.74-4.82.9-1.71,2.17-3.24,4.71-6.28l33.42-40.2-33.42-40.21c-2.53-3.05-3.8-4.57-4.7-6.28-.8-1.52-1.39-3.14-1.74-4.82-.4-1.89-.4-3.87-.4-7.84v-8.36c0-9.83,0-14.74,1.91-18.49,1.68-3.3,4.37-5.99,7.67-7.67,3.75-1.91,8.67-1.91,18.49-1.91h227.71Z";
const CENTER = 157.895;
const INTERVAL_MS = 1000;
const theme = matchMedia("(prefers-color-scheme: dark)");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function buildSvg(rot: number): string {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 315.79 315.79">' +
        `<style>.bg{fill:${theme.matches ? '#010101' : '#fff'};stroke:${theme.matches ? '#010101' : '#fff'}}.fg{fill:${theme.matches ? '#fff' : '#010101'}}</style>` +
        '<rect class="bg" width="315.79" height="315.79" rx="62" ry="62" stroke-width="72"/>' +
        '<g transform="translate(40 40) scale(0.747)">' +
        '<g transform="rotate(' + rot + " " + CENTER + " " + CENTER + ')">' +
        '<path class="fg" d="' + PATH_D + '"/>' +
        "</g></g></svg>"
    );
}

const spinLink = document.createElement('link');
spinLink.rel = 'icon';
spinLink.type = 'image/png';
spinLink.sizes = '64x64';
spinLink.id = 'favicon-spin';
let frames: string[] = [];
let frame = 0;
let timer: ReturnType<typeof setInterval> | undefined;
let generation = 0;

function syncPlayback(): void {
    clearInterval(timer);
    timer = undefined;
    if (!frames.length) return;
    if (motion.matches) frame = 0;
    spinLink.href = frames[frame];
    if (document.visibilityState !== 'visible' || motion.matches) return;
    timer = setInterval(() => {
        frame = (frame + 1) % frames.length;
        spinLink.href = frames[frame];
    }, INTERVAL_MS);
}

async function prepareFrames(): Promise<void> {
    const current = ++generation;
    const next = await Promise.all([0, 90, 180, 270].map(async angle => {
        const image = new Image();
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(buildSvg(angle));
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Favicon canvas unavailable');
        context.drawImage(image, 0, 0, 64, 64);
        return canvas.toDataURL('image/png');
    }));
    if (current !== generation) return;
    frames = next;
    frame = 0;
    // One live candidate avoids browsers choosing an unrelated static size.
    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach(link => link.remove());
    document.head.append(spinLink);
    syncPlayback();
}
const prepare = () => { void prepareFrames().catch(() => { /* Keep the existing static fallback. */ }); };
theme.addEventListener('change', prepare);
motion.addEventListener('change', syncPlayback);
document.addEventListener('visibilitychange', syncPlayback);
window.addEventListener('pagehide', () => clearInterval(timer));
window.addEventListener('pageshow', syncPlayback);
prepare();
if (import.meta.hot) import.meta.hot.dispose(() => {
    ++generation;
    clearInterval(timer);
    theme.removeEventListener('change', prepare);
    motion.removeEventListener('change', syncPlayback);
    document.removeEventListener('visibilitychange', syncPlayback);
});
