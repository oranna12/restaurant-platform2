import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdeed7',
          200: '#fad9ae',
          300: '#f6be7b',
          400: '#f19a46',
          500: '#ed7d21',
          600: '#de6317',
          700: '#b84b15',
          800: '#933c19',
          900: '#773317',
        },
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
