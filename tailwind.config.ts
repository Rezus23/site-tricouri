import type { Config } from "tailwindcss";

const config: Config = {
  
  content: [
    // Această linie acoperă absolut tot din folderul src
    "./src/**/*.{js,ts,jsx,tsx}",
    // Backup pentru folderul pages din rădăcină (dacă există)
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
        
    extend: {
      animation: {
  'gradient': 'gradient 8s linear infinite',
          },
    keyframes: {
    gradient: {
    '0%, 100%': { 'background-position': '0% 50%' },
    '50%': { 'background-position': '100% 50%' },
  }
}
    },
  },
  plugins: [],
};
export default config;