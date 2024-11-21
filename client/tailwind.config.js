/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        // 'root-pink': '#EAE7DC', // Custom pink color for the root background
      },
      transitionDuration: {
        '2000': '2000ms', // Custom duration for 3 seconds
      },
    },
  },
}
