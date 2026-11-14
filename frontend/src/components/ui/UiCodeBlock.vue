<template>
  <div class="ui-codeblock">
    <div class="ui-codeblock-head">
      <span class="ui-codeblock-label">{{ label }}</span>
      <UiButton size="sm" variant="ghost" :icon="copied ? 'check' : 'content_copy'" :label="copied ? 'Copied' : 'Copy'" @click="copy" />
    </div>
    <pre class="ui-codeblock-pre" tabindex="0" :aria-label="label"><code>{{ code }}</code></pre>
    <p class="sr-only" aria-live="polite">{{ copied ? `${label} copied` : '' }}</p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import UiButton from './UiButton.vue';

/** Generated code or markup with a copy button; `label` names it ("CSS", "Vue component") */
const props = defineProps({
  code: { type: String, required: true },
  label: { type: String, default: 'Code' },
});

const emit = defineEmits(['copied', 'copy-failed']);
const copied = ref(false);
let timer;

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    emit('copied');
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 2000);
  } catch {
    emit('copy-failed');
  }
};

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.ui-codeblock {
  @apply rounded-tile border border-line bg-surface-sunken overflow-hidden;
}
.ui-codeblock-head {
  @apply flex items-center justify-between gap-3 pl-4 pr-2 py-1.5 border-b border-line;
}
.ui-codeblock-label {
  @apply text-xs font-medium text-ink-muted;
}
.ui-codeblock-pre {
  @apply m-0 p-4 overflow-auto max-h-96 font-code text-xs leading-relaxed text-ink focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
