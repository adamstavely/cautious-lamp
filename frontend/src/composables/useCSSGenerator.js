export function generateCSS(fonts, options = {}) {
  const {
    format = 'css',
    includeVariables = false,
    includeTailwind = false
  } = options

  let output = ''

  if (format === 'css' || format === 'css-variables') {
    // Generate @font-face declarations
    fonts.forEach(font => {
      output += `/* ${font.name} */\n`
      output += `@import url('${font.url}');\n\n`
    })

    if (includeVariables || format === 'css-variables') {
      output += `:root {\n`
      fonts.forEach((font, index) => {
        const varName = font.name.toLowerCase().replace(/\s+/g, '-')
        output += `  --font-${varName}: '${font.name}', sans-serif;\n`
      })
      output += `}\n\n`
    }

    // Generate utility classes
    fonts.forEach(font => {
      const className = font.name.toLowerCase().replace(/\s+/g, '-')
      output += `.font-${className} {\n`
      output += `  font-family: '${font.name}', sans-serif;\n`
      output += `}\n\n`
    })
  }

  if (format === 'tailwind') {
    output += `// tailwind.config.js\n\n`
    output += `module.exports = {\n`
    output += `  theme: {\n`
    output += `    extend: {\n`
    output += `      fontFamily: {\n`
    fonts.forEach(font => {
      const varName = font.name.toLowerCase().replace(/\s+/g, '-')
      output += `        '${varName}': ['${font.name}', 'sans-serif'],\n`
    })
    output += `      }\n`
    output += `    }\n`
    output += `  }\n`
    output += `}\n`
  }

  if (format === 'embed') {
    // Generate Google Fonts embed code
    // One family= per font, each with its own weights (css2 wants them in ascending order)
    const families = fonts
      .map(f => {
        const weights = [...(f.weights?.length ? f.weights : ['400'])].sort((a, b) => Number(a) - Number(b))
        return `family=${f.name.replace(/\s+/g, '+')}:wght@${weights.join(';')}`
      })
      .join('&')
    output += `<link rel="preconnect" href="https://fonts.googleapis.com">\n`
    output += `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n`
    output += `<link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">\n`
  }

  return output
}

