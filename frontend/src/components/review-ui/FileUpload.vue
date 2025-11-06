<template>
  <form @submit.prevent="submit" class="space-y-6">
    <!-- Upload Type Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-3">Upload Type</label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="uploadType"
            value="file"
            class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
            @change="clearInputs"
          />
          <span class="text-sm text-gray-900 dark:text-gray-300">Upload File</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="uploadType"
            value="url"
            class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
            @change="clearInputs"
          />
          <span class="text-sm text-gray-900 dark:text-gray-300">Website URL</span>
        </label>
      </div>
    </div>

    <!-- File Upload Section -->
    <div v-if="uploadType === 'file'">
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
        Select file
      </label>
      <div
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragenter.prevent="isDragging = true"
        class="relative border-2 border-dashed rounded-lg p-8 transition-colors"
        :class="isDragging 
          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
          : file 
            ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800'"
      >
        <input
          ref="fileInput"
          type="file"
          @change="handleFileChange"
          class="hidden"
          required
        />
        
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <svg class="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span class="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer" @click="openFileDialog">
              Click to upload
            </span>
            <span class="text-gray-500 dark:text-gray-400"> or drag and drop</span>
          </p>
          
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
            PDF, AI, Sketch, Figma, or other design files
          </p>
          
          <!-- Selected File Preview -->
          <div v-if="file" class="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ file.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="removeFile"
                class="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <button
            type="button"
            @click="openFileDialog"
            class="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors shadow-sm"
          >
            Choose File
          </button>
        </div>
      </div>
    </div>

    <!-- URL Input Section -->
    <div v-else>
      <label for="externalUrl" class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
        Website URL
      </label>
      <input
        id="externalUrl"
        v-model="externalUrl"
        type="url"
        placeholder="https://example.com or https://staging.example.com"
        class="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
        required
      />
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Enter a URL to a website that's under development (e.g., staging site, prototype, or in-progress design)
      </p>
    </div>
    
    <!-- Password Protection -->
    <div>
      <label class="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          v-model="passwordProtected"
          class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
        />
        <span class="text-sm font-medium text-gray-900 dark:text-gray-300">Password Protect?</span>
      </label>
      
      <div v-if="passwordProtected" class="mt-2">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">DO NOT USE YOUR ACCOUNT PASSWORD</p>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter password"
            class="block w-full px-4 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.367 5.19m0 0L21 21" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <button
            type="button"
            @click="generatePassword"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Suggest Strong Password
          </button>
          <span class="text-gray-400 dark:text-gray-500">|</span>
          <button
            type="button"
            @click="copyPassword"
            :disabled="!password"
            class="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-indigo-600 dark:disabled:hover:text-indigo-400"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ passwordCopied ? '✓ Copied!' : 'Copy Password' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Review Path Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-3">Review Path</label>
      <div class="flex flex-col gap-3">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="reviewPath"
            value="client"
            class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
          />
          <span class="text-sm text-gray-900 dark:text-gray-300">Client Review</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="reviewPath"
            value="bypass"
            class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
          />
          <span class="text-sm text-gray-900 dark:text-gray-300">Bypass Client Review (go directly to Art/Creative Director)</span>
        </label>
      </div>
    </div>

    <!-- Sharing Options -->
    <div>
      <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-3">Sharing</label>
      <div class="flex flex-col gap-3">
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="sharingType"
            value="anyone"
            class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
          />
          <span class="text-sm text-gray-900 dark:text-gray-300">Anyone with link</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="sharingType"
            value="restricted"
            class="accent-indigo-600 dark:accent-indigo-400 focus:ring-indigo-500"
          />
          <span class="text-sm text-gray-900 dark:text-gray-300">Only people I list</span>
        </label>
      </div>
      
      <!-- Approved People List -->
      <div v-if="sharingType === 'restricted'" class="mt-3">
        <div class="space-y-2">
          <div v-for="(person, index) in approvedPeople" :key="index" class="flex items-center gap-2">
            <input
              type="email"
              v-model="approvedPeople[index]"
              placeholder="email@example.com"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
            <button
              type="button"
              @click="removeApprovedPerson(index)"
              class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            @click="addApprovedPerson"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            + Add Person
          </button>
        </div>
      </div>
    </div>
    
    <!-- Upload Button -->
    <button
      type="submit"
      :disabled="uploadType === 'file' ? !file : !externalUrl"
      class="w-full px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Create Review Request
    </button>
  </form>

  <!-- Alert Modal -->
  <AlertModal
    v-model="showAlert"
    title="Upload Error"
    :message="alertMessage"
    type="error"
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import { mockAPI, isMockMode } from '../../mockData.js';
import { uploadAPI } from '../../services/api.js';
import AlertModal from './AlertModal.vue';

const emit = defineEmits(['uploaded']);

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
const showAlert = ref(false);
const alertMessage = ref('');
const isDragging = ref(false);
const fileInput = ref(null);

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

// Add a new approved person field
const addApprovedPerson = () => {
  approvedPeople.value.push('');
};

// Remove an approved person
const removeApprovedPerson = (index) => {
  if (approvedPeople.value.length > 1) {
    approvedPeople.value.splice(index, 1);
  } else {
    approvedPeople.value[index] = '';
  }
};

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
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleFileChange = (event) => {
  file.value = event.target.files[0];
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const droppedFiles = event.dataTransfer.files;
  if (droppedFiles.length > 0) {
    file.value = droppedFiles[0];
  }
};

const removeFile = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const submit = async () => {
  if (uploadType.value === 'file' && !file.value) return;
  if (uploadType.value === 'url' && !externalUrl.value) return;

  try {
    const useMockMode = await isMockMode();
    const bypassClientReview = reviewPath.value === 'bypass';
    const finalPassword = passwordProtected.value ? password.value : null;
    const sharingMode = sharingType.value === 'restricted' ? 'restricted' : 'anyone';
    const approvedEmails = sharingType.value === 'restricted' 
      ? approvedPeople.value.filter(email => email.trim() !== '')
      : [];
    
    if (useMockMode) {
      // Use mock API
      if (uploadType.value === 'file') {
        const { uploadUrl, reviewId } = await mockAPI.upload(file.value.name, finalPassword, bypassClientReview, sharingMode, approvedEmails);
        const fullUrl = `${window.location.origin}/review/${reviewId}`;
        emit('uploaded', fullUrl);
      } else {
        // Create review with external URL
        const { reviewId } = await mockAPI.createReviewFromUrl(externalUrl.value, finalPassword, bypassClientReview, sharingMode, approvedEmails);
        const fullUrl = `${window.location.origin}/review/${reviewId}`;
        emit('uploaded', fullUrl);
      }
    } else {
      // Use real API
      if (uploadType.value === 'file') {
        const { uploadUrl, reviewId } = await uploadAPI.createFromUpload(
          file.value.name,
          finalPassword,
          bypassClientReview,
          sharingMode,
          approvedEmails
        );

        await uploadAPI.uploadFile(uploadUrl, file.value);

        const fullUrl = `${window.location.origin}/review/${reviewId}`;
        emit('uploaded', fullUrl);
      } else {
        // Create review with external URL
        const { reviewId } = await uploadAPI.createFromUrl(
          externalUrl.value,
          finalPassword,
          bypassClientReview,
          sharingMode,
          approvedEmails
        );
        const fullUrl = `${window.location.origin}/review/${reviewId}`;
        emit('uploaded', fullUrl);
      }
    }
  } catch (error) {
    console.error('Upload failed:', error);
    alertMessage.value = uploadType.value === 'file' 
      ? 'Upload failed. Please try again.' 
      : 'Failed to create review link. Please check the URL and try again.';
    showAlert.value = true;
  }
};
</script>
