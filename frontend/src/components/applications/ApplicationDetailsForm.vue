<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <UiInput v-model="model.name" label="Application name" required maxlength="100" placeholder="My Application" />
    <UiInput
      v-model="model.teamId"
      label="Team ID"
      maxlength="100"
      pattern="[A-Za-z0-9_\-]+"
      title="Letters, digits, _ or -"
      placeholder="e.g., team-web"
      hint="Owns the visual-regression and session-replay projects. Defaults to the workspace."
    />
    <div class="md:col-span-2">
      <UiTextarea v-model="model.description" label="Description" :rows="3" maxlength="5000" placeholder="Brief description of the application" />
    </div>
    <UiInput v-model="model.repository" type="url" label="Repository URL" placeholder="https://github.com/company/app" />
    <UiInput v-model="model.applicationUrl" type="url" label="Application URL" placeholder="https://app.example.com" />
    <UiInput v-model="model.version" label="Application version" maxlength="50" placeholder="1.0.0" />
    <UiInput
      v-if="showDesignSystemVersion"
      v-model="model.designSystemVersion"
      label="Design system version"
      pattern="v?\d+\.\d+\.\d+([\-+][0-9A-Za-z.\-]+)?"
      title="A semantic version like 2.1.0"
      placeholder="2.1.0"
    />
    <UiSelect v-model="model.environment" label="Environment" :options="environmentOptions" />
    <UiInput v-model="model.framework" label="Framework" maxlength="100" placeholder="Vue, React…" />
    <UiInput v-model="model.language" label="Language" maxlength="100" placeholder="TypeScript" />
    <UiInput v-model="model.tags" label="Tags" placeholder="comma, separated" />
  </div>
</template>

<script setup>
import { UiInput, UiSelect, UiTextarea } from '../ui';

/** Edits the object from detailsForm() in place (v-model) */
const model = defineModel({ type: Object, required: true });
defineProps({
  showDesignSystemVersion: { type: Boolean, default: false },
});

const environmentOptions = [
  { value: '', label: 'Not set' },
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
];
</script>
