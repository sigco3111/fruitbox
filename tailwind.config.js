/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Apple SD Gothic Neo"', '"Pretendard"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};