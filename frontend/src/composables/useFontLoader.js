const loadedFonts = new Set()

export function loadFont(name, url) {
  // Check if font is already loaded
  if (loadedFonts.has(url)) return
  
  // For Google Fonts URLs, create a link tag
  if (url.includes('fonts.googleapis.com')) {
    // Check if link already exists
    const existingLink = document.querySelector(`link[data-font-url="${url}"]`)
    if (existingLink) {
      loadedFonts.add(url)
      return
    }
    
    // Create and append link tag
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.setAttribute('data-font-url', url)
    document.head.appendChild(link)
    loadedFonts.add(url)
  } else {
    // For direct font URLs, use FontFace API
    if (document.fonts.check(`1em "${name}"`)) {
      loadedFonts.add(url)
      return
    }
    const fontFace = new FontFace(name, `url(${url})`)
    fontFace.load().then((loaded) => {
      document.fonts.add(loaded)
      loadedFonts.add(url)
    }).catch((err) => {
      console.error(`Failed to load font ${name}:`, err)
    })
  }
}