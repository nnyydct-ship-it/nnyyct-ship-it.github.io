/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 15s infinite alternate", // 背景光球流动
        'bounce-slow': 'bounce 4s infinite', // 花朵缓慢跳动
        'fade-in-up': 'fadeInUp 0.8s ease-out', // 卡片浮现
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeInUp: {
          "from": { opacity: 0, transform: "translateY(20px)" },
          "to": { opacity: 1, transform: "translateY(0)" }
        }
      },
    },
  },
  plugins: [],
}