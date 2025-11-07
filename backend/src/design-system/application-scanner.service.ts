import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
// Note: axe-core is designed for browser environments
// For server-side use, we'll use basic accessibility checks
// In production, consider using @axe-core/cli or running scans in browser

export interface ApplicationScanContext {
  html?: string;
  css?: string;
  javascript?: string;
  components?: any[];
  tokens?: any[];
  applicationName?: string;
  file?: string;
}

export interface ComplianceCheck {
  id: string;
  rule: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
  element?: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
}

@Injectable()
export class ApplicationScannerService {
  
  /**
   * Design System Compliance Rules
   */
  
  // Rule: Check if application uses design system components
  scanDesignSystemComponentUsage(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    // Check for design system component imports/usage
    const designSystemPatterns = [
      /@designsystem\/components/g,
      /from ['"]@designsystem/g,
      /import.*from ['"]@designsystem/g
    ];
    
    const hasDesignSystemImport = designSystemPatterns.some(pattern => pattern.test(context.javascript || ''));
    
    if (!hasDesignSystemImport && html.length > 0) {
      checks.push({
        id: 'ds-component-usage',
        rule: 'Design System Component Usage',
        status: 'warning',
        message: 'Application does not appear to import design system components',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for hardcoded border radius values
  scanBorderRadiusConsistency(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const css = context.css || '';
    const tokens = context.tokens || [];
    const tokenValues = tokens.map(t => t.value);
    
    // Find border-radius values
    const borderRadiusPattern = /border-radius\s*:\s*([^;]+)/gi;
    const matches = [...css.matchAll(borderRadiusPattern)];
    
    matches.forEach(match => {
      const borderRadiusValue = match[1].trim();
      // Check if it's a token reference or hardcoded value
      const isToken = tokenValues.some(tv => borderRadiusValue.includes(tv)) || 
                     borderRadiusValue.match(/var\(|--[a-z-]+/i); // CSS custom property
      
      if (!isToken && !borderRadiusValue.match(/^\d+px$/)) {
        checks.push({
          id: `border-radius-${match.index}`,
          rule: 'Border Radius Consistency',
          status: 'warning',
          message: `Found non-standard border-radius value: ${borderRadiusValue}. Use design system tokens for consistency.`,
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(css, match.index)
        });
      }
    });
    
    return checks;
  }

  // Rule: Check for hardcoded shadow/elevation values
  scanShadowConsistency(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const css = context.css || '';
    const tokens = context.tokens || [];
    const tokenValues = tokens.map(t => t.value);
    
    // Find box-shadow values
    const shadowPattern = /box-shadow\s*:\s*([^;]+)/gi;
    const matches = [...css.matchAll(shadowPattern)];
    
    matches.forEach(match => {
      const shadowValue = match[1].trim();
      // Check if it's a token reference
      const isToken = tokenValues.some(tv => shadowValue.includes(tv)) || 
                     shadowValue.match(/var\(|--[a-z-]+/i); // CSS custom property
      
      if (!isToken && shadowValue !== 'none') {
        checks.push({
          id: `shadow-${match.index}`,
          rule: 'Shadow/Elevation Consistency',
          status: 'warning',
          message: `Found hardcoded box-shadow value. Use design system elevation tokens for consistency.`,
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(css, match.index)
        });
      }
    });
    
    return checks;
  }

  // Rule: Check for hardcoded z-index values
  scanZIndexManagement(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const css = context.css || '';
    
    // Find z-index values
    const zIndexPattern = /z-index\s*:\s*(\d+)/gi;
    const matches = [...css.matchAll(zIndexPattern)];
    
    matches.forEach(match => {
      const zIndexValue = parseInt(match[1]);
      // Check if it's a common problematic value (not using design system layers)
      if (zIndexValue > 1000 || (zIndexValue > 100 && zIndexValue % 10 !== 0)) {
        checks.push({
          id: `z-index-${match.index}`,
          rule: 'Z-index Layer Management',
          status: 'warning',
          message: `Found z-index value: ${zIndexValue}. Use design system layer tokens for proper stacking context management.`,
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(css, match.index)
        });
      }
    });
    
    return checks;
  }

  // Rule: Check for icon usage consistency
  scanIconUsage(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for icon imports from design system
    const hasDesignSystemIcons = /@designsystem.*icon|from ['"]@designsystem.*icon/i.test(js);
    
    // Check for inline SVG icons or icon fonts
    const hasInlineIcons = /<svg|<i class.*icon|icon-/i.test(html);
    const hasIconFonts = /font.*icon|iconfont/i.test(html + (context.css || ''));
    
    if ((hasInlineIcons || hasIconFonts) && !hasDesignSystemIcons) {
      checks.push({
        id: 'icon-usage',
        rule: 'Icon Usage Consistency',
        status: 'warning',
        message: 'Icons detected but not using design system icon library. Use design system icons for consistency.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check design system version
  scanDesignSystemVersion(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const js = context.javascript || '';
    const packageJson = context.html || ''; // Assuming package.json content might be in html field
    
    // Check for version in package.json or imports
    const versionPattern = /@designsystem[^'"]*['"]\s*([\d.]+)/;
    const versionMatch = js.match(versionPattern) || packageJson.match(versionPattern);
    
    if (versionMatch) {
      const version = versionMatch[1];
      // Check if version is outdated (simplified check)
      const majorVersion = parseInt(version.split('.')[0]);
      if (majorVersion < 2) {
        checks.push({
          id: 'ds-version',
          rule: 'Design System Version',
          status: 'warning',
          message: `Application is using design system v${version}. Consider upgrading to latest version.`,
          application: context.applicationName,
          file: context.file
        });
      }
    }
    
    return checks;
  }

  /**
   * UX / HCD Best Practices Rules
   */
  
  // Rule: Check for form labels
  scanFormLabels(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    // Find all input elements
    const inputPattern = /<input[^>]*>/gi;
    const inputs = [...html.matchAll(inputPattern)];
    
    inputs.forEach(match => {
      const inputTag = match[0];
      const inputId = inputTag.match(/id=['"]([^'"]+)['"]/)?.[1];
      const hasLabel = inputId ? new RegExp(`<label[^>]*for=['"]${inputId}['"]`, 'i').test(html) : false;
      const hasAriaLabel = /aria-label|aria-labelledby/i.test(inputTag);
      const hasPlaceholder = /placeholder/i.test(inputTag);
      
      if (!hasLabel && !hasAriaLabel && !hasPlaceholder) {
        checks.push({
          id: `form-label-${match.index}`,
          rule: 'Form Label Requirements',
          status: 'error',
          message: 'Input element missing label, aria-label, or placeholder',
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(html, match.index),
          element: inputTag.substring(0, 50)
        });
      }
    });
    
    return checks;
  }

  // Rule: Check for error message handling
  scanErrorHandling(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for error message elements
    const hasErrorMessages = /error|invalid|required|aria-invalid|aria-errormessage/i.test(html);
    
    // Check for error handling in JS
    const hasErrorHandling = /catch|error|\.error\(|onError|handleError/i.test(js);
    
    if (!hasErrorMessages && !hasErrorHandling) {
      checks.push({
        id: 'error-handling',
        rule: 'Error Message Handling',
        status: 'warning',
        message: 'No error message handling detected. Forms should provide clear error feedback.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for loading states
  scanLoadingStates(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for loading indicators
    const hasLoadingIndicators = /loading|spinner|skeleton|aria-busy|aria-live/i.test(html);
    const hasAsyncOperations = /fetch|axios|async|await|\.then\(/i.test(js);
    
    if (hasAsyncOperations && !hasLoadingIndicators) {
      checks.push({
        id: 'loading-states',
        rule: 'Loading State Indicators',
        status: 'warning',
        message: 'Async operations detected but no loading indicators found. Users need feedback during async operations.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for empty states
  scanEmptyStates(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    // Check for empty state handling
    const hasEmptyStates = /empty|no.*found|no.*data|no.*results|nothing.*here/i.test(html);
    
    // Check for lists/tables that might need empty states
    const hasLists = /<ul|<ol|<table|<tbody/i.test(html);
    
    if (hasLists && !hasEmptyStates) {
      checks.push({
        id: 'empty-states',
        rule: 'Empty State Handling',
        status: 'warning',
        message: 'Lists or tables detected. Consider adding empty state messages when no data is available.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for confirmation dialogs on destructive actions
  scanDestructiveActions(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Find destructive action patterns
    const destructivePatterns = [
      /delete|remove|destroy|clear|reset|archive/i,
      /onClick.*delete|onClick.*remove/i
    ];
    
    const hasDestructiveActions = destructivePatterns.some(pattern => 
      pattern.test(html) || pattern.test(js)
    );
    
    // Check for confirmation dialogs
    const hasConfirmations = /confirm|dialog|modal.*delete|modal.*remove|are.*sure/i.test(html + js);
    
    if (hasDestructiveActions && !hasConfirmations) {
      checks.push({
        id: 'destructive-actions',
        rule: 'Destructive Action Confirmation',
        status: 'warning',
        message: 'Destructive actions detected but no confirmation dialogs found. Add confirmations to prevent accidental data loss.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for touch target sizes (minimum 44x44px)
  scanTouchTargetSizes(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const css = context.css || '';
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
      
      interactiveElements.forEach((element, index) => {
        const style = element.getAttribute('style') || '';
        const minHeightMatch = style.match(/min-height\s*:\s*(\d+)px/i) || css.match(new RegExp(`\\.${element.className}\\s*{[^}]*min-height\\s*:\\s*(\\d+)px`, 'i'));
        const minWidthMatch = style.match(/min-width\s*:\s*(\d+)px/i) || css.match(new RegExp(`\\.${element.className}\\s*{[^}]*min-width\\s*:\\s*(\\d+)px`, 'i'));
        
        const minHeight = minHeightMatch ? parseInt(minHeightMatch[1]) : null;
        const minWidth = minWidthMatch ? parseInt(minWidthMatch[1]) : null;
        
        if ((minHeight && minHeight < 44) || (minWidth && minWidth < 44)) {
          checks.push({
            id: `touch-target-${index}`,
            rule: 'Touch Target Sizes',
            status: 'warning',
            message: `Interactive element should have minimum touch target size of 44x44px for mobile accessibility`,
            application: context.applicationName,
            file: context.file,
            element: element.outerHTML.substring(0, 100)
          });
        }
      });
    } catch (error) {
      // If DOM parsing fails, skip this check
    }
    
    return checks;
  }

  // Rule: Check for success state indicators
  scanSuccessStates(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for form submissions or data mutations
    const hasFormSubmissions = /submit|save|create|update|post/i.test(html + js);
    
    // Check for success indicators
    const hasSuccessIndicators = /success|saved|created|updated|toast.*success|notification.*success|aria-live.*polite/i.test(html + js);
    
    if (hasFormSubmissions && !hasSuccessIndicators) {
      checks.push({
        id: 'success-states',
        rule: 'Success State Indicators',
        status: 'warning',
        message: 'Form submissions detected. Consider adding success feedback to confirm user actions.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for consistent navigation patterns
  scanNavigationConsistency(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Check for navigation elements
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      const hasMultipleNavs = navElements.length > 1;
      
      // Check for breadcrumbs
      const hasBreadcrumbs = /breadcrumb|aria-label.*breadcrumb/i.test(html);
      
      // Check for skip links (accessibility)
      const hasSkipLinks = /skip.*to.*content|skip.*navigation/i.test(html);
      
      if (hasMultipleNavs && !hasBreadcrumbs) {
        checks.push({
          id: 'navigation-consistency',
          rule: 'Navigation Consistency',
          status: 'warning',
          message: 'Multiple navigation elements detected. Consider adding breadcrumbs for deep navigation.',
          application: context.applicationName,
          file: context.file
        });
      }
      
      if (!hasSkipLinks && navElements.length > 0) {
        checks.push({
          id: 'skip-links',
          rule: 'Navigation Consistency',
          status: 'warning',
          message: 'Navigation detected but no skip links found. Add skip links for keyboard navigation accessibility.',
          application: context.applicationName,
          file: context.file
        });
      }
    } catch (error) {
      // If DOM parsing fails, skip this check
    }
    
    return checks;
  }

  // Rule: Check for help text and tooltips on complex inputs
  scanHelpText(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Find complex form inputs
      const complexInputs = document.querySelectorAll('input[type="date"], input[type="datetime-local"], input[type="time"], input[type="number"], input[type="range"], select, textarea');
      
      complexInputs.forEach((input, index) => {
        const inputId = input.getAttribute('id');
        const hasAriaDescribedBy = input.hasAttribute('aria-describedby');
        const hasPlaceholder = input.hasAttribute('placeholder');
        const hasTitle = input.hasAttribute('title');
        
        // Check for associated help text
        const helpTextId = input.getAttribute('aria-describedby');
        const hasHelpText = helpTextId ? document.getElementById(helpTextId) !== null : false;
        
        if (!hasAriaDescribedBy && !hasPlaceholder && !hasTitle && !hasHelpText) {
          checks.push({
            id: `help-text-${index}`,
            rule: 'Help Text and Tooltips',
            status: 'warning',
            message: 'Complex input detected without help text. Consider adding tooltips or help text for better UX.',
            application: context.applicationName,
            file: context.file,
            element: input.outerHTML.substring(0, 100)
          });
        }
      });
    } catch (error) {
      // If DOM parsing fails, skip this check
    }
    
    return checks;
  }

  // Rule: Check for responsive breakpoint usage
  scanResponsiveBreakpoints(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const css = context.css || '';
    const tokens = context.tokens || [];
    
    // Common design system breakpoints (mobile-first)
    const standardBreakpoints = ['640px', '768px', '1024px', '1280px', '1536px']; // Tailwind defaults
    const breakpointPattern = /@media\s*\([^)]*min-width\s*:\s*([^)]+)\)|@media\s*\([^)]*max-width\s*:\s*([^)]+)\)/gi;
    const matches = [...css.matchAll(breakpointPattern)];
    
    matches.forEach(match => {
      const breakpoint = (match[1] || match[2] || '').trim();
      const isStandard = standardBreakpoints.some(bp => breakpoint.includes(bp));
      const isToken = breakpoint.match(/var\(|--[a-z-]+/i);
      
      if (!isStandard && !isToken && breakpoint) {
        checks.push({
          id: `breakpoint-${match.index}`,
          rule: 'Responsive Breakpoint Usage',
          status: 'warning',
          message: `Found non-standard breakpoint: ${breakpoint}. Use design system breakpoint tokens for consistency.`,
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(css, match.index)
        });
      }
    });
    
    return checks;
  }

  // Rule: Check for animation/transition consistency
  scanAnimationConsistency(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const css = context.css || '';
    const tokens = context.tokens || [];
    const tokenValues = tokens.map(t => t.value);
    
    // Find transition and animation properties
    const transitionPattern = /transition\s*:\s*([^;]+)/gi;
    const animationPattern = /animation\s*:\s*([^;]+)/gi;
    const matches = [
      ...css.matchAll(transitionPattern),
      ...css.matchAll(animationPattern)
    ];
    
    matches.forEach(match => {
      const value = match[1].trim();
      // Check if it references a design system token or standard values
      const isToken = tokenValues.some(tv => value.includes(tv)) || 
                     value.match(/var\(|--[a-z-]+/i);
      const isStandard = /ease|linear|ease-in|ease-out|ease-in-out/i.test(value);
      
      if (!isToken && !isStandard && value !== 'none') {
        checks.push({
          id: `animation-${match.index}`,
          rule: 'Animation/Transition Consistency',
          status: 'warning',
          message: `Found custom animation/transition: ${value}. Use design system animation tokens for consistency.`,
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(css, match.index)
        });
      }
    });
    
    return checks;
  }

  // Rule: Check for component variant usage
  scanComponentVariantUsage(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for design system component usage with variants
    const variantPatterns = [
      /variant=['"]\w+['"]/i,
      /size=['"]\w+['"]/i,
      /variant:\s*['"]\w+['"]/i,
      /size:\s*['"]\w+['"]/i
    ];
    
    const hasVariants = variantPatterns.some(pattern => pattern.test(html + js));
    const hasDesignSystemComponents = /@designsystem\/components|from ['"]@designsystem/i.test(js);
    
    // Check for custom variant implementations
    const customVariantPattern = /class.*variant|className.*variant|\.variant/i;
    const hasCustomVariants = customVariantPattern.test(html + js);
    
    if (hasDesignSystemComponents && hasCustomVariants && !hasVariants) {
      checks.push({
        id: 'component-variant-usage',
        rule: 'Component Variant Usage',
        status: 'warning',
        message: 'Custom variant implementations detected. Use design system component variants instead.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for search functionality on content-heavy pages
  scanSearchFunctionality(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for content-heavy indicators
    const hasLists = /<ul|<ol|<table|<tbody/i.test(html);
    const hasManyLinks = (html.match(/<a[^>]*>/gi) || []).length > 10;
    const hasManyHeadings = (html.match(/<h[1-6][^>]*>/gi) || []).length > 5;
    
    // Check for search functionality
    const hasSearchInput = /<input[^>]*type=['"]search['"]|<input[^>]*placeholder=['"][^'"]*search/i.test(html);
    const hasSearchFunction = /search|filter|find/i.test(js);
    const hasSearchIcon = /search|magnifying/i.test(html);
    
    const isContentHeavy = hasLists && (hasManyLinks || hasManyHeadings);
    
    if (isContentHeavy && !hasSearchInput && !hasSearchFunction && !hasSearchIcon) {
      checks.push({
        id: 'search-functionality',
        rule: 'Search Functionality',
        status: 'warning',
        message: 'Content-heavy page detected. Consider adding search functionality for better UX.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for consistent modal/dialog patterns
  scanModalConsistency(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Find modal/dialog elements
    const modalPatterns = [
      /<dialog/i,
      /role=['"]dialog['"]/i,
      /role=['"]alertdialog['"]/i,
      /modal|dialog/i
    ];
    
    const modals = modalPatterns.filter(pattern => pattern.test(html + js));
    const hasMultipleModals = modals.length > 1;
    
    // Check for design system modal usage
    const hasDesignSystemModals = /@designsystem.*modal|@designsystem.*dialog|Modal|Dialog/i.test(js);
    
    // Check for consistent modal patterns
    const hasConsistentPattern = /Modal|Dialog|modal|dialog/i.test(js) && 
                                 (hasDesignSystemModals || /class.*modal|className.*modal/i.test(html));
    
    if (hasMultipleModals && !hasConsistentPattern) {
      checks.push({
        id: 'modal-consistency',
        rule: 'Consistent Modal/Dialog Patterns',
        status: 'warning',
        message: 'Multiple modal/dialog implementations detected. Use consistent design system modal patterns.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for consistent toast/notification patterns
  scanToastConsistency(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for notification/toast patterns
    const hasNotifications = /notification|toast|snackbar|alert/i.test(html + js);
    const hasMultiplePatterns = [
      /toast/i,
      /notification/i,
      /snackbar/i,
      /alert/i
    ].filter(pattern => pattern.test(html + js)).length > 1;
    
    // Check for design system notification usage
    const hasDesignSystemNotifications = /@designsystem.*toast|@designsystem.*notification|Toast|Notification/i.test(js);
    
    if (hasNotifications && hasMultiplePatterns && !hasDesignSystemNotifications) {
      checks.push({
        id: 'toast-consistency',
        rule: 'Consistent Toast/Notification Patterns',
        status: 'warning',
        message: 'Multiple notification patterns detected. Use consistent design system notification/toast components.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for page load performance indicators
  scanPerformanceIndicators(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    const js = context.javascript || '';
    
    // Check for performance optimizations
    const hasLazyLoading = /loading=['"]lazy['"]|lazy-load/i.test(html + js);
    const hasCodeSplitting = /import\(|lazy\(|React\.lazy/i.test(js);
    const hasImageOptimization = /srcset|sizes/i.test(html);
    const hasPreload = /<link[^>]*rel=['"]preload['"]/i.test(html);
    const hasPrefetch = /<link[^>]*rel=['"]prefetch['"]/i.test(html);
    
    // Check for heavy resources
    const hasManyImages = (html.match(/<img[^>]*>/gi) || []).length > 5;
    const hasManyScripts = (html.match(/<script[^>]*>/gi) || []).length > 5;
    const hasManyStylesheets = (html.match(/<link[^>]*rel=['"]stylesheet['"]/gi) || []).length > 3;
    
    const hasHeavyResources = hasManyImages || hasManyScripts || hasManyStylesheets;
    const hasOptimizations = hasLazyLoading || hasCodeSplitting || hasImageOptimization || hasPreload || hasPrefetch;
    
    if (hasHeavyResources && !hasOptimizations) {
      checks.push({
        id: 'performance-indicators',
        rule: 'Page Load Performance Indicators',
        status: 'warning',
        message: 'Heavy resources detected without performance optimizations. Consider lazy loading, code splitting, or resource preloading.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for offline state handling
  scanOfflineStateHandling(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const js = context.javascript || '';
    
    // Check for offline detection
    const hasOfflineDetection = /online|offline|navigator\.onLine|addEventListener.*online|addEventListener.*offline/i.test(js);
    const hasServiceWorker = /serviceWorker|navigator\.serviceWorker/i.test(js);
    const hasCacheAPI = /cache|Cache\.open|CacheStorage/i.test(js);
    const hasIndexedDB = /indexedDB|IDB/i.test(js);
    
    const hasOfflineCapabilities = hasServiceWorker || hasCacheAPI || hasIndexedDB;
    
    // Check for async operations that might need offline handling
    const hasAsyncOperations = /fetch|axios|async|await|\.then\(/i.test(js);
    
    if (hasAsyncOperations && !hasOfflineDetection && !hasOfflineCapabilities) {
      checks.push({
        id: 'offline-state-handling',
        rule: 'Offline State Handling',
        status: 'warning',
        message: 'Async operations detected. Consider adding offline state handling for better UX.',
        application: context.applicationName,
        file: context.file
      });
    }
    
    return checks;
  }

  // Rule: Check for proper content hierarchy
  scanContentHierarchy(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      let hasH1 = false;
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        // Check for h1
        if (level === 1) {
          hasH1 = true;
        }
        
        // Check for hierarchy jumps
        if (previousLevel > 0 && level > previousLevel + 1) {
          checks.push({
            id: `content-hierarchy-${index}`,
            rule: 'Content Hierarchy',
            status: 'warning',
            message: `Heading hierarchy jumps from h${previousLevel} to h${level}. Headings should follow a logical order.`,
            application: context.applicationName,
            file: context.file,
            element: heading.outerHTML.substring(0, 100)
          });
        }
        
        previousLevel = level;
      });
      
      // Check for missing h1
      if (headings.length > 0 && !hasH1) {
        checks.push({
          id: 'content-hierarchy-h1',
          rule: 'Content Hierarchy',
          status: 'warning',
          message: 'Page has headings but no h1. Each page should have a single h1 for proper content hierarchy.',
          application: context.applicationName,
          file: context.file
        });
      }
      
      // Check for semantic structure
      const hasMain = document.querySelector('main') !== null;
      const hasArticle = document.querySelector('article') !== null;
      const hasSection = document.querySelector('section') !== null;
      
      if (headings.length > 3 && !hasMain && !hasArticle && !hasSection) {
        checks.push({
          id: 'content-hierarchy-semantic',
          rule: 'Content Hierarchy',
          status: 'warning',
          message: 'Multiple headings detected. Consider using semantic HTML elements (main, article, section) for better structure.',
          application: context.applicationName,
          file: context.file
        });
      }
    } catch (error) {
      // If DOM parsing fails, skip this check
    }
    
    return checks;
  }

  /**
   * Accessibility Rules using axe-core
   */
  
  // Rule: Run accessibility scan (axe-core compatible)
  // Note: For full axe-core support, consider using Puppeteer/Playwright to run in browser
  async scanAccessibility(context: ApplicationScanContext): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];
    
    if (!context.html) {
      return checks;
    }
    
    try {
      // Use jsdom to parse HTML
      const dom = new JSDOM(context.html);
      const document = dom.window.document;
      
      // Run comprehensive accessibility checks (axe-core compatible patterns)
      checks.push(...this.checkColorContrast(document, context));
      checks.push(...this.checkKeyboardNavigation(document, context));
      checks.push(...this.checkARIAAttributes(document, context));
      checks.push(...this.checkFocusManagement(document, context));
      checks.push(...this.basicAccessibilityScan(context));
      
    } catch (error) {
      // Fallback to basic accessibility checks if parsing fails
      checks.push(...this.basicAccessibilityScan(context));
    }
    
    return checks;
  }

  // Check color contrast (WCAG AA)
  private checkColorContrast(document: Document, context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Find all text elements and their computed styles
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th');
    
    textElements.forEach((element, index) => {
      const textContent = element.textContent?.trim();
      if (!textContent || textContent.length === 0) return;
      
      // Check for inline styles with color
      const style = element.getAttribute('style') || '';
      const hasColor = /color\s*:/i.test(style);
      const hasBackground = /background/i.test(style);
      
      // Check for class-based styling (would need CSS parsing for full check)
      const className = element.className || '';
      
      // If element has color styling but no explicit background, flag for review
      if (hasColor && !hasBackground && !className.includes('bg-')) {
        checks.push({
          id: `contrast-check-${index}`,
          rule: 'Color Contrast WCAG AA',
          status: 'warning',
          message: `Text element may have contrast issues. Verify foreground/background contrast ratio meets WCAG AA (4.5:1).`,
          application: context.applicationName,
          file: context.file,
          element: element.outerHTML.substring(0, 100)
        });
      }
    });
    
    return checks;
  }

  // Check keyboard navigation
  private checkKeyboardNavigation(document: Document, context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === '-1' && element.tagName.toLowerCase() !== 'input') {
        // Check if element should be keyboard accessible
        const role = element.getAttribute('role');
        if (role && ['button', 'link', 'menuitem'].includes(role)) {
          checks.push({
            id: `keyboard-nav-${index}`,
            rule: 'Keyboard Navigation',
            status: 'error',
            message: `Interactive element with role="${role}" has tabindex="-1" and is not keyboard accessible`,
            application: context.applicationName,
            file: context.file,
            element: element.outerHTML.substring(0, 100)
          });
        }
      }
    });
    
    return checks;
  }

  // Check ARIA attributes
  private checkARIAAttributes(document: Document, context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const elementsWithRoles = document.querySelectorAll('[role]');
    
    elementsWithRoles.forEach((element, index) => {
      const role = element.getAttribute('role');
      const hasLabel = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
      
      // Some roles require labels
      const rolesRequiringLabels = ['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'tab', 'treeitem'];
      if (rolesRequiringLabels.includes(role || '') && !hasLabel && !element.textContent?.trim()) {
        checks.push({
          id: `aria-label-${index}`,
          rule: 'ARIA Required Attributes',
          status: 'error',
          message: `Element with role="${role}" requires aria-label or aria-labelledby`,
          application: context.applicationName,
          file: context.file,
          element: element.outerHTML.substring(0, 100)
        });
      }
    });
    
    return checks;
  }

  // Check focus management
  private checkFocusManagement(document: Document, context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    
    modals.forEach((modal, index) => {
      // Check if modal has focus trap or focus management
      const hasFocusManagement = modal.querySelector('[autofocus]') || 
                                 modal.getAttribute('aria-describedby') ||
                                 modal.querySelector('[tabindex="-1"]');
      
      if (!hasFocusManagement) {
        checks.push({
          id: `focus-management-${index}`,
          rule: 'Focus Management',
          status: 'warning',
          message: 'Modal/dialog should manage focus (focus trap, initial focus, return focus)',
          application: context.applicationName,
          file: context.file,
          element: modal.outerHTML.substring(0, 100)
        });
      }
    });
    
    return checks;
  }

  // Fallback basic accessibility scan
  basicAccessibilityScan(context: ApplicationScanContext): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const html = context.html || '';
    
    // Check for alt text on images
    const imgPattern = /<img[^>]*>/gi;
    const images = [...html.matchAll(imgPattern)];
    
    images.forEach(match => {
      const imgTag = match[0];
      const hasAlt = /alt=['"][^'"]*['"]/i.test(imgTag);
      const isDecorative = /alt=['"]\s*['"]|role=['"]presentation['"]/i.test(imgTag);
      
      if (!hasAlt && !isDecorative) {
        checks.push({
          id: `alt-text-${match.index}`,
          rule: 'Image Alt Text',
          status: 'error',
          message: 'Image missing alt text. All images must have descriptive alt text or be marked as decorative.',
          application: context.applicationName,
          file: context.file,
          line: this.getLineNumber(html, match.index),
          element: imgTag.substring(0, 50)
        });
      }
    });
    
    // Check for heading hierarchy
    const headings = html.match(/<h[1-6][^>]*>/gi) || [];
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '0');
      if (previousLevel > 0 && level > previousLevel + 1) {
        checks.push({
          id: `heading-hierarchy-${index}`,
          rule: 'Heading Hierarchy',
          status: 'warning',
          message: `Heading level jumps from h${previousLevel} to h${level}. Headings should follow a logical hierarchy.`,
          application: context.applicationName,
          file: context.file,
          element: heading
        });
      }
      previousLevel = level;
    });
    
    return checks;
  }

  // Helper: Get line number from index
  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }
}

