<template>
  <UiField :label="label" :id="inputId">
    <input
      :id="inputId"
      v-model="query"
      type="search"
      role="combobox"
      autocomplete="off"
      :aria-expanded="results.length > 0 ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="active >= 0 ? `${listId}-${active}` : undefined"
      aria-autocomplete="list"
      :placeholder="placeholder"
      :disabled="disabled"
      class="user-picker-input"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="active >= 0 && choose(results[active])"
      @keydown.esc="clearIfOpen"
    />
    <p class="sr-only" role="status" aria-live="polite">{{ status }}</p>
    <p v-if="status && !results.length" class="text-sm text-ink-muted" aria-hidden="true">{{ status }}</p>
    <ul v-show="results.length" :id="listId" role="listbox" :aria-label="`${label} results`" class="user-picker-list">
      <li
        v-for="(user, index) in results"
        :id="`${listId}-${index}`"
        :key="user.id"
        role="option"
        :aria-selected="index === active ? 'true' : 'false'"
        :aria-disabled="isExcluded(user) ? 'true' : 'false'"
        class="user-picker-option"
        :class="{ 'user-picker-option-active': index === active, 'user-picker-option-excluded': isExcluded(user) }"
        @mousedown.prevent
        @click="choose(user)"
      >
        <span class="min-w-0">
          <span class="block truncate font-medium text-ink-strong">{{ user.name }}</span>
          <span class="block truncate text-xs text-ink-muted">{{ user.email }}</span>
        </span>
        <span v-if="isExcluded(user)" class="shrink-0 text-xs text-ink-muted">{{ excludedText }}</span>
        <UiChip v-else-if="user.status === 'disabled'" class="shrink-0">Disabled</UiChip>
      </li>
    </ul>
  </UiField>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import UiChip from '../ui/UiChip.vue';
import UiField from '../ui/UiField.vue';
import { adminErrorMessage, usersApi } from '../../composables/useAccessAdmin.js';

/**
 * Searches users by email or name (GET /users?q=, needs admin:users) and
 * emits `select` with the chosen user. Users in `excludeIds` are shown but
 * can't be picked.
 */
const props = defineProps({
  label: { type: String, default: 'Find a user' },
  placeholder: { type: String, default: 'Search by name or email' },
  excludeIds: { type: Array, default: () => [] },
  excludedText: { type: String, default: 'Already added' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['select']);

const uid = Math.random().toString(36).slice(2, 10);
const inputId = `user-picker-${uid}`;
const listId = `user-picker-list-${uid}`;
const query = ref('');
const results = ref([]);
const active = ref(-1);
const status = ref('');
let timer = null;
let seq = 0;

const isExcluded = (user) => props.excludeIds.includes(user.id);

const search = async (q) => {
  const mine = ++seq;
  status.value = 'Searching…';
  try {
    const { users } = await usersApi.list({ q });
    if (mine !== seq) return;
    results.value = users.slice(0, 20);
    active.value = -1;
    status.value = users.length
      ? `${users.length} user${users.length === 1 ? '' : 's'} found${users.length > 20 ? ', showing the first 20' : ''}.`
      : 'No users match.';
  } catch (error) {
    if (mine !== seq) return;
    results.value = [];
    status.value = adminErrorMessage(error, "Couldn't search users.");
  }
};

watch(query, (value) => {
  clearTimeout(timer);
  const q = value.trim();
  if (!q) {
    seq++;
    results.value = [];
    status.value = '';
    return;
  }
  timer = setTimeout(() => search(q), 250);
});

const move = (step) => {
  if (!results.value.length) return;
  const count = results.value.length;
  active.value = (active.value + step + count) % count;
};

const choose = (user) => {
  if (!user || isExcluded(user)) return;
  emit('select', user);
  query.value = '';
};

const clearIfOpen = (event) => {
  // Escape clears the list first; a second Escape reaches the dialog
  if (results.value.length || query.value) {
    // preventDefault too: a native <dialog> closes on Escape's default action
    event.preventDefault();
    event.stopPropagation();
    query.value = '';
  }
};

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.user-picker-input {
  @apply w-full h-11 px-3.5 rounded-field border border-solid border-line-control bg-surface-control text-sm text-ink placeholder:text-ink-muted;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.user-picker-list {
  @apply max-h-64 overflow-y-auto rounded-tile border border-solid border-line bg-surface-overlay;
}
.user-picker-option {
  @apply flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-fill-hover;
}
.user-picker-option-active {
  @apply bg-accent-subtle;
}
.user-picker-option-excluded {
  @apply cursor-not-allowed opacity-60;
}
</style>
