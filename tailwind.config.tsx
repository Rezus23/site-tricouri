import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Barlow", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;