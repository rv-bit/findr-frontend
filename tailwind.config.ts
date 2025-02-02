import type { Config } from "tailwindcss";
const plugin = require("tailwindcss/plugin");
const { fontFamily } = require("tailwindcss/defaultTheme");

export default {
	darkMode: "selector",
	content: ["./app/**/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Segoe UI"', "Roboto", "sans-serif", ...fontFamily.sans],
				"bricolage-grotesque": ["Bricolage Grotesque", "sans-serif"],
			},
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
			},
			animation: {
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),

		plugin(function ({ addVariant }: any) {
			addVariant("current", "&.active");
		}),

		// @ts-ignore
		function ({ matchVariant }) {
			matchVariant(
				"has",
				// @ts-ignore
				(value) => {
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
