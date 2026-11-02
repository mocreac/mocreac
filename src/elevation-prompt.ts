import { DARK_ELEVATIONS, LIGHT_ELEVATIONS } from './shadow-elevations.ts';

/** Self-contained agent handoff. Values come from the same presets as the preview. */
export function elevationPrompt(): string {
    const tokens = (items: typeof LIGHT_ELEVATIONS, dark = false) => {
        const declarations = items.map((item, i) => `  --elevation-${i}: ${item.shadow};`).join('\n');
        const aliases = dark
            ? '  --shadow-card: var(--elevation-3);\n  --shadow-popover: var(--elevation-4);\n  --shadow-floating: var(--elevation-5);\n  --shadow-dialog: var(--elevation-6);'
            : '  --shadow-card: var(--elevation-2);\n  --shadow-popover: var(--elevation-3);\n  --shadow-floating: var(--elevation-4);\n  --shadow-dialog: var(--elevation-5);';
        return `${dark ? '[data-theme="dark"]' : ':root'} {\n${declarations}\n${aliases}\n}`;
    };
    return `Implement these exact elevation tokens in the project's existing design system. Inspect its token definitions, theme selectors, and shadow usage first. Adapt the selectors below to the existing light/dark theme mechanism; preserve all shadow values and layer order.

Use the semantic aliases for cards, popovers, floating controls, and dialogs (e.g. box-shadow: var(--shadow-card)). Replace corresponding ad hoc surface shadows and map framework utilities to these tokens. Keep focus rings, inset control borders, and intentional decorative shadows. Preserve layout, colors, and typography. Verify representative components in both themes, run the project's relevant checks, and summarize changed files and validation.

Exact CSS values:
\`\`\`css
${tokens(LIGHT_ELEVATIONS)}

${tokens(DARK_ELEVATIONS, true)}
\`\`\``;
}
