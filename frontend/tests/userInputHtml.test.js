// S14: the persona generator put its fields into an HTML string rendered with
// v-html, so pasted markup became live elements with event handlers. The Eero
// chat did the same with messages. Both must show such input as inert text.
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UserPersonaGenerator from '../src/views/UserPersonaGenerator.vue';
import { formatChatMessage } from '../src/utils/chatFormat.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const PAYLOAD = '<img src=x onerror=alert(1)>';
const FIELDS = ['name', 'howTheySeeThemselves', 'greatEnablers', 'greatestPainPoints', 'howTheyDescribedNeeds', 'currentExperience'];

let page;
afterEach(() => {
  page?.unmount();
  page = undefined;
});

describe('UserPersonaGenerator', () => {
  it('shows pasted markup in every field as text, creating no elements or handlers', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    page = await mountView(UserPersonaGenerator);
    for (const field of FIELDS) page.state.form[field] = `${field}: ${PAYLOAD}`;
    page.state.generatePersona();
    await nextTick();

    const preview = page.vm.$el.parentNode.querySelector('.persona-preview');
    expect(preview).not.toBeNull();
    expect(preview.querySelector('img')).toBeNull();
    expect(preview.querySelector('[onerror]')).toBeNull();
    for (const field of FIELDS) expect(preview.textContent).toContain(`${field}: ${PAYLOAD}`);
    expect(alert).not.toHaveBeenCalled();
  });
});

describe('formatChatMessage (Eero chat)', () => {
  it('escapes markup in a message and keeps its own formatting', () => {
    const el = document.createElement('div');
    el.innerHTML = formatChatMessage(`**Hi** ${PAYLOAD}\n\`<b>x</b>\``);
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('code b')).toBeNull();
    expect(el.querySelector('strong')?.textContent).toBe('Hi');
    expect(el.querySelector('br')).not.toBeNull();
    expect(el.textContent).toContain(PAYLOAD);
    expect(el.querySelector('code')?.textContent).toBe('<b>x</b>');
  });
});
