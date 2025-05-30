import type { Config } from "tailwindcss";
const plugin = require("tailwindcss/plugin");

export default {
	content: ["./app/**/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				primary: {
					"50": "#e9ebfb",
					"100": "#d3d7f7",
					"200": "#a7afee",
					"300": "#7c88e6",
					"400": "#5060dd",
					"500": "#2438d5",
					"600": "#1d2daa",
					"700": "#162280",
					"800": "#0e1655",
					"900": "#070b2b",
				},
				modal: {
					DEFAULT: "hsl(var(--modal-background))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			keyframes: {
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},

				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-collapsible-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-collapsible-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"caret-blink": "caret-blink 1.25s ease-out infinite",

				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),

		plugin(function ({ addVariant }: any) {
			addVariant("current", "&.active");
		}),

		function ({ matchVariant }: any) {
			matchVariant(
				"has",
				(value: any) => {
					return `&:has(${value})`;
				},
				{
					values: {
						checked: "input:checked",
					},
				},
			);
		},
	],
} satisfies Config;
