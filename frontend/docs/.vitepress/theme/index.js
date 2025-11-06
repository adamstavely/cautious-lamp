import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    if (typeof window === 'undefined') return;
    
    // Check if embedded
    const checkEmbedded = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('embedded') === 'true') return true;
      try {
        return window.self !== window.top;
      } catch(e) {
        return true;
      }
    };

    if (checkEmbedded()) {
      // Set attribute immediately
      if (document.body) {
        document.body.setAttribute('data-embedded', 'true');
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.setAttribute('data-embedded', 'true');
        });
      }
      
      // Aggressive hiding function
      const hideElements = () => {
        // Hide sidebar
        const sidebarSelectors = [
          '.VPSidebar',
          'aside.VPSidebar',
          '[class*="VPSidebar"]',
          'aside[class*="sidebar"]',
          '.sidebar',
          'nav[class*="sidebar"]'
        ];
        
        // Hide nav
        const navSelectors = [
          '.VPNav',
          'nav.VPNav',
          '[class*="VPNav"]',
          'nav[class*="nav"]',
          '.nav'
        ];
        
        sidebarSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.cssText = 'display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; opacity: 0 !important; position: absolute !important; left: -9999px !important;';
          });
        });
        
        navSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.cssText = 'display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; opacity: 0 !important; position: absolute !important; left: -9999px !important;';
          });
        });
        
        // Adjust content
        document.querySelectorAll('.VPContent, .VPDoc, main, .content').forEach(el => {
          el.style.cssText += 'padding-left: 0 !important; margin-left: 0 !important; max-width: 100% !important;';
        });
      };
      
      // Run immediately
      if (document.body) {
        hideElements();
      }
      
      // Run on DOM ready
      document.addEventListener('DOMContentLoaded', hideElements);
      
      // Run after delays
      setTimeout(hideElements, 0);
      setTimeout(hideElements, 100);
      setTimeout(hideElements, 500);
      setTimeout(hideElements, 1000);
      
      // Watch for changes
      const observer = new MutationObserver(() => {
        hideElements();
      });
      
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
      
      // Also watch router changes
      router.onAfterRouteChanged = () => {
        setTimeout(hideElements, 0);
        setTimeout(hideElements, 100);
        setTimeout(hideElements, 500);
      };
    }
  }
}
