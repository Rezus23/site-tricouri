import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Această linie acoperă absolut tot din folderul src
    "./src/**/*.{js,ts,jsx,tsx}",
    // Backup pentru folderul pages din rădăcină (dacă există)
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;