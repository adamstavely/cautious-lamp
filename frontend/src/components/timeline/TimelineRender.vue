<template>
  <section :class="rootClass(config.style, theme, config.cards)" :data-tl-preview="uid" :aria-labelledby="headingId">
    <header :class="config.showHeader ? 'tl-header' : 'tl-header tl-sr'">
      <h2 :id="headingId" class="tl-heading">{{ config.title || 'Timeline' }}</h2>
      <p v-if="config.summary" class="tl-summary">{{ config.summary }}</p>
    </header>
    <ol class="tl-list">
      <li v-for="(item, index) in items" :key="index" :class="itemClass(item, config.style)">
        <span class="tl-marker" aria-hidden="true">
          <svg v-if="iconNode(item.icon)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><component :is="part[0]" v-for="(part, i) in iconNode(item.icon)" :key="i" v-bind="part[1]" /></svg>
        </span>
        <div class="tl-body">
          <time v-if="formatDate(item.date, config.dateFormat)" class="tl-date" :datetime="item.date">{{ formatDate(item.date, config.dateFormat) }}</time>
          <div class="tl-text">
            <h3 class="tl-title"><span v-if="config.style === 'milestones'" class="tl-sr">{{ item.state === 'done' ? 'Completed: ' : 'Upcoming: ' }}</span>{{ item.title || 'Untitled event' }}</h3>
            <p v-if="item.description" class="tl-desc">{{ item.description }}</p>
          </div>
        </div>
      </li>
    </ol>
    <p v-if="config.keyInsight" class="tl-insight"><strong>Key insight:</strong> {{ config.keyInsight }}</p>
  </section>
</template>

<script setup>
/**
 * The Timeline generator's preview: the same markup and stylesheet as the
 * exported components (utils/timelineTheme.js), so what you see is what you
 * export. The stylesheet and this timeline's colours go into a <style>
 * element in the document head while it's shown. The `auto` theme follows the app.
 */
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useDarkMode } from '../../composables/useDarkMode.js';
import {
  TIMELINE_CSS, TIMELINE_ICONS, formatDate, itemClass, itemVars, rootClass, timelineItems, timelineVars,
} from '../../utils/timelineTheme.js';

const props = defineProps({
  /** title, summary, keyInsight, showHeader, style, cards, theme, timelineColor, dateFormat, spacing, sortByDate */
  config: { type: Object, required: true },
  events: { type: Array, required: true },
  headingId: { type: String, default: 'timeline-heading' },
});

const uid = `p${Math.random().toString(36).slice(2, 10)}`;
const appDark = useDarkMode();

const theme = computed(() => (props.config.theme === 'auto' ? (appDark.value ? 'dark' : 'light') : props.config.theme));
const items = computed(() => timelineItems(props.events, props.config));
const iconNode = (name) => TIMELINE_ICONS[name]?.node;

const declarations = (vars) => Object.entries(vars).map(([name, value]) => `${name}:${value}`).join(';');
const instanceCss = computed(() => {
  const scope = `.tl[data-tl-preview="${uid}"]`;
  const rules = [`${scope}{${declarations(timelineVars(props.config))}}`];
  items.value.forEach((item, index) => {
    rules.push(`${scope} .tl-list>.tl-item:nth-child(${index + 1}){${declarations(itemVars(item, props.config))}}`);
  });
  return rules.join('\n');
});

// One shared copy of the stylesheet for every preview on the page, and one rule set per preview
let sheet = null;
onMounted(() => {
  let base = document.getElementById('timeline-css');
  if (!base) {
    base = document.createElement('style');
    base.id = 'timeline-css';
    base.textContent = TIMELINE_CSS;
    document.head.appendChild(base);
  }
  base.dataset.users = String(Number(base.dataset.users || 0) + 1);
  sheet = document.createElement('style');
  sheet.dataset.timelinePreview = uid;
  sheet.textContent = instanceCss.value;
  document.head.appendChild(sheet);
});
watch(instanceCss, (css) => {
  if (sheet) sheet.textContent = css;
});
onBeforeUnmount(() => {
  sheet?.remove();
  sheet = null;
  const base = document.getElementById('timeline-css');
  const users = Number(base?.dataset.users || 1) - 1;
  if (base && users <= 0) base.remove();
  else if (base) base.dataset.users = String(users);
});
</script>
