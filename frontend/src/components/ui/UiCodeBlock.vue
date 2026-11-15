<template>
  <div class="ui-codeblock">
    <div class="ui-codeblock-head">
      <span class="ui-codeblock-label">{{ label }}</span>
      <UiButton size="sm" variant="ghost" :icon="status === 'copied' ? 'check' : status === 'failed' ? 'circle-alert' : 'copy'" :label="buttonLabel" @click="copy" />
    </div>
    <pre class="ui-codeblock-pre" tabindex="0" :aria-label="label"><code>{{ code }}</code></pre>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import UiButton from './UiButton.vue';

/** Generated code or markup with a copy button; `label` names it ("CSS", "Vue component") */
const props = defineProps({
  code: { type: String, required: true },
  label: { type: String, default: 'Code' },
});

const emit = defineEmits(['copied', 'copy-failed']);
// idle · copied · failed (the browser refused clipboard access); resets after a moment
const status = ref('idle');
let timer;
const buttonLabel = computed(() => ({ idle: 'Copy', copied: 'Copied', failed: "Couldn't copy" })[status.value]);
const announcement = computed(
  () => ({ idle: '', copied: `${props.label} copied`, failed: `Couldn't copy ${props.label}. Select the code and copy it instead.` })[status.value],
);

const show = (next) => {
  status.value = next;
  clearTimeout(timer);
  timer = setTimeout(() => (status.value = 'idle'), next === 'failed' ? 4000 : 2000);
};

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    show('copied');
    emit('copied');
  } catch {
    show('failed');
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
