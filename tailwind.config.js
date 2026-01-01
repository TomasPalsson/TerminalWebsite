import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.tsx",
  ],
  theme: {
    extend: {
      animation: {
        cursor: 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        terminal: "var(--terminal)",
      }
    },
  },
  plugins: [typography],
}
