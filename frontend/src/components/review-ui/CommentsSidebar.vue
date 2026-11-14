<template>
  <UiPanel :title="`Comments (${validComments.length})`" heading-tag="h3">
    <p v-if="readOnly" class="text-sm text-ink-muted">This review is completed. Comments are view-only.</p>

    <div class="comments-scroll">
      <p v-if="validComments.length === 0" class="py-6 text-center text-sm text-ink-muted">No comments yet. Be the first to add feedback!</p>

      <ul v-else class="flex flex-col gap-2">
        <li v-for="comment in validComments" :key="comment.id" class="comment">
          <span class="avatar" aria-hidden="true">{{ getInitials(comment.author) }}</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-2">
              <p class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <span class="font-medium text-ink-strong">{{ comment.author }}</span>
                <span class="text-xs text-ink-muted">{{ getRoleLabel(getAuthorRole(comment.author, comment)) }}</span>
                <UiChip v-if="comment.resolved" tone="success" icon="check">Resolved</UiChip>
              </p>
              <div class="flex shrink-0 items-center">
                <UiButton
                  icon-only
                  icon="reply"
                  variant="ghost"
                  size="sm"
                  label="Reply"
                  :disabled="readOnly"
                  :aria-expanded="replyingTo === comment.id"
                  @click="toggleReply(comment.id)"
                />
                <UiButton
                  icon-only
                  :icon="comment.resolved ? 'check_circle' : 'radio_button_unchecked'"
                  variant="ghost"
                  size="sm"
                  :label="comment.resolved ? 'Mark as unresolved' : 'Mark as resolved'"
                  :aria-pressed="!!comment.resolved"
                  :disabled="readOnly"
                  @click="toggleResolved(comment.id)"
                />
              </div>
            </div>
            <p class="text-xs text-ink-muted">{{ formatTimestamp(comment.timestamp) }}</p>
            <p class="comment-text">{{ comment.text }}</p>

            <!-- Reactions -->
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button
                v-for="(reactionGroup, emoji) in getReactionGroups(comment)"
                :key="`${comment.id}-${emoji}-${reactionGroup.length}`"
                type="button"
                class="reaction"
                :class="{ 'reaction-on': hasUserReacted(comment, emoji) }"
                :aria-pressed="hasUserReacted(comment, emoji)"
                :aria-label="`${emoji} ${reactionGroup.length}`"
                :disabled="readOnly"
                @click="toggleEmojiReaction(comment.id, emoji)"
              >
                <span aria-hidden="true">{{ emoji }}</span>
                <span class="font-medium" aria-hidden="true">{{ reactionGroup.length }}</span>
              </button>
              <ReactionPicker v-if="!readOnly" :emojis="availableEmojis" @pick="addEmojiReaction(comment.id, $event)" />
            </div>

            <!-- Reply form -->
            <form v-if="replyingTo === comment.id" class="mt-3 flex flex-col gap-2" @submit.prevent="submitReply(comment.id)">
              <UiTextarea v-model="replyText" label="Reply" placeholder="Write a reply..." :rows="2" autofocus />
              <div class="flex justify-end gap-2">
                <UiButton size="sm" variant="ghost" @click="cancelReply">Cancel</UiButton>
                <UiButton size="sm" variant="primary" type="submit" :disabled="!replyText.trim()">Reply</UiButton>
              </div>
            </form>

            <!-- Replies -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies">
              <p class="replies-heading">Replies ({{ comment.replies.length }})</p>
              <ul class="flex flex-col gap-2">
                <template v-for="(reply, replyIndex) in comment.replies" :key="reply?.id || `reply-${comment.id}-${replyIndex}`">
                  <li v-if="reply" class="reply">
                    <span class="avatar avatar-sm" aria-hidden="true">{{ getInitials(reply.author) }}</span>
                    <div class="min-w-0 flex-1">
                      <p class="flex flex-wrap items-center gap-x-2">
                        <span class="text-sm font-medium text-ink-strong">{{ reply.author }}</span>
                        <span class="text-xs text-ink-muted">{{ getRoleLabel(reply.authorRole || getAuthorRole(reply.author, reply)) }}</span>
                      </p>
                      <p class="text-xs text-ink-muted">{{ formatTimestamp(reply.timestamp) }}</p>
                      <p class="comment-text text-sm">{{ reply.text }}</p>

                      <div class="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          v-for="(reactionGroup, emoji) in getReactionGroups(reply)"
                          :key="emoji"
                          type="button"
                          class="reaction"
                          :class="{ 'reaction-on': hasUserReacted(reply, emoji) }"
                          :aria-pressed="hasUserReacted(reply, emoji)"
                          :aria-label="`${emoji} ${reactionGroup.length}`"
                          :disabled="readOnly"
                          @click="toggleEmojiReactionOnReply(comment.id, reply.id, emoji)"
                        >
                          <span aria-hidden="true">{{ emoji }}</span>
                          <span class="font-medium" aria-hidden="true">{{ reactionGroup.length }}</span>
                        </button>
                        <ReactionPicker v-if="!readOnly" :emojis="availableEmojis" @pick="addEmojiReactionToReply(comment.id, reply.id, $event)" />
                      </div>
                    </div>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <template v-if="!readOnly" #footer>
      <form class="flex w-full flex-col gap-3" @submit.prevent="submitComment">
        <UiTextarea v-model="newComment" label="Add a comment" placeholder="Write your comment..." :rows="3" />
        <div class="flex justify-end">
          <UiButton type="submit" variant="primary" icon="chat" :loading="submitting">Add comment</UiButton>
        </div>
      </form>
    </template>
  </UiPanel>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getCurrentUser } from '../../mockData.js';
import { UiButton, UiChip, UiPanel, UiTextarea } from '../ui';
import ReactionPicker from './ReactionPicker.vue';

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  versionId: String,
  readOnly: {
    type: Boolean,
    default: false
  },
  currentUserRole: {
    type: String,
    default: 'designer'
  }
});

// comment-added: ({ text, version, type, resolved }); reply-added: (commentId, text)
const emit = defineEmits(['comment-added', 'comment-updated', 'reply-added', 'emoji-reaction-toggled', 'emoji-reaction-toggled-reply']);

// Filter comments by version and remove null/undefined comments
const validComments = computed(() => {
  const allComments = (props.comments || []).filter(comment => comment && comment.id);
  
  // If versionId is provided, filter by version
  if (props.versionId) {
    return allComments.filter(comment => comment.version === props.versionId);
  }
  
  return allComments;
});

const newComment = ref('');
const submitting = ref(false);
const replyingTo = ref(null);
const replyText = ref('');
// The acting user, read once: it only changes when the user switches identity elsewhere and reloads
const currentUser = getCurrentUser();

// Available emoji reactions
const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '✅', '🎉', '🔥', '👏', '💯'];

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
};

// Get user initials from name
const getInitials = (name) => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    // First letter of first name + first letter of last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // Single name - use first two letters if available
  return parts[0].substring(0, 2).toUpperCase();
};

// Get role label from role string
const getRoleLabel = (role) => {
  if (!role) return '';
  const roleMap = {
    'designer': 'Designer',
    'art_director': 'Art Director',
    'creative_director': 'Creative Director',
    'client': 'Client',
    'admin': 'Review Admin'
  };
  return roleMap[role] || role;
};

// Role for display. The API doesn't record roles, so this is a best guess from the comment.
const getAuthorRole = (author, comment) => {
  if (comment?.authorRole) {
    return comment.authorRole;
  }
  if ((comment?.authorEmail && comment.authorEmail === currentUser.email) || author === currentUser.name) {
    return props.currentUserRole;
  }
  const name = (author || '').toLowerCase();
  if (name.includes('client')) return 'client';
  if (name.includes('art director')) return 'art_director';
  if (name.includes('creative director')) return 'creative_director';
  return '';
};

// Reactions are { [emoji]: [email] } (contract shape)
const getReactionGroups = (target) => {
  const reactions = target?.reactions;
  if (!reactions || typeof reactions !== 'object' || Array.isArray(reactions)) return {};
  const groups = {};
  Object.entries(reactions).forEach(([emoji, emails]) => {
    if (Array.isArray(emails) && emails.length) groups[emoji] = emails;
  });
  return groups;
};

// Check if current user has reacted with specific emoji
const hasUserReacted = (target, emoji) => getReactionGroups(target)[emoji]?.includes(currentUser.email) || false;

// Add emoji reaction
const addEmojiReaction = (commentId, emoji) => {
  if (props.readOnly) return;
  emit('emoji-reaction-toggled', commentId, emoji);
};

// Toggle emoji reaction (click on existing reaction chip)
const toggleEmojiReaction = (commentId, emoji) => {
  if (props.readOnly) return;
  emit('emoji-reaction-toggled', commentId, emoji);
};

// Add emoji reaction to reply
const addEmojiReactionToReply = (commentId, replyId, emoji) => {
  if (props.readOnly) return;
  emit('emoji-reaction-toggled-reply', commentId, replyId, emoji);
};

// Toggle emoji reaction on reply
const toggleEmojiReactionOnReply = (commentId, replyId, emoji) => {
  if (props.readOnly) return;
  emit('emoji-reaction-toggled-reply', commentId, replyId, emoji);
};

const submitComment = () => {
  const text = newComment.value.trim();
  if (!text || props.readOnly) return;

  submitting.value = true;
  // The server records the author from the signed-in user's token.
  emit('comment-added', {
    text,
    version: props.versionId || null,
    type: 'comment',
    resolved: false
  });
  newComment.value = '';
  submitting.value = false;
};

const toggleReply = (commentId) => {
  if (props.readOnly) return;
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
  if (props.readOnly) return;
  const text = replyText.value.trim();
  if (!text) return;

  emit('reply-added', commentId, text);
  replyText.value = '';
  replyingTo.value = null;
};

const toggleResolved = (commentId) => {
  if (props.readOnly) return;
  
  const comment = props.comments.find(c => c.id === commentId);
  if (!comment) return;
  
  emit('comment-updated', commentId, { resolved: !comment.resolved });
};
</script>

<style scoped>
.comments-scroll {
  @apply overflow-y-auto overflow-x-hidden;
  max-height: 60vh;
}
.comment {
  @apply flex items-start gap-3 rounded-tile p-3 transition-colors hover:bg-fill-subtle;
}
.comment-text {
  @apply mt-2 break-words text-ink;
}
.avatar {
  @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-accent text-xs font-semibold text-ink-on-accent;
}
.avatar-sm {
  @apply h-6 w-6 bg-fill-strong text-ink;
}
.reaction {
  @apply inline-flex h-7 items-center gap-1 rounded-pill border border-line bg-surface-control px-2.5 text-xs text-ink transition-colors;
  @apply hover:border-line-control-hover focus-visible:outline focus-visible:outline-2 outline-focus;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.reaction-on {
  @apply border-accent-highlight bg-accent-subtle text-accent-text;
}
.replies {
  @apply mt-4 border-l-2 border-accent-highlight pl-3;
}
.replies-heading {
  @apply mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted;
}
.reply {
  @apply flex items-start gap-2 rounded-control bg-fill-subtle px-3 py-2;
}
</style>
