module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    require('./postcss-plugins/add-appearance')(),
  },
}