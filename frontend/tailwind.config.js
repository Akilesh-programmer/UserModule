/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#eef2ff",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        sidebar: {
          DEFAULT: "#0f172a",
          hover: "#1e293b",
          active: "#1d2d4e",
          border: "#1e293b",
        },
        surface: {
          DEFAULT: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
        },
        accent: {
          DEFAULT: "#06b6d4",
          light: "#ecfeff",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        "gradient-card": "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "modal": "0 25px 50px -12px rgb(0 0 0 / 0.35)",
        "sidebar": "4px 0 20px 0 rgb(0 0 0 / 0.15)",
        "header": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "button": "0 1px 2px 0 rgb(99 102 241 / 0.3)",
        "button-hover": "0 4px 12px 0 rgb(99 102 241 / 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
