# WCAG 2.1 AA status of the app

This describes the accessibility work in the frontend as the code stands, and what is still open. It is not an audit: no screen-reader or contrast audit has been done across the app. To scan pages, use the accessibility reports (`/admin/accessibility-reports`, axe-core; see [docs/AUTOMATED_ACCESSIBILITY_REPORTS.md](../docs/AUTOMATED_ACCESSIBILITY_REPORTS.md)).

## In place

### Bypass blocks (2.4.1)
- `App.vue` has "Skip to main content" (`#main-content`, the `<main>` element) and, outside bare pages such as sign-in, "Skip to navigation" (`#navigation`, in `Sidebar.vue`). The links are hidden until focused.

### Focus visible (2.4.7)
- `style.css` gives every `:focus-visible` element the design system's focus ring (`--tc-focus-outline`, `--tc-focus-ring-offset`) in both themes, and hides the outline for mouse focus. Fields in the ui kit show focus with their own ring.

### Name, role, value (4.1.2)
- Icons come from Lucide through `<AppIcon>`, which is decorative (`aria-hidden`) unless given a label. Icon-only buttons in the top bar and ui kit carry `aria-label`; `npm run check:icons` keeps icons on AppIcon.
- Menus in the top bar use `aria-expanded` and `aria-haspopup`.

### Dialogs
- `UiDialog` (`components/ui/UiDialog.vue`) is built on the native `<dialog>` element: focus moves into it and back, Escape and the close button close it, the page behind is inert, and its heading labels it (`aria-labelledby`). Pages moved onto the design system use it. Older pages still have hand-built modals of varying quality.

### Labels, instructions and errors (1.3.1, 3.3.1, 3.3.2)
- `UiField` and `UiInput` tie each label, hint and error to the control (`for`/`id`, `aria-describedby`) and set `aria-invalid`; the error is announced with `role="alert"`.
- `.sr-only` in `style.css` hides text visually but keeps it for screen readers.

### Non-text content (1.1.1)
- The app does use `<img>`: visual regression diffs (`EnhancedDiffViewer.vue`, `ImageComparisonSlider.vue`), image previews (`PNGToICO.vue`, `ImageCompressor.vue`), workspace resources (`WorkspaceResourceList.vue`, `ResourceLibrary.vue`) and examples (`ComponentExamples.vue`). Each has an `alt`, mostly built from the image's name; decorative ones use `alt=""`. The examples' "Card image" is a placeholder, not useful alt text.
- Page-hero spot illustrations (`SpotArt.vue`) are inlined SVG and `aria-hidden`.
- `MarkdownViewer.vue` inlines `/svgs/*.svg` images from the guidance Markdown in place of their `<img>` tags.

### Headings
- Pages on the design system (`PageShell` and `PageHero`, listed in `frontend/scripts/reskinned.json`) have one `h1` and sentence-case headings.

## Open

- **Contrast (1.4.3, 1.4.11)**: the token colours are designed for AA, but text and UI colours across the app haven't been checked. Pages not yet moved onto tokens (not in `reskinned.json`) still use raw palette colours.
- **Pages not yet on the design system** may lack labels, use hand-built modals without focus handling, or have more than one `h1`.
- **Manual testing**: none recorded with a screen reader (NVDA, JAWS, VoiceOver), keyboard only, or at 200% zoom.
- The open accessibility items in [CODE_REVIEW.md](../CODE_REVIEW.md) (F13) still apply.

## Checklist

- [x] Skip links
- [x] Visible focus ring for keyboard focus
- [x] Labelled fields and announced errors in the ui kit
- [x] Accessible dialog component
- [x] Alt text on `<img>` elements (one placeholder to improve)
- [ ] Contrast checked across the app
- [ ] Every page on the design system
- [ ] Screen reader testing
- [ ] Keyboard-only testing
- [ ] 200% zoom testing

## Resources

- [WCAG 2.1 quick reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
