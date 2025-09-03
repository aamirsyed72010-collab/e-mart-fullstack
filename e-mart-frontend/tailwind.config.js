/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class', // Enable dark mode based on class
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Light theme colors (default)
        background: '#f8f9fa', // Very light gray/off-white
        surface: '#ffffff',    // White for cards/elements
        primary: {
          DEFAULT: '#3b82f6', // Tailwind blue-500
          light: '#60a5fa',   // Tailwind blue-400
          dark: '#2563eb',    // Tailwind blue-600
        },
        secondary: {
          DEFAULT: '#ef4444', // Tailwind red-500
          light: '#f87171',   // Tailwind red-400
          dark: '#dc2626',    // Tailwind red-600
        },
        accent: {
          DEFAULT: '#facc15', // Tailwind yellow-400
        },
        text: {
          DEFAULT: '#1f2937', // Tailwind gray-800 for main text
          light: '#4b5563',   // Tailwind gray-600 for subtle text
          dark: '#6b7280',    // Tailwind gray-500 for even subtler text
        },
        // Standard Tailwind grays for utility
        gray: defaultTheme.colors.gray,

        // Dark theme colors (used with dark: prefix)
        dark_background: '#1a1a2e', // Deep dark blue/purple
        dark_surface: '#2a2a4a',    // Slightly lighter dark blue/purple for cards/elements
        dark_primary: {
          DEFAULT: '#00f7ff', // Cyan/Electric Blue - Neon accent
          light: '#66ffff',
          dark: '#00c4cc',
        },
        dark_secondary: {
          DEFAULT: '#ff00ff', // Magenta/Electric Pink - Neon accent
          light: '#ff66ff',
          dark: '#cc00cc',
        },
        dark_accent: {
          DEFAULT: '#f0ff00', // Electric Yellow/Lime - Another accent
        },
        dark_text: {
          DEFAULT: '#e0e0e0', // Light gray for main text
          light: '#ffffff',   // White for highlights
          dark: '#a0a0a0',    // Darker gray for subtle text
        },
      },
      borderRadius: {
        'xl': '1rem', // Larger rounded borders
        '2xl': '2rem',
        '3xl': '3rem',
      }
    },
  },
  plugins: [],
}