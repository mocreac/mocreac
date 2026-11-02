import './shadow-widget.css';
import { elevationPrompt } from './elevation-prompt.ts';
import { DARK_ELEVATIONS, LIGHT_ELEVATIONS } from './shadow-elevations.ts';
import { phosphorIcon } from './phosphor-icons.ts';

// Keep widget state when switching Notes categories.
let instance: HTMLElement | undefined;
export function shadowWidget(): HTMLElement {
    if (instance) return instance;
    const card = document.createElement('article');
    instance = card;
    card.className = 'curation-card shadow-widget';
    card.innerHTML = `<div class="shadow-heading"><div><span class="note-kind">Tool</span><h2>Shadow elevation</h2></div><button type="button" class="shadow-mode" aria-label="Dark mode" aria-pressed="false" title="Toggle dark preview">${phosphorIcon('moon')}</button></div>
        <div class="shadow-workbench">
            <div class="shadow-stage" aria-label="Shadow preview"><div class="shadow-light" aria-hidden="true"></div><div class="shadow-sample" aria-hidden="true"><span class="shadow-glow"></span></div></div>
            <div class="shadow-current"><span data-shadow-name></span><p data-shadow-description></p></div>
            <div class="shadow-control"><div class="shadow-range"><input type="range" min="0" max="7" step="1" value="3" aria-label="Shadow elevation level" /><div class="shadow-ticks" aria-hidden="true">${Array.from({length:8}, (_,i) => `<span>${i}</span>`).join('')}</div></div></div>
            <div class="shadow-layers shadow-table" role="table" aria-label="Shadow layer values in pixels"><div class="shadow-table-header" role="row"><span role="columnheader">X</span><span role="columnheader">Y</span><span role="columnheader">Blur</span><span role="columnheader">Spread</span><span role="columnheader">Color</span></div><div data-layers role="rowgroup"></div></div>

        </div>
        <div class="shadow-footer"><a class="note-source" href="https://codepen.io/jshmllr/pen/LERqgQa" target="_blank" rel="noopener noreferrer">By Josh Miller</a><div class="shadow-copy-actions"><button class="copy-button" type="button" data-copy><span>Copy CSS</span></button><button class="copy-button" type="button" data-copy-prompt><span>Copy Prompt</span></button></div></div><p class="shadow-feedback" role="status"></p>`;
    const sample = card.querySelector<HTMLElement>('.shadow-sample')!;
    const slider = card.querySelector<HTMLInputElement>('input[type=range]')!;
    const mode = card.querySelector<HTMLButtonElement>('.shadow-mode')!;
    const layers = card.querySelector<HTMLElement>('[data-layers]')!;
    const cssOutput = () => current().layers.length ? `box-shadow:\n  ${current().layers.join(',\n  ')};` : 'box-shadow: none;';
    const feedback = card.querySelector<HTMLElement>('.shadow-feedback')!;
    const copy = card.querySelector<HTMLButtonElement>('[data-copy]')!;
    let dark = false, level = 3;
    let copyTimer = 0;
    let promptTimer = 0;
    const values = () => dark ? DARK_ELEVATIONS : LIGHT_ELEVATIONS;
    const current = () => values()[level];
    const classify = (layer: string) => layer.startsWith('inset 0 1px') ? 'Top highlight' : layer.startsWith('inset') ? 'Inset ring' : /^(0|0px) (0|0px) (0|0px) 1px/.test(layer) ? 'Ambient ring' : 'Drop shadow';
    // Stable row slots let existing lines stay in place while new lines unfold.
    const layerRows = Array.from({ length: 9 }, (_, i) => {
        const row = document.createElement('div');
        row.className = 'shadow-layer-row';
        const content = document.createElement('div');
        content.className = 'shadow-layer-content';
        const button = document.createElement('div');
        button.className = 'shadow-table-values';
        button.setAttribute('role', 'row');
        const cells = Array.from({ length: 5 }, () => {
            const cell = document.createElement('span');
            cell.setAttribute('role', 'cell');
            button.append(cell);
            return cell;
        });
        content.append(button);
        row.append(content);
        layers.append(row);
        return { row, button, cells };
    });
    const empty = document.createElement('p');
    empty.textContent = 'No shadow layers.';
    layers.append(empty);
    function paint() {
        const item = current();
        sample.style.boxShadow = item.shadow;
        card.style.setProperty('--shadow-lift', String(level / 7));
        card.style.setProperty('--shadow-raise', `${Math.round(level / 7 * (dark ? 6 : 5))}px`);

    }
    function render() {
        const item = current();
        card.dataset.dark = String(dark);
        mode.setAttribute('aria-pressed', String(dark));
        mode.innerHTML = phosphorIcon(dark ? 'sun' : 'moon');
        mode.title = dark ? 'Switch to light preview' : 'Switch to dark preview';
        card.querySelector('[data-shadow-name]')!.textContent = item.name;
        card.querySelector('[data-shadow-description]')!.textContent = item.desc;
        slider.value = String(level);
        slider.setAttribute('aria-valuetext', `${level} of 7: ${item.desc}`);
        slider.style.setProperty('--progress', `${level / 7 * 100}%`);
        layerRows.forEach(({ row, button, cells }, i) => {
            const layer = item.layers[i];
            const visible = layer !== undefined;
            row.classList.toggle('is-visible', visible);
            row.setAttribute('aria-hidden', String(!visible));
            row.inert = !visible;
            if (visible) {
                button.setAttribute('aria-label', `${classify(layer)}${layer.startsWith('inset') ? ', inset' : ''}`);
                button.title = layer;
                const [x, y, blur, spread] = layer.replace(/^inset\s+/, '').split(/\s+/).slice(0, 4);
                [x, y, blur, spread].forEach((value, column) => { cells[column].textContent = String(parseFloat(value)); });
                const rgba = layer.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/)!;
                const hex = '#' + rgba.slice(1, 4).map(value => Number(value).toString(16).padStart(2, '0')).join('').toUpperCase();
                const opacity = Math.round(Number(rgba[4]) * 100);
                cells[4].className = 'shadow-color-cell';
                cells[4].replaceChildren();
                const swatch = document.createElement('i');
                swatch.setAttribute('aria-hidden', 'true');
                swatch.style.setProperty('--swatch-color', rgba[0]);
                swatch.title = `${hex} at ${opacity}% opacity (${rgba[0]})`;
                const color = document.createElement('span');
                color.textContent = `${hex} ${opacity}%`;
                cells[4].append(swatch, color);
            }
        });
        empty.hidden = item.layers.length > 0;
        feedback.textContent = '';
        copy.querySelector('span')!.textContent = 'Copy CSS';
        paint();
    }
    function change(next: number) { level = Math.max(0, Math.min(7, next)); render(); }
    slider.oninput = () => change(Number(slider.value));
    mode.onclick = () => { dark = !dark; render(); };
    copy.onclick = async () => {
        try {
            await navigator.clipboard.writeText(cssOutput());
            copy.querySelector('span')!.textContent = 'Copied!';
            window.clearTimeout(copyTimer);
            copyTimer = window.setTimeout(() => { copy.querySelector('span')!.textContent = 'Copy CSS'; }, 1800);
        } catch {
            feedback.textContent = cssOutput();
        }
    };
    const copyPrompt = card.querySelector<HTMLButtonElement>('[data-copy-prompt]')!;
    copyPrompt.onclick = async () => {
        try {
            await navigator.clipboard.writeText(elevationPrompt());
            copyPrompt.querySelector('span')!.textContent = 'Copied!';
            feedback.textContent = '';
            window.clearTimeout(promptTimer);
            promptTimer = window.setTimeout(() => { copyPrompt.querySelector('span')!.textContent = 'Copy Prompt'; }, 1800);
        } catch {
            feedback.textContent = elevationPrompt();
        }
    };
    render();
    return card;
}
