/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          dark: "#4F46E5",
        },
        background: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1E293B",
        },
        text: {
          light: "#1E293B",
          dark: "#F8FAFC",
        },
        textSecondary: {
          light: "#64748B",
          dark: "#94A3B8",
        },
        accent: "#10B981",
        success: "#10B981",
        error: "#EF4444",
        info: "#3B82F6",
        warning: "#F59E0B",
        border: {
          light: "#F1F5F9",
          dark: "#334155",
        },
        divider: {
          light: "#E2E8F0",
          dark: "#1E293B",
        }
      },
    },
  },
  plugins: [],
};
