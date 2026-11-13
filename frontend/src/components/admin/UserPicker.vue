<template>
  <div>
    <label :for="inputId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
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
      class="w-full rounded-lg border border-solid border-gray-300 px-3 py-2 text-sm bg-[#fff] text-gray-900 disabled:opacity-60 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="active >= 0 && choose(results[active])"
      @keydown.esc="clearIfOpen"
    />
    <p class="sr-only" role="status" aria-live="polite">{{ status }}</p>
    <p v-if="status && !results.length" class="mt-2 text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">{{ status }}</p>
    <ul
      v-show="results.length"
      :id="listId"
      role="listbox"
      :aria-label="`${label} results`"
      class="mt-2 max-h-64 overflow-y-auto rounded-lg border border-solid border-gray-200 dark:border-gray-700"
    >
      <li
        v-for="(user, index) in results"
        :id="`${listId}-${index}`"
        :key="user.id"
        role="option"
        :aria-selected="index === active ? 'true' : 'false'"
        :aria-disabled="isExcluded(user) ? 'true' : 'false'"
        class="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm"
        :class="[
          index === active ? 'bg-indigo-50 dark:bg-slate-700' : 'hover:bg-gray-50 dark:hover:bg-slate-700/60',
          isExcluded(user) ? 'cursor-not-allowed opacity-60' : '',
        ]"
        @mousedown.prevent
        @click="choose(user)"
      >
        <span class="min-w-0">
          <span class="block truncate font-medium text-gray-900 dark:text-white">{{ user.name }}</span>
          <span class="block truncate text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</span>
        </span>
        <span v-if="isExcluded(user)" class="shrink-0 text-xs text-gray-500 dark:text-gray-400">{{ excludedText }}</span>
        <span
          v-else-if="user.status === 'disabled'"
          class="shrink-0 rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >Disabled</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
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
    event.stopPropagation();
    query.value = '';
  }
};

onBeforeUnmount(() => clearTimeout(timer));
</script>
