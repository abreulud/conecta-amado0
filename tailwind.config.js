module.exports = {
  content: ['./imports/**/*.{js,jsx,ts,tsx}', './client/*.html'],
  theme: {
    extend: {
      colors: {
        red: '#ed4a68',
        'light-red': '#f5aec5',
        'dark-red': '#b91c1c',
        'light-beige': '#faf6f2',
        'light-blue': '#dae2f5',
        'dark-blue': '#1d4ed8',
        blue: '#89ace8',
      },
      fontFamily: {
        yeseva: ['Yeseva One', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
