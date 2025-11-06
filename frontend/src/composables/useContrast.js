export function calculateContrast(color1, color2) {
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  function getLuminance(rgb) {
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return null

  const l1 = getLuminance(rgb1)
  const l2 = getLuminance(rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  const ratio = (lighter + 0.05) / (darker + 0.05)

  return {
    ratio: Math.round(ratio * 100) / 100,
    level: {
      normal: {
        AA: ratio >= 4.5,
        AAA: ratio >= 7
      },
      large: {
        AA: ratio >= 3,
        AAA: ratio >= 4.5
      }
    },
    passes: {
      normalAA: ratio >= 4.5,
      normalAAA: ratio >= 7,
      largeAA: ratio >= 3,
      largeAAA: ratio >= 4.5
    }
  }
}

