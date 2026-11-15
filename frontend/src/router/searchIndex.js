/**
 * The top-nav search index, generated from the router so it can't point at a
 * page that doesn't exist. Every static route is listed; PAGES adds a title,
 * description, category, icon and search tags to the ones people look for.
 * Pages served by a catch-all route (guideline and pattern documents) are
 * listed only through PAGES, and only while the router still resolves them to
 * a page rather than to the not-found route.
 */

/** Titles, descriptions and search tags, by path */
export const PAGES = {
  '/getting-started': { title: 'Getting started', description: 'Learn the fundamentals, explore key concepts, and start building with confidence', category: 'Getting started', icon: 'rocket', tags: ['getting-started', 'onboarding', 'tutorial'] },
  '/getting-started/why-design-system': { title: 'Why a design system?', description: 'Understand the value and philosophy behind our design system and how it enables teams to build better products', category: 'Getting started', icon: 'circle-help', tags: ['philosophy', 'value', 'benefits', 'why', 'design-system'] },
  '/getting-started/principles': { title: 'Design principles', description: 'The core principles that guide our design decisions and ensure extraordinary experiences for all users', category: 'Getting started', icon: 'lightbulb', tags: ['principles', 'design', 'user-centric', 'accessibility', 'best-practices'] },
  '/getting-started/themes': { title: 'Design themes', description: 'Actionable design themes that expand on our principles and guide day-to-day design decisions', category: 'Getting started', icon: 'palette', tags: ['themes', 'design', 'guidelines', 'practices', 'patterns'] },
  '/getting-started/contribute': { title: 'Contribute', description: 'Learn how to contribute components, patterns, documentation, and feedback to the design system', category: 'Getting started', icon: 'users-round', tags: ['contribute', 'contribution', 'guidelines', 'process', 'collaboration'] },
  '/getting-started/quick-start': { title: 'Quick start', description: 'Get up and running with the design system in minutes', category: 'Getting started', icon: 'play', tags: ['quick-start', 'getting-started', 'tutorial', 'setup'] },
  '/getting-started/installation': { title: 'Installation', description: 'Install and configure the design system in your project', category: 'Getting started', icon: 'download', tags: ['installation', 'setup', 'npm', 'yarn', 'cdn'] },
  '/getting-started/best-practices': { title: 'Best practices', description: 'Recommended practices for using the design system effectively', category: 'Getting started', icon: 'circle-check', tags: ['best-practices', 'guidelines', 'recommendations', 'standards'] },
  '/getting-started/resources': { title: 'Resources', description: 'Helpful resources, tools, and links to help you work effectively with the design system', category: 'Getting started', icon: 'book', tags: ['resources', 'tools', 'links', 'documentation'] },
  '/getting-started/support': { title: 'Support & help', description: 'Get help when you need it. Find answers to common questions, report issues, or contact the design system team', category: 'Getting started', icon: 'circle-help', tags: ['support', 'help', 'faq', 'contact', 'assistance'] },
  '/getting-started/get-in-touch': { title: 'Get in touch', description: 'Have questions, feedback, or need support? We\'re here to help', category: 'Getting started', icon: 'mail', tags: ['contact', 'support', 'feedback', 'help', 'communication'] },
  '/getting-started/adopt': { title: 'Adopt', description: 'Learn how to successfully adopt the design system in your organization', category: 'Getting started', icon: 'trending-up', tags: ['adopt', 'adoption', 'implementation', 'onboarding', 'rollout'] },
  '/getting-started/improving-ux-through-acquisition': { title: 'Improving UX through acquisition', description: 'Learn how design system adoption and user acquisition strategies work together to create exceptional user experiences', category: 'Getting started', icon: 'lightbulb', tags: ['ux', 'acquisition', 'user-experience', 'strategy', 'growth', 'adoption'] },
  '/research': { title: 'HCD', description: 'Explore journey maps, user personas, HCD reports, and other human-centered design research artifacts', category: 'HCD', icon: 'notebook-tabs', tags: ['research', 'personas', 'journey-maps', 'hcd', 'user-studies'] },
  '/components/buttons': { title: 'Button', description: 'Primary, secondary, and tertiary button variants with different sizes and states', category: 'Components', icon: 'rectangle-horizontal', tags: ['interactive', 'form', 'action'] },
  '/components/loupe': { title: 'Loupe', description: 'Inspect design system components on any page with keyboard shortcut', category: 'Components', icon: 'zoom-in', tags: ['loupe', 'inspector', 'components', 'keyboard-shortcut'] },
  '/components/color-picker': { title: 'Color picker', description: 'Accessible color picker component with support for multiple color formats and WCAG compliance', category: 'Components', icon: 'pipette', tags: ['color', 'picker', 'accessibility', 'wcag', 'component'] },
  '/components/status': { title: 'Component status', description: 'Track component development status and availability', category: 'Components', icon: 'circle-check', tags: ['status', 'tracking'] },
  '/tokens/studio': { title: 'Token studio', description: 'Create and manage design tokens with Style Dictionary', category: 'Tokens', icon: 'sliders-horizontal', tags: ['tokens', 'design', 'style'] },
  '/tokens/library': { title: 'Style library', description: 'View, edit, download, and retire style dictionaries', category: 'Tokens', icon: 'library', tags: ['tokens', 'library'] },
  '/patterns/navigation': { title: 'Navigation pattern', description: 'Navigation patterns and best practices', category: 'Patterns', icon: 'navigation', tags: ['pattern', 'navigation'] },
  '/patterns/layout': { title: 'Layout pattern', description: 'Grid systems, containers, and responsive layouts', category: 'Patterns', icon: 'layout-dashboard', tags: ['pattern', 'layout'] },
  '/patterns/forms': { title: 'Form pattern', description: 'Form patterns and validation guidelines', category: 'Patterns', icon: 'file-text', tags: ['pattern', 'form'] },
  '/patterns/feedback': { title: 'Feedback pattern', description: 'User feedback patterns and notifications', category: 'Patterns', icon: 'message-square-warning', tags: ['pattern', 'feedback'] },
  '/patterns/status': { title: 'Pattern status', description: 'Track pattern development status and availability', category: 'Patterns', icon: 'circle-check', tags: ['pattern', 'status', 'tracking'] },
  '/patterns/form-validation': { title: 'Form validation pattern', description: 'Code pattern for accessible form validation', category: 'Patterns', icon: 'file-text', tags: ['pattern', 'form', 'validation', 'code'] },
  '/patterns/accessible-modal': { title: 'Accessible modal pattern', description: 'Code pattern for accessible modal dialogs', category: 'Patterns', icon: 'maximize', tags: ['pattern', 'modal', 'accessibility', 'code'] },
  '/patterns/sortable-data-table': { title: 'Sortable data table pattern', description: 'Code pattern for sortable data tables', category: 'Patterns', icon: 'table-2', tags: ['pattern', 'table', 'data', 'code'] },
  '/patterns/login-form': { title: 'Login form pattern', description: 'Code pattern for login forms', category: 'Patterns', icon: 'lock', tags: ['pattern', 'form', 'login', 'code'] },
  '/patterns/responsive-navigation': { title: 'Responsive navigation pattern', description: 'Code pattern for responsive navigation', category: 'Patterns', icon: 'menu', tags: ['pattern', 'navigation', 'responsive', 'code'] },
  '/patterns/toast-notification': { title: 'Toast notification pattern', description: 'Code pattern for toast notifications', category: 'Patterns', icon: 'bell', tags: ['pattern', 'toast', 'notification', 'code'] },
  '/design-assets/font-library': { title: 'Font library', description: 'Browse and preview hundreds of Google Fonts', category: 'Design assets', icon: 'library', tags: ['font', 'typography', 'design-assets'] },
  '/tools/font-scale': { title: 'Font scale', description: 'Typography scale and sizing system', category: 'Tools', icon: 'a-large-small', tags: ['font', 'scale', 'typography', 'tool'] },
  '/tools/font-stack': { title: 'Font stack & subsetting', description: 'Build font stacks with fallback fonts and optimize Google Fonts by subsetting character sets', category: 'Tools', icon: 'layers', tags: ['font', 'stack', 'subsetting', 'typography', 'tool', 'optimization'] },
  '/design-assets/icons': { title: 'Icon library', description: 'Browse Lucide icons and upload your own SVG icon sets', category: 'Design assets', icon: 'star', tags: ['icons', 'assets'] },
  '/design-assets/country-flags': { title: 'Country flags', description: 'Collection of country flag assets for use in your designs', category: 'Design assets', icon: 'flag', tags: ['flags', 'countries', 'assets'] },
  '/design-assets/usg-seals': { title: 'USG seals', description: 'Official US Government seals and emblems for authorized use', category: 'Design assets', icon: 'badge-check', tags: ['seals', 'usg', 'government', 'assets'] },
  '/design-assets/internal-seals': { title: 'Internal seals', description: 'Internal organizational seals and emblems for agency use', category: 'Design assets', icon: 'shield', tags: ['seals', 'internal', 'organizational', 'assets'] },
  '/design-assets/interactives': { title: 'Interactives', description: 'Interactive design assets and components for enhanced user experiences', category: 'Design assets', icon: 'pointer', tags: ['interactive', 'components', 'assets'] },
  '/design-assets/stock-photos': { title: 'Stock photos', description: 'Curated collection of stock photography for use in your projects', category: 'Design assets', icon: 'images', tags: ['photos', 'stock', 'photography', 'assets'] },
  '/design-assets/illustrations': { title: 'Illustrations', description: 'Curated illustration collections for your designs', category: 'Design assets', icon: 'pencil-line', tags: ['illustrations', 'art', 'assets'] },
  '/design-assets/capability-logos': { title: 'Capability logos', description: 'Logos and branding assets for specific capabilities and services', category: 'Design assets', icon: 'award', tags: ['logos', 'capability', 'branding', 'assets'] },
  '/design-assets/company-logos': { title: 'Company logos', description: 'Company and organization logos for partnership and collaboration materials', category: 'Design assets', icon: 'building-2', tags: ['logos', 'company', 'organizations', 'assets'] },
  '/tools/color-converter': { title: 'Color converter', description: 'Convert colors between different formats (HEX, RGB, HSL, etc.)', category: 'Tools', icon: 'palette', tags: ['color', 'converter', 'tool'] },
  '/tools/nasa-tlx': { title: 'NASA-TLX', description: 'Assess task workload across six dimensions for usability analysis', category: 'Tools', icon: 'brain', tags: ['usability', 'workload', 'assessment', 'nasa-tlx'] },
  '/tools/sus': { title: 'System usability scale', description: 'Quick and reliable tool for measuring system usability', category: 'Tools', icon: 'brain', tags: ['usability', 'sus', 'assessment', 'scale'] },
  '/tools/heuristic-evaluation': { title: 'Heuristic evaluation', description: 'Evaluate interfaces using Nielsen\'s 10 Usability Heuristics', category: 'Tools', icon: 'list-checks', tags: ['usability', 'heuristics', 'nielsen', 'evaluation', 'checklist'] },
  '/research/user-personas': { title: 'User persona generator', description: 'Create detailed user personas from research data to inform design decisions', category: 'HCD', icon: 'user', tags: ['persona', 'user-research', 'research', 'user-profile', 'archetype', 'hcd'] },
  '/tools/png-to-ico': { title: 'PNG to ICO converter', description: 'Convert PNG images to ICO format for favicons and app icons', category: 'Tools', icon: 'image', tags: ['image', 'converter', 'ico', 'favicon', 'icon'] },
  '/tools/alt-text-generator': { title: 'Alt text generator', description: 'Generate accessible, descriptive alt text for images to improve web accessibility and SEO', category: 'Tools', icon: 'type', tags: ['alt-text', 'accessibility', 'images', 'seo', 'a11y'] },
  '/tools/color-contrast': { title: 'Color contrast checker', description: 'Check color contrast ratios for accessibility', category: 'Tools', icon: 'contrast', tags: ['color', 'accessibility', 'contrast'] },
  '/tools/gradient-generator': { title: 'Gradient generator', description: 'Create beautiful gradients with custom stops and directions', category: 'Tools', icon: 'blend', tags: ['gradient', 'color', 'tool'] },
  '/tools/lorem-ipsum': { title: 'Lorem ipsum generator', description: 'Generate placeholder text with various options', category: 'Tools', icon: 'type', tags: ['text', 'placeholder', 'tool'] },
  '/tools/seo-tagging': { title: 'SEO tagging generator', description: 'Generate SEO meta tags for your pages', category: 'Tools', icon: 'search', tags: ['seo', 'meta', 'tool'] },
  '/tools/color-scale': { title: 'Color scale generator', description: 'Generate color scales with accessibility checks', category: 'Tools', icon: 'palette', tags: ['color', 'scale', 'accessibility'] },
  '/admin/health': { title: 'System health', description: 'Monitor your design system\'s health, track adoption, and identify improvements', category: 'Admin', icon: 'layout-panel-left', tags: ['health', 'metrics', 'analytics'] },
  '/admin/governance': { title: 'Design system governance', description: 'Enforce design system rules and check compliance', category: 'Admin', icon: 'shield-user', tags: ['governance', 'compliance', 'rules'] },
  '/admin/audit': { title: 'Audit logs', description: 'Track and monitor all user actions, API calls, and system events', category: 'Admin', icon: 'history', tags: ['audit', 'logs', 'tracking', 'monitoring'] },
  '/admin/roles': { title: 'Role management', description: 'Manage user roles and their access to design system features and permissions', category: 'Admin', icon: 'shield-user', tags: ['roles', 'permissions', 'rbac', 'access', 'management'] },
  '/admin/feature-flags': { title: 'Feature flags', description: 'Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts', category: 'Admin', icon: 'flag', tags: ['feature flags', 'feature toggles', 'rollout', 'targeting', 'openfeature'] },
  '/admin/content': { title: 'Component and pattern lifecycle management', description: 'Create new pattern or component pages and edit/update statuses of existing pages', category: 'Admin', icon: 'file-pen-line', tags: ['content', 'lifecycle', 'components', 'patterns', 'status', 'management'] },
  '/admin/applications': { title: 'Application management', description: 'Register applications, manage capabilities, and configure scanners for governance, visual regression, and session replay', category: 'Admin', icon: 'layout-grid', tags: ['applications', 'registration', 'governance', 'visual-regression', 'session-replay'] },
  '/admin/applications/register': { title: 'Application registration', description: 'Register a new application with the design system and enable/disable scanners and capabilities', category: 'Admin', icon: 'circle-plus', tags: ['applications', 'registration', 'onboarding', 'capabilities'] },
  '/review/handoff': { title: 'Design-dev handoff', description: 'Generate specs, export assets, and measure designs', category: 'Review', icon: 'arrow-left-right', tags: ['handoff', 'specs', 'export'] },
  '/notifications': { title: 'Change notifications', description: 'Stay informed about component and token changes', category: 'Tools', icon: 'bell', tags: ['notifications', 'changes', 'alerts'] },
  '/ai-suggestions': { title: 'AI-powered suggestions', description: 'Get intelligent recommendations for components and accessibility', category: 'Tools', icon: 'brain', tags: ['ai', 'suggestions', 'accessibility'] },
  '/brands': { title: 'Multi-brand support', description: 'Manage multiple brands and white-label systems', category: 'Tools', icon: 'layout-grid', tags: ['brands', 'white-label', 'themes'] },
  '/theme-builder': { title: 'Theme builder', description: 'Visually customize your design system theme', category: 'Tools', icon: 'sliders-horizontal', tags: ['theme', 'customization', 'colors'] },
  '/components/composition': { title: 'Component composition', description: 'Build complex components from primitives', category: 'Components', icon: 'layout-dashboard', tags: ['composition', 'primitives', 'builder'] },
  '/guidelines/colors': { title: 'Color guidelines', description: 'Color system and usage guidelines', category: 'Guidelines', icon: 'palette', tags: ['guidelines', 'color', 'colors', 'palette', 'design-tokens'] },
  '/guidelines/typography': { title: 'Typography guidelines', description: 'Typography system and best practices', category: 'Guidelines', icon: 'type', tags: ['guidelines', 'typography', 'fonts', 'text', 'type'] },
  '/guidelines/spacing': { title: 'Spacing guidelines', description: 'Spacing system and layout guidelines', category: 'Guidelines', icon: 'layout-panel-left', tags: ['guidelines', 'spacing', 'layout', 'margin', 'padding'] },
  '/guidelines/shadows': { title: 'Shadow guidelines', description: 'Shadow system and elevation guidelines', category: 'Guidelines', icon: 'layers', tags: ['guidelines', 'shadows', 'elevation', 'depth', 'layers'] },
  '/guidelines/accessibility': { title: 'Accessibility guidelines', description: 'Accessibility standards and best practices for inclusive design', category: 'Guidelines', icon: 'accessibility', tags: ['guidelines', 'accessibility', 'a11y', 'wcag', 'inclusive', 'design'] },
  '/guidelines/tui-guidance': { title: 'Terminal UI (TUI) guidance', description: 'Design standards for Terminal User Interfaces (TUIs) across command-line and console-based applications', category: 'Guidelines', icon: 'terminal', tags: ['guidelines', 'tui', 'terminal', 'cli', 'command-line', 'console', 'ncurses', 'accessibility', 'scriptability'] },
  '/admin/performance': { title: 'Performance analysis', description: 'Analyze bundle sizes and set performance budgets', category: 'Admin', icon: 'gauge', tags: ['performance', 'budgets', 'bundle', 'size', 'analysis', 'monitoring'] },
  '/tools/visual-regression': { title: 'Visual regression testing', description: 'Catch visual bugs before production with automated visual testing powered by Argos', category: 'Tools', icon: 'git-compare', tags: ['visual-regression', 'testing', 'argos', 'screenshots', 'qa'] },
  '/hcd/session-replay': { title: 'Session replay', description: 'See exactly what users experience with session replay and heatmaps for your applications', category: 'HCD', icon: 'video', tags: ['session-replay', 'openreplay', 'heatmaps', 'user-analytics', 'monitoring'] },
  '/tools/photosensitivity': { title: 'Photosensitivity analysis', description: 'Analyze video content for photosensitive epileptic risks using IRIS', category: 'Tools', icon: 'eye', tags: ['photosensitivity', 'iris', 'accessibility', 'video', 'epilepsy', 'a11y'] },
  '/ai': { title: 'AI overview', description: 'Explore AI-powered features and capabilities in the design system', category: 'AI', icon: 'brain', tags: ['ai', 'artificial-intelligence', 'overview', 'features'] },
  '/ai/patterns': { title: 'AI patterns', description: 'AI-generated design patterns and recommendations', category: 'AI', icon: 'layout-template', tags: ['ai', 'patterns', 'design', 'recommendations'] },
  '/ai/components': { title: 'AI components', description: 'AI-generated component suggestions and recommendations', category: 'AI', icon: 'blocks', tags: ['ai', 'components', 'suggestions', 'recommendations'] },
  '/review/management': { title: 'Review management', description: 'Manage review workflows, teams, and review links', category: 'Review', icon: 'folder-kanban', tags: ['review', 'management', 'workflow', 'teams', 'kanban'] },
  '/feedback': { title: 'Roadmap & feedback', description: 'View roadmap, submit feedback, and see what\'s new', category: 'Tools', icon: 'badge-alert', tags: ['roadmap', 'feedback', 'requests', 'whats-new'] },
  '/tools/chart-builder': { title: 'Chart builder', description: 'Create interactive charts and data visualizations with customizable options', category: 'Tools', icon: 'chart-column', tags: ['chart', 'data-visualization', 'graph', 'chartjs', 'tool'] },
  '/tools/timeline-generator': { title: 'Timeline generator', description: 'Create interactive timelines with events, dates, and custom styling', category: 'Tools', icon: 'chart-gantt', tags: ['timeline', 'events', 'history', 'visualization', 'tool'] },
  '/tools/table-generator': { title: 'Table generator', description: 'Generate data tables with sorting, filtering, and pagination', category: 'Tools', icon: 'table-2', tags: ['table', 'datatable', 'data', 'sorting', 'filtering', 'tool'] },
  '/tools/map-maker': { title: 'Map maker', description: 'Create choropleth maps and flow maps with customizable data visualization', category: 'Tools', icon: 'map', tags: ['map', 'choropleth', 'flow-map', 'geographic', 'data-visualization', 'tool'] },
  '/palette-builder': { title: 'Palette builder', description: 'Build and customize color palettes for your design system', category: 'Tools', icon: 'palette', tags: ['palette', 'color', 'builder', 'design-tokens', 'tool'] },
  '/tools/spacing-scale': { title: 'Spacing scale generator', description: 'Generate consistent spacing scales for your design system', category: 'Tools', icon: 'layout-panel-left', tags: ['spacing', 'scale', 'margin', 'padding', 'layout', 'tool'] },
  '/tools/box-shadow': { title: 'Box shadow generator', description: 'Generate CSS box shadows with customizable properties', category: 'Tools', icon: 'layers', tags: ['shadow', 'box-shadow', 'css', 'elevation', 'tool'] },
  '/tools/border-radius': { title: 'Border radius generator', description: 'Generate border radius values for rounded corners', category: 'Tools', icon: 'square-round-corner', tags: ['border-radius', 'rounded', 'corners', 'css', 'tool'] },
  '/tools/html-viewer': { title: 'HTML viewer', description: 'Preview and inspect HTML code in a live viewer', category: 'Tools', icon: 'eye', tags: ['html', 'viewer', 'preview', 'code', 'tool'] },
  '/tools/html-escaper': { title: 'HTML escaper', description: 'Escape and unescape HTML entities and special characters', category: 'Tools', icon: 'lock', tags: ['html', 'escape', 'entities', 'security', 'tool'] },
  '/tools/px-converter': { title: 'PX unit converter', description: 'Convert pixel values to other CSS units (rem, em, pt, etc.)', category: 'Tools', icon: 'ruler', tags: ['px', 'converter', 'units', 'css', 'rem', 'em', 'tool'] },
  '/tools/css-converter': { title: 'CSS converter', description: 'Convert CSS between different formats and syntaxes', category: 'Tools', icon: 'code', tags: ['css', 'converter', 'syntax', 'format', 'tool'] },
  '/tools/image-compressor': { title: 'Image compressor', description: 'Compress and optimize images to reduce file size while maintaining quality', category: 'Tools', icon: 'shrink', tags: ['image', 'compressor', 'optimization', 'file-size', 'tool'] },
  '/tools/css-animation': { title: 'CSS animation generator', description: 'Generate CSS animations and keyframes with customizable properties', category: 'Tools', icon: 'wand-sparkles', tags: ['css', 'animation', 'keyframes', 'transitions', 'tool'] },
  '/components': { title: 'Components', description: 'Browse and explore all design system components', category: 'Components', icon: 'blocks', tags: ['components', 'overview', 'library'] },
  '/tokens': { title: 'Tokens', description: 'Explore design tokens, color palettes, and style systems', category: 'Tokens', icon: 'sliders-horizontal', tags: ['tokens', 'overview', 'design-tokens'] },
  '/patterns': { title: 'Patterns', description: 'Browse design patterns and best practices', category: 'Patterns', icon: 'layout-template', tags: ['patterns', 'overview', 'design-patterns'] },
  '/tools': { title: 'Tools', description: 'Access design and development tools', category: 'Tools', icon: 'wrench', tags: ['tools', 'overview', 'utilities'] },
  '/fonts': { title: 'Fonts', description: 'Browse typography resources and font tools', category: 'Design assets', icon: 'type', tags: ['fonts', 'typography', 'overview'] },
  '/design-assets': { title: 'Design assets', description: 'Browse icons, fonts, illustrations, and other design assets', category: 'Design assets', icon: 'images', tags: ['design-assets', 'assets', 'overview'] },
  '/review': { title: 'Review', description: 'Review system for design and development collaboration', category: 'Review', icon: 'message-square-text', tags: ['review', 'collaboration', 'overview'] },
  '/guidelines': { title: 'Guidelines', description: 'Design guidelines and documentation', category: 'Guidelines', icon: 'book-open', tags: ['guidelines', 'documentation', 'overview'] },
  '/for-designers': { title: 'For designers', description: 'Resources and tools specifically for designers', category: 'Getting started', icon: 'palette', tags: ['designers', 'resources', 'tools'] },
  '/for-developers': { title: 'For developers', description: 'Resources and tools specifically for developers', category: 'Getting started', icon: 'code', tags: ['developers', 'resources', 'tools'] },
  '/for-researchers': { title: 'For researchers', description: 'Resources and tools specifically for researchers', category: 'Getting started', icon: 'flask-conical', tags: ['researchers', 'resources', 'tools'] },
  '/components/export': { title: 'Component library export', description: 'Export component libraries and documentation', category: 'Components', icon: 'download', tags: ['export', 'library', 'components'] },
  '/components/deprecation': { title: 'Deprecation manager', description: 'Manage component deprecations and migrations', category: 'Components', icon: 'triangle-alert', tags: ['deprecation', 'migration', 'components'] },
  '/components/badge-generator': { title: 'Badge generator', description: 'Generate badge components with customizable styles', category: 'Components', icon: 'id-card', tags: ['badge', 'generator', 'components'] },
  '/components/progress-generator': { title: 'Progress generator', description: 'Generate progress bar components', category: 'Components', icon: 'loader-circle', tags: ['progress', 'generator', 'components'] },
  '/components/loading-generator': { title: 'Loading spinner generator', description: 'Generate loading spinner components', category: 'Components', icon: 'refresh-cw', tags: ['loading', 'spinner', 'generator', 'components'] },
  '/components/scaffold': { title: 'Component scaffolding wizard', description: 'Scaffold new components with best practices', category: 'Components', icon: 'sparkles', tags: ['scaffold', 'wizard', 'components', 'generator'] },
  '/components/testing': { title: 'Component testing', description: 'Test components and ensure quality', category: 'Components', icon: 'flask-conical', tags: ['testing', 'components', 'qa'] },
  '/components/documentation': { title: 'Documentation generator', description: 'Generate component documentation automatically', category: 'Components', icon: 'file-text', tags: ['documentation', 'generator', 'components'] },
  '/admin/dependencies': { title: 'Component dependency graph', description: 'Visualize component dependencies and relationships', category: 'Components', icon: 'network', tags: ['dependencies', 'graph', 'components'] },
  '/tokens/playground': { title: 'Token playground', description: 'Experiment with design tokens in an interactive playground', category: 'Tokens', icon: 'play', tags: ['tokens', 'playground', 'experiment'] },
  '/tokens/color-palettes': { title: 'Color palettes', description: 'Browse and manage color palettes', category: 'Tokens', icon: 'palette', tags: ['color', 'palettes', 'tokens'] },
  '/tokens/color-palettes/harmony': { title: 'Harmony palette', description: 'Create harmonious color palettes', category: 'Tokens', icon: 'palette', tags: ['harmony', 'color', 'palette', 'tokens'] },
  '/tokens/color-palettes/colored-text': { title: 'Colored text palette', description: 'Generate accessible colored text palettes', category: 'Tokens', icon: 'baseline', tags: ['colored-text', 'color', 'palette', 'tokens', 'accessibility'] },
  '/tokens/migration': { title: 'Token migration', description: 'Migrate and update design tokens', category: 'Tokens', icon: 'arrow-left-right', tags: ['migration', 'tokens', 'update'] },
  '/tokens/relationships': { title: 'Token relationships', description: 'Visualize token relationships and dependencies', category: 'Tokens', icon: 'share-2', tags: ['relationships', 'tokens', 'dependencies'] },
  '/tokens/sync': { title: 'Token sync', description: 'Pull tokens from Figma or Penpot and review the diff', category: 'Tokens', icon: 'refresh-cw', tags: ['sync', 'tokens', 'synchronization'] },
  '/tokens/extract': { title: 'Design extractor', description: 'Extract design tokens from design files', category: 'Tokens', icon: 'file-output', tags: ['extract', 'tokens', 'design-files'] },
  '/tokens/ai-builder': { title: 'AI token builder', description: 'Build design tokens with AI assistance', category: 'Tokens', icon: 'sparkles', tags: ['ai', 'tokens', 'builder', 'generator'] },
  '/design-sync': { title: 'Design sync', description: 'Compare Figma or Penpot components with the library', category: 'Tools', icon: 'refresh-cw', tags: ['design-sync', 'sync', 'tools'] },
  '/hcd/principles': { title: 'HCD principles', description: 'Human-centered design principles and guidelines', category: 'HCD', icon: 'lightbulb', tags: ['hcd', 'principles', 'human-centered-design'] },
  '/hcd/research': { title: 'HCD research', description: 'User research methods and practices', category: 'HCD', icon: 'flask-conical', tags: ['hcd', 'research', 'user-research'] },
  '/hcd/accessibility': { title: 'HCD accessibility', description: 'Accessibility in human-centered design', category: 'HCD', icon: 'accessibility', tags: ['hcd', 'accessibility', 'a11y'] },
  '/hcd/laws-of-ux': { title: 'Laws of UX', description: 'Explore fundamental laws and principles of user experience design', category: 'HCD', icon: 'gavel', tags: ['laws-of-ux', 'ux', 'principles', 'hcd'] },
  '/hcd/process': { title: 'HCD process', description: 'Human-centered design process and methodology', category: 'HCD', icon: 'chart-gantt', tags: ['hcd', 'process', 'methodology'] },
  '/hcd/recruiting-users': { title: 'Recruiting users', description: 'Guidelines and tools for recruiting research participants', category: 'HCD', icon: 'users', tags: ['recruiting', 'users', 'research', 'hcd'] },
  '/hcd/conducting-interviews': { title: 'Conducting interviews', description: 'Best practices for conducting user interviews', category: 'HCD', icon: 'mic', tags: ['interviews', 'user-research', 'hcd'] },
  '/hcd/research-reports': { title: 'Research reports', description: 'Create and manage user research reports', category: 'HCD', icon: 'file-text', tags: ['research-reports', 'reports', 'hcd'] },
  '/hcd/research-methods': { title: 'Research methods', description: 'User research methods and techniques', category: 'HCD', icon: 'brain', tags: ['research-methods', 'methods', 'hcd'] },
  '/hcd/council': { title: 'HCD council', description: 'Human-centered design council and governance', category: 'HCD', icon: 'users-round', tags: ['hcd-council', 'council', 'governance', 'hcd'] },
  '/research/journey-maps': { title: 'Journey maps', description: 'Create and visualize user journey maps', category: 'HCD', icon: 'map', tags: ['journey-maps', 'user-journey', 'research', 'hcd'] },
  '/research/hcd-reports': { title: 'HCD reports', description: 'Browse human-centered design research reports', category: 'HCD', icon: 'file-text', tags: ['hcd-reports', 'reports', 'research', 'hcd'] },
  '/research/user-studies': { title: 'User studies', description: 'Browse and manage user studies', category: 'HCD', icon: 'flask-conical', tags: ['user-studies', 'studies', 'research', 'hcd'] },
  '/research/insights': { title: 'Research insights', description: 'Key insights from user research', category: 'HCD', icon: 'lightbulb', tags: ['research-insights', 'insights', 'research', 'hcd'] },
  '/getting-started/foundations/atomic-design': { title: 'Atomic design', description: 'Learn about atomic design methodology', category: 'Getting started', icon: 'flask-conical', tags: ['atomic-design', 'methodology', 'foundations'] },
  '/getting-started/foundations/building-trust': { title: 'Building trust', description: 'Design principles for building user trust', category: 'Getting started', icon: 'badge-check', tags: ['trust', 'foundations', 'principles'] },
  '/getting-started/foundations/responsiveness': { title: 'Responsiveness', description: 'Responsive design principles and practices', category: 'Getting started', icon: 'monitor-smartphone', tags: ['responsiveness', 'responsive', 'foundations'] },
  '/getting-started/foundations/usability': { title: 'Usability', description: 'Usability principles and best practices', category: 'Getting started', icon: 'pointer', tags: ['usability', 'foundations', 'ux'] },
  '/getting-started/foundations/writing-content': { title: 'Writing content', description: 'Content writing guidelines and best practices', category: 'Getting started', icon: 'pencil', tags: ['content', 'writing', 'foundations'] },
  '/getting-started/purpose-and-benefits': { title: 'Purpose and benefits', description: 'Understand the purpose and benefits of the design system', category: 'Getting started', icon: 'info', tags: ['purpose', 'benefits', 'getting-started'] },
  '/guidelines/voice-and-tone': { title: 'Voice and tone', description: 'Content voice and tone guidelines', category: 'Guidelines', icon: 'speech', tags: ['voice', 'tone', 'content', 'guidelines'] },
  '/tools/svg-placeholder-text': { title: 'SVG placeholder text generator', description: 'Generate SVG placeholder text for designs', category: 'Tools', icon: 'type', tags: ['svg', 'placeholder', 'text', 'generator', 'tool'] },
  '/tools/apca-calculator': { title: 'APCA calculator', description: 'Calculate Advanced Perceptual Contrast Algorithm values', category: 'Tools', icon: 'calculator', tags: ['apca', 'contrast', 'accessibility', 'calculator', 'tool'] },
  '/api': { title: 'Design system API', description: 'Access the design system via API', category: 'Tools', icon: 'webhook', tags: ['api', 'design-system', 'integration'] },
  '/admin/workspaces': { title: 'Workspace management', description: 'Manage workspaces and teams', category: 'Admin', icon: 'briefcase', tags: ['workspaces', 'teams', 'admin'] },
  '/admin/users': { title: 'User management', description: 'Manage users and permissions', category: 'Admin', icon: 'users', tags: ['users', 'permissions', 'admin'] },
  '/admin/api-keys': { title: 'API keys', description: 'Create and revoke API keys for machine clients', category: 'Admin', icon: 'key', tags: ['api', 'keys', 'tokens', 'ci', 'admin'] },
  '/admin/accessibility-reports': { title: 'Accessibility reports', description: 'View and manage accessibility reports', category: 'Admin', icon: 'accessibility', tags: ['accessibility', 'reports', 'admin', 'a11y'] },
  '/tools/references/jaws-commands': { title: 'JAWS commands', description: 'Reference guide for JAWS screen reader commands and keyboard shortcuts', category: 'Tools', icon: 'keyboard', tags: ['jaws', 'screen-reader', 'accessibility', 'keyboard', 'commands', 'reference', 'a11y'] },
  '/tools/references/penpot-for-beginners': { title: 'Penpot for beginners', description: 'Getting started guide for Penpot design tool', category: 'Tools', icon: 'pencil-line', tags: ['penpot', 'design-tool', 'tutorial', 'beginners', 'reference'] },
  '/tools/references/units-of-measure': { title: 'Units of measure', description: 'Reference guide for units of measurement in design and development', category: 'Tools', icon: 'ruler', tags: ['units', 'measurement', 'reference', 'design', 'development'] },
  '/guidelines/patterns/agent-oriented-onboarding': { title: 'Agent-oriented onboarding', description: 'Design patterns for AI agent onboarding experiences', category: 'Patterns', icon: 'rocket', tags: ['pattern', 'onboarding', 'ai', 'agent', 'interaction'] },
  '/guidelines/patterns/ai-disengagement-timeout-error': { title: 'AI disengagement timeout error', description: 'Patterns for handling AI disengagement and timeout errors', category: 'Patterns', icon: 'timer-off', tags: ['pattern', 'ai', 'error', 'timeout', 'disengagement', 'interaction'] },
  '/guidelines/patterns/ai-thinking-states': { title: 'AI thinking states', description: 'Design patterns for displaying AI thinking and processing states', category: 'Patterns', icon: 'brain', tags: ['pattern', 'ai', 'thinking', 'states', 'loading', 'interaction'] },
  '/guidelines/patterns/empty-loading-states': { title: 'Empty loading states', description: 'Design patterns for empty and loading states in user interfaces', category: 'Patterns', icon: 'hourglass', tags: ['pattern', 'empty', 'loading', 'states', 'ui', 'design'] },
  '/guidelines/patterns/error-handling': { title: 'Error handling', description: 'Design patterns for error handling and user feedback', category: 'Patterns', icon: 'circle-alert', tags: ['pattern', 'error', 'handling', 'feedback', 'ui', 'design'] },
  '/guidelines/patterns/multi-agent-orchestration': { title: 'Multi-agent orchestration', description: 'Design patterns for orchestrating multiple AI agents', category: 'Patterns', icon: 'network', tags: ['pattern', 'ai', 'agents', 'orchestration', 'multi-agent', 'interaction'] },
  '/guidelines/patterns/new-features-experiences': { title: 'New features experiences', description: 'Design patterns for introducing new features to users', category: 'Patterns', icon: 'badge-alert', tags: ['pattern', 'features', 'onboarding', 'discovery', 'ui', 'design'] },
  '/guidelines/color-contrast': { title: 'Color contrast', description: 'Guidelines for color contrast and accessibility in design', category: 'Guidelines', icon: 'contrast', tags: ['guidelines', 'color', 'contrast', 'accessibility', 'a11y', 'wcag'] },
  '/guidelines/content-organization-navigation': { title: 'Content organization navigation', description: 'Guidelines for organizing content and navigation structures', category: 'Guidelines', icon: 'navigation', tags: ['guidelines', 'content', 'organization', 'navigation', 'information-architecture'] },
  '/guidelines/css-grid-layout': { title: 'CSS grid layout', description: 'Guidelines for using CSS Grid in layout design', category: 'Guidelines', icon: 'layout-dashboard', tags: ['guidelines', 'css', 'grid', 'layout', 'design'] },
  '/guidelines/flashing': { title: 'Flashing', description: 'Guidelines for handling flashing content and photosensitivity', category: 'Guidelines', icon: 'zap', tags: ['guidelines', 'flashing', 'photosensitivity', 'accessibility', 'a11y', 'epilepsy'] },
  '/guidelines/focus': { title: 'Focus', description: 'Guidelines for keyboard focus and accessibility', category: 'Guidelines', icon: 'focus', tags: ['guidelines', 'focus', 'keyboard', 'accessibility', 'a11y'] },
  '/guidelines/iconography': { title: 'Iconography', description: 'Guidelines for icon design and usage', category: 'Guidelines', icon: 'image', tags: ['guidelines', 'icons', 'iconography', 'design', 'visual'] },
  '/guidelines/information-architecture': { title: 'Information architecture', description: 'Guidelines for information architecture and content structure', category: 'Guidelines', icon: 'network', tags: ['guidelines', 'information-architecture', 'ia', 'structure', 'content'] },
  '/guidelines/keyboard-gestures': { title: 'Keyboard gestures', description: 'Guidelines for keyboard gestures and shortcuts', category: 'Guidelines', icon: 'keyboard', tags: ['guidelines', 'keyboard', 'gestures', 'shortcuts', 'accessibility', 'a11y'] },
  '/guidelines/metadata-seo': { title: 'Metadata SEO', description: 'Guidelines for metadata and SEO best practices', category: 'Guidelines', icon: 'search', tags: ['guidelines', 'metadata', 'seo', 'search', 'optimization'] },
  '/guidelines/multimedia-animation': { title: 'Multimedia animation', description: 'Guidelines for multimedia and animation in design', category: 'Guidelines', icon: 'wand-sparkles', tags: ['guidelines', 'multimedia', 'animation', 'video', 'motion'] },
  '/guidelines/text-graphics': { title: 'Text graphics', description: 'Guidelines for combining text and graphics in design', category: 'Guidelines', icon: 'type', tags: ['guidelines', 'text', 'graphics', 'typography', 'visual'] },
  '/guidelines/time': { title: 'Time', description: 'Guidelines for time-based interactions and displays', category: 'Guidelines', icon: 'clock', tags: ['guidelines', 'time', 'temporal', 'interactions', 'display'] },
};

const CATEGORIES = {
  'getting-started': 'Getting started',
  'for-designers': 'Getting started',
  'for-developers': 'Getting started',
  'for-researchers': 'Getting started',
  components: 'Components',
  tokens: 'Tokens',
  patterns: 'Patterns',
  guidelines: 'Guidelines',
  tools: 'Tools',
  'data-viz': 'Tools',
  fonts: 'Design assets',
  'design-assets': 'Design assets',
  research: 'HCD',
  hcd: 'HCD',
  ai: 'AI',
  review: 'Review',
  admin: 'Admin',
  performance: 'Admin',
};

const NOT_FOUND = '/:pathMatch(.*)*';

const sentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** "/tools/px-converter" → "Px converter" */
export const titleFromPath = (path) => sentenceCase((path.split('/').filter(Boolean).pop() || 'home').replace(/-/g, ' '));

export const categoryFor = (path) => CATEGORIES[path.split('/')[1]] || 'Pages';

/** Static pages a person can open: no parameters, redirects or sign-in screens */
const isListedRoute = (route) => !route.path.includes(':') && !route.redirect && !route.meta?.bare && !route.meta?.public;

/** Whether the router opens a real page at this path (not the not-found page or a redirect) */
export const resolvesToPage = (router, path) => {
  const matched = router.resolve(path).matched;
  const record = matched[matched.length - 1];
  return !!record && record.path !== NOT_FOUND && !record.redirect;
};

const entryFor = (path, meta = {}) => {
  const info = PAGES[path] || {};
  return {
    id: path,
    path,
    title: info.title || meta.title || titleFromPath(path),
    description: info.description || '',
    category: info.category || categoryFor(path),
    icon: info.icon || 'file-text',
    tags: info.tags || path.split('/').filter(Boolean),
  };
};

/** The search index for a router: every listed route, plus documents under catch-all routes */
export function buildSearchIndex(router) {
  const entries = new Map();
  for (const route of router.getRoutes()) {
    if (isListedRoute(route)) entries.set(route.path, entryFor(route.path, route.meta));
  }
  for (const path of Object.keys(PAGES)) {
    if (!entries.has(path) && resolvesToPage(router, path)) entries.set(path, entryFor(path));
  }
  return [...entries.values()];
}
