/** A valid create body for every resource kind, and a valid update for it */
export const RESOURCE_SAMPLES: Record<string, { create: Record<string, unknown>; update: Record<string, unknown> }> = {
  fonts: {
    create: { name: 'Body', family: 'Inter', weights: ['400', '700'], styles: ['normal'], source: 'google', fallback: 'sans-serif' },
    update: { family: 'Inter Variable' },
  },
  assets: { create: { name: 'Hero', type: 'image', url: 'https://cdn.example.com/hero.png', tags: ['home'] }, update: { description: 'Home hero' } },
  tokens: { create: { name: 'color.primary', value: '#3355ff', type: 'color', category: 'colors' }, update: { value: '#2244ee' } },
  reviews: { create: { title: 'Checkout review', status: 'pending', url: 'https://example.com/r/1' }, update: { status: 'approved' } },
  'session-replays': { create: { name: 'Checkout drop-off', sessionId: 's-1' }, update: { description: 'Users abandon at step 3' } },
  'journey-maps': {
    create: { title: 'Onboarding', persona: 'New admin', stages: [{ name: 'Sign up' }, { name: 'Invite team', description: 'Adds 3 people' }] },
    update: { persona: 'Returning admin' },
  },
  'hcd-reports': { create: { title: 'Q3 usability', reportType: 'usability' }, update: { reportType: 'heuristic' } },
  'user-personas': {
    create: { name: 'Dana', demographics: { age: 34, role: 'PM' }, goals: ['Ship faster'], painPoints: ['Slow reviews'] },
    update: { behaviors: ['Works late'] },
  },
  'research-artifacts': { create: { title: 'Interview 4', artifactType: 'interview' }, update: { artifactType: 'survey' } },
  insights: { create: { title: 'Search is hidden', category: 'pain-point', priority: 'high' }, update: { priority: 'medium' } },
  patterns: { create: { name: 'Empty state', category: 'feedback' }, update: { category: 'layout' } },
  icons: {
    create: { name: 'check', iconSet: 'core', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>' },
    update: { iconSet: 'extended' },
  },
  interactives: { create: { name: 'Checkout prototype', type: 'prototype', url: 'https://figma.example.com/p/1' }, update: { type: 'demo' } },
  'stock-photos': { create: { name: 'Team', url: 'https://photos.example.com/team.jpg', license: 'CC-BY' }, update: { photographer: 'Sam' } },
  illustrations: { create: { name: 'Empty inbox', url: 'https://cdn.example.com/inbox.svg', style: 'flat' }, update: { style: 'line' } },
  'capability-logos': { create: { name: 'Search', url: 'https://cdn.example.com/search.svg', capability: 'search' }, update: { format: 'svg' } },
  'style-dictionaries': { create: { name: 'Brand', format: 'json', tokens: { color: { primary: { $value: '#000' } } } }, update: { format: 'css' } },
  guidelines: { create: { title: 'Writing errors', category: 'content', content: '# Errors\n\nSay what happened.' }, update: { category: 'design' } },
};
