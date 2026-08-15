/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="silverhands_dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        warm: {
          50: '#FAF8F5',
          100: '#F5F1EA',
          200: '#E8E0D2',
          300: '#D6C8B2',
          400: '#BFA88A',
          500: '#9E7D56',
          600: '#80613F',
          700: '#634A2E',
          800: '#47331D',
          900: '#2E1F10',
        },
        saffron: {
          50: '#FFF8F0',
          100: '#FEEDDC',
          200: '#FED7B0',
          300: '#FDBE7E',
          400: '#FCA44C',
          500: '#FA821C',
          600: '#E0640B',
          700: '#B84906',
          800: '#923608',
          900: '#752A0A',
        }
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        silverhands: {
          "primary": "#0D9488",        // Deep teal / emerald
          "primary-content": "#ffffff",
          "secondary": "#E0640B",      // Saffron / terracotta
          "secondary-content": "#ffffff",
          "accent": "#4F46E5",         // Royal indigo
          "accent-content": "#ffffff",
          "neutral": "#1F2937",        // Charcoal
          "neutral-content": "#F9FAFB",
          "base-100": "#FFFFFF",
          "base-200": "#F9FAFB",       // Warm subtle gray
          "base-300": "#F3F4F6",
          "base-content": "#111827",
          "info": "#0284C7",
          "success": "#16A34A",
          "warning": "#D97706",
          "error": "#DC2626",
        },
        silverhands_dark: {
          "primary": "#14B8A6",
          "primary-content": "#ffffff",
          "secondary": "#FB923C",
          "secondary-content": "#ffffff",
          "accent": "#818CF8",
          "accent-content": "#ffffff",
          "neutral": "#1E293B",
          "neutral-content": "#F8FAFC",
          "base-100": "#0F172A",        // Deep night slate
          "base-200": "#1E293B",        // Elevated dark container
          "base-300": "#334155",        // Slate border
          "base-content": "#F8FAFC",    // Pure light text
          "info": "#38BDF8",
          "success": "#22C55E",
          "warning": "#F59E0B",
          "error": "#EF4444",
        }
      },
      "dark",
      "night",
      "emerald",
      "sunset"
    ],
    darkTheme: "silverhands_dark",
    base: true,
    styled: true,
    utils: true,
  }
}
