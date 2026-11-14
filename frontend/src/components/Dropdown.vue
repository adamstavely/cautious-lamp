<template>
  <div
    data-ds-component="dropdown"
    data-ds-path="@design-system/components/dropdown"
    class="dropdown"
    :class="$attrs.class"
    ref="dropdownRef"
  >
    <button
      ref="buttonRef"
      type="button"
      v-bind="controlAttrs"
      class="dropdown-button"
      :class="{ 'dropdown-button-open': isOpen }"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? listId : undefined"
      :aria-label="ariaLabel"
      @click="toggleDropdown"
      @keydown="onButtonKey"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <span class="material-symbols-outlined dropdown-chevron" :class="{ 'rotate-180': isOpen }" aria-hidden="true">expand_more</span>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <ul
        v-if="isOpen"
        :id="listId"
        ref="listRef"
        class="dropdown-list"
        role="listbox"
        tabindex="-1"
        :aria-label="ariaLabel"
        :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
        @keydown="onListKey"
      >
        <li
          v-for="(option, index) in safeOptions"
          :id="optionId(index)"
          :key="option.value"
          role="option"
          class="dropdown-option"
          :class="{
            'dropdown-option-selected': option.value === modelValue,
            'dropdown-option-active': index === activeIndex,
          }"
          :aria-selected="option.value === modelValue"
          @click="selectOption(option)"
          @mousemove="activeIndex = index"
        >
          <span class="truncate">{{ option.label }}</span>
          <span v-if="option.value === modelValue" class="material-symbols-outlined text-base" aria-hidden="true">check</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, useAttrs, useId } from 'vue';

/**
 * A custom listbox (select) used across the app; looks like UiSelect.
 * v-model is the selected option's value; `options` are { value, label }.
 * Keyboard: Enter, Space, ArrowDown or ArrowUp open it; arrows, Home and End
 * move; Enter or Space picks; Escape or Tab closes. Attributes such as `id`
 * and `aria-label` go to the button (so a <label for> names it); `class` stays
 * on the wrapper.
 */
defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    required: false,
    default: () => [],
    validator: (options) => {
      if (!options || !Array.isArray(options)) return true;
      return options.every((opt) => opt.value !== undefined && opt.label !== undefined);
    },
  },
  /** @deprecated Ignored: the dropdown follows the theme through tokens. Still accepted because callers pass it. */
  // style-check: allow deprecated prop kept for backward compatibility
  isDarkMode: {
    type: Boolean,
    default: null,
  },
  /** Accessible name when no <label for> points at the dropdown */
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
const attrs = useAttrs();

const isOpen = ref(false);
const dropdownRef = ref(null);
const buttonRef = ref(null);
const listRef = ref(null);
const activeIndex = ref(-1);
const uid = useId();
const listId = `dropdown-${uid}-list`;
const optionId = (index) => `dropdown-${uid}-option-${index}`;

const controlAttrs = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const { class: _class, ...rest } = attrs;
  return rest;
});
const ariaLabel = computed(() => attrs['aria-label'] || props.label || undefined);

const safeOptions = computed(() => (Array.isArray(props.options) ? props.options : []));

const selectedLabel = computed(() => {
  const option = safeOptions.value.find((opt) => opt.value === props.modelValue);
  return option ? option.label : '';
});

const scrollActiveIntoView = () => {
  nextTick(() => {
    const el = listRef.value?.children?.[activeIndex.value];
    el?.scrollIntoView?.({ block: 'nearest' });
  });
};

const open = async () => {
  if (isOpen.value) return;
  isOpen.value = true;
  const selected = safeOptions.value.findIndex((opt) => opt.value === props.modelValue);
  activeIndex.value = selected >= 0 ? selected : 0;
  await nextTick();
  listRef.value?.focus();
  scrollActiveIntoView();
};

const close = (returnFocus = true) => {
  if (!isOpen.value) return;
  isOpen.value = false;
  activeIndex.value = -1;
  if (returnFocus) buttonRef.value?.focus();
};

const toggleDropdown = () => (isOpen.value ? close() : open());

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  close();
};

const onButtonKey = (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    open();
  }
};

const onListKey = (event) => {
  const count = safeOptions.value.length;
  const move = (index) => {
    event.preventDefault();
    if (!count) return;
    activeIndex.value = index;
    scrollActiveIntoView();
  };
  switch (event.key) {
    case 'ArrowDown':
      move((activeIndex.value + 1) % Math.max(count, 1));
      break;
    case 'ArrowUp':
      move((activeIndex.value - 1 + count) % Math.max(count, 1));
      break;
    case 'Home':
      move(0);
      break;
    case 'End':
      move(count - 1);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (safeOptions.value[activeIndex.value]) selectOption(safeOptions.value[activeIndex.value]);
      break;
    case 'Escape':
      event.preventDefault();
      close();
      break;
    case 'Tab':
      close(false);
      break;
    default:
      break;
  }
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    close(false);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown {
  @apply relative;
}
.dropdown-button {
  @apply w-full h-11 pl-3.5 pr-3 flex items-center justify-between gap-2 rounded-field border border-solid border-line-control bg-surface-control text-sm text-left text-ink;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.dropdown-button-open {
  @apply outline outline-2 outline-offset-0 outline-focus border-transparent;
}
.dropdown-chevron {
  @apply text-lg text-ink-muted transition-transform;
}
.dropdown-list {
  @apply absolute z-50 mt-1 w-full max-h-60 overflow-auto p-1 rounded-field border border-line bg-surface-overlay shadow-overlay;
  @apply focus:outline-none;
}
.dropdown-option {
  @apply flex items-center justify-between gap-2 px-3 py-2 rounded-control cursor-pointer text-sm text-ink;
}
.dropdown-option-active {
  @apply bg-fill-hover;
}
.dropdown-option-selected {
  @apply bg-accent-subtle text-accent-text font-medium;
}
</style>
