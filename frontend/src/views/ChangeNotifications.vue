<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Tools"
      title="Change notifications"
      lead="Follow components, tokens and patterns, see what changed across the design system, and choose how you hear about it."
      spot="foundations/pattern-notifications"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiTabs v-model="activeTab" :tabs="tabs" label="Change notifications">
      <!-- The signed-in person's notifications -->
      <template #inbox>
        <UiPanel title="Your notifications" description="Changes to what you follow, and updates on your requests.">
          <template #actions>
            <UiButton v-if="unreadCount > 0" size="sm" icon="check-check" :loading="markingAll" @click="markAllAsRead">Mark all read</UiButton>
          </template>

          <UiSegmented v-model="inboxFilter" aria-label="Show" :options="INBOX_FILTERS" class="mb-4" />

          <UiCallout v-if="notificationsError && !notificationsLoaded" tone="danger" role="alert">
            Notifications couldn't be loaded. {{ apiErrorMessage(notificationsError) }}
          </UiCallout>
          <div v-else-if="!notificationsLoaded" class="flex justify-center py-8">
            <UiSpinner label="Loading notifications…" />
          </div>
          <UiEmptyState
            v-else-if="visibleNotifications.length === 0"
            :title="inboxFilter === 'unread' && notifications.length ? 'All caught up' : 'No notifications yet'"
            :body="
              inboxFilter === 'unread' && notifications.length
                ? 'You have read every notification.'
                : 'Follow components, tokens or patterns and you will be notified here when they change.'
            "
            :bordered="false"
          >
            <template v-if="!notifications.length" #actions>
              <UiButton icon="settings" @click="activeTab = 'settings'">Choose what to follow</UiButton>
            </template>
          </UiEmptyState>
          <ul v-else class="space-y-3">
            <li v-for="item in visibleNotifications" :key="item.id" class="feed-item" :class="{ 'feed-item-unread': !item.read }">
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-ink-strong">{{ item.title }}</h3>
                  <UiChip v-if="item.breaking" tone="danger">Breaking</UiChip>
                  <UiChip v-if="!item.read" tone="accent">Unread</UiChip>
                </div>
                <p class="text-sm text-ink-secondary mb-1">{{ item.message }}</p>
                <p class="text-xs text-ink-muted">
                  <time :datetime="item.createdAt">{{ formatRelativeTime(item.createdAt) }}</time>
                  <template v-if="item.link">
                    · <UiLink :to="item.link" @click="openNotification(item)">Open</UiLink>
                  </template>
                </p>
              </div>
              <div class="flex items-center gap-1">
                <UiButton
                  v-if="!item.read"
                  variant="ghost"
                  size="sm"
                  icon="check"
                  icon-only
                  :label="`Mark “${item.title}” read`"
                  @click="markAsRead(item)"
                />
                <UiButton variant="ghost" size="sm" icon="trash-2" icon-only :label="`Delete “${item.title}”`" @click="deleteNotification(item)" />
              </div>
            </li>
          </ul>
        </UiPanel>
      </template>

      <!-- The design-system changelog -->
      <template #changes>
        <div class="space-y-6">
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <UiStat label="Components changed" icon="blocks" :value="changesLoaded ? summary.componentsChanged : '–'" />
            <UiStat label="Tokens changed" icon="swatch-book" :value="changesLoaded ? summary.tokensChanged : '–'" />
            <UiStat label="Breaking changes" icon="triangle-alert" tone="danger" :value="changesLoaded ? summary.breakingChanges : '–'" />
            <UiStat label="Deprecations" icon="octagon-alert" tone="warning" :value="changesLoaded ? summary.deprecations : '–'" />
          </div>

          <UiPanel title="Recent changes" description="Every recorded change to components, tokens and patterns you can see.">
            <div class="flex flex-wrap items-end gap-4 mb-4">
              <UiSelect id="changes-type" v-model="changeType" label="Show" size="sm" :options="CHANGE_TYPE_OPTIONS" class="w-48" />
              <UiSwitch v-model="breakingOnly" label="Breaking changes only" />
            </div>

            <UiCallout v-if="changesError" tone="danger" role="alert">The changelog couldn't be loaded. {{ changesError }}</UiCallout>
            <div v-else-if="!changesLoaded" class="flex justify-center py-8">
              <UiSpinner label="Loading changes…" />
            </div>
            <UiEmptyState
              v-else-if="entries.length === 0"
              title="No changes recorded"
              body="Changes appear here when components, tokens or patterns are added, changed, deprecated or removed."
              :bordered="false"
            />
            <ul v-else class="space-y-3">
              <li v-for="entry in entries" :key="entry.id" class="feed-item" :class="{ 'feed-item-breaking': entry.breaking }">
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <UiChip :tone="TYPE_TONES[entry.type] || 'neutral'">{{ TYPE_LABELS[entry.type] || entry.type }}</UiChip>
                    <h3 class="text-sm font-semibold text-ink-strong">{{ entry.entityName }}</h3>
                    <UiChip :tone="actionTone(entry)">{{ ACTION_LABELS[entry.action] || entry.action }}</UiChip>
                    <UiChip v-if="entry.breaking" tone="danger" icon="triangle-alert">Breaking</UiChip>
                  </div>
                  <ul v-if="entry.changes && entry.changes.length" class="text-sm text-ink-secondary mb-1">
                    <li v-for="(change, idx) in entry.changes" :key="idx">{{ change.description || change.field }}</li>
                  </ul>
                  <p class="text-xs text-ink-muted">
                    <time :datetime="entry.createdAt">{{ formatRelativeTime(entry.createdAt) }}</time>
                    <span v-if="entry.author"> · by {{ entry.author }}</span>
                    <span v-if="entry.version"> · v{{ entry.version }}</span>
                    <template v-if="entry.link"> · <UiLink :to="entry.link">View</UiLink></template>
                  </p>
                </div>
                <UiButton
                  v-if="canFollow(entry)"
                  size="sm"
                  :icon="isFollowing(entry.type, entry.entityId) ? 'bell-off' : 'bell'"
                  :aria-label="`${isFollowing(entry.type, entry.entityId) ? 'Unfollow' : 'Follow'} ${entry.entityName}`"
                  @click="toggleFollow(entry)"
                >
                  {{ isFollowing(entry.type, entry.entityId) ? 'Unfollow' : 'Follow' }}
                </UiButton>
              </li>
            </ul>
          </UiPanel>
        </div>
      </template>

      <!-- What the person follows and how they are told -->
      <template #settings>
        <UiCallout v-if="settingsError" tone="danger" role="alert">Your settings couldn't be loaded. {{ settingsError }}</UiCallout>
        <div v-else-if="!settingsLoaded" class="flex justify-center py-8">
          <UiSpinner label="Loading your settings…" />
        </div>
        <div v-else class="grid lg:grid-cols-2 gap-6">
          <UiPanel title="Following" description="You're notified when anything you follow changes.">
            <form class="flex flex-wrap items-end gap-3 mb-5" @submit.prevent="followSelected">
              <UiSelect id="follow-type" v-model="followType" label="Type" size="sm" :options="FOLLOW_TYPE_OPTIONS" class="w-40" />
              <UiSelect
                id="follow-item"
                v-model="followItem"
                label="Item"
                size="sm"
                :options="followItemOptions"
                class="flex-1 min-w-48"
                :hint="followType === 'component' ? '' : `To follow one ${followType}, use Follow on one of its changes.`"
              />
              <UiButton type="submit" size="sm" variant="primary" icon="plus" :loading="following">Follow</UiButton>
            </form>

            <p v-if="subscriptions.length === 0" class="text-sm text-ink-secondary">You aren't following anything yet.</p>
            <ul v-else class="divide-y divide-line">
              <li v-for="sub in subscriptions" :key="sub.id" class="flex items-center justify-between gap-3 py-2">
                <span class="flex items-center gap-2 min-w-0">
                  <UiChip :tone="TYPE_TONES[sub.type] || 'neutral'">{{ TYPE_LABELS[sub.type] }}</UiChip>
                  <span class="text-sm text-ink-strong truncate">{{ subscriptionName(sub) }}</span>
                </span>
                <UiButton variant="ghost" size="sm" :aria-label="`Unfollow ${subscriptionName(sub)}`" @click="unfollow(sub)">Unfollow</UiButton>
              </li>
            </ul>
          </UiPanel>

          <div class="space-y-6">
            <UiPanel title="Preferences" description="Changes are saved as you make them.">
              <div class="space-y-4">
                <UiSwitch
                  :model-value="preferences.inApp"
                  label="Show notifications in the app"
                  hint="The bell in the top bar and the list on this page."
                  :disabled="savingPreferences"
                  @update:model-value="savePreferences({ inApp: $event })"
                />
                <UiSwitch
                  :model-value="preferences.breakingOnly"
                  label="Only breaking changes"
                  :disabled="savingPreferences"
                  @update:model-value="savePreferences({ breakingOnly: $event })"
                />
                <fieldset>
                  <legend class="text-sm font-medium text-ink-strong mb-2">Notify me when something is</legend>
                  <div class="flex flex-wrap gap-x-6 gap-y-2">
                    <UiCheckbox
                      v-for="option in ACTION_OPTIONS"
                      :key="option.value"
                      :model-value="preferences.actions"
                      :value="option.value"
                      :label="option.label"
                      :disabled="savingPreferences"
                      @update:model-value="savePreferences({ actions: $event })"
                    />
                  </div>
                </fieldset>
              </div>
            </UiPanel>

            <UiPanel title="Email, Slack and webhooks">
              <UiCallout tone="warning" title="Delivery isn't set up yet" class="mb-4">
                Nothing is sent to email, Slack or webhooks yet. You can choose channels now and they're saved, but only in-app notifications are delivered.
              </UiCallout>
              <div class="flex flex-wrap gap-x-6 gap-y-2">
                <UiCheckbox
                  v-for="channel in CHANNEL_OPTIONS"
                  :key="channel.value"
                  :model-value="preferences.channels[channel.value]"
                  :label="channel.label"
                  hint="Not delivered yet"
                  :disabled="savingPreferences"
                  @update:model-value="savePreferences({ channels: { [channel.value]: $event } })"
                />
              </div>
            </UiPanel>
          </div>
        </div>
      </template>
    </UiTabs>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiEmptyState,
  UiLink,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiStat,
  UiSwitch,
  UiTabs,
} from '../components/ui';
import { formatRelativeTime, useNotifications } from '../composables/useNotifications.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

const TYPE_LABELS = { component: 'Component', token: 'Token', pattern: 'Pattern', workspace: 'Workspace', application: 'Application', system: 'System' };
const TYPE_TONES = { component: 'accent', token: 'info', pattern: 'neutral' };
const ACTION_LABELS = { created: 'Added', updated: 'Updated', deprecated: 'Deprecated', deleted: 'Removed', 'status-changed': 'Status changed' };
const ACTION_OPTIONS = [
  { value: 'created', label: 'Added' },
  { value: 'updated', label: 'Updated' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'deleted', label: 'Removed' },
];
const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'slack', label: 'Slack' },
  { value: 'webhook', label: 'Webhook' },
];
const INBOX_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];
const CHANGE_TYPE_OPTIONS = [
  { value: '', label: 'All changes' },
  { value: 'component', label: 'Components' },
  { value: 'token', label: 'Tokens' },
  { value: 'pattern', label: 'Patterns' },
];
const FOLLOW_TYPE_OPTIONS = [
  { value: 'component', label: 'Component' },
  { value: 'token', label: 'Token' },
  { value: 'pattern', label: 'Pattern' },
];
const FOLLOWABLE = new Set(['component', 'token', 'pattern']);
const EMPTY_SUMMARY = { componentsChanged: 0, tokensChanged: 0, breakingChanges: 0, deprecations: 0 };

const { notice, showNotice, clearNotice } = useNotice();
const {
  notifications,
  unreadCount,
  loaded: notificationsLoaded,
  error: notificationsError,
  load: loadNotifications,
  markRead,
  markAllRead,
  remove,
} = useNotifications();

const activeTab = ref('inbox');
const tabs = computed(() => [
  { value: 'inbox', label: 'Notifications', icon: 'bell', count: unreadCount.value || undefined },
  { value: 'changes', label: 'Recent changes', icon: 'history' },
  { value: 'settings', label: 'Following and preferences', icon: 'settings' },
]);

// ---------- Notifications ----------

const inboxFilter = ref('all');
const markingAll = ref(false);
const visibleNotifications = computed(() => (inboxFilter.value === 'unread' ? notifications.value.filter((n) => !n.read) : notifications.value));

const markAsRead = async (item) => {
  try {
    await markRead(item.id);
  } catch (error) {
    showNotice(apiErrorMessage(error, "The notification couldn't be marked read."), 'error');
  }
};

const markAllAsRead = async () => {
  markingAll.value = true;
  try {
    await markAllRead();
    showNotice('All notifications marked read.', 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, "Notifications couldn't be marked read."), 'error');
  } finally {
    markingAll.value = false;
  }
};

const deleteNotification = async (item) => {
  try {
    await remove(item.id);
  } catch (error) {
    showNotice(apiErrorMessage(error, "The notification couldn't be deleted."), 'error');
  }
};

/** Following a notification's link marks it read */
const openNotification = (item) => {
  if (!item.read) markAsRead(item);
};

// ---------- Changelog ----------

const changeType = ref('');
const breakingOnly = ref(false);
const entries = ref([]);
const summary = ref({ ...EMPTY_SUMMARY });
const changesLoaded = ref(false);
const changesError = ref('');
let changesRequest = 0;

const loadChanges = async () => {
  const request = ++changesRequest;
  changesError.value = '';
  try {
    const params = {};
    if (changeType.value) params.type = changeType.value;
    if (breakingOnly.value) params.breakingOnly = 'true';
    const res = await apiClient.get('/api/v1/changelog/aggregated', { params });
    if (request !== changesRequest) return;
    entries.value = res.data.entries ?? [];
    summary.value = { ...EMPTY_SUMMARY, ...(res.data.summary ?? {}) };
    changesLoaded.value = true;
  } catch (error) {
    if (request !== changesRequest) return;
    changesError.value = apiErrorMessage(error);
  }
};

watch([changeType, breakingOnly], loadChanges);

const actionTone = (entry) => {
  if (entry.action === 'deleted') return 'danger';
  if (entry.action === 'deprecated') return 'warning';
  if (entry.action === 'created') return 'success';
  return 'neutral';
};

// ---------- Following and preferences ----------

const subscriptions = ref([]);
const preferences = ref({ inApp: true, actions: [], breakingOnly: false, channels: { email: false, slack: false, webhook: false } });
const settingsLoaded = ref(false);
const settingsError = ref('');
const savingPreferences = ref(false);
const following = ref(false);
const components = ref([]);
const followType = ref('component');
const followItem = ref('*');

const applySettings = (data) => {
  subscriptions.value = data.subscriptions ?? [];
  preferences.value = data.preferences ?? preferences.value;
};

const loadSettings = async () => {
  settingsError.value = '';
  try {
    applySettings((await apiClient.get('/api/v1/notifications/settings')).data);
    settingsLoaded.value = true;
  } catch (error) {
    settingsError.value = apiErrorMessage(error);
  }
};

const loadComponents = async () => {
  try {
    const res = await apiClient.get('/api/v1/components');
    components.value = (res.data.components ?? []).map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Following "all components" still works without the list
    components.value = [];
  }
};

const followItemOptions = computed(() => {
  const all = { value: '*', label: `All ${TYPE_LABELS[followType.value].toLowerCase()}s` };
  if (followType.value !== 'component') return [all];
  return [all, ...components.value.map((c) => ({ value: c.id, label: c.name }))];
});

watch(followType, () => {
  followItem.value = '*';
});

const isFollowing = (type, entityId) => subscriptions.value.some((s) => s.type === type && s.entityId === entityId);
const canFollow = (entry) => settingsLoaded.value && FOLLOWABLE.has(entry.type);

const subscriptionName = (sub) =>
  sub.entityId === '*' ? `All ${TYPE_LABELS[sub.type].toLowerCase()}s` : sub.entityName || components.value.find((c) => c.id === sub.entityId)?.name || sub.entityId;

const follow = async (type, entityId, entityName) => {
  const res = await apiClient.post('/api/v1/notifications/subscriptions', { type, entityId, ...(entityName ? { entityName } : {}) });
  if (!subscriptions.value.some((s) => s.id === res.data.id)) subscriptions.value = [...subscriptions.value, res.data];
};

const followSelected = async () => {
  following.value = true;
  try {
    const name = followItem.value === '*' ? undefined : components.value.find((c) => c.id === followItem.value)?.name;
    await follow(followType.value, followItem.value, name);
    showNotice(`Following ${followItem.value === '*' ? `all ${followType.value}s` : name || followItem.value}.`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, "That couldn't be followed."), 'error');
  } finally {
    following.value = false;
  }
};

const unfollow = async (sub) => {
  try {
    await apiClient.delete(`/api/v1/notifications/subscriptions/${encodeURIComponent(sub.id)}`);
    subscriptions.value = subscriptions.value.filter((s) => s.id !== sub.id);
  } catch (error) {
    showNotice(apiErrorMessage(error, "That couldn't be unfollowed."), 'error');
  }
};

const toggleFollow = async (entry) => {
  const existing = subscriptions.value.find((s) => s.type === entry.type && s.entityId === entry.entityId);
  if (existing) return unfollow(existing);
  try {
    await follow(entry.type, entry.entityId, entry.entityName);
  } catch (error) {
    showNotice(apiErrorMessage(error, "That couldn't be followed."), 'error');
  }
};

/** Saves part of the preferences; the server's answer is what's shown */
const savePreferences = async (patch) => {
  savingPreferences.value = true;
  try {
    applySettings((await apiClient.put('/api/v1/notifications/preferences', patch)).data);
  } catch (error) {
    showNotice(apiErrorMessage(error, "Your preferences couldn't be saved."), 'error');
  } finally {
    savingPreferences.value = false;
  }
};

onMounted(() => {
  loadNotifications();
  loadChanges();
  loadSettings();
  loadComponents();
});
</script>

<style scoped>
.feed-item {
  @apply flex items-start gap-3 p-4 rounded-tile border border-line bg-surface;
}
.feed-item-unread {
  @apply border-accent bg-accent-subtle;
}
.feed-item-breaking {
  @apply border-danger-solid bg-danger-bg;
}
</style>
