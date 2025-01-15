import type { Config } from "tailwindcss";
const plugin = require('tailwindcss/plugin');
const { fontFamily } = require('tailwindcss/defaultTheme')

export default {
	darkMode: 'selector',
	content: ["./app/**/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'"Segoe UI"',
					'Roboto',
					'sans-serif',
					...fontFamily.sans,
				],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				accent: 'hsl(var(--accent))',
				primary: {
					DEFAULT: 'hsl(var(--primary))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			}
		}
	},
		plugins: [
			require("tailwindcss-animate"),

			plugin(function({ addVariant }: any) {
	            addVariant('current', '&.active');
	        })
		],
} satisfies Config;
