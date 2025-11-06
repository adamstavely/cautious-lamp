<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-comment-text</v-icon>
      Add Comment
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submitComment">
        <v-textarea
          v-model="newComment"
          label="Write your comment..."
          rows="3"
          variant="outlined"
          class="mb-3"
          :rules="[v => !!v || 'Comment is required']"
          required
        />
        <v-select
          v-model="commentType"
          :items="commentTypes"
          label="Comment Type"
          variant="outlined"
          color="primary"
          class="mb-3"
        />
        <div class="d-flex justify-end">
          <v-btn 
            type="submit" 
            color="primary" 
            :disabled="!newComment.trim()"
            :loading="submitting"
          >
            Add Comment
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['comment-added']);

const newComment = ref('');
const commentType = ref('general');
const submitting = ref(false);

const commentTypes = [
  { title: 'General Feedback', value: 'general' },
  { title: 'Bug Report', value: 'bug' },
  { title: 'Design Suggestion', value: 'suggestion' },
  { title: 'Approval', value: 'approval' },
  { title: 'Request Changes', value: 'changes' }
];

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  
  submitting.value = true;
  
  try {
    const comment = {
      id: Date.now().toString(),
      text: newComment.value.trim(),
      type: commentType.value,
      author: 'Current User', // In real app, this would come from auth
      timestamp: new Date().toISOString(),
      version: props.versionId,
      resolved: false,
      replies: []
    };
    
    emit('comment-added', comment);
    
    // Reset form
    newComment.value = '';
    commentType.value = 'general';
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    submitting.value = false;
  }
};

const props = defineProps({
  versionId: String
});
</script>
