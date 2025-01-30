/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // bg: "#f7f9fc",
        // bg: "#F0F5F5",
        bg: "#F0F5F5",
        heading: "#29343d",
        shade: "#00ac9a",
      },
    },
  },
  plugins: [],
};
