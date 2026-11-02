import './frequency-player.css';
import { smoothWaveform } from './smooth-waveform.ts';
import { phosphorIcon } from './phosphor-icons.ts';

const tracks = [
    { id: '01', title: 'Regeneration', use: 'Nap', band: 'Theta', hz: 6.3, right: 206.3 },
    { id: '02', title: 'IQ elevation', use: 'Study', band: 'Beta', hz: 18, right: 218 },
    { id: '03', title: 'Superlearning', use: 'Task', band: 'Alpha', hz: 10, right: 210 },
];
const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } };
let selected = Math.max(0, tracks.findIndex(t => t.id === read('frequency-track')));
let pinned = read('frequency-pinned') === 'true';
const card = document.createElement('article');
card.className = 'curation-card frequency-card';
card.innerHTML = `<div class="frequency-heading"><div><span class="note-kind">Audio</span><h2>Frequencies</h2></div><button type="button" data-pin aria-label="Pin frequency player" title="Pin to top">${phosphorIcon("pin")}</button></div>
<div class="frequency-tracks" role="tablist" aria-label="Frequency session">${tracks.map((t, i) => `<button type="button" role="tab" id="frequency-tab-${t.id}" aria-controls="frequency-panel" aria-selected="false" tabindex="-1" data-track="${i}" title="${t.title} · ${t.band} · ${t.hz.toFixed(1)} Hz">${t.use}</button>`).join('')}</div>
<div class="frequency-signal" id="frequency-panel" role="tabpanel" tabindex="0"><canvas class="smooth-waveform" aria-hidden="true"></canvas></div>
<div class="frequency-transport"><button class="copy-button" type="button" data-play aria-label="Play session">${phosphorIcon('playFill')}</button><div class="frequency-volume" data-slot="parameter-slider"><input data-volume type="range" min="0" max="1" step="0.01" value="0.2" aria-label="Playback volume" title="Double-click to reset volume" /></div></div>`;

const feedback = document.createElement('p');
feedback.className = 'frequency-feedback';
feedback.setAttribute('role', 'status');
card.append(feedback);
let context: AudioContext | undefined;
let gain: GainNode | undefined;
let analyser: AnalyserNode | undefined;
let source: AudioBufferSourceNode | undefined;
let loading = false;
let generation = 0;
let level = .2;
let muted = false;
const buffers = new Map<string, AudioBuffer>();
function stopAudio() {
    generation++;
    loading = false;
    source?.stop();
    source?.disconnect();
    source = undefined;
}

const play = card.querySelector<HTMLButtonElement>('[data-play]')!;
const volume = card.querySelector<HTMLInputElement>('[data-volume]')!;
const pin = card.querySelector<HTMLButtonElement>('[data-pin]')!;
function visibility() {
    pin.setAttribute('aria-pressed', String(pinned));
    pin.innerHTML = phosphorIcon('pin');
    pin.setAttribute('aria-label', pinned ? 'Unpin frequency player' : 'Pin frequency player');
    pin.title = pinned ? 'Unpin from top' : 'Pin to top';
}
function select(index: number) {
    stopAudio();
    selected = index;
    const t = tracks[index];
    card.querySelectorAll<HTMLButtonElement>('[data-track]').forEach((b, i) => {
        b.setAttribute('aria-selected', String(i === index));
        b.tabIndex = i === index ? 0 : -1;
    });
    card.querySelector('[role="tabpanel"]')!.setAttribute('aria-labelledby', `frequency-tab-${t.id}`);
    save('frequency-track', t.id);
    feedback.textContent = '';
    update();
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: t.use, artist: `${t.title} · ${t.hz} Hz`, album: 'Listening notes' });
}
function update() {
    for (const button of [play]) {
        button.innerHTML = phosphorIcon(source ? 'pauseFill' : 'playFill');
        button.setAttribute('aria-label', source ? 'Pause session' : 'Play session');
    }
}
function updateVolume() {
    for (const slider of [volume]) {
        slider.value = String(muted ? 0 : level);
        slider.setAttribute('aria-valuetext', `${Math.round(Number(slider.value) * 100)} percent`);
        slider.style.setProperty('--volume', `${Number(slider.value) * 100}%`);
    }
    if (context && gain) gain.gain.setTargetAtTime(muted ? 0 : level, context.currentTime, .015);
}
async function start() {
    if (source || loading) return;
    const request = ++generation;
    loading = true;
    try {
        context ??= new AudioContext();
        gain ??= context.createGain();
        analyser ??= context.createAnalyser();
        analyser.fftSize = 2048;
        gain.disconnect();
        analyser.disconnect();
        gain.connect(analyser);
        analyser.connect(context.destination);
        gain.gain.value = muted ? 0 : level;
        await context.resume();
        const id = tracks[selected].id;
        let buffer = buffers.get(id);
        if (!buffer) {
            const response = await fetch(`/media/frequencies/${id}.wav`);
            if (!response.ok) throw new Error('Audio unavailable');
            buffer = await context.decodeAudioData(await response.arrayBuffer());
            buffers.set(id, buffer);
        }
        if (request !== generation) return;
        const next = context.createBufferSource();
        next.buffer = buffer;
        next.loop = true;
        next.connect(gain);
        source = next;
        next.start();
        feedback.textContent = '';
        update();
    } catch {
        if (request === generation) {
            stopAudio();
            feedback.textContent = 'Playback unavailable. Try again.';
            update();
        }
    } finally { if (request === generation) loading = false; }
}
function togglePlayback() {
    if (source || loading) { stopAudio(); update(); }
    else void start();
}
play.onclick = togglePlayback;
card.querySelectorAll<HTMLButtonElement>('[data-track]').forEach(b => b.onclick = () => {
    const next = Number(b.dataset.track);
    if (selected !== next) { const playing = Boolean(source) || loading; select(next); if (playing) void start(); }
});
card.querySelector('.frequency-tracks')!.addEventListener('keydown', (event) => {
    const e = event as KeyboardEvent;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tracks.length - 1 : (selected + (e.key === 'ArrowRight' ? 1 : -1) + tracks.length) % tracks.length;
    const button = card.querySelector<HTMLButtonElement>(`[data-track="${next}"]`)!;
    button.click();
    button.focus();
});
for (const slider of [volume]) {
    slider.oninput = () => { level = Number(slider.value); muted = false; updateVolume(); };
    slider.ondblclick = () => { level = .2; muted = false; updateVolume(); };
}
pin.onclick = () => {
    pinned = !pinned;
    save('frequency-pinned', String(pinned));
    visibility();
    card.dispatchEvent(new CustomEvent('frequency-pin-change', { bubbles: true }));
};
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => { void start(); });
    navigator.mediaSession.setActionHandler('pause', () => { stopAudio(); update(); });
}
select(selected);
updateVolume();
visibility();
smoothWaveform(card.querySelector<HTMLCanvasElement>('.smooth-waveform')!, () => ({ analyser, active: Boolean(source) && !muted && level > 0, loading }));
export function frequencyCard(): HTMLElement { return card; }

export function isFrequencyPinned(): boolean { return pinned; }
