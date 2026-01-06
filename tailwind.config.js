/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita dark mode via classe
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg))',
        'bg-secondary': 'rgb(var(--color-bg-secondary))',
        text: 'rgb(var(--color-text))',
        'text-secondary': 'rgb(var(--color-text-secondary))',
        'text-muted': 'rgb(var(--color-text-muted))',
        primary: 'rgb(var(--color-primary))',
        'primary-hover': 'rgb(var(--color-primary-hover))',
        card: 'rgb(var(--color-card))',
        'card-border': 'rgb(var(--color-card-border))',
        'input-bg': 'rgb(var(--color-input-bg))',
        'input-border': 'rgb(var(--color-input-border))',
        'header-bg': 'rgb(var(--color-header-bg))',
        'header-border': 'rgb(var(--color-header-border))',
        danger: 'rgb(var(--color-danger))',
        'danger-hover': 'rgb(var(--color-danger-hover))',
        success: 'rgb(var(--color-success))',
        warning: 'rgb(var(--color-warning))',
        overlay: 'rgb(var(--color-overlay))',
      },
    },
  },
  plugins: [],
}


