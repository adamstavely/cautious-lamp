<template>
  <tc-embed-widget
    look="clean"
    floating
    heading="Eero"
    subtitle="Design system AI assistant"
    :greeting="greeting"
    privacy=""
    .starters="STARTERS"
    .messages="messages"
    .labels="LABELS"
    :open="open"
    :typing="isLoading"
    :unread="unread"
    @tc-open-change="onOpenChange"
    @tc-send="onSend"
  ></tc-embed-widget>
</template>

<script setup>
import '@adamstavely/trenchcoat/embed-widget';
import { computed, ref, watch } from 'vue';
import apiClient from '../services/api.js';
import { eeroReplyText, plainChatText } from '../utils/chatFormat.js';

/**
 * Eero, the design system assistant: Trench Coat's chat widget, with its own
 * corner launcher. `open` is v-model:open so App.vue can open it from the
 * open-eero-chat event. Messages go to POST /ai/chat with the last ten for
 * context, where Claude answers from the design system. The widget shows text
 * only and has no streaming, so each reply arrives whole. Without a Claude API
 * key on the backend, Eero says it isn't configured instead of answering.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(['update:open']);

const GREETING =
  "Hi! I'm Eero. Ask me about components, design tokens, compliance rules, or UX and accessibility practice.";
const NOT_CONFIGURED =
  "Eero isn't configured yet: the backend needs a Claude API key (ANTHROPIC_API_KEY). Ask your administrator to set it up.";
// Statuses whose message from the API is written for the person (not configured, busy, too many requests, declined)
const SHOWN_STATUSES = new Set([422, 429, 502, 503]);
const LABELS = { launcher: 'Ask Eero', placeholder: 'Ask Eero a question…' };
// Shown until the person has written; after that, follow-ups are part of each reply
const STARTERS = [
  'Which button variants are there?',
  'What spacing tokens can I use?',
  'How do I scan my application for compliance?',
].map((text) => ({ id: text, text }));

const messages = ref([]);
const isLoading = ref(false);
const unread = ref(0);
/** null until checked, the first time the panel opens */
const configured = ref(null);
let nextId = 0;

const greeting = computed(() => (configured.value === false ? NOT_CONFIGURED : GREETING));

const checkStatus = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/ai/status');
    configured.value = !!data.configured;
  } catch {
    // Unknown: let the person ask, and show whatever the chat route says
  }
};

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    unread.value = 0;
    if (configured.value === null) checkStatus();
  },
  { immediate: true },
);

const onOpenChange = (event) => emit('update:open', event.detail.open);

const add = (from, text) => {
  messages.value = [...messages.value, { id: `m${(nextId += 1)}`, from, text }];
  if (from === 'assistant' && !props.open) unread.value += 1;
};

const onSend = async (event) => {
  const text = event.detail.text.trim();
  if (!text || isLoading.value) {
    event.preventDefault();
    return;
  }
  const conversationHistory = messages.value.map((m) => ({
    role: m.from === 'visitor' ? 'user' : 'assistant',
    content: m.text,
  }));
  add('visitor', text);
  isLoading.value = true;
  try {
    const { data } = await apiClient.post(
      '/api/v1/ai/chat',
      {
        message: text,
        conversationHistory: [...conversationHistory, { role: 'user', content: text }].slice(-10),
      },
      { timeout: 120000 },
    );
    configured.value = true;
    const followUps = (data.suggestions ?? []).map(plainChatText);
    const reply = eeroReplyText(data);
    add('assistant', followUps.length ? `${reply}\n\nYou could also ask:\n${followUps.map((q) => `• ${q}`).join('\n')}` : reply);
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 503 && /not configured/i.test(message ?? '')) configured.value = false;
    add('assistant', SHOWN_STATUSES.has(status) && typeof message === 'string' ? message : 'Sorry, something went wrong. Please try again.');
  } finally {
    isLoading.value = false;
  }
};
</script>

