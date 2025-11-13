<script setup>
import { useData, Content } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const { Layout: DefaultLayout } = DefaultTheme
const { frontmatter } = useData()

// Use ref for embedded check to ensure reactivity
const isEmbedded = ref(false)

// Check if embedded - must be synchronous for SSR
const checkEmbedded = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('embedded') === 'true') return true
  try {
    return window.self !== window.top
  } catch(e) {
    return true
  }
}

isEmbedded.value = checkEmbedded()

// Sync dark mode from parent window or localStorage
let lastDarkModeState = null
const syncDarkMode = () => {
  try {
    // Try to get dark mode from parent window if in iframe
    let isDark = false
    try {
      if (window.parent !== window.self) {
        isDark = window.parent.document.documentElement.classList.contains('dark')
      }
    } catch (e) {
      // Cross-origin or other error, fall back to localStorage
    }
    
    // Fall back to localStorage if parent check failed
    if (!isDark) {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) {
        isDark = saved === 'true'
      } else {
        // Check system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    }
    
    // Only update if changed to avoid flicker
    if (lastDarkModeState !== isDark) {
      lastDarkModeState = isDark
      // Apply dark mode to this document
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  } catch (e) {
    console.error('Error syncing dark mode:', e)
  }
}

onMounted(() => {
  // Sync dark mode on mount
  syncDarkMode()
  
  // Listen for dark mode changes from parent window
  try {
    if (window.parent !== window.self) {
      const parentObserver = new MutationObserver(() => {
        syncDarkMode()
      })
      parentObserver.observe(window.parent.document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
  } catch (e) {
    // Cross-origin or other error, use localStorage polling
    console.log('Cross-origin detected, using polling for dark mode sync')
  }
  
  // Poll continuously for changes (every 200ms)
  const darkModeInterval = setInterval(() => {
    syncDarkMode()
  }, 200)
  
  // Also watch this document's html element for class changes (in case something else modifies it)
  const htmlObserver = new MutationObserver(() => {
    syncDarkMode()
  })
  htmlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  
  // Listen for postMessage from parent window
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'darkModeChange') {
      syncDarkMode()
    }
  })
  
  // Also listen for localStorage changes (works across tabs/windows)
  window.addEventListener('storage', (e) => {
    if (e.key === 'darkMode') {
      syncDarkMode()
    }
  })
  
  // Also create a custom event listener for same-window localStorage changes
  // (storage event only fires in other windows, so we need to dispatch custom events)
  const originalSetItem = Storage.prototype.setItem
  Storage.prototype.setItem = function(key, value) {
    originalSetItem.apply(this, arguments)
    if (key === 'darkMode') {
      window.dispatchEvent(new Event('darkModeStorageChange'))
    }
  }
  window.addEventListener('darkModeStorageChange', () => {
    syncDarkMode()
  })
  
  // Cleanup interval on unmount
  onBeforeUnmount(() => {
    if (darkModeInterval) {
      clearInterval(darkModeInterval)
    }
    if (htmlObserver) {
      htmlObserver.disconnect()
    }
  })
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    const saved = localStorage.getItem('darkMode')
    if (saved === null) {
      syncDarkMode()
    }
  })
  
  // Re-check on mount
  isEmbedded.value = checkEmbedded()
  
  if (isEmbedded.value) {
    document.body.setAttribute('data-embedded', 'true')
    
    // Aggressively hide sidebar and nav
    const hideElements = () => {
      const selectors = [
        '.VPSidebar',
        '.VPNav',
        'aside.VPSidebar',
        'nav.VPNav',
        '[class*="VPSidebar"]',
        '[class*="VPNav"]',
        'aside[class*="sidebar"]',
        'nav[class*="sidebar"]',
        '.sidebar',
        '.nav',
        'aside',
        'nav[class*="VP"]'
      ]
      
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.cssText = 'display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; overflow: hidden !important;'
        })
      })
      
      document.querySelectorAll('.VPContent, .VPDoc, main, .content').forEach(el => {
        el.style.cssText += 'padding-left: 0 !important; margin-left: 0 !important; max-width: 100% !important; width: 100% !important;'
      })
    }
    
    hideElements()
    setTimeout(hideElements, 0)
    setTimeout(hideElements, 50)
    setTimeout(hideElements, 100)
    setTimeout(hideElements, 200)
    setTimeout(hideElements, 500)
    
    const observer = new MutationObserver(() => {
      hideElements()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }
})
</script>

<template>
  <DefaultLayout v-if="!isEmbedded" />
  <div v-else class="vp-embedded-content">
    <Content />
  </div>
</template>

<style scoped>
.vp-embedded-content {
  width: 100%;
  max-width: 100%;
  padding: 2rem;
  margin: 0;
  min-height: 100vh;
  background: white;
  transition: background-color 0.3s ease;
}

:global(.dark) .vp-embedded-content,
:global(html.dark) .vp-embedded-content {
  background: #0f172a;
}
</style>

<style>
/* Global styles for smooth dark mode transitions */
html {
  transition: background-color 0.3s ease !important;
  background-color: white !important;
}

html.dark,
.dark {
  background-color: #0f172a !important;
}

/* Ensure body also transitions */
body {
  transition: background-color 0.3s ease, color 0.3s ease !important;
  background-color: white !important;
}

html.dark body,
.dark body {
  background-color: #0f172a !important;
}

/* Override any VitePress default backgrounds */
.VPApp,
#app,
main {
  transition: background-color 0.3s ease !important;
}

html.dark .VPApp,
html.dark #app,
.dark .VPApp,
.dark #app {
  background-color: #0f172a !important;
}

/* Global styles for embedded mode - these apply to the iframe content */
body[data-embedded="true"] .VPSidebar,
body[data-embedded="true"] .VPNav,
body[data-embedded="true"] aside,
body[data-embedded="true"] nav[class*="VP"],
body[data-embedded="true"] [class*="VPSidebar"],
body[data-embedded="true"] [class*="VPNav"] {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
  position: absolute !important;
  left: -9999px !important;
  overflow: hidden !important;
}

body[data-embedded="true"] .VPContent,
body[data-embedded="true"] .VPDoc,
body[data-embedded="true"] main {
  padding-left: 0 !important;
  margin-left: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  transition: background-color 0.3s ease;
}

/* Ensure VitePress page content areas transition smoothly */
.VPPage,
.VPDoc,
.VPContent {
  transition: background-color 0.3s ease;
}

/* Ensure the embedded content container takes full width */
body[data-embedded="true"] {
  padding: 0 !important;
  margin: 0 !important;
  background-color: white;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Dark mode body background */
html.dark body[data-embedded="true"],
.dark body[data-embedded="true"] {
  background-color: #0f172a;
}

/* Make text darker and more readable */
body[data-embedded="true"] {
  color: #1f2937 !important;
  font-weight: 400 !important;
}

body[data-embedded="true"] h1,
body[data-embedded="true"] h2,
body[data-embedded="true"] h3,
body[data-embedded="true"] h4,
body[data-embedded="true"] h5,
body[data-embedded="true"] h6 {
  color: #111827 !important;
  font-weight: 600 !important;
}

body[data-embedded="true"] p,
body[data-embedded="true"] li,
body[data-embedded="true"] span,
body[data-embedded="true"] div {
  color: #1f2937 !important;
  font-weight: 400 !important;
}

html.dark body[data-embedded="true"],
.dark body[data-embedded="true"] {
  color: #e5e7eb !important;
  transition: color 0.3s ease;
}

html.dark body[data-embedded="true"] h1,
html.dark body[data-embedded="true"] h2,
html.dark body[data-embedded="true"] h3,
html.dark body[data-embedded="true"] h4,
html.dark body[data-embedded="true"] h5,
html.dark body[data-embedded="true"] h6,
.dark body[data-embedded="true"] h1,
.dark body[data-embedded="true"] h2,
.dark body[data-embedded="true"] h3,
.dark body[data-embedded="true"] h4,
.dark body[data-embedded="true"] h5,
.dark body[data-embedded="true"] h6 {
  color: #f9fafb !important;
  font-weight: 600 !important;
  transition: color 0.3s ease;
}

html.dark body[data-embedded="true"] p,
html.dark body[data-embedded="true"] li,
html.dark body[data-embedded="true"] span,
html.dark body[data-embedded="true"] div,
.dark body[data-embedded="true"] p,
.dark body[data-embedded="true"] li,
.dark body[data-embedded="true"] span,
.dark body[data-embedded="true"] div {
  color: #e5e7eb !important;
  font-weight: 400 !important;
  transition: color 0.3s ease;
}
</style>
