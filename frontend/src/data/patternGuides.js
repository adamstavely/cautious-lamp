// The pattern pages that are written guidance rather than code: the core UI
// guides (/patterns/<slug>) and the experience patterns
// (/guidelines/patterns/<slug>, also reachable as /patterns/<slug>). Their text
// is Markdown in public/docs/patterns/<slug>.md; this is their hero and links.
import { snippetForSlug } from './patternSnippets.js';

/** Core UI pattern guides; navigation and notifications have pages of their own */
export const PATTERN_GUIDES = [
  {
    slug: 'layout',
    title: 'Layout patterns',
    lead: 'Grids, containers and breakpoints that give every page the same structure.',
    spot: 'guidelines/css-grid-layout',
    icon: 'layout-dashboard',
    to: '/patterns/layout',
    related: ['navigation', 'data-display', 'forms'],
  },
  {
    slug: 'navigation',
    title: 'Navigation patterns',
    lead: 'Sidebars, top bars and breadcrumbs that show people where they are and where they can go.',
    spot: 'patterns/pattern-navigation-overview',
    icon: 'navigation',
    to: '/patterns/navigation',
    related: ['layout', 'data-display', 'forms'],
  },
  {
    slug: 'data-display',
    title: 'Data display patterns',
    lead: 'Tables, lists and cards for presenting records clearly.',
    spot: 'patterns/data-visualization',
    icon: 'table-2',
    to: '/patterns/data-display',
    related: ['sortable-data-table', 'layout', 'navigation'],
  },
  {
    slug: 'forms',
    title: 'Form patterns',
    lead: 'Inputs, layout and validation that make forms quick to fill in and hard to get wrong.',
    spot: 'patterns/error-handling',
    icon: 'file-text',
    to: '/patterns/forms',
    related: ['form-validation', 'login-form', 'feedback'],
  },
  {
    slug: 'feedback',
    title: 'Feedback patterns',
    lead: 'Toasts, alerts and loading states that tell people what the system is doing.',
    spot: 'patterns/empty-loading-states',
    icon: 'message-square-warning',
    to: '/patterns/feedback',
    related: ['notifications', 'toast-notification', 'forms'],
  },
  {
    slug: 'notifications',
    title: 'Notification patterns',
    lead: 'A decision tree for choosing between a modal, a banner, a toast and a dialog.',
    spot: 'patterns/pattern-notifications-overview',
    icon: 'bell',
    to: '/patterns/notifications',
    related: ['feedback', 'toast-notification', 'accessible-modal'],
  },
];

/** Experience patterns, mostly for AI features */
export const EXPERIENCE_PATTERNS = [
  {
    slug: 'empty-loading-states',
    title: 'Empty and loading states',
    lead: 'Empty states that explain what goes here and how to start, and loading states that set expectations.',
  },
  {
    slug: 'error-handling',
    title: 'Error handling',
    lead: 'Communicating errors clearly and giving people a way to recover.',
  },
  {
    slug: 'new-features-experiences',
    title: 'Introducing new features',
    lead: 'Pointing people to something new without getting in the way of their work.',
  },
  {
    slug: 'data-visualization',
    title: 'Data visualization',
    lead: 'Charts that are clear, honest and readable by everyone.',
  },
  {
    slug: 'agent-oriented-onboarding',
    title: 'Agent-oriented onboarding',
    lead: 'Introducing people to what an AI agent can do, what it cannot, and how to work with it.',
  },
  {
    slug: 'ai-thinking-states',
    title: 'AI thinking states',
    lead: 'Showing that an AI is working, what it is doing, and how long it may take.',
  },
  {
    slug: 'ai-disengagement-timeout-error',
    title: 'AI timeouts and disengagement',
    lead: 'Handling requests that take too long or that the user walks away from.',
  },
  {
    slug: 'multi-agent-orchestration',
    title: 'Multi-agent orchestration',
    lead: 'Interfaces where several AI agents work on one task and people stay in charge.',
  },
].map((pattern) => ({ ...pattern, spot: `patterns/${pattern.slug}`, to: `/guidelines/patterns/${pattern.slug}` }));

export const guideForSlug = (slug) => PATTERN_GUIDES.find((g) => g.slug === slug) ?? null;
export const experiencePatternForSlug = (slug) => EXPERIENCE_PATTERNS.find((p) => p.slug === slug) ?? null;

/** Cards for a guide's related pages: other guides and code patterns, by slug */
export const relatedCards = (slugs) =>
  slugs
    .map((slug) => {
      const guide = guideForSlug(slug);
      if (guide) return { title: guide.title, to: guide.to, body: guide.lead, spot: guide.spot };
      const snippet = snippetForSlug(slug);
      if (snippet) return { title: snippet.title, to: `/patterns/${snippet.slug}`, body: snippet.description, spot: 'foundations/pattern-code-snippet' };
      return null;
    })
    .filter(Boolean);
