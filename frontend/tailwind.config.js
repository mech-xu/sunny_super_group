/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        financial: {
          navy: '#0f172a', // slate-950
          slate: '#64748b', // slate-500
          accent: '#3b82f6', // blue-500
          gold: '#fbbf24',   // amber-400
        }
      }
    },
  },
  plugins: [],
}
