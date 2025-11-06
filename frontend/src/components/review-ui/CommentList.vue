<template>
  <v-card class="mt-4">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-comment-multiple</v-icon>
        Comments ({{ comments.length }})
      </div>
      <v-btn
        icon
        @click="refreshComments"
        :loading="loading"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text v-if="comments.length === 0" class="text-center py-8">
      <v-icon size="48" color="grey-lighten-1">mdi-comment-outline</v-icon>
      <p class="text-grey mt-2">No comments yet. Be the first to add feedback!</p>
    </v-card-text>
    
    <v-list v-else>
      <template v-for="comment in comments" :key="comment.id">
        <v-list-item class="comment-item">
          <template #prepend>
            <v-avatar :color="getCommentColor(comment.type)" size="32">
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title class="d-flex align-center">
            <span class="font-weight-medium">{{ comment.author }}</span>
            <v-chip
              :color="getCommentColor(comment.type)"
              size="small"
              class="ml-2"
            >
              {{ getCommentTypeLabel(comment.type) }}
            </v-chip>
            <v-chip
              v-if="comment.resolved"
              color="success"
              size="small"
              class="ml-2"
            >
              <v-icon start>mdi-check</v-icon>
              Resolved
            </v-chip>
          </v-list-item-title>
          
          <v-list-item-subtitle class="mt-1">
            {{ formatTimestamp(comment.timestamp) }}
          </v-list-item-subtitle>
          
          <template #append>
            <div class="d-flex align-center ga-1">
              <v-tooltip text="Reply">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    v-bind="props"
                    @click="toggleReply(comment.id)"
                  >
                    <v-icon>mdi-reply</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
              
              <v-tooltip text="Mark as resolved">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    v-bind="props"
                    @click="toggleResolved(comment.id)"
                    :color="comment.resolved ? 'success' : 'default'"
                  >
                    <v-icon>{{ comment.resolved ? 'mdi-check-circle' : 'mdi-check-circle-outline' }}</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>
          
          <div class="comment-content mt-2">
            <p class="text-body-1">{{ comment.text }}</p>
          </div>
          
          <!-- Reply Form -->
          <v-expand-transition>
            <div v-if="replyingTo === comment.id" class="mt-3">
              <v-textarea
                v-model="replyText"
                label="Write a reply..."
                rows="2"
                variant="outlined"
                class="mb-2"
              />
              <div class="d-flex justify-end ga-2">
                <v-btn
                  variant="text"
                  @click="cancelReply"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="primary"
                  @click="submitReply(comment.id)"
                  :disabled="!replyText.trim()"
                >
                  Reply
                </v-btn>
              </div>
            </div>
          </v-expand-transition>
          
          <!-- Replies -->
          <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-8">
            <v-divider class="mb-2" />
            <div class="text-caption text-grey mb-2">Replies:</div>
            <template v-for="reply in comment.replies" :key="reply.id">
              <v-list-item class="reply-item">
                <template #prepend>
                  <v-avatar size="24" color="grey-lighten-2">
                    <v-icon size="16">mdi-account</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title class="d-flex align-center">
                  <span class="font-weight-medium">{{ reply.author }}</span>
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  {{ formatTimestamp(reply.timestamp) }}
                </v-list-item-subtitle>
                
                <div class="reply-content mt-1">
                  <p class="text-body-2">{{ reply.text }}</p>
                </div>
              </v-list-item>
            </template>
          </div>
        </v-list-item>
        
        <v-divider v-if="comment !== comments[comments.length - 1]" />
      </template>
    </v-list>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  versionId: String
});

const emit = defineEmits(['comment-updated', 'reply-added']);

const replyingTo = ref(null);
const replyText = ref('');
const loading = ref(false);

const getCommentColor = (type) => {
  const colors = {
    general: 'blue',
    bug: 'red',
    suggestion: 'orange',
    approval: 'green',
    changes: 'amber'
  };
  return colors[type] || 'blue';
};

const getCommentTypeLabel = (type) => {
  const labels = {
    general: 'General',
    bug: 'Bug',
    suggestion: 'Suggestion',
    approval: 'Approved',
    changes: 'Changes'
  };
  return labels[type] || 'General';
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const toggleReply = (commentId) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null;
    replyText.value = '';
  } else {
    replyingTo.value = commentId;
    replyText.value = '';
  }
};

const cancelReply = () => {
  replyingTo.value = null;
  replyText.value = '';
};

const submitReply = (commentId) => {
  if (!replyText.value.trim()) return;
  
  const reply = {
    id: Date.now().toString(),
    text: replyText.value.trim(),
    author: 'Current User',
    timestamp: new Date().toISOString()
  };
  
  emit('reply-added', commentId, reply);
  replyText.value = '';
  replyingTo.value = null;
};

const toggleResolved = (commentId) => {
  emit('comment-updated', commentId, 'toggle-resolved');
};

const refreshComments = () => {
  loading.value = true;
  // Simulate refresh
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};
</script>

<style scoped>
.comment-item {
  align-items: flex-start !important;
}

.reply-item {
  align-items: flex-start !important;
}

.comment-content {
  width: 100%;
}
</style>
