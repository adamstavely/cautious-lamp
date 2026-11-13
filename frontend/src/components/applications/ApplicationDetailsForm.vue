<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label :for="`${uid}-name`" class="block text-sm font-medium mb-2" :class="c.label">Application Name *</label>
      <input :id="`${uid}-name`" v-model="model.name" type="text" required maxlength="100" placeholder="My Application" :class="[inputClass, c.input]" />
    </div>
    <div>
      <label :for="`${uid}-team`" class="block text-sm font-medium mb-2" :class="c.label">Team ID</label>
      <input
        :id="`${uid}-team`"
        v-model="model.teamId"
        type="text"
        maxlength="100"
        pattern="[A-Za-z0-9_\-]+"
        title="Letters, digits, _ or -"
        placeholder="e.g., team-web"
        :class="[inputClass, c.input]"
      />
      <p class="text-xs mt-1" :class="c.faint">Owns the visual-regression and session-replay projects. Defaults to the workspace.</p>
    </div>
    <div class="md:col-span-2">
      <label :for="`${uid}-desc`" class="block text-sm font-medium mb-2" :class="c.label">Description</label>
      <textarea :id="`${uid}-desc`" v-model="model.description" rows="3" maxlength="5000" placeholder="Brief description of the application" :class="[inputClass, c.input]" />
    </div>
    <div>
      <label :for="`${uid}-repo`" class="block text-sm font-medium mb-2" :class="c.label">Repository URL</label>
      <input :id="`${uid}-repo`" v-model="model.repository" type="url" placeholder="https://github.com/company/app" :class="[inputClass, c.input]" />
    </div>
    <div>
      <label :for="`${uid}-url`" class="block text-sm font-medium mb-2" :class="c.label">Application URL</label>
      <input :id="`${uid}-url`" v-model="model.applicationUrl" type="url" placeholder="https://app.example.com" :class="[inputClass, c.input]" />
    </div>
    <div>
      <label :for="`${uid}-version`" class="block text-sm font-medium mb-2" :class="c.label">Application Version</label>
      <input :id="`${uid}-version`" v-model="model.version" type="text" maxlength="50" placeholder="1.0.0" :class="[inputClass, c.input]" />
    </div>
    <div v-if="showDesignSystemVersion">
      <label :for="`${uid}-dsv`" class="block text-sm font-medium mb-2" :class="c.label">Design System Version</label>
      <input
        :id="`${uid}-dsv`"
        v-model="model.designSystemVersion"
        type="text"
        pattern="v?\d+\.\d+\.\d+([\-+][0-9A-Za-z.\-]+)?"
        title="A semantic version like 2.1.0"
        placeholder="2.1.0"
        :class="[inputClass, c.input]"
      />
    </div>
    <div>
      <div class="block text-sm font-medium mb-2" :class="c.label">Environment</div>
      <Dropdown
        v-model="model.environment"
        :options="[
          { value: '', label: 'Not set' },
          { value: 'development', label: 'Development' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Production' },
        ]"
        :is-dark-mode="isDarkMode"
      />
    </div>
    <div>
      <label :for="`${uid}-framework`" class="block text-sm font-medium mb-2" :class="c.label">Framework</label>
      <input :id="`${uid}-framework`" v-model="model.framework" type="text" maxlength="100" placeholder="Vue, React…" :class="[inputClass, c.input]" />
    </div>
    <div>
      <label :for="`${uid}-language`" class="block text-sm font-medium mb-2" :class="c.label">Language</label>
      <input :id="`${uid}-language`" v-model="model.language" type="text" maxlength="100" placeholder="TypeScript" :class="[inputClass, c.input]" />
    </div>
    <div>
      <label :for="`${uid}-tags`" class="block text-sm font-medium mb-2" :class="c.label">Tags</label>
      <input :id="`${uid}-tags`" v-model="model.tags" type="text" placeholder="comma, separated" :class="[inputClass, c.input]" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Dropdown from '../Dropdown.vue';
import { inputClass, ui } from '../workspaces/ui.js';

/** Edits the object from detailsForm() in place (v-model) */
const model = defineModel({ type: Object, required: true });
const props = defineProps({
  isDarkMode: { type: Boolean, default: false },
  showDesignSystemVersion: { type: Boolean, default: false },
});

const uid = `app${Math.random().toString(36).slice(2, 8)}`;
const c = computed(() => ui(props.isDarkMode));
</script>
