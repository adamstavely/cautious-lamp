<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Design system API"
      lead="Read design tokens and components from your own tools and pipelines over a REST API. Everything on this page comes from the server you're signed in to."
      spot="site/design-system-api"
    />

    <PageSection title="Version and base URL" description="There is one API version. New routes are added to it; nothing is versioned separately yet.">
      <UiCallout v-if="versionError" tone="warning" icon="circle-alert" role="alert">{{ versionError }}</UiCallout>
      <div v-else-if="version" class="grid sm:grid-cols-3 gap-4">
        <UiStat label="Version" :value="version.version" />
        <UiStat label="Server release" :value="version.release" />
        <UiStat label="Routes under the base path" :value="String(version.routeCount)" />
      </div>
      <UiSpinner v-else label="Loading the API version" />
      <UiCodeBlock class="mt-4" :code="baseUrl" label="Base URL" />
    </PageSection>

    <PageSection title="Authentication" description="Every route needs a credential, except the health check." divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiPanel title="Scripts and pipelines" heading-tag="h3">
          <p class="text-ink-secondary">
            Send an API key as a bearer token. Administrators create keys with
            <UiCode>POST /api/v1/auth/api-keys</UiCode> (needs the user management permission); a key can only do what its roles allow.
          </p>
          <UiCodeBlock code="Authorization: Bearer YOUR_API_KEY" label="Request header" />
        </UiPanel>
        <UiPanel title="In the browser" heading-tag="h3">
          <p class="text-ink-secondary">
            This app signs you in and sends your session with each request, so pages call the same routes with your own permissions.
            A route that needs a permission you don't have answers 403.
          </p>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Tokens and components" description="The routes most integrations use. All are GET requests under the base URL." divided>
      <div class="flex flex-col gap-4">
        <UiPanel v-for="endpoint in endpoints" :key="endpoint.path" heading-tag="h3" :title="endpoint.path">
          <template #actions><UiChip tone="info">GET</UiChip></template>
          <p class="text-ink-secondary">{{ endpoint.description }}</p>
          <UiCodeBlock v-if="endpoint.example" :code="endpoint.example" :label="`Example response for ${endpoint.path}`" />
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="All routes" description="Every route the server registers, and who may call it. Routes outside /api/v1 predate it and work the same way." divided>
      <UiCallout v-if="routesError" tone="warning" icon="circle-alert" role="alert">{{ routesError }}</UiCallout>
      <UiSpinner v-else-if="!routes" label="Loading the routes" />
      <template v-else>
        <div class="route-filter">
          <UiInput v-model="query" label="Filter routes" icon="search" hint="Matches the path, method or permission." />
        </div>
        <UiPanel flush>
          <UiTable :caption="`API routes (${filteredRoutes.length} of ${routes.length})`" compact>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Path</th>
                <th scope="col">Who may call it</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="route in filteredRoutes" :key="`${route.method} ${route.path}`">
                <td><UiChip :tone="methodTone(route.method)">{{ route.method }}</UiChip></td>
                <td><UiCode>{{ route.path }}</UiCode></td>
                <td>{{ access(route) }}</td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>
        <p v-if="!filteredRoutes.length" class="mt-3 text-ink-secondary">No routes match “{{ query }}”.</p>
      </template>
    </PageSection>

    <PageSection title="SDK and CLI" description="Both live in this repository and call the routes above." divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiPanel title="JavaScript SDK" description="@adamstavely/design-system-sdk, in sdk/" heading-tag="h3">
          <UiCodeBlock :code="sdkExample" label="JavaScript" />
        </UiPanel>
        <UiPanel title="Command line" description="@adamstavely/design-system-cli (the ds command), in cli/" heading-tag="h3">
          <UiCodeBlock :code="cliExample" label="Shell" />
        </UiPanel>
      </div>
      <UiPanel class="mt-4" title="cURL" heading-tag="h3">
        <UiCodeBlock :code="curlExample" label="Shell" />
      </UiPanel>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiCallout,
  UiChip,
  UiCode,
  UiCodeBlock,
  UiInput,
  UiPanel,
  UiSpinner,
  UiStat,
  UiTable,
} from '../components/ui';
import apiClient, { apiErrorMessage } from '../services/api.js';

/*
 * The version and the route list come from the server (GET /api/versions/current
 * and /api/versions/current/routes), so they can't drift from what it serves.
 */
const version = ref(null);
const versionError = ref('');
const routes = ref(null);
const routesError = ref('');
const query = ref('');

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/+$/, '');
const baseUrl = computed(() => `${apiOrigin}${version.value?.basePath ?? '/api/v1'}`);

onMounted(async () => {
  const [versionResult, routesResult] = await Promise.allSettled([
    apiClient.get('/api/versions/current'),
    apiClient.get('/api/versions/current/routes'),
  ]);
  if (versionResult.status === 'fulfilled') version.value = versionResult.value.data;
  else versionError.value = apiErrorMessage(versionResult.reason, 'The API version could not be loaded.');
  if (routesResult.status === 'fulfilled') routes.value = routesResult.value.data;
  else routesError.value = apiErrorMessage(routesResult.reason, 'The route list could not be loaded.');
});

const filteredRoutes = computed(() => {
  const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!routes.value) return [];
  return routes.value.filter((route) => {
    const haystack = `${route.method} ${route.path} ${route.permissions.join(' ')} ${route.public ? 'public' : ''}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
});

const access = (route) => {
  if (route.public) return 'Anyone, no credential';
  if (route.permissions.length) return `Signed in, with ${route.permissions.join(' or ')}`;
  return 'Anyone signed in';
};

const METHOD_TONES = { GET: 'info', POST: 'success', PUT: 'warning', PATCH: 'warning', DELETE: 'danger' };
const methodTone = (method) => METHOD_TONES[method] ?? 'neutral';

const endpoints = [
  {
    path: '/health',
    description: "The server's release and whether Elasticsearch answers. Needs no credential; answers 503 while Elasticsearch is unreachable.",
    example: `{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-11-15T10:00:00.000Z",
  "elasticsearch": { "status": "up" }
}`,
  },
  {
    path: '/tokens',
    description: 'Every design token. Narrow the list with the category, type and tag query parameters, e.g. /tokens?category=colors&tag=brand.',
    example: `{
  "tokens": [
    {
      "name": "color.primary",
      "value": "#4f46e5",
      "type": "color",
      "category": "colors",
      "description": "Primary brand color",
      "tags": ["brand", "primary"]
    }
  ],
  "count": 1,
  "filters": { "category": "colors", "tag": "brand" }
}`,
  },
  {
    path: '/tokens/category/:category',
    description: 'The tokens in one category, e.g. /tokens/category/spacing.',
    example: `{ "tokens": [ … ], "category": "spacing", "count": 7 }`,
  },
  { path: '/tokens/:name', description: 'One token by name, e.g. /tokens/color.primary.' },
  {
    path: '/components',
    description: 'The components you can see: the shared ones and those of your workspaces. Filter with ?status=production (or in-progress, planned, deprecated).',
    example: `{ "components": [ … ], "count": 8, "filters": { "status": "production" } }`,
  },
  {
    path: '/components/:id',
    description: 'One component with its props, code (Vue, React, HTML), examples and accessibility notes.',
    example: `{
  "id": "button",
  "name": "Button",
  "description": "…",
  "status": "production",
  "props": [ … ],
  "code": { "vue": "…", "react": "…" }
}`,
  },
  { path: '/components/status/:status', description: 'The components with one status, e.g. /components/status/deprecated.' },
];

const sdkExample = computed(() => `import { DesignSystemAPI } from '@adamstavely/design-system-sdk';

const api = new DesignSystemAPI({
  apiKey: process.env.DS_API_KEY,
  baseURL: '${baseUrl.value}',
});

const { tokens } = await api.tokens();
const { tokens: colors } = await api.tokensByCategory('colors');
const button = await api.component('button');`);

const cliExample = computed(() => `export DS_API_KEY=YOUR_API_KEY
export DS_API_URL=${baseUrl.value}

ds health
ds tokens
ds token color.primary
ds components
ds component button --code react`);

const curlExample = computed(() => `curl ${baseUrl.value}/tokens/category/colors \\
  -H "Authorization: Bearer YOUR_API_KEY"`);
</script>

<style scoped>
.route-filter {
  @apply mb-4 max-w-md;
}
</style>
