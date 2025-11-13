import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Design System Guidelines',
  description: 'Design guidelines, best practices, and usage documentation',
  base: '/guidelines/',
  
  // Server configuration
  server: {
    port: 5175,
    host: 'localhost'
  },
  
  themeConfig: {
    logo: '/logo.svg',
    // Disable VitePress default appearance toggle - we'll handle it ourselves
    appearance: false,
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Colors', link: '/colors' },
      { text: 'Typography', link: '/typography' },
      { text: 'Components', link: '/components' },
      { text: 'Spacing', link: '/spacing' },
      { text: 'Patterns', link: '/patterns' }
    ],
    
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Design Principles', link: '/principles' }
        ]
      },
      {
        text: 'Foundations',
        items: [
          { text: 'Colors', link: '/colors' },
          { text: 'Typography', link: '/typography' },
          { text: 'Spacing', link: '/spacing' },
          { text: 'Shadows', link: '/shadows' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Overview', link: '/components' },
          { text: 'Buttons', link: '/components/buttons' },
          { text: 'Forms', link: '/components/forms' },
          { text: 'Cards', link: '/components/cards' }
        ]
      },
      {
        text: 'Patterns',
        items: [
          { text: 'Layout Patterns', link: '/patterns' },
          { text: 'Navigation', link: '/patterns/navigation' },
          { text: 'Data Display', link: '/patterns/data-display' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    footer: {
      message: 'Design System Guidelines',
      copyright: 'Copyright © 2024'
    },
    
    search: {
      provider: 'local'
    }
  },
  
  // Inject script immediately to hide sidebar/nav before Vue renders and sync dark mode
  head: [
    ['script', {}, `
      (function() {
        // Sync dark mode immediately and continuously
        let lastDarkMode = null;
        const syncDarkMode = () => {
          try {
            let isDark = false;
            try {
              if (window.parent !== window.self) {
                isDark = window.parent.document.documentElement.classList.contains('dark');
              }
            } catch (e) {
              // Cross-origin or other error, fall back to localStorage
            }
            
            if (!isDark) {
              const saved = localStorage.getItem('darkMode');
              if (saved !== null) {
                isDark = saved === 'true';
              } else {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              }
            }
            
            // Only update if changed to avoid flicker
            if (lastDarkMode !== isDark) {
              lastDarkMode = isDark;
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }
          } catch (e) {
            console.error('Error syncing dark mode:', e);
          }
        };
        
        // Run immediately
        syncDarkMode();
        
        // Also run on DOM ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', syncDarkMode);
        } else {
          syncDarkMode();
        }
        
        // Poll continuously for changes (every 200ms)
        setInterval(syncDarkMode, 200);
        
        // Listen for postMessage from parent window
        window.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'darkModeChange') {
            syncDarkMode();
          }
        });
        
        // Listen for localStorage changes
        window.addEventListener('storage', (e) => {
          if (e.key === 'darkMode') {
            syncDarkMode();
          }
        });
        
        const isEmbedded = () => {
          const params = new URLSearchParams(window.location.search);
          if (params.get('embedded') === 'true') return true;
          try {
            return window.self !== window.top;
          } catch(e) {
            return true;
          }
        };
        
        if (isEmbedded()) {
          // Set attribute immediately
          if (document.body) {
            document.body.setAttribute('data-embedded', 'true');
          }
          
          // Inject CSS immediately
          const style = document.createElement('style');
          style.id = 'embedded-hide-styles';
          style.textContent = \`
            .VPSidebar,
            .VPNav,
            aside.VPSidebar,
            nav.VPNav,
            [class*="VPSidebar"],
            [class*="VPNav"],
            aside[class*="sidebar"],
            nav[class*="sidebar"],
            .sidebar,
            .nav {
              display: none !important;
              visibility: hidden !important;
              width: 0 !important;
              height: 0 !important;
              opacity: 0 !important;
              position: absolute !important;
              left: -9999px !important;
              overflow: hidden !important;
            }
            .VPContent,
            .VPDoc,
            main,
            .content {
              padding-left: 0 !important;
              margin-left: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
            }
            body[data-embedded="true"] .VPSidebar,
            body[data-embedded="true"] .VPNav,
            body[data-embedded="true"] aside,
            body[data-embedded="true"] nav[class*="VP"] {
              display: none !important;
            }
          \`;
          document.head.appendChild(style);
          
          // Hide elements function
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
              '.nav'
            ];
            
            selectors.forEach(sel => {
              document.querySelectorAll(sel).forEach(el => {
                el.style.cssText = 'display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; opacity: 0 !important; position: absolute !important; left: -9999px !important;';
              });
            });
            
            document.querySelectorAll('.VPContent, .VPDoc, main').forEach(el => {
              el.style.cssText += 'padding-left: 0 !important; margin-left: 0 !important; max-width: 100% !important;';
            });
          };
          
          // Run immediately and repeatedly
          if (document.body) {
            hideElements();
          }
          
          document.addEventListener('DOMContentLoaded', () => {
            document.body.setAttribute('data-embedded', 'true');
            hideElements();
            setInterval(hideElements, 50);
            
            const observer = new MutationObserver(hideElements);
            observer.observe(document.body, { childList: true, subtree: true });
          });
          
          // Also run before DOM ready
          const checkInterval = setInterval(() => {
            if (document.body) {
              document.body.setAttribute('data-embedded', 'true');
              hideElements();
              clearInterval(checkInterval);
            }
          }, 10);
        }
      })();
    `]
  ]
})
