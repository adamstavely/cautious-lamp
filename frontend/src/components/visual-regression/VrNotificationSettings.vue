<template>
  <UiPanel
    title="Send build results"
    heading-tag="h3"
    description="When an Argos build for this project finishes or fails, the result is sent to the channels turned on here."
  >
    <div v-if="!loaded && !loadError" class="flex justify-center py-6">
      <UiSpinner label="Loading notification settings…" />
    </div>
    <UiCallout v-else-if="forbidden" tone="info">Only people who can edit this project can see and change where build results are sent.</UiCallout>
    <UiCallout v-else-if="loadError" tone="danger" role="alert">Notification settings couldn't be loaded. {{ loadError }}</UiCallout>

    <template v-else>
      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

      <ul class="divide-y divide-line">
        <li v-for="channel in CHANNELS" :key="channel.value" class="py-4 space-y-3">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <UiSwitch
              :model-value="view(channel.value).enabled"
              :label="channel.label"
              :hint="channel.hint"
              :disabled="busy === channel.value || !view(channel.value).configured"
              @update:model-value="setEnabled(channel, $event)"
            />
            <div class="flex flex-wrap items-center gap-2">
              <UiChip :tone="state(channel.value).tone">{{ state(channel.value).label }}</UiChip>
              <UiButton
                size="sm"
                icon="send"
                :loading="testing === channel.value"
                :disabled="!view(channel.value).configured || unavailable(channel.value) || !!testing"
                :aria-label="`Send test to ${channel.label}`"
                @click="sendTest(channel)"
              >
                Send test
              </UiButton>
            </div>
          </div>

          <UiCallout v-if="unavailable(channel.value)" tone="warning" :title="`${channel.label} isn't set up on this server`">
            {{ availability[channel.value].reason }} Ask an administrator to configure it; until then build results aren't emailed.
          </UiCallout>

          <form class="flex flex-wrap items-end gap-3" @submit.prevent="save(channel)">
            <UiInput
              v-if="channel.value === 'email'"
              :id="`vr-${channel.value}-recipients`"
              v-model="drafts.email"
              size="sm"
              label="Recipients"
              hint="Email addresses, separated by commas."
              placeholder="qa@example.com, design@example.com"
              autocomplete="off"
              class="flex-1 min-w-64"
            />
            <UiInput
              v-else
              :id="`vr-${channel.value}-url`"
              v-model="drafts[channel.value]"
              type="url"
              size="sm"
              :label="`${channel.label} URL`"
              :placeholder="view(channel.value).configured ? 'Saved. Enter a new URL to replace it.' : channel.placeholder"
              autocomplete="off"
              class="flex-1 min-w-64"
            />
            <UiButton type="submit" size="sm" variant="primary" :loading="busy === channel.value" :disabled="!drafts[channel.value].trim()">
              Save
            </UiButton>
            <UiButton
              v-if="view(channel.value).configured"
              size="sm"
              variant="ghost"
              icon="trash-2"
              :aria-label="`Remove ${channel.label} notifications`"
              @click="remove(channel)"
            >
              Remove
            </UiButton>
          </form>

          <div v-if="channel.value === 'webhook' && revealedSecret" class="flex flex-wrap items-end gap-2 rounded-tile border border-warning-border bg-warning-bg p-4">
            <div class="flex-1 min-w-0">
              <UiInput
                id="vr-webhook-signing-secret"
                :model-value="revealedSecret"
                label="Signing secret for X-Signature-256. Copy it now: it won't be shown again."
                readonly
                mono
                @focus="$event.target.select()"
              />
            </div>
            <UiButton :icon="secretCopied ? 'check' : 'copy'" @click="copySecret">{{ secretCopied ? 'Copied' : 'Copy' }}</UiButton>
          </div>
        </li>
      </ul>

      <h4 class="text-sm font-semibold text-ink-strong mt-6 mb-3">Recent deliveries</h4>
      <DeliveryAttempts :attempts="attempts" empty-text="No build results have been sent yet." />
    </template>
  </UiPanel>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import DeliveryAttempts from '../delivery/DeliveryAttempts.vue';
import { UiButton, UiCallout, UiChip, UiInput, UiPanel, UiSpinner, UiSwitch } from '../ui';
import { useNotice } from '../../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../../services/api.js';

/** Where a visual regression project's build results are sent, with a test send per channel */
const props = defineProps({
  projectId: { type: String, required: true },
});

const CHANNELS = [
  { value: 'email', label: 'Email', hint: 'Build results emailed to the recipients below.' },
  { value: 'slack', label: 'Slack', hint: 'Posted by a Slack incoming webhook.', placeholder: 'https://hooks.slack.com/services/…' },
  { value: 'teams', label: 'Microsoft Teams', hint: 'Posted as a card by a Teams incoming webhook or Workflows URL.', placeholder: 'https://….webhook.office.com/…' },
  {
    value: 'webhook',
    label: 'Webhook',
    hint: 'A JSON POST signed with HMAC-SHA256 in the X-Signature-256 header.',
    placeholder: 'https://example.com/hooks/visual-regression',
  },
];

const { notice, showNotice, clearNotice } = useNotice();
const loaded = ref(false);
const loadError = ref('');
const forbidden = ref(false);
const channels = ref([]);
const availability = ref({});
const attempts = ref([]);
const drafts = ref({ email: '', slack: '', teams: '', webhook: '' });
const busy = ref('');
const testing = ref('');
const revealedSecret = ref('');
const secretCopied = ref(false);

const path = () => `/api/v1/visual-regression/projects/${encodeURIComponent(props.projectId)}/notifications`;

const view = (type) => channels.value.find((c) => c.type === type) ?? { type, enabled: false, configured: false };
const unavailable = (type) => availability.value[type]?.available === false;

const state = (type) => {
  if (unavailable(type)) return { label: 'Not set up on this server', tone: 'warning' };
  const channel = view(type);
  if (!channel.configured) return { label: type === 'email' ? 'No recipients' : 'No URL saved', tone: 'neutral' };
  return channel.enabled ? { label: 'On', tone: 'success' } : { label: 'Off', tone: 'neutral' };
};

const applyChannel = (updated) => {
  const { secret, ...channel } = updated;
  channels.value = [...channels.value.filter((c) => c.type !== channel.type), channel];
  if (channel.type === 'email') drafts.value.email = (channel.recipients ?? []).join(', ');
  return secret;
};

const load = async () => {
  loadError.value = '';
  forbidden.value = false;
  try {
    const res = await apiClient.get(path());
    channels.value = res.data.channels ?? [];
    availability.value = res.data.availability ?? {};
    attempts.value = res.data.attempts ?? [];
    drafts.value.email = (view('email').recipients ?? []).join(', ');
    loaded.value = true;
  } catch (error) {
    if (error?.response?.status === 403) forbidden.value = true;
    loadError.value = apiErrorMessage(error);
  }
};

const save = async (channel) => {
  busy.value = channel.value;
  try {
    const value = drafts.value[channel.value].trim();
    const body =
      channel.value === 'email'
        ? { type: 'email', recipients: value.split(/[\s,;]+/).filter(Boolean) }
        : { type: channel.value, url: value };
    const secret = applyChannel((await apiClient.post(path(), body)).data);
    if (channel.value !== 'email') drafts.value[channel.value] = '';
    if (channel.value === 'webhook') {
      revealedSecret.value = secret ?? '';
      secretCopied.value = false;
    }
    showNotice(`${channel.label} saved.`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, `${channel.label} couldn't be saved.`), 'error');
  } finally {
    busy.value = '';
  }
};

const setEnabled = async (channel, enabled) => {
  busy.value = channel.value;
  try {
    applyChannel((await apiClient.post(path(), { type: channel.value, enabled })).data);
  } catch (error) {
    showNotice(apiErrorMessage(error, `${channel.label} couldn't be turned ${enabled ? 'on' : 'off'}.`), 'error');
  } finally {
    busy.value = '';
  }
};

const remove = async (channel) => {
  busy.value = channel.value;
  try {
    await apiClient.delete(`${path()}/${channel.value}`);
    channels.value = channels.value.filter((c) => c.type !== channel.value);
    if (channel.value === 'email') drafts.value.email = '';
    if (channel.value === 'webhook') revealedSecret.value = '';
    showNotice(`${channel.label} notifications removed.`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, `${channel.label} couldn't be removed.`), 'error');
  } finally {
    busy.value = '';
  }
};

const sendTest = async (channel) => {
  testing.value = channel.value;
  try {
    const attempt = (await apiClient.post(`${path()}/${channel.value}/test`)).data;
    attempts.value = [attempt, ...attempts.value.filter((a) => a.id !== attempt.id)];
    if (attempt.status === 'sent') showNotice(channel.value === 'email' ? 'Test email sent.' : `Test sent to ${channel.label}.`, 'success');
    else showNotice(`The test to ${channel.label} wasn't delivered: ${attempt.error || attempt.status}`, 'error');
  } catch (error) {
    showNotice(apiErrorMessage(error, `The test to ${channel.label} couldn't be sent.`), 'error');
  } finally {
    testing.value = '';
  }
};

const copySecret = async () => {
  try {
    await navigator.clipboard.writeText(revealedSecret.value);
    secretCopied.value = true;
  } catch {
    showNotice('Copy the secret by selecting it.', 'error');
  }
};

onMounted(load);
watch(() => props.projectId, load);
</script>
