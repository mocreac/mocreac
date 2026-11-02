// Shadow values by Josh Miller (@jshmllr).
// Original: https://codepen.io/jshmllr/pen/LERqgQa
export const DARK_ELEVATIONS = [
	{ name: "dm-elevation-0", desc: "Flat: no lift signal", shadow: "none", layers: [] },
	{ name: "dm-elevation-1", desc: "Sunken: inset border only",
		shadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
		layers: ["inset 0 0 0 1px rgba(255,255,255,0.02)"] },
	{ name: "dm-elevation-2", desc: "First lift: inner cards, inset panels",
		shadow: "inset 0 1px 0 0 rgba(255,255,255,0.02), inset 0 0 0 1px rgba(255,255,255,0.02), 0 1px 1px -0.5px rgba(0,0,0,0.18)",
		layers: [
			"inset 0 1px 0 0 rgba(255,255,255,0.02)",
			"inset 0 0 0 1px rgba(255,255,255,0.02)",
			"0 1px 1px -0.5px rgba(0,0,0,0.18)"
		] },
	{ name: "dm-elevation-3", desc: "Card / surface",
		shadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.02), 0 0 0 1px rgba(0,0,0,0.12), 0 1px 1px -0.5px rgba(0,0,0,0.18), 0 3px 3px -1.5px rgba(0,0,0,0.18)",
		layers: [
			"inset 0 1px 0 0 rgba(255,255,255,0.05)",
			"inset 0 0 0 1px rgba(255,255,255,0.02)",
			"0 0 0 1px rgba(0,0,0,0.12)",
			"0 1px 1px -0.5px rgba(0,0,0,0.18)",
			"0 3px 3px -1.5px rgba(0,0,0,0.18)"
		] },
	{ name: "dm-elevation-4", desc: "Popover / dropdown",
		shadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 0 1px rgba(0,0,0,0.14), 0 1px 1px -0.5px rgba(0,0,0,0.18), 0 3px 3px -1.5px rgba(0,0,0,0.18), 0 6px 6px -3px rgba(0,0,0,0.18)",
		layers: [
			"inset 0 1px 0 0 rgba(255,255,255,0.05)",
			"inset 0 0 0 1px rgba(255,255,255,0.04)",
			"0 0 0 1px rgba(0,0,0,0.14)",
			"0 1px 1px -0.5px rgba(0,0,0,0.18)",
			"0 3px 3px -1.5px rgba(0,0,0,0.18)",
			"0 6px 6px -3px rgba(0,0,0,0.18)"
		] },
	{ name: "dm-elevation-5", desc: "Sticky / floating bar",
		shadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 0 1px rgba(0,0,0,0.16), 0 1px 1px -0.5px rgba(0,0,0,0.18), 0 3px 3px -1.5px rgba(0,0,0,0.18), 0 6px 6px -3px rgba(0,0,0,0.18), 0 12px 12px -6px rgba(0,0,0,0.18)",
		layers: [
			"inset 0 1px 0 0 rgba(255,255,255,0.08)",
			"inset 0 0 0 1px rgba(255,255,255,0.04)",
			"0 0 0 1px rgba(0,0,0,0.16)",
			"0 1px 1px -0.5px rgba(0,0,0,0.18)",
			"0 3px 3px -1.5px rgba(0,0,0,0.18)",
			"0 6px 6px -3px rgba(0,0,0,0.18)",
			"0 12px 12px -6px rgba(0,0,0,0.18)"
		] },
	{ name: "dm-elevation-6", desc: "Modal / dialog",
		shadow: "inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(0,0,0,0.18), 0 1px 1px -0.5px rgba(0,0,0,0.18), 0 3px 3px -1.5px rgba(0,0,0,0.18), 0 6px 6px -3px rgba(0,0,0,0.18), 0 12px 12px -6px rgba(0,0,0,0.18), 0 24px 24px -12px rgba(0,0,0,0.18)",
		layers: [
			"inset 0 1px 0 0 rgba(255,255,255,0.08)",
			"inset 0 0 0 1px rgba(255,255,255,0.06)",
			"0 0 0 1px rgba(0,0,0,0.18)",
			"0 1px 1px -0.5px rgba(0,0,0,0.18)",
			"0 3px 3px -1.5px rgba(0,0,0,0.18)",
			"0 6px 6px -3px rgba(0,0,0,0.18)",
			"0 12px 12px -6px rgba(0,0,0,0.18)",
			"0 24px 24px -12px rgba(0,0,0,0.18)"
		] },
	{ name: "dm-elevation-7", desc: "Full overlay: maximum depth",
		shadow: "inset 0 1px 0 0 rgba(255,255,255,0.11), inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(0,0,0,0.20), 0 1px 1px -0.5px rgba(0,0,0,0.18), 0 3px 3px -1.5px rgba(0,0,0,0.18), 0 6px 6px -3px rgba(0,0,0,0.18), 0 12px 12px -6px rgba(0,0,0,0.18), 0 24px 24px -12px rgba(0,0,0,0.18), 0 48px 48px -24px rgba(0,0,0,0.18)",
		layers: [
			"inset 0 1px 0 0 rgba(255,255,255,0.11)",
			"inset 0 0 0 1px rgba(255,255,255,0.06)",
			"0 0 0 1px rgba(0,0,0,0.20)",
			"0 1px 1px -0.5px rgba(0,0,0,0.18)",
			"0 3px 3px -1.5px rgba(0,0,0,0.18)",
			"0 6px 6px -3px rgba(0,0,0,0.18)",
			"0 12px 12px -6px rgba(0,0,0,0.18)",
			"0 24px 24px -12px rgba(0,0,0,0.18)",
			"0 48px 48px -24px rgba(0,0,0,0.18)"
		] }
];

export const LIGHT_ELEVATIONS = [
	{ name: "elevation-0", desc: "Flat: ambient ring only",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06)",
		layers: ["0 0 0 1px rgba(0,0,0,0.06)"] },
	{ name: "elevation-1", desc: "Subtle lift: inner cards, inset panels",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)"
		] },
	{ name: "elevation-2", desc: "Card / surface",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)",
			"0 3px 3px -1.5px rgba(0,0,0,0.06)"
		] },
	{ name: "elevation-3", desc: "Popover / dropdown",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)",
			"0 3px 3px -1.5px rgba(0,0,0,0.06)",
			"0 6px 6px -3px rgba(0,0,0,0.06)"
		] },
	{ name: "elevation-4", desc: "Sticky / floating",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06), 0px 12px 12px -6px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)",
			"0 3px 3px -1.5px rgba(0,0,0,0.06)",
			"0 6px 6px -3px rgba(0,0,0,0.06)",
			"0 12px 12px -6px rgba(0,0,0,0.06)"
		] },
	{ name: "elevation-5", desc: "Modal / dialog",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06), 0px 12px 12px -6px rgba(0,0,0,0.06), 0px 24px 24px -12px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)",
			"0 3px 3px -1.5px rgba(0,0,0,0.06)",
			"0 6px 6px -3px rgba(0,0,0,0.06)",
			"0 12px 12px -6px rgba(0,0,0,0.06)",
			"0 24px 24px -12px rgba(0,0,0,0.06)"
		] },
	{ name: "elevation-6", desc: "Overlay / drawer",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06), 0px 12px 12px -6px rgba(0,0,0,0.06), 0px 24px 24px -12px rgba(0,0,0,0.06), 0px 48px 48px -24px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)",
			"0 3px 3px -1.5px rgba(0,0,0,0.06)",
			"0 6px 6px -3px rgba(0,0,0,0.06)",
			"0 12px 12px -6px rgba(0,0,0,0.06)",
			"0 24px 24px -12px rgba(0,0,0,0.06)",
			"0 48px 48px -24px rgba(0,0,0,0.06)"
		] },
	{ name: "elevation-7", desc: "Full overlay: maximum depth",
		shadow: "0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 1px -0.5px rgba(0,0,0,0.06), 0px 3px 3px -1.5px rgba(0,0,0,0.06), 0px 6px 6px -3px rgba(0,0,0,0.06), 0px 12px 12px -6px rgba(0,0,0,0.06), 0px 24px 24px -12px rgba(0,0,0,0.06), 0px 48px 48px -24px rgba(0,0,0,0.06), 0px 96px 96px -48px rgba(0,0,0,0.06)",
		layers: [
			"0 0 0 1px rgba(0,0,0,0.06)",
			"0 1px 1px -0.5px rgba(0,0,0,0.06)",
			"0 3px 3px -1.5px rgba(0,0,0,0.06)",
			"0 6px 6px -3px rgba(0,0,0,0.06)",
			"0 12px 12px -6px rgba(0,0,0,0.06)",
			"0 24px 24px -12px rgba(0,0,0,0.06)",
			"0 48px 48px -24px rgba(0,0,0,0.06)",
			"0 96px 96px -48px rgba(0,0,0,0.06)"
		] }
];

