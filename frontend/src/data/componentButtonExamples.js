// Code examples shown on the Button component page (ComponentButton.vue).
// They are content (markup a reader copies), not the page's own styling, so
// they keep the Tailwind classes the examples teach.

export const variantExamples = [
  {
    title: 'Primary',
    description: 'Use for the main action on a page or in a form.',
    preview: 'primary',
    code: `<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
    Primary Button
</button>`,
  },
  {
    title: 'Secondary',
    description: 'Use for secondary actions that are less prominent.',
    preview: 'secondary',
    code: `<button class="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
    Secondary Button
</button>`,
  },
  {
    title: 'Sizes',
    description: 'Choose from small, medium, or large button sizes.',
    preview: 'sizes',
    code: `<!-- Small -->
<button class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg">Small</button>

<!-- Medium -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">Medium</button>

<!-- Large -->
<button class="px-8 py-4 text-lg bg-indigo-600 text-white rounded-lg">Large</button>`,
  },
];

export const usageExamples = [
  {
    title: 'Form submission',
    description: '',
    code: `<form @submit.prevent="handleSubmit">
  <input v-model="email" type="email" placeholder="Email" />
  <button
    type="submit"
    class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
    :disabled="isSubmitting"
  >
    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
  </button>
</form>`,
  },
  {
    title: 'Action buttons',
    description:
      'Group primary and secondary actions together. Primary actions should be visually prominent, while secondary actions are less emphasized.',
    code: `<div class="flex gap-4">
  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
    Save Changes
  </button>
  <button class="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
    Cancel
  </button>
</div>`,
  },
  {
    title: 'Icon buttons',
    description: 'Use icon buttons for compact actions or when space is limited. Always include an aria-label for accessibility.',
    code: `<!-- Icon button with label -->
<button
  class="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
  aria-label="Delete item"
>
  <span class="material-symbols-outlined">delete</span>
</button>

<!-- Icon button with text -->
<button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
  <span class="material-symbols-outlined text-sm">download</span>
  Download
</button>`,
  },
  {
    title: 'Destructive actions',
    description:
      'Use a distinct style (typically red) for destructive actions like delete or remove. Consider adding a confirmation step for critical actions.',
    code: `<!-- Destructive action button -->
<button
  class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
  @click="confirmDelete"
>
  Delete Account
</button>

<!-- With confirmation dialog -->
<button
  class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
  @click="showDeleteConfirmation = true"
>
  Delete Item
</button>`,
  },
  {
    title: 'Button groups',
    description: 'Group related buttons together, especially when they represent different views or states of the same data.',
    code: `<!-- Button group for view switching -->
<div class="inline-flex rounded-lg border" :class="isDarkMode ? 'border-gray-700' : 'border-gray-300'">
  <button
    class="px-4 py-2 rounded-l-lg"
    :class="view === 'list'
      ? 'bg-indigo-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-50'"
    @click="view = 'list'"
  >
    List
  </button>
  <button
    class="px-4 py-2 rounded-r-lg border-l"
    :class="view === 'grid'
      ? 'bg-indigo-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-50'"
    :class="isDarkMode ? 'border-gray-700' : 'border-gray-300'"
    @click="view = 'grid'"
  >
    Grid
  </button>
</div>`,
  },
  {
    title: 'Full-width buttons',
    description: 'Use full-width buttons on mobile devices or when the button is the primary focus of the view.',
    code: `<!-- Full-width button -->
<button class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  Complete Purchase
</button>

<!-- Responsive: full-width on mobile, auto on desktop -->
<button class="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  Sign Up
</button>`,
  },
];

export const bestPractices = [
  {
    title: 'Use descriptive labels',
    description:
      'Button labels should clearly communicate the action that will occur when clicked. Avoid generic labels like "Click here" or "Submit".',
    code: `<!-- Good: Descriptive label -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
  Save Changes
</button>

<!-- Good: Action-oriented -->
<button class="px-6 py-3 bg-red-600 text-white rounded-lg">
  Delete Account
</button>`,
  },
  {
    title: 'Provide visual feedback',
    description:
      "Use loading states and disabled states to provide clear feedback about the button's current state and prevent duplicate submissions.",
    code: `<!-- Good: Loading state -->
<button
  class="px-6 py-3 bg-indigo-600 text-white rounded-lg"
  :disabled="isLoading"
>
  <span v-if="isLoading">Processing...</span>
  <span v-else>Submit Form</span>
</button>

<!-- Good: Disabled state for invalid forms -->
<button
  class="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
  :disabled="!isFormValid"
>
  Save
</button>`,
  },
  {
    title: 'Use appropriate variants',
    description:
      "Choose the right variant based on the action's importance. Use primary for main actions, secondary for secondary actions, and tertiary for less important actions.",
    code: `<!-- Good: Primary for main action -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
  Create Account
</button>

<!-- Good: Secondary for alternative action -->
<button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
  Cancel
</button>

<!-- Good: Tertiary for less important actions -->
<button class="px-6 py-3 text-indigo-600 rounded-lg hover:bg-indigo-50">
  Learn More
</button>`,
  },
  {
    title: 'Group related actions',
    description:
      'Group related buttons together and use consistent spacing. Place primary actions on the right in left-to-right languages.',
    code: `<!-- Good: Grouped actions -->
<div class="flex gap-3 justify-end">
  <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
    Cancel
  </button>
  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
    Save Changes
  </button>
</div>`,
  },
];

export const antiPatterns = [
  {
    title: 'Avoid generic labels',
    description:
      'Generic labels like "Click here" or "Submit" don\'t provide context about what will happen. Users need clear, action-oriented labels.',
    code: `<!-- Bad: Generic label -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
  Click Here
</button>

<!-- Bad: Unclear action -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
  Submit
</button>

<!-- Good: Descriptive and clear -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
  Save Profile Changes
</button>`,
  },
  {
    title: "Don't use buttons for navigation",
    description: 'Buttons are for actions, not navigation. Use links or router-links for navigation between pages.',
    code: `<!-- Bad: Button for navigation -->
<button
  class="px-6 py-3 bg-indigo-600 text-white rounded-lg"
  @click="$router.push('/about')"
>
  About Us
</button>

<!-- Good: Link for navigation -->
<router-link
  to="/about"
  class="px-6 py-3 text-indigo-600 rounded-lg hover:bg-indigo-50"
>
  About Us
</router-link>`,
  },
  {
    title: 'Avoid too many primary actions',
    description:
      'Having multiple primary buttons on the same page creates confusion. There should typically be only one primary action per view.',
    code: `<!-- Bad: Multiple primary actions -->
<div class="flex gap-3">
  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
    Save
  </button>
  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
    Publish
  </button>
  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
    Share
  </button>
</div>

<!-- Good: One primary, others secondary -->
<div class="flex gap-3">
  <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
    Save Draft
  </button>
  <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">
    Preview
  </button>
  <button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
    Publish
  </button>
</div>`,
  },
  {
    title: "Don't hide the disabled state reason",
    description:
      'When a button is disabled, users should understand why. Use tooltips or helper text to explain the disabled state.',
    code: `<!-- Bad: No explanation for disabled state -->
<button
  class="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
  :disabled="true"
>
  Submit
</button>

<!-- Good: Tooltip explains why disabled -->
<div class="relative group">
  <button
    class="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
    :disabled="!isFormValid"
    title="Please fill in all required fields"
  >
    Submit
  </button>
</div>`,
  },
];
