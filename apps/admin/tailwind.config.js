/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CareSpace Theme Colors
        'cs-background': 'var(--background)',
        'cs-foreground': 'var(--foreground)',
        'cs-primary': 'var(--primary)',
        'cs-secondary': 'var(--secondary)',
        'cs-text2': 'var(--text2)',
        'cs-search-bg': 'var(--search-bar-background)',
        'cs-search-placeholder': 'var(--search-bar-placeholder)',
        'cs-post-body': 'var(--post-body-text)',
        'cs-border': 'var(--bottom-border)',
        'cs-icons-grey': 'var(--icons-grey)',
        'cs-comment-bg': 'var(--comment-background)',
        'cs-card-bg': 'var(--card-background)',
        'cs-shadow': 'var(--shadow)',
        'cs-date-grey': 'var(--date-grey)',
        'cs-report-red': 'var(--report-red)',
      },
      fontFamily: {
        'sans': ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        'mono': ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
