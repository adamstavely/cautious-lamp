<template>
  <form class="flex flex-col gap-6" @submit.prevent="submit">
    <UiSegmented
      :model-value="uploadType"
      label="Upload type"
      :options="[{ value: 'file', label: 'Upload file', icon: 'upload_file' }, { value: 'url', label: 'Website URL', icon: 'link' }]"
      @update:model-value="setUploadType"
    />

    <UiFileDropZone
      v-if="uploadType === 'file'"
      ref="dropZone"
      label="File"
      :file="file"
      :accept="ACCEPTED_TYPES.join(',')"
      hint="PDF, PNG, JPEG, GIF, WebP or SVG, up to 50MB"
      @select="selectFile"
      @remove="removeFile"
    />

    <UiInput
      v-else
      v-model="externalUrl"
      label="Website URL"
      type="url"
      placeholder="https://example.com or https://staging.example.com"
      hint="A website that's under development: a staging site, prototype or in-progress design."
      required
    />

    <div class="flex flex-col gap-3">
      <UiCheckbox v-model="passwordProtected" label="Password protect" />
      <div v-if="passwordProtected" class="flex flex-col gap-3 pl-7">
        <UiInput
          v-model="password"
          label="Review password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter password"
          autocomplete="new-password"
          hint="Do not use your account password."
        />
        <div class="flex flex-wrap items-center gap-2">
          <UiCheckbox v-model="showPassword" label="Show password" />
          <UiButton size="sm" variant="ghost" icon="key" @click="generatePassword">Suggest strong password</UiButton>
          <UiButton size="sm" variant="ghost" :icon="passwordCopied ? 'check' : 'content_copy'" :disabled="!password" @click="copyPassword">
            {{ passwordCopied ? 'Copied' : 'Copy password' }}
          </UiButton>
          <span class="sr-only" aria-live="polite">{{ passwordCopied ? 'Password copied' : '' }}</span>
        </div>
      </div>
    </div>

    <UiRadioChoices
      v-model="reviewPath"
      label="Review path"
      :options="[
        { value: 'client', label: 'Client review' },
        { value: 'bypass', label: 'Bypass client review', hint: 'Go directly to the Art Director and Creative Director.' },
      ]"
    />

    <div class="flex flex-col gap-3">
      <UiRadioChoices
        v-model="sharingType"
        label="Sharing"
        :options="[
          { value: 'anyone', label: 'Anyone with the link' },
          { value: 'restricted', label: 'Only people I list' },
        ]"
      />
      <ApprovedPeopleEditor v-if="sharingType === 'restricted'" v-model="approvedPeople" />
    </div>

    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <UiButton
      variant="primary"
      type="submit"
      icon="send"
      :loading="submitting"
      :disabled="uploadType === 'file' ? !file : !externalUrl"
    >
      {{ submitting ? 'Creating review…' : 'Create review request' }}
    </UiButton>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { uploadAPI, reviewPasswords, apiErrorMessage } from '../../services/api.js';
import { useNotice } from '../../composables/useNotice.js';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiCheckbox, UiInput, UiSegmented } from '../ui';
import UiFileDropZone from '../ui/UiFileDropZone.vue';
import UiRadioChoices from '../ui/UiRadioChoices.vue';
import ApprovedPeopleEditor from './ApprovedPeopleEditor.vue';

// uploaded: ({ reviewId, url }) once the review exists (and its file is stored)
const emit = defineEmits(['uploaded']);

// What the review service accepts for uploads (docs/REVIEW_API.md)
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 50 * 1024 * 1024;
const submitting = ref(false);
const { notice, showNotice, clearNotice } = useNotice();

const uploadType = ref('file');
const file = ref(null);
const externalUrl = ref('');
const passwordProtected = ref(false);
const password = ref('');
const reviewPath = ref('client'); // 'client' or 'bypass'
const sharingType = ref('anyone'); // 'anyone' or 'restricted'
const approvedPeople = ref(['']);
const showPassword = ref(false);
const passwordCopied = ref(false);
const dropZone = ref(null);

// Store previously generated passwords to avoid duplicates
const generatedPasswords = new Set();

// Clear password when checkbox is unchecked
watch(passwordProtected, (newValue) => {
  if (!newValue) {
    password.value = '';
    showPassword.value = false;
  }
});

// Reset approved people when sharing type changes
watch(sharingType, (newValue) => {
  if (newValue === 'anyone') {
    approvedPeople.value = [''];
  } else if (newValue === 'restricted' && approvedPeople.value.length === 0) {
    approvedPeople.value = [''];
  }
});

// Generate a strong password that hasn't been generated before
const generatePassword = () => {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let generatedPassword = '';
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop
  
  // Keep generating until we get a unique password
  do {
    generatedPassword = '';
    
    // Ensure at least one of each type
    generatedPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    generatedPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    generatedPassword += numbers[Math.floor(Math.random() * numbers.length)];
    generatedPassword += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = generatedPassword.length; i < length; i++) {
      generatedPassword += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password using Fisher-Yates algorithm for better randomness
    const passwordArray = generatedPassword.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    generatedPassword = passwordArray.join('');
    
    attempts++;
    
    // If we've tried too many times, break to avoid infinite loop
    // (theoretical probability of duplicate is extremely low anyway)
    if (attempts >= maxAttempts) {
      break;
    }
  } while (generatedPasswords.has(generatedPassword));
  
  // Store the generated password
  generatedPasswords.add(generatedPassword);
  
  password.value = generatedPassword;
  showPassword.value = true; // Show the password so user can see it
  passwordCopied.value = false; // Reset copied state when new password is generated
};

// Copy password to clipboard
const copyPassword = async () => {
  if (!password.value) return;
  
  try {
    await navigator.clipboard.writeText(password.value);
    passwordCopied.value = true;
    
    // Reset the "Copied!" message after 2 seconds
    setTimeout(() => {
      passwordCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy password:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = password.value;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      passwordCopied.value = true;
      setTimeout(() => {
        passwordCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }
};

const clearInputs = () => {
  file.value = null;
  externalUrl.value = '';
  dropZone.value?.reset();
};

const setUploadType = (type) => {
  if (type === uploadType.value) return;
  uploadType.value = type;
  clearInputs();
};

const selectFile = (selected) => {
  if (!selected) return;
  if (!ACCEPTED_TYPES.includes(selected.type)) {
    showNotice('Choose a PDF, PNG, JPEG, GIF, WebP or SVG file.', 'error');
    return;
  }
  if (selected.size > MAX_SIZE) {
    showNotice('That file is larger than 50MB.', 'error');
    return;
  }
  clearNotice();
  file.value = selected;
};

const removeFile = () => {
  file.value = null;
};

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const submit = async () => {
  if (submitting.value) return;
  if (uploadType.value === 'file' && !file.value) return;
  if (uploadType.value === 'url') {
    if (!externalUrl.value) return;
    if (!isHttpUrl(externalUrl.value.trim())) {
      showNotice('Enter a full http:// or https:// address.', 'error');
      return;
    }
  }
  if (passwordProtected.value && !password.value) {
    showNotice('Enter a password, or turn off password protection.', 'error');
    return;
  }

  const restricted = sharingType.value === 'restricted';
  const options = {
    password: passwordProtected.value ? password.value : undefined,
    bypassClientReview: reviewPath.value === 'bypass',
    sharingMode: restricted ? 'approved_emails' : 'anyone',
    approvedEmails: restricted ? approvedPeople.value.map((email) => email.trim()).filter(Boolean) : [],
  };
  if (restricted && options.approvedEmails.length === 0) {
    showNotice('Add at least one email address, or share with anyone who has the link.', 'error');
    return;
  }

  submitting.value = true;
  clearNotice();
  try {
    const { reviewId } = uploadType.value === 'file'
      ? await uploadAPI.uploadReview(file.value, options)
      : await uploadAPI.createFromUrl({ ...options, url: externalUrl.value.trim() });

    // The designer set this password, so they can open the review this session without retyping it.
    if (options.password) reviewPasswords.set(reviewId, options.password);

    emit('uploaded', { reviewId, url: `${window.location.origin}/review/${encodeURIComponent(reviewId)}` });
    clearInputs();
  } catch (error) {
    console.error('Upload failed:', error);
    const fallback = uploadType.value === 'file'
      ? 'Upload failed.'
      : 'Failed to create the review link.';
    showNotice(apiErrorMessage(error, fallback), 'error');
  } finally {
    submitting.value = false;
  }
};
</script>
