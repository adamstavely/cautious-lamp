<script setup>
import { useData, Content } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { onMounted, ref } from 'vue'

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

onMounted(() => {
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
}

:global(body.dark) .vp-embedded-content {
  background: #0f172a;
}
</style>

<style>
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
}

/* Ensure the embedded content container takes full width */
body[data-embedded="true"] {
  padding: 0 !important;
  margin: 0 !important;
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

body[data-embedded="true"].dark,
body[data-embedded="true"] .dark {
  color: #e5e7eb !important;
}

body[data-embedded="true"].dark h1,
body[data-embedded="true"].dark h2,
body[data-embedded="true"].dark h3,
body[data-embedded="true"].dark h4,
body[data-embedded="true"].dark h5,
body[data-embedded="true"].dark h6,
body[data-embedded="true"] .dark h1,
body[data-embedded="true"] .dark h2,
body[data-embedded="true"] .dark h3,
body[data-embedded="true"] .dark h4,
body[data-embedded="true"] .dark h5,
body[data-embedded="true"] .dark h6 {
  color: #f9fafb !important;
  font-weight: 600 !important;
}

body[data-embedded="true"].dark p,
body[data-embedded="true"].dark li,
body[data-embedded="true"].dark span,
body[data-embedded="true"].dark div,
body[data-embedded="true"] .dark p,
body[data-embedded="true"] .dark li,
body[data-embedded="true"] .dark span,
body[data-embedded="true"] .dark div {
  color: #e5e7eb !important;
  font-weight: 400 !important;
}
</style>
