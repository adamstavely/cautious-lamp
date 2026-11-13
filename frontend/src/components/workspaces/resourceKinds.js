/**
 * The workspace item kinds and their form fields. Mirrors the server's
 * allowlist (backend/src/workspaces/resource-kinds.ts); the server validates.
 *
 * Field types: text, textarea, url, select, list (comma-separated), number,
 * json, svg, markdown, stages (one "Name: description" per line).
 */
const tags = { key: 'tags', label: 'Tags', type: 'list', placeholder: 'comma, separated' };
const description = { key: 'description', label: 'Description', type: 'textarea' };
const link = { key: 'url', label: 'Link', type: 'url', placeholder: 'https://…' };

export const RESOURCE_KINDS = [
  {
    kind: 'fonts', label: 'Fonts', singular: 'Font', icon: 'font_download', titleField: 'name',
    subtitle: (item) => [item.family, item.source].filter(Boolean).join(' · '),
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g., Body' },
      { key: 'family', label: 'Font family', type: 'text', required: true, placeholder: 'e.g., Inter' },
      { key: 'source', label: 'Source', type: 'select', required: true, default: 'google', options: ['google', 'custom', 'system'] },
      { key: 'weights', label: 'Weights', type: 'list', placeholder: '400, 700' },
      { key: 'styles', label: 'Styles', type: 'list', placeholder: 'normal, italic' },
      { key: 'url', label: 'Font URL', type: 'url', placeholder: 'https://…' },
      { key: 'fallback', label: 'Fallback', type: 'text', placeholder: 'sans-serif' },
      tags,
    ],
  },
  {
    kind: 'assets', label: 'Assets', singular: 'Asset', icon: 'perm_media', titleField: 'name', image: 'url',
    subtitle: (item) => item.type,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', required: true, default: 'image', options: ['image', 'icon', 'illustration', 'logo', 'other'] },
      { key: 'url', label: 'URL', type: 'url', required: true, placeholder: 'https://…' },
      { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url' },
      { key: 'format', label: 'Format', type: 'text', placeholder: 'svg, png…' },
      description,
      tags,
    ],
  },
  {
    kind: 'tokens', label: 'Tokens', singular: 'Token', icon: 'token', titleField: 'name',
    subtitle: (item) => `${item.category} · ${item.value}`,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'color.primary' },
      { key: 'value', label: 'Value', type: 'text', required: true, placeholder: '#3355ff' },
      { key: 'type', label: 'Type', type: 'text', required: true, default: 'color' },
      { key: 'category', label: 'Category', type: 'text', required: true, default: 'colors' },
      description,
      tags,
    ],
  },
  {
    kind: 'reviews', label: 'Reviews', singular: 'Review', icon: 'rate_review', titleField: 'title',
    subtitle: (item) => item.status,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', default: 'pending', options: ['pending', 'in-review', 'approved', 'rejected'] },
      description, link, tags,
    ],
  },
  {
    kind: 'session-replays', label: 'Session Replays', singular: 'Session Replay', icon: 'replay', titleField: 'name',
    subtitle: (item) => item.sessionId,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'projectId', label: 'Project ID', type: 'text' },
      { key: 'sessionId', label: 'Session ID', type: 'text' },
      description, link, tags,
    ],
  },
  {
    kind: 'journey-maps', label: 'Journey Maps', singular: 'Journey Map', icon: 'route', titleField: 'title',
    subtitle: (item) => [item.persona, item.stages?.length ? `${item.stages.length} stages` : ''].filter(Boolean).join(' · '),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'persona', label: 'Persona', type: 'text' },
      { key: 'stages', label: 'Stages', type: 'stages', placeholder: 'Sign up: creates an account\nInvite team' },
      description, link, tags,
    ],
  },
  {
    kind: 'hcd-reports', label: 'HCD Reports', singular: 'HCD Report', icon: 'summarize', titleField: 'title',
    subtitle: (item) => item.reportType,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'reportType', label: 'Report type', type: 'select', options: ['usability', 'accessibility', 'heuristic', 'user-research', 'other'] },
      description, link, tags,
    ],
  },
  {
    kind: 'user-personas', label: 'User Personas', singular: 'User Persona', icon: 'person', titleField: 'name',
    subtitle: (item) => (item.goals || []).slice(0, 2).join(', '),
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'goals', label: 'Goals', type: 'list' },
      { key: 'painPoints', label: 'Pain points', type: 'list' },
      { key: 'behaviors', label: 'Behaviors', type: 'list' },
      { key: 'demographics', label: 'Demographics (JSON)', type: 'json', placeholder: '{ "age": 34 }' },
      description, link, tags,
    ],
  },
  {
    kind: 'research-artifacts', label: 'Research Artifacts', singular: 'Research Artifact', icon: 'science', titleField: 'title',
    subtitle: (item) => item.artifactType,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'artifactType', label: 'Type', type: 'select', options: ['interview', 'survey', 'observation', 'workshop', 'other'] },
      description, link, tags,
    ],
  },
  {
    kind: 'insights', label: 'Insights', singular: 'Insight', icon: 'lightbulb', titleField: 'title',
    subtitle: (item) => [item.category, item.priority].filter(Boolean).join(' · '),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['user-need', 'pain-point', 'opportunity', 'finding', 'other'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
      description, link, tags,
    ],
  },
  {
    kind: 'patterns', label: 'Patterns', singular: 'Pattern', icon: 'pattern', titleField: 'name',
    subtitle: (item) => item.category,
    fields: [{ key: 'name', label: 'Name', type: 'text', required: true }, { key: 'category', label: 'Category', type: 'text' }, description, link, tags],
  },
  {
    kind: 'icons', label: 'Icons', singular: 'Icon', icon: 'interests', titleField: 'name', svg: 'svg',
    subtitle: (item) => item.iconSet,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'iconSet', label: 'Icon set', type: 'text' },
      { key: 'svg', label: 'SVG markup', type: 'svg', placeholder: '<svg …>…</svg>' },
      description, link, tags,
    ],
  },
  {
    kind: 'interactives', label: 'Interactives', singular: 'Interactive', icon: 'touch_app', titleField: 'name',
    subtitle: (item) => item.type,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['prototype', 'demo', 'sandbox', 'other'] },
      description, link, tags,
    ],
  },
  {
    kind: 'stock-photos', label: 'Stock Photos', singular: 'Stock Photo', icon: 'photo_library', titleField: 'name', image: 'url',
    subtitle: (item) => [item.photographer, item.license].filter(Boolean).join(' · '),
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url' },
      { key: 'photographer', label: 'Photographer', type: 'text' },
      { key: 'license', label: 'License', type: 'text' },
      description, tags,
    ],
  },
  {
    kind: 'illustrations', label: 'Illustrations', singular: 'Illustration', icon: 'brush', titleField: 'name', image: 'url',
    subtitle: (item) => item.style,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url' },
      { key: 'style', label: 'Style', type: 'text' },
      description, tags,
    ],
  },
  {
    kind: 'capability-logos', label: 'Capability Logos', singular: 'Capability Logo', icon: 'verified', titleField: 'name', image: 'url',
    subtitle: (item) => item.capability,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url' },
      { key: 'capability', label: 'Capability', type: 'text' },
      { key: 'format', label: 'Format', type: 'text' },
      description, tags,
    ],
  },
  {
    kind: 'style-dictionaries', label: 'Style Dictionaries', singular: 'Style Dictionary', icon: 'data_object', titleField: 'name',
    subtitle: (item) => item.format,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'format', label: 'Format', type: 'select', default: 'json', options: ['json', 'css', 'scss', 'less', 'js', 'ts'] },
      { key: 'tokens', label: 'Tokens (JSON)', type: 'json', placeholder: '{ "color": { "primary": { "$value": "#000" } } }' },
      description, link, tags,
    ],
  },
  {
    kind: 'guidelines', label: 'Guidelines', singular: 'Guideline', icon: 'menu_book', titleField: 'title', markdown: 'content',
    subtitle: (item) => item.category,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['design', 'accessibility', 'content', 'interaction', 'visual', 'technical', 'other'] },
      { key: 'content', label: 'Content (Markdown)', type: 'markdown' },
      description, link, tags,
    ],
  },
];

export const resourceKind = (kind) => RESOURCE_KINDS.find((k) => k.kind === kind);

/** Form values for an item (or defaults for a new one) */
export const formValuesFor = (spec, item = null) =>
  Object.fromEntries(
    spec.fields.map((field) => {
      const value = item?.[field.key];
      switch (field.type) {
        case 'list':
          return [field.key, Array.isArray(value) ? value.join(', ') : ''];
        case 'json':
          return [field.key, value ? JSON.stringify(value, null, 2) : ''];
        case 'stages':
          return [field.key, Array.isArray(value) ? value.map((s) => (s.description ? `${s.name}: ${s.description}` : s.name)).join('\n') : ''];
        default:
          return [field.key, value ?? field.default ?? ''];
      }
    }),
  );

/**
 * The request body from form values. For an update, only changed fields are
 * sent; emptied optional text fields are sent as '' to clear them.
 * Throws an Error with a readable message for bad JSON.
 */
export const bodyFromForm = (spec, values, original = null) => {
  const body = {};
  for (const field of spec.fields) {
    const raw = values[field.key];
    let value;
    switch (field.type) {
      case 'list':
        value = String(raw || '').split(',').map((s) => s.trim()).filter(Boolean);
        break;
      case 'json':
        if (!String(raw || '').trim()) value = undefined;
        else {
          try {
            value = JSON.parse(raw);
          } catch {
            throw new Error(`${field.label} must be valid JSON`);
          }
        }
        break;
      case 'stages':
        value = String(raw || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const at = line.indexOf(':');
            return at > 0 ? { name: line.slice(0, at).trim(), description: line.slice(at + 1).trim() } : { name: line };
          });
        break;
      case 'number':
        value = raw === '' || raw === null ? undefined : Number(raw);
        break;
      default:
        value = typeof raw === 'string' ? raw.trim() : raw;
    }

    if (!original) {
      const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
      if (!empty) body[field.key] = value;
      continue;
    }
    const before = original[field.key];
    const same = JSON.stringify(before ?? (Array.isArray(value) ? [] : field.type === 'json' ? undefined : '')) === JSON.stringify(value ?? undefined);
    if (same) continue;
    if (value === undefined) continue; // JSON fields can't be cleared to null; leave unchanged
    // URL-typed and select fields can't be empty strings on the server; skip clearing them
    if (value === '' && (field.type === 'url' || field.type === 'select' || field.required)) continue;
    body[field.key] = value;
  }
  return body;
};
