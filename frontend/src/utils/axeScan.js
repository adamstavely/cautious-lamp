// Shared axe-core options for the generator pages' "Run Accessibility Check".
// Every id here must exist in the installed axe-core registry: axe.run rejects
// the whole scan when an option names an unknown rule.
//
// The tag set already covers names and labels (aria-input-field-name,
// aria-command-name, button-name, label, image-alt, svg-img-alt, role-img-alt)
// and keyboard access (nested-interactive, scrollable-region-focusable,
// tabindex), so only rules outside those tags are enabled by id.
export const AXE_SCAN_OPTIONS = Object.freeze({
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  },
  rules: {
    // Experimental, so not in the tags above.
    'focus-order-semantics': { enabled: true },
    // The scan targets a preview fragment, not a page: page-level checks
    // would report on the app shell rather than the generated output.
    'document-title': { enabled: false },
    'html-has-lang': { enabled: false },
    'html-lang-valid': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'landmark-one-main': { enabled: false },
    region: { enabled: false },
  },
});
