
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'roboto-slab': ['Roboto Slab', 'serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Company/Admin Green palette (existing)
				green: {
					50: 'hsl(var(--green-50))',
					100: 'hsl(var(--green-100))',
					200: 'hsl(var(--green-200))',
					300: 'hsl(var(--green-300))',
					400: 'hsl(var(--green-400))',
					500: 'hsl(var(--green-500))',
					600: 'hsl(var(--green-600))',
					700: 'hsl(var(--green-700))',
					800: 'hsl(var(--green-800))',
					900: 'hsl(var(--green-900))',
				},
				// Vendor Blue palette based on #A4CCD9
				vendor: {
					50: 'hsl(var(--vendor-50))',
					100: 'hsl(var(--vendor-100))',
					200: 'hsl(var(--vendor-200))',
					300: 'hsl(var(--vendor-300))',
					400: 'hsl(var(--vendor-400))',
					500: 'hsl(var(--vendor-500))',
					600: 'hsl(var(--vendor-600))',
					700: 'hsl(var(--vendor-700))',
					800: 'hsl(var(--vendor-800))',
					900: 'hsl(var(--vendor-900))',
				},
				// Candidate Purple palette based on #725CAD
				candidate: {
					50: 'hsl(var(--candidate-50))',
					100: 'hsl(var(--candidate-100))',
					200: 'hsl(var(--candidate-200))',
					300: 'hsl(var(--candidate-300))',
					400: 'hsl(var(--candidate-400))',
					500: 'hsl(var(--candidate-500))',
					600: 'hsl(var(--candidate-600))',
					700: 'hsl(var(--candidate-700))',
					800: 'hsl(var(--candidate-800))',
					900: 'hsl(var(--candidate-900))',
				},
				// Client theme colors (Coral/Salmon tones based on #f6a192)
				client: {
					50: 'hsl(var(--client-50))',
					100: 'hsl(var(--client-100))',
					200: 'hsl(var(--client-200))',
					300: 'hsl(var(--client-300))',
					400: 'hsl(var(--client-400))',
					500: 'hsl(var(--client-500))',
					600: 'hsl(var(--client-600))',
					700: 'hsl(var(--client-700))',
					800: 'hsl(var(--client-800))',
					900: 'hsl(var(--client-900))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
