<template>
  <div class="flex flex-col gap-6">
    <fieldset class="flex flex-col gap-4">
      <legend class="mb-1 text-sm font-medium text-ink-strong">Privacy</legend>
      <UiSelect
        v-model="model.defaultInputMode"
        :id="`${idPrefix}-input-mode`"
        label="Form inputs"
        :options="INPUT_MODE_OPTIONS"
        hint="What the recording keeps of what people type."
      />
      <div class="grid sm:grid-cols-2 gap-2">
        <UiCheckbox v-model="model.privateMode" label="Mask all text" hint="Only elements marked data-openreplay-unmask stay readable." />
        <UiCheckbox v-model="model.respectDoNotTrack" label="Respect Do Not Track" hint="Don't record browsers that ask not to be tracked." />
        <UiCheckbox v-model="model.obscureTextEmails" label="Obscure emails in text" />
        <UiCheckbox v-model="model.obscureTextNumbers" label="Obscure numbers in text" />
        <UiCheckbox v-model="model.obscureInputEmails" label="Obscure emails in inputs" />
        <UiCheckbox v-model="model.obscureInputNumbers" label="Obscure numbers in inputs" />
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <UiTextarea
          v-model="model.maskTextSelector"
          :id="`${idPrefix}-mask-selectors`"
          label="Obscure text in these elements"
          :rows="3"
          mono
          hint="CSS selectors, one per line, e.g. .account-balance"
        />
        <UiTextarea
          v-model="model.blockSelector"
          :id="`${idPrefix}-block-selectors`"
          label="Leave these elements out"
          :rows="3"
          mono
          hint="CSS selectors, one per line, e.g. [data-private]"
        />
      </div>
    </fieldset>

    <fieldset class="flex flex-col gap-2">
      <legend class="mb-1 text-sm font-medium text-ink-strong">Capture</legend>
      <div class="grid sm:grid-cols-2 gap-2">
        <UiCheckbox v-model="model.captureConsole" label="Console messages" />
        <UiCheckbox v-model="model.captureIFrames" label="Same-origin iframes" />
        <UiCheckbox v-model="model.captureNetwork" label="Network requests" />
        <UiCheckbox
          v-model="model.captureNetworkPayload"
          :disabled="!model.captureNetwork"
          label="Request and response bodies"
          hint="Bodies can hold personal data."
        />
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { UiCheckbox, UiSelect, UiTextarea } from '../ui';
import { INPUT_MODE_OPTIONS } from './captureSettings.js';

/** Edits the object from captureForm() in place (v-model) */
const model = defineModel({ type: Object, required: true });

defineProps({
  /** Keeps field ids unique when the fields appear twice on a page */
  idPrefix: { type: String, default: 'capture' },
});
</script>
