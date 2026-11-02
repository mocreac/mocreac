// Canvas adapter for audiocn SmoothWaveform. Rendering model and wave-line
// implementation: https://github.com/audiocn/ui (MIT; see vendor/audiocn/LICENSE).
import { createWaveLine } from './vendor/audiocn/wave-line.ts';
import { bandsFromSpectrum, logBandEdges } from './vendor/audiocn/bands.ts';
import type { VisualFrame } from './vendor/audiocn/types.ts';

export function smoothWaveform(canvas: HTMLCanvasElement, read: () => { analyser?: AnalyserNode; active: boolean; loading: boolean }) {
    const ctx = canvas.getContext('2d')!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let line = createWaveLine({ mode: 'wave', loading: false, reducedMotion: motion.matches, sensitivity: 1.5 });
    let wasLoading = false;
    let width = 0, height = 0, ratio = 1, visible = true, raf = 0, last = 0;
    const spectrum = new Float32Array(1024);
    const bands = new Float32Array(16);
    let edges = logBandEdges(16, 20, 20000);
    const frame: VisualFrame = { bands, history: new Float32Array(0), historyStart: 0, historyLength: 0, peakDb: -Infinity };
    const resize = new ResizeObserver(() => {
        const rect = canvas.getBoundingClientRect();
        width = rect.width; height = rect.height; ratio = devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.round(width * ratio)); canvas.height = Math.max(1, Math.round(height * ratio));
    });
    resize.observe(canvas);
    const visibility = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; });
    visibility.observe(canvas);
    const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden || !width || (motion.matches && now - last < 250)) return;
        last = now;
        const state = read();
        if (wasLoading !== state.loading) {
            wasLoading = state.loading;
            line = createWaveLine({ mode: 'wave', loading: wasLoading, reducedMotion: motion.matches, sensitivity: 1.5 });
        }
        if (state.analyser && state.active) {
            state.analyser.getFloatFrequencyData(spectrum);
            edges = logBandEdges(16, 20, Math.min(20000, state.analyser.context.sampleRate / 2));
            bandsFromSpectrum(spectrum, state.analyser.context.sampleRate, edges, bands);
        } else bands.fill(0);
        const active = line.step(now, frame, Math.min(513, Math.round(width / 3) + 1));
        canvas.dataset.active = String(active);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = getComputedStyle(canvas).color;
        ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
        for (let i = 0; i < line.count; i++) {
            const x = i / (line.count - 1) * width;
            const y = height / 2 - line.heights[i] * (height / 2 - 2);
            if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'destination-out';
        const fade = ctx.createLinearGradient(0, 0, width, 0);
        fade.addColorStop(0, '#000'); fade.addColorStop(Math.min(.49, 24 / width), '#0000');
        fade.addColorStop(Math.max(.51, 1 - 24 / width), '#0000'); fade.addColorStop(1, '#000');
        ctx.fillStyle = fade; ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); resize.disconnect(); visibility.disconnect(); };
}
