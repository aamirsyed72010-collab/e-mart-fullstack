module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('./postcss-plugins/add-appearance')(),
  ],
}