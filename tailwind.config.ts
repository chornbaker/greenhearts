import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray': {
          600: '#666666',
          700: '#555555',
          800: '#333333',
          900: '#171717',
        },
        'green': {
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
        },
      },
    },
  },
  plugins: [],
};

export default config; 