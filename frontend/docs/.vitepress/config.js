import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Design System Guidelines',
  description: 'Design guidelines, best practices, and usage documentation',
  base: '/guidelines/',
  
  // Server configuration
  server: {
    port: 5174,
    host: 'localhost'
  },
  
  themeConfig: {
    logo: '/logo.svg',
    
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
  
  // Inject script immediately to hide sidebar/nav before Vue renders
  head: [
    ['script', {}, `
      (function() {
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
