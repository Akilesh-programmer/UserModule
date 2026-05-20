/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4361ee",
          dark: "#3451d1",
          light: "#eef1fd",
        },
        sidebar: "#1e2a3a",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
