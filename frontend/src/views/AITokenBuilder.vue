<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens', label: 'Design tokens' }"
      title="AI tokens"
      lead="Define design tokens for AI interfaces: agent identity, confidence, explainability, risk, citations and more. Start from suggested token names, set the values yourself, then save them to a workspace's style library or export them."
      spot="ai/ai-token-builder"
      size="tool"
    >
      <template #actions>
        <UiButton variant="primary" icon="save" :disabled="!tokens.length" @click="showSaveDialog = true">Save to library</UiButton>
        <UiButton icon="upload" @click="fileInput?.click()">Import JSON</UiButton>
        <UiButton icon="library" to="/tokens/library">Style library</UiButton>
      </template>
    </PageHero>
    <input ref="fileInput" type="file" accept=".json,application/json" class="sr-only" tabindex="-1" aria-hidden="true" @change="importFile" />

    <div class="flex flex-col gap-4 mb-6">
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
      <UiCallout v-if="loadedDictionary" tone="info" role="status">
        Editing <strong>{{ loadedDictionary.name }}</strong> from {{ library.workspaceName(loadedDictionary.workspaceId) ?? 'a shared workspace' }}.
        <template v-if="!library.canEdit(loadedDictionary)"> You can read it but not change it; saving makes a copy.</template>
      </UiCallout>
      <p v-if="openingDictionary" class="flex items-center gap-2 text-sm text-ink-secondary"><UiSpinner /> Opening the style dictionary…</p>
    </div>

    <div class="grid lg:grid-cols-4 gap-6 pb-12">
      <div class="lg:col-span-1 flex flex-col gap-6">
        <UiPanel title="Categories">
          <nav aria-label="AI token categories">
            <ul class="flex flex-col gap-1">
              <li v-for="category in aiCategories" :key="category.id">
                <button
                  type="button"
                  class="category-button"
                  :class="{ 'category-button-active': selectedCategory === category.id }"
                  :aria-current="selectedCategory === category.id ? 'true' : undefined"
                  @click="selectedCategory = category.id"
                >
                  <span class="flex items-center gap-2 min-w-0"><AppIcon :name="category.icon" class="text-base shrink-0" /><span class="truncate">{{ category.name }}</span></span>
                  <span class="text-xs text-ink-muted">{{ categoryCount(category.id) }}</span>
                </button>
              </li>
            </ul>
          </nav>
        </UiPanel>

        <UiPanel title="Export" description="Every token, in one file.">
          <div class="flex flex-col gap-2">
            <UiButton v-for="format in EXPORT_FORMATS" :key="format.value" :icon="format.icon" size="sm" :disabled="!tokens.length" @click="exportTokens(format.value)">
              {{ format.label }}
            </UiButton>
          </div>
        </UiPanel>
      </div>

      <div class="lg:col-span-3 flex flex-col gap-6">
        <UiPanel :title="`${currentCategory.name} tokens`" :description="currentCategory.description">
          <template #actions>
            <UiButton variant="primary" icon="plus" size="sm" @click="openNewToken()">Add token</UiButton>
          </template>
          <TokenList v-if="filteredTokens.length" :tokens="filteredTokens" @edit="editToken" @delete="deleteToken" />
          <UiEmptyState
            v-else
            title="No tokens yet"
            :body="`Add your first ${currentCategory.name.toLowerCase()} token, start from a suggestion below, or import a DTCG JSON file.`"
            :bordered="false"
          />
        </UiPanel>

        <UiPanel v-if="availableTemplates.length" title="Suggested tokens" :description="`Common ${currentCategory.name.toLowerCase()} tokens. Pick one to set its value.`">
          <ul class="grid sm:grid-cols-2 gap-2">
            <li v-for="template in availableTemplates" :key="template.name">
              <button type="button" class="template-button" :disabled="hasToken(template)" @click="openNewToken(template)">
                <span class="flex items-center justify-between gap-2">
                  <code class="font-code text-xs text-ink-strong break-all">{{ currentCategory.prefix }}{{ template.name }}</code>
                  <UiChip v-if="hasToken(template)" tone="success" icon="check">Added</UiChip>
                </span>
                <span class="text-xs text-ink-secondary">{{ template.description }}</span>
              </button>
            </li>
          </ul>
        </UiPanel>
      </div>
    </div>

    <UiDialog v-model:open="showTokenDialog" :title="editingToken ? 'Edit token' : 'Add token'">
      <form id="ai-token-form" class="flex flex-col gap-5" @submit.prevent="saveToken">
        <UiCallout tone="info">
          <strong>{{ currentCategory.name }}.</strong> {{ currentCategory.description }}
        </UiCallout>
        <UiInput
          v-model="tokenForm.name"
          label="Token name"
          required
          mono
          :placeholder="namePlaceholder(selectedCategory)"
          :hint="`Full name: ${currentCategory.prefix}${tokenForm.name || '…'}`"
          :error="tokenFormErrors.name"
          @blur="validateTokenName"
        />
        <UiSelect v-model="tokenForm.$type" label="Type" :options="tokenTypeOptions" required />
        <UiCheckbox v-if="tokenForm.$type === 'color'" v-model="tokenForm.useAlias" label="Reference another token (alias)" />
        <UiInput
          v-model="tokenForm.$value"
          label="Value"
          required
          mono
          :placeholder="tokenForm.useAlias ? '{color.primary.500}' : valuePlaceholder(tokenForm.$type)"
          :hint="tokenForm.useAlias ? 'The name of another token in braces' : valueHint(tokenForm.$type)"
          :error="tokenFormErrors.value"
          @blur="validateTokenValue"
        />
        <div v-if="tokenForm.$type === 'color' && !tokenForm.useAlias" class="w-32">
          <UiInput
            type="color"
            label="Pick a colour"
            :model-value="pickerValue(tokenForm.$value)"
            @update:model-value="tokenForm.$value = $event"
          />
        </div>
        <UiTextarea v-model="tokenForm.$description" label="Description" :rows="3" placeholder="What the token is for" />
      </form>
      <template #footer>
        <UiButton @click="showTokenDialog = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="ai-token-form" :disabled="!tokenForm.name || !tokenForm.$type || !tokenForm.$value">
          {{ editingToken ? 'Save token' : 'Add token' }}
        </UiButton>
      </template>
    </UiDialog>

    <SaveDictionaryDialog v-model:open="showSaveDialog" :tokens="tokensForLibrary" :dictionary="loadedDictionary" :library="library" :tags="['ai']" @saved="onSaved" />
  </PageShell>
</template>

<script setup>
import { confirmDialog } from '../composables/useConfirm.js';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import SaveDictionaryDialog from '../components/tokens/SaveDictionaryDialog.vue';
import TokenList from '../components/tokens/TokenList.vue';
import {
  PageHero, PageShell, UiButton, UiCallout, UiCheckbox, UiChip, UiDialog, UiEmptyState, UiInput, UiPanel, UiSelect, UiSpinner, UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { useResourceLibrary } from '../composables/useResourceLibrary.js';
import { dictionaryTokens, dtcgToTokens, tokensToDtcg } from '../utils/styleDictionary.js';
import { EXPORT_FORMATS, downloadText, exportTokenFile } from '../utils/tokenExport.js';

const route = useRoute();
const router = useRouter();
const { notice, showNotice, clearNotice } = useNotice();
const library = useResourceLibrary('style-dictionaries');

// The working draft stays in this browser between visits; saved dictionaries live in a workspace
const DRAFT_KEY = 'aiDesignTokens';

const tokenTypeOptions = [
  { label: 'Color', value: 'color' },
  { label: 'Dimension', value: 'dimension' },
  { label: 'Font family', value: 'fontFamily' },
  { label: 'Font weight', value: 'fontWeight' },
  { label: 'Duration', value: 'duration' },
  { label: 'Cubic bezier', value: 'cubicBezier' },
  { label: 'Number', value: 'number' },
  { label: 'String', value: 'string' },
];

// Suggested tokens for each category: a name (after the category prefix), type and description
const aiTokenTemplates = {
  'agent-identity': [
    { name: 'id', type: 'string', description: 'Agent identifier' },
    { name: 'name', type: 'string', description: 'Agent name' },
    { name: 'role', type: 'string', description: 'Agent role (e.g., researcher, planner, classifier, summarizer)' },
    { name: 'persona.tone', type: 'string', description: 'Persona tone (e.g., formal/supportive/direct/brief)' },
    { name: 'persona.avatar', type: 'string', description: 'Persona avatar (SVG or raster)' },
    { name: 'badge.shape', type: 'string', description: 'Badge shape' },
    { name: 'badge.color', type: 'color', description: 'Badge color' },
    { name: 'trustLevel', type: 'number', description: 'Trust level (numeric or categorical)' }
  ],
  'confidence': [
    { name: 'level', type: 'number', description: 'Confidence level (0–1)' },
    { name: 'color.low', type: 'color', description: 'Color for low confidence' },
    { name: 'color.medium', type: 'color', description: 'Color for medium confidence' },
    { name: 'color.high', type: 'color', description: 'Color for high confidence' },
    { name: 'pattern', type: 'string', description: 'Pattern to signal uncertainty (dot/stripe/gradient)' },
    { name: 'iconography.low', type: 'string', description: 'Iconography for low confidence' },
    { name: 'iconography.high', type: 'string', description: 'Iconography for high confidence' },
    { name: 'animation', type: 'string', description: 'Animation for uncertain state (gentle pulse)' }
  ],
  'explainability': [
    { name: 'summaryStyle', type: 'string', description: 'Summary style' },
    { name: 'highlightColor', type: 'color', description: 'Highlight color for explanations' },
    { name: 'annotationShape', type: 'string', description: 'Annotation shape' },
    { name: 'stepIndicator.color', type: 'color', description: 'Step indicator color' },
    { name: 'stepIndicator.size', type: 'dimension', description: 'Step indicator size' },
    { name: 'callout.background', type: 'color', description: 'Callout background color' }
  ],
  'risk-safety': [
    { name: 'level', type: 'number', description: 'Risk level' },
    { name: 'color.low', type: 'color', description: 'Color for low risk' },
    { name: 'color.med', type: 'color', description: 'Color for medium risk' },
    { name: 'color.high', type: 'color', description: 'Color for high risk' },
    { name: 'color.critical', type: 'color', description: 'Color for critical risk' },
    { name: 'banner.style', type: 'string', description: 'Risk banner style' },
    { name: 'icon.warning', type: 'string', description: 'Warning icon' },
    { name: 'blocked.actionColor', type: 'color', description: 'Color for blocked actions' },
    { name: 'safety.disallowedContent.pattern', type: 'string', description: 'Pattern for disallowed content' },
    { name: 'safety.feedbackRequired', type: 'string', description: 'Feedback required indicator (boolean)' }
  ],
  'prompting': [
    { name: 'input.background', type: 'color', description: 'Prompt input background' },
    { name: 'input.placeholder', type: 'string', description: 'Prompt input placeholder' },
    { name: 'input.syntaxHighlighting', type: 'string', description: 'Syntax highlighting style' },
    { name: 'template.color', type: 'color', description: 'Prompt template color' },
    { name: 'tokenLimit.indicatorColor', type: 'color', description: 'Token limit indicator color' },
    { name: 'roleSystem.color', type: 'color', description: 'System role color' },
    { name: 'roleUser.color', type: 'color', description: 'User role color' },
    { name: 'roleAgent.color', type: 'color', description: 'Agent role color' }
  ],
  'message-state': [
    { name: 'thinking.color', type: 'color', description: 'Thinking state color' },
    { name: 'thinking.animation', type: 'string', description: 'Thinking animation (ellipsis, shimmer, pulse)' },
    { name: 'toolUse.color', type: 'color', description: 'Tool use state color' },
    { name: 'toolUse.icon', type: 'string', description: 'Tool use icon' },
    { name: 'streaming.cursorColor', type: 'color', description: 'Streaming cursor color' },
    { name: 'error.background', type: 'color', description: 'Error state background' },
    { name: 'error.borderColor', type: 'color', description: 'Error state border color' }
  ],
  'citation': [
    { name: 'badge.color', type: 'color', description: 'Citation badge color' },
    { name: 'badge.icon', type: 'string', description: 'Citation badge icon' },
    { name: 'number.color', type: 'color', description: 'Citation number color' },
    { name: 'hoverCard.background', type: 'color', description: 'Citation hover card background' },
    { name: 'provenance.sourceTypeColor.web', type: 'color', description: 'Web source type color' },
    { name: 'provenance.sourceTypeColor.pdf', type: 'color', description: 'PDF source type color' },
    { name: 'provenance.sourceTypeColor.image', type: 'color', description: 'Image source type color' },
    { name: 'provenance.sourceTypeColor.database', type: 'color', description: 'Database source type color' },
    { name: 'provenance.confidenceIndicator', type: 'string', description: 'Provenance confidence indicator' }
  ],
  'memory': [
    { name: 'shortTerm.icon', type: 'string', description: 'Short-term memory icon' },
    { name: 'shortTerm.badge.color', type: 'color', description: 'Short-term memory badge color' },
    { name: 'longTerm.icon', type: 'string', description: 'Long-term memory icon' },
    { name: 'longTerm.badge.color', type: 'color', description: 'Long-term memory badge color' },
    { name: 'memoryConflict.color', type: 'color', description: 'Memory conflict color' },
    { name: 'userEditable.background', type: 'color', description: 'User editable memory background' }
  ],
  'human-ai-teaming': [
    { name: 'hitl.requiredIndicator.color', type: 'color', description: 'HITL required indicator color' },
    { name: 'hotl.alert.style', type: 'string', description: 'HOTL alert style' },
    { name: 'handoff.step.color', type: 'color', description: 'AI handoff step color' },
    { name: 'handoff.callout.background', type: 'color', description: 'AI handoff callout background' },
    { name: 'handoff.requiredAction.icon', type: 'string', description: 'AI handoff required action icon' }
  ],
  'safety-boundary': [
    { name: 'softLimit.color', type: 'color', description: 'Soft limit color' },
    { name: 'hardLimit.color', type: 'color', description: 'Hard limit color' },
    { name: 'animation', type: 'string', description: 'Boundary animation' },
    { name: 'moderation.flag.color', type: 'color', description: 'Moderation flag color' },
    { name: 'moderation.breakGlass.background', type: 'color', description: 'Break glass background color' }
  ],
  'model-behavior': [
    { name: 'type', type: 'string', description: 'Behavior type (reasoning | planning | retrieval | action)' },
    { name: 'color.reasoning', type: 'color', description: 'Reasoning behavior color' },
    { name: 'color.retrieval', type: 'color', description: 'Retrieval behavior color' },
    { name: 'color.action', type: 'color', description: 'Action behavior color' },
    { name: 'traceLine.color', type: 'color', description: 'Trace line color' },
    { name: 'traceNode.shape', type: 'string', description: 'Trace node shape' }
  ],
  'multi-agent': [
    { name: 'lineColor', type: 'color', description: 'Agent interaction line color' },
    { name: 'lineStyle', type: 'string', description: 'Line style (dotted, dashed, braided)' },
    { name: 'priority.color', type: 'color', description: 'Priority color' },
    { name: 'assignmentTag.background', type: 'color', description: 'Assignment tag background' }
  ]
};

// The categories of AI-interface tokens, each with the name prefix its tokens share
const aiCategories = [
  {
    id: 'agent-identity',
    name: 'Agent identity',
    icon: 'bot',
    prefix: 'agent.',
    description: 'Represent agent personality, role, trust profile, and visual identity'
  },
  {
    id: 'confidence',
    name: 'Confidence and uncertainty',
    icon: 'trending-up',
    prefix: 'ai.confidence.',
    description: 'Visual and behavioral representation of model uncertainty'
  },
  {
    id: 'explainability',
    name: 'Explainability',
    icon: 'lightbulb',
    prefix: 'ai.explainability.',
    description: 'Standardizing how explanations appear'
  },
  {
    id: 'risk-safety',
    name: 'Risk and safety',
    icon: 'shield',
    prefix: 'ai.risk.',
    description: 'GenAI guardrails and HOTL/HITL patterns'
  },
  {
    id: 'prompting',
    name: 'Prompting',
    icon: 'notebook-pen',
    prefix: 'prompt.',
    description: 'Tokens for chat UI and internal subsystem hints'
  },
  {
    id: 'message-state',
    name: 'Message state',
    icon: 'message-circle',
    prefix: 'message.state.',
    description: 'Reflecting streaming, thinking, planning, and tool-use states'
  },
  {
    id: 'citation',
    name: 'Citation and provenance',
    icon: 'link',
    prefix: 'citation.',
    description: 'Essential for compliance and transparency'
  },
  {
    id: 'memory',
    name: 'Memory',
    icon: 'cpu',
    prefix: 'memory.',
    description: 'Short-term and long-term memory tokens'
  },
  {
    id: 'human-ai-teaming',
    name: 'Human-AI teaming',
    icon: 'handshake',
    prefix: 'ai.teaming.',
    description: 'HITL/HOTL UX guidance tokens'
  },
  {
    id: 'safety-boundary',
    name: 'Safety and boundaries',
    icon: 'triangle-alert',
    prefix: 'ai.boundary.',
    description: 'GenAI guardrail UI tokens'
  },
  {
    id: 'model-behavior',
    name: 'Model behavior',
    icon: 'brain',
    prefix: 'model.behavior.',
    description: 'MCP, LangChain, LangGraph agent states'
  },
  {
    id: 'multi-agent',
    name: 'Multi-agent interaction',
    icon: 'users-round',
    prefix: 'agent.interaction.',
    description: 'Agent Crowd / Team-of-Agents design tokens'
  }
];

// Names written before the categories had their current prefixes
const LEGACY_PREFIXES = [
  ['ai.safety.', 'risk-safety'],
  ['provenance.', 'citation'],
  ['hitl.', 'human-ai-teaming'],
  ['hotl.', 'human-ai-teaming'],
  ['ai.handoff.', 'human-ai-teaming'],
  ['ai.moderation.', 'safety-boundary'],
];
const PREFIXES = [...aiCategories.map((c) => [c.prefix, c.id]), ...LEGACY_PREFIXES].sort((a, b) => b[0].length - a[0].length);

/** The AI category a token name belongs to (longest matching prefix; agent identity otherwise) */
const categoryFromName = (name) => PREFIXES.find(([prefix]) => name.startsWith(prefix))?.[1] ?? 'agent-identity';

const NAME_PLACEHOLDERS = {
  'agent-identity': 'role',
  confidence: 'color.high',
  explainability: 'highlightColor',
  'risk-safety': 'color.critical',
  prompting: 'input.background',
  'message-state': 'thinking.color',
  citation: 'badge.color',
  memory: 'longTerm.badge.color',
  'human-ai-teaming': 'hitl.requiredIndicator.color',
  'safety-boundary': 'hardLimit.color',
  'model-behavior': 'color.reasoning',
  'multi-agent': 'lineColor',
};
const namePlaceholder = (id) => NAME_PLACEHOLDERS[id] ?? 'token.name';

const PLACEHOLDERS = {
  color: '#2f5ea8', dimension: '16px', fontFamily: 'Inter, sans-serif', fontWeight: '400',
  duration: '200ms', cubicBezier: '0.4, 0.0, 0.2, 1', number: '0.8', string: 'value',
};
const HINTS = {
  color: 'Hex, RGB or HSL',
  dimension: 'A value with a unit (px, rem, em)',
  fontFamily: 'A font family or stack',
  fontWeight: 'A weight from 100 to 900',
  duration: 'A time with a unit (ms, s)',
  cubicBezier: 'Four comma-separated numbers',
  number: 'A number',
  string: 'Text',
};
const valuePlaceholder = (type) => PLACEHOLDERS[type] ?? '';
const valueHint = (type) => HINTS[type] ?? '';

const selectedCategory = ref('agent-identity');
const tokens = ref([]);
const loadedDictionary = ref(null);
const openingDictionary = ref(false);
const fileInput = ref(null);
const showTokenDialog = ref(false);
const showSaveDialog = ref(false);
const editingToken = ref(null);

const blankForm = () => ({ name: '', $type: 'color', $value: '', $description: '', useAlias: false });
const tokenForm = ref(blankForm());
const tokenFormErrors = ref({ name: '', value: '' });

const currentCategory = computed(() => aiCategories.find((c) => c.id === selectedCategory.value) ?? aiCategories[0]);
const tokenCategory = (token) => token.aiCategory || categoryFromName(token.name);
const filteredTokens = computed(() => tokens.value.filter((token) => tokenCategory(token) === selectedCategory.value));
const categoryCount = (id) => tokens.value.filter((token) => tokenCategory(token) === id).length;
const availableTemplates = computed(() => aiTokenTemplates[selectedCategory.value] ?? []);
const hasToken = (template) => tokens.value.some((t) => t.name === currentCategory.value.prefix + template.name);

// The library keeps names, types and values; the AI category comes back from the name prefix
const tokensForLibrary = computed(() => tokens.value.map(({ aiCategory, category, ...token }) => token));

const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value ?? ''));
// A native colour input only takes #rrggbb
const pickerValue = (value) => (isHex(value) ? value : '#000000');
const isAlias = (value) => typeof value === 'string' && /^\{[^{}]+\}$/.test(value.trim());

const saveDraft = () => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(tokens.value));
  } catch {
    // Storage can be full or blocked; the draft just won't survive a reload
  }
};

const loadDraft = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
    tokens.value = Array.isArray(stored) ? stored : [];
  } catch {
    tokens.value = [];
  }
};

const fullName = () => currentCategory.value.prefix + tokenForm.value.name.trim();

const validateTokenName = () => {
  const name = tokenForm.value.name.trim();
  if (!name) tokenFormErrors.value.name = 'Give the token a name';
  else if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(name)) tokenFormErrors.value.name = 'Start with a letter; use only letters, numbers, dots, underscores and hyphens';
  else if (tokens.value.some((t) => t.name === fullName() && t.id !== editingToken.value?.id)) tokenFormErrors.value.name = 'A token with this name already exists';
  else tokenFormErrors.value.name = '';
};

const validateTokenValue = () => {
  const value = String(tokenForm.value.$value ?? '').trim();
  if (!value) tokenFormErrors.value.value = 'Give the token a value';
  else if (tokenForm.value.useAlias && !isAlias(value)) tokenFormErrors.value.value = 'An alias is another token\'s name in braces, e.g. {color.primary.500}';
  else tokenFormErrors.value.value = '';
};

/** Opens the token form, empty or filled from a suggested token */
const openNewToken = (template = null) => {
  editingToken.value = null;
  tokenForm.value = template
    ? { name: template.name, $type: template.type, $value: '', $description: template.description, useAlias: false }
    : blankForm();
  tokenFormErrors.value = { name: '', value: '' };
  showTokenDialog.value = true;
};

const editToken = (token) => {
  const category = tokenCategory(token);
  const prefix = aiCategories.find((c) => c.id === category)?.prefix ?? '';
  selectedCategory.value = category;
  editingToken.value = token;
  tokenForm.value = {
    name: token.name.startsWith(prefix) ? token.name.slice(prefix.length) : token.name,
    $type: token.$type || 'string',
    $value: typeof token.$value === 'object' ? JSON.stringify(token.$value) : String(token.$value ?? ''),
    $description: token.$description || '',
    useAlias: isAlias(token.$value),
  };
  tokenFormErrors.value = { name: '', value: '' };
  showTokenDialog.value = true;
};

const deleteToken = async (token) => {
  if (!(await confirmDialog({ title: `Delete ${token.name}?`, confirmLabel: 'Delete', danger: true }))) return;
  tokens.value = tokens.value.filter((t) => t.id !== token.id);
  saveDraft();
};

const saveToken = () => {
  validateTokenName();
  validateTokenValue();
  if (tokenFormErrors.value.name || tokenFormErrors.value.value) return;
  const token = {
    id: editingToken.value?.id ?? `${Date.now()}-${tokens.value.length}`,
    name: fullName(),
    aiCategory: selectedCategory.value,
    $type: tokenForm.value.$type,
    $value: tokenForm.value.$value.trim(),
  };
  if (tokenForm.value.$description.trim()) token.$description = tokenForm.value.$description.trim();
  tokens.value = editingToken.value ? tokens.value.map((t) => (t.id === editingToken.value.id ? token : t)) : [...tokens.value, token];
  saveDraft();
  showTokenDialog.value = false;
};

const exportTokens = (format) => {
  downloadText(exportTokenFile(tokensToDtcg(tokensForLibrary.value), format, loadedDictionary.value?.name?.replace(/\s+/g, '-') || 'ai-tokens'));
};

const withAiCategory = (list) => list.map(({ category, ...token }) => ({ ...token, aiCategory: categoryFromName(token.name) }));

const importFile = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    const imported = withAiCategory(dtcgToTokens(JSON.parse(await file.text())));
    if (!imported.length) {
      showNotice('No tokens found. Tokens need a "$value" (DTCG format).', 'error');
      return;
    }
    const existing = new Set(tokens.value.map((t) => t.name));
    const added = imported.filter((t) => !existing.has(t.name));
    tokens.value = [...tokens.value, ...added];
    saveDraft();
    const skipped = imported.length - added.length;
    showNotice(`Imported ${added.length} token${added.length === 1 ? '' : 's'}${skipped ? `; ${skipped} already existed` : ''}.`, 'success');
  } catch (err) {
    showNotice(`Could not import the file: ${err.message}`, 'error');
  }
};

const openDictionary = async (id) => {
  openingDictionary.value = true;
  try {
    if (!library.loaded.value) await library.load();
    if (library.error.value) {
      showNotice(`Could not open the style dictionary: ${library.error.value}`, 'error');
      return;
    }
    const dictionary = library.items.value.find((item) => item.id === String(id));
    if (!dictionary) {
      showNotice('That style dictionary was not found, or you can\'t see it. Your draft is unchanged.', 'error');
      return;
    }
    loadedDictionary.value = dictionary;
    tokens.value = withAiCategory(dictionaryTokens(dictionary));
    saveDraft();
  } finally {
    openingDictionary.value = false;
  }
};

const onSaved = (saved, { created }) => {
  loadedDictionary.value = saved;
  showNotice(created ? `Saved ${saved.name} to the style library.` : `Saved changes to ${saved.name}.`, 'success');
  if (route.query.load !== saved.id) router.replace({ query: { ...route.query, load: saved.id } });
};

watch(
  () => route.query.load,
  (id) => {
    if (id && id !== loadedDictionary.value?.id) openDictionary(id);
  },
);

onMounted(() => {
  loadDraft();
  if (route.query.load) openDictionary(route.query.load);
  // Workspaces for the save dialog
  else library.load();
});
</script>

<style scoped>
.category-button {
  @apply flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left text-sm text-ink-secondary hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.category-button-active {
  @apply bg-accent-subtle text-accent-text;
}
.template-button {
  @apply flex h-full w-full flex-col gap-1 rounded-control border border-line bg-surface-raised px-3 py-2 text-left hover:border-accent-border hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
  @apply disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line disabled:hover:bg-surface-raised;
}
</style>
