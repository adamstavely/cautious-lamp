<template>
  <div class="home min-h-full bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <div class="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <!-- Hero -->
      <section class="grid md:grid-cols-[1fr_auto] items-center gap-10 pb-14 md:pb-20 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p class="text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4">
            The Agency's design system
          </p>
          <h1 class="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-5">
            Unifying the mission,<br class="hidden sm:block" /> by design.
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mb-8">
            Guidelines, components, tokens, patterns and assets for building digital experiences
            that look, work and feel like one Agency.
          </p>
          <div class="flex flex-wrap gap-3">
            <router-link to="/getting-started" class="btn btn-primary">
              Get started
              <span class="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </router-link>
            <router-link to="/components" class="btn btn-secondary">Browse components</router-link>
            <router-link to="/search" class="btn btn-ghost">
              <span class="material-symbols-outlined text-lg" aria-hidden="true">search</span>
              Search
            </router-link>
          </div>
        </div>
        <div class="spot hidden md:block w-72 h-72 lg:w-80 lg:h-80" aria-hidden="true" v-html="spot('site/compass-rose')"></div>
      </section>

      <!-- Foundations -->
      <section class="py-14 md:py-16">
        <div class="section-head">
          <h2>Start with the foundations</h2>
          <p>The building blocks every product shares.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link v-for="item in foundations" :key="item.to" :to="item.to" class="card group">
            <div class="spot w-20 h-20 -ml-1 mb-3" aria-hidden="true" v-html="spot(item.art)"></div>
            <h3 class="card-title">
              {{ item.title }}
              <span class="material-symbols-outlined arrow" aria-hidden="true">arrow_forward</span>
            </h3>
            <p class="card-body">{{ item.body }}</p>
          </router-link>
        </div>
      </section>

      <!-- Roles -->
      <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">
        <div class="section-head">
          <h2>Made for how you work</h2>
          <p>Paths through the system for each discipline.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <router-link v-for="role in roles" :key="role.to" :to="role.to" class="role group">
            <div class="spot w-28 h-28 mx-auto mb-4" aria-hidden="true" v-html="spot(role.art)"></div>
            <h3 class="card-title justify-center">{{ role.title }}</h3>
            <p class="card-body text-center mb-4">{{ role.body }}</p>
            <span class="link">
              {{ role.cta }}
              <span class="material-symbols-outlined arrow" aria-hidden="true">arrow_forward</span>
            </span>
          </router-link>
        </div>
      </section>

      <!-- Showcase -->
      <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">
        <div class="section-head">
          <h2>What you see is what you build</h2>
          <p>These components use the same tokens the products ship with, so the docs can't drift from production.</p>
        </div>
        <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <div class="panel">
            <div class="panel-body">
              <div class="flex flex-wrap items-center gap-3">
                <span class="btn btn-primary">Primary</span>
                <span class="btn btn-secondary">Secondary</span>
                <span class="btn btn-ghost">
                  <span class="material-symbols-outlined text-lg" aria-hidden="true">download</span>
                  Ghost
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="chip chip-stable">Stable</span>
                <span class="chip chip-beta">Beta</span>
                <span class="chip chip-deprecated">Deprecated</span>
                <span class="chip">
                  <span class="material-symbols-outlined" aria-hidden="true">accessibility_new</span>
                  WCAG 2.1 AA
                </span>
              </div>
              <router-link to="/components/buttons" class="specimen group">
                <div class="flex items-start gap-3">
                  <div class="spot w-12 h-12 shrink-0 -m-1" aria-hidden="true" v-html="spot('foundations/component-button')"></div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-semibold group-hover:text-[#2f5ea8] dark:group-hover:text-[#9dbcf0] transition-colors">Button</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">@design-system/button</p>
                  </div>
                  <span class="chip chip-stable">Stable</span>
                </div>
                <p class="card-body">Triggers an action. Primary, secondary and ghost variants in three sizes, with loading and icon states.</p>
                <div class="flex flex-wrap gap-1.5">
                  <span class="code">variant</span>
                  <span class="code">size</span>
                  <span class="code">loading</span>
                </div>
              </router-link>
            </div>
            <div class="panel-foot">
              <span>Live components</span>
              <router-link to="/components" class="link">Browse components →</router-link>
            </div>
          </div>

          <div class="panel">
            <div class="panel-body">
              <div class="callout">
                <span class="material-symbols-outlined text-xl" aria-hidden="true">info</span>
                <p>Color is <b>information, not decoration.</b> Every color in the system is a named token with one job, from text and surfaces to status and focus.</p>
              </div>
              <ol class="steps">
                <li><span><b>Install the tokens</b> so color, type and space come from one place.</span></li>
                <li><span><b>Compose the components</b> rather than restyling them, and pass props like <span class="code">variant</span> and <span class="code">size</span>.</span></li>
                <li><span><b>Check accessibility</b> with the contrast and APCA tools before you ship.</span></li>
              </ol>
            </div>
            <div class="panel-foot">
              <span>Getting started</span>
              <router-link to="/getting-started/quick-start" class="link">Read the guide →</router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Tools -->
      <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">
        <div class="section-head section-head-split">
          <div>
            <h2>Popular tools</h2>
            <p>Check, generate and convert without leaving the system.</p>
          </div>
          <router-link to="/tools" class="link shrink-0">
            All tools
            <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </router-link>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <router-link v-for="tool in tools" :key="tool.to" :to="tool.to" class="tool group">
            <div class="spot w-14 h-14 shrink-0" aria-hidden="true" v-html="spot(tool.art)"></div>
            <div class="min-w-0">
              <h3 class="font-medium group-hover:text-[#2f5ea8] dark:group-hover:text-[#9dbcf0] transition-colors">{{ tool.title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ tool.body }}</p>
            </div>
          </router-link>
        </div>
      </section>

      <!-- More -->
      <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">
        <div class="section-head">
          <h2>Go further</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link v-for="item in more" :key="item.to" :to="item.to" class="card card-sm group">
            <div class="spot w-16 h-16 -ml-1 mb-2" aria-hidden="true" v-html="spot(item.art)"></div>
            <h3 class="card-title">
              {{ item.title }}
              <span class="material-symbols-outlined arrow" aria-hidden="true">arrow_forward</span>
            </h3>
            <p class="card-body">{{ item.body }}</p>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { spot } from '../utils/spotIllustrations.js';

const foundations = [
  { title: 'Guidelines', to: '/guidelines', art: 'site/guidelines', body: 'Principles and best practices for consistent, accessible interfaces.' },
  { title: 'Components', to: '/components', art: 'foundations/components', body: 'Reusable UI built with accessibility and consistency in mind.' },
  { title: 'Tokens', to: '/tokens', art: 'foundations/tokens', body: 'Color, spacing, type and motion as shared design decisions.' },
  { title: 'Patterns', to: '/patterns', art: 'foundations/patterns', body: 'Proven solutions for navigation, forms, feedback and data.' },
  { title: 'Fonts', to: '/fonts', art: 'foundations/fonts', body: 'Typefaces, stacks and scales for clear, readable text.' },
  { title: 'Design assets', to: '/design-assets', art: 'foundations/design-assets', body: 'Icons, seals, flags, logos, photos and illustrations.' },
];

const roles = [
  { title: 'For designers', to: '/for-designers', art: 'site/for-designers', cta: 'Explore designer tools', body: 'Visual tools, design assets and a smooth path from design to code.' },
  { title: 'For developers', to: '/for-developers', art: 'site/for-developers', cta: 'Explore developer tools', body: 'Components, APIs, snippets and testing to build faster.' },
  { title: 'For researchers', to: '/for-researchers', art: 'research/for-researchers', cta: 'Explore research tools', body: 'HCD methods, studies and insights that inform design decisions.' },
];

const tools = [
  { title: 'Color contrast checker', to: '/tools/color-contrast', art: 'tools/color-contrast-checker', body: 'Check color pairs against WCAG.' },
  { title: 'APCA calculator', to: '/tools/apca-calculator', art: 'tools/apca-calculator', body: 'Perceptual contrast for modern readability.' },
  { title: 'Color scale generator', to: '/tools/color-scale', art: 'tools/color-scale-generator', body: 'Build even, accessible tonal ramps.' },
  { title: 'Font scale', to: '/tools/font-scale', art: 'tools/font-scale', body: 'Generate a modular type scale.' },
  { title: 'Chart builder', to: '/tools/chart-builder', art: 'tools/chart-builder', body: 'Make on-brand charts from your data.' },
  { title: 'Gradient generator', to: '/tools/gradient-generator', art: 'tools/gradient-generator', body: 'Compose gradients from system colors.' },
];

const more = [
  { title: 'AI', to: '/ai', art: 'ai/artificial-intelligence', body: 'Patterns and components for AI experiences.' },
  { title: 'Laws of UX', to: '/hcd/laws-of-ux', art: 'site/laws-of-ux', body: 'The psychology behind good interfaces.' },
  { title: 'Contribute', to: '/getting-started/contribute', art: 'site/contribute', body: 'Propose, build and improve the system.' },
  { title: 'Roadmap', to: '/roadmap', art: 'site/roadmap-feedback', body: "See what's next and share feedback." },
];
</script>

<style scoped>
.spot :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.btn {
  @apply inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium transition-colors;
}
.btn-primary {
  @apply bg-[#2f5ea8] text-white hover:bg-[#264d8b] dark:bg-[#9dbcf0] dark:text-slate-950 dark:hover:bg-[#b8cff5];
}
.btn-secondary {
  @apply border border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900;
}
.btn-ghost {
  @apply text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900;
}

.section-head {
  @apply flex flex-col gap-1 mb-8;
}
.section-head-split {
  @apply sm:flex-row sm:items-end sm:justify-between gap-4;
}
.section-head h2 {
  @apply text-2xl md:text-3xl font-semibold tracking-tight;
}
.section-head p {
  @apply text-slate-600 dark:text-slate-400;
}

.card {
  @apply block rounded-2xl p-6 border border-slate-200 bg-[#fff] transition-all hover:border-[#8fb0e8] hover:shadow-[0_8px_24px_-12px_rgba(47,94,168,0.25)] dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-[#6f93d1];
}
.card-sm {
  @apply p-5;
}
.card-title {
  @apply flex items-center gap-1.5 text-lg font-semibold mb-1.5;
}
.card-body {
  @apply text-sm leading-relaxed text-slate-600 dark:text-slate-400;
}

.role {
  @apply flex flex-col items-center rounded-2xl p-8 bg-slate-50 border border-transparent transition-all hover:bg-[#f2f6fd] hover:border-[#dce8fb] dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:hover:border-slate-700;
}

.tool {
  @apply flex items-center gap-4 rounded-xl p-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors;
}

.panel {
  @apply flex flex-col rounded-2xl border border-slate-200 bg-[#fff] overflow-hidden dark:border-slate-800 dark:bg-slate-900/40;
}
.panel-body {
  @apply flex-1 flex flex-col gap-5 p-6;
}
.panel-foot {
  @apply flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400;
}

.chip {
  @apply inline-flex items-center gap-1 h-6 px-2.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300;
}
.chip .material-symbols-outlined {
  @apply text-sm;
}
.chip-stable {
  @apply border-[#dce8fb] bg-[#f2f6fd] text-[#2f5ea8] dark:border-[#263a5c] dark:bg-[#263a5c]/40 dark:text-[#9dbcf0];
}
.chip-beta {
  @apply border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300;
}
.chip-deprecated {
  @apply border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400;
}

.specimen {
  @apply flex flex-col gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-[#8fb0e8] dark:border-slate-800 dark:hover:border-[#6f93d1];
}
.code {
  @apply inline-block font-mono text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300;
}

.callout {
  @apply flex gap-3 rounded-xl p-4 text-sm leading-relaxed bg-[#f2f6fd] text-[#2f5ea8] dark:bg-[#263a5c]/40 dark:text-[#9dbcf0];
}
.callout b {
  @apply text-slate-900 dark:text-white font-semibold;
}

.steps {
  @apply flex flex-col gap-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400;
  counter-reset: step;
}
.steps li {
  @apply flex gap-3;
  counter-increment: step;
}
.steps li::before {
  @apply flex-none grid place-items-center w-7 h-7 rounded-full text-xs font-semibold bg-[#2f5ea8] text-white dark:bg-[#9dbcf0] dark:text-slate-950;
  content: counter(step);
}
.steps b {
  @apply text-slate-900 dark:text-white font-semibold;
}

.link {
  @apply inline-flex items-center gap-1 text-sm font-medium text-[#2f5ea8] dark:text-[#9dbcf0] hover:underline underline-offset-4;
}

.arrow {
  @apply text-base text-slate-400 transition-transform;
}
.group:hover .arrow {
  @apply translate-x-1 text-[#2f5ea8] dark:text-[#9dbcf0];
}
</style>
