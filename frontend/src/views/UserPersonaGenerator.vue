<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="User Persona Generator"
      lead="Create detailed user personas from research data. Generate structured persona documents that inform design decisions and keep teams aligned on user needs."
      spot="research/user-persona-generator"
      size="tool"
    />

    <PageSection>
      <form class="space-y-6" novalidate @submit.prevent="generatePersona">
        <UiPanel title="Basic information" description="Who this persona is.">
          <UiInput
            v-model="form.name"
            label="Persona name"
            required
            :error="nameError"
            placeholder="e.g., Sarah, The Busy Professional"
          />
        </UiPanel>

        <UiPanel title="Persona details" description="Fill in what your research supports; empty sections are left out.">
          <div class="space-y-5">
            <UiTextarea
              v-for="section in PERSONA_SECTIONS"
              :key="section.key"
              v-model="form[section.key]"
              :label="section.title"
              :placeholder="section.placeholder"
              rows="3"
            />
          </div>
        </UiPanel>

        <div class="flex flex-wrap justify-end gap-3">
          <UiButton icon="restart_alt" @click="resetForm">Reset</UiButton>
          <UiButton type="submit" variant="primary" icon="person">Generate persona</UiButton>
        </div>
      </form>
    </PageSection>

    <PageSection v-if="personaGenerated" ref="previewSection" title="Generated persona" description="A plain-text copy downloads with Export." divided>
      <UiPanel id="persona-preview" :title="form.name">
        <template #actions>
          <UiButton variant="primary" size="sm" icon="download" @click="exportPersona">Export</UiButton>
        </template>
        <!-- Text interpolation only: the fields are whatever the user pasted -->
        <dl v-if="personaSections.length" class="space-y-5">
          <div v-for="section in personaSections" :key="section.key">
            <dt class="text-sm font-semibold text-ink">{{ section.title }}</dt>
            <dd class="mt-1 whitespace-pre-line text-sm text-ink-secondary">{{ section.text }}</dd>
          </div>
        </dl>
        <p v-else class="text-sm text-ink-muted">No details yet. Add some above and generate again.</p>
      </UiPanel>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiInput, UiPanel, UiTextarea } from '../components/ui';

const personaGenerated = ref(false);
const nameError = ref('');
const previewSection = ref(null);

const form = reactive({
  name: '',
  howTheySeeThemselves: '',
  greatEnablers: '',
  greatestPainPoints: '',
  howTheyDescribedNeeds: '',
  currentExperience: ''
});

const PERSONA_SECTIONS = [
  { key: 'howTheySeeThemselves', title: 'How they see themselves', placeholder: 'How does this persona see themselves? What is their self-perception?' },
  { key: 'greatEnablers', title: 'Great enablers', placeholder: 'What are the great enablers for this persona? What helps them succeed?' },
  { key: 'greatestPainPoints', title: 'Greatest pain points', placeholder: 'What are their greatest pain points? What causes them the most frustration?' },
  { key: 'howTheyDescribedNeeds', title: 'How they described their needs', placeholder: 'How did they describe their needs? What did they say they need?' },
  { key: 'currentExperience', title: 'Current experience', placeholder: 'What is their current experience? How do they currently interact with similar products or services?' },
];

// The filled-in sections, shown as plain text in the preview
const personaSections = computed(() =>
  personaGenerated.value
    ? PERSONA_SECTIONS.filter(({ key }) => form[key]).map(({ key, title }) => ({ key, title, text: form[key] }))
    : [],
);

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = '';
  });
  personaGenerated.value = false;
  nameError.value = '';
};

const generatePersona = async () => {
  if (!form.name.trim()) {
    nameError.value = 'Enter a name for the persona.';
    return;
  }
  nameError.value = '';
  personaGenerated.value = true;
  await nextTick();
  previewSection.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const exportPersona = () => {
  // Create a formatted text version
  let text = `USER PERSONA\n`;
  text += `============\n\n`;
  text += `Name: ${form.name}\n\n`;
  
  if (form.howTheySeeThemselves) {
    text += `How They See Themselves:\n${form.howTheySeeThemselves}\n\n`;
  }
  
  if (form.greatEnablers) {
    text += `Great Enablers:\n${form.greatEnablers}\n\n`;
  }
  
  if (form.greatestPainPoints) {
    text += `Greatest Pain Points:\n${form.greatestPainPoints}\n\n`;
  }
  
  if (form.howTheyDescribedNeeds) {
    text += `How They Described Their Needs:\n${form.howTheyDescribedNeeds}\n\n`;
  }
  
  if (form.currentExperience) {
    text += `Current Experience:\n${form.currentExperience}\n`;
  }
  
  // Create and download file
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${form.name.replace(/\s+/g, '_')}_Persona.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>
