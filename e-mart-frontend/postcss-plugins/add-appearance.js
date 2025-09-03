module.exports = () => {
  return {
    postcssPlugin: 'add-appearance',
    Declaration(decl) {
      if (decl.prop === '-webkit-appearance') {
        // Add the standard 'appearance' property
        // Handle 'none' and 'textfield' specifically
        if (decl.value === 'none' || decl.value === 'textfield') {
          decl.cloneBefore({ prop: 'appearance', value: decl.value });
        }
      }
    }
  }
}
module.exports.postcss = true
