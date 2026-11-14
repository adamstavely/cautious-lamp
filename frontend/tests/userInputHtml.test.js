// S14: the persona generator put its fields into an HTML string rendered with
// v-html, so pasted markup became live elements with event handlers. The Eero
// chat did the same with messages; it now uses Trench Coat's widget, which
// renders text only. Both must show such input as inert text.
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UserPersonaGenerator from '../src/views/UserPersonaGenerator.vue';
import { eeroReplyText, plainChatText } from '../src/utils/chatFormat.js';
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

    const preview = page.vm.$el.parentNode.querySelector('#persona-preview');
    expect(preview).not.toBeNull();
    expect(preview.querySelector('img')).toBeNull();
    expect(preview.querySelector('[onerror]')).toBeNull();
    for (const field of FIELDS) expect(preview.textContent).toContain(`${field}: ${PAYLOAD}`);
    expect(alert).not.toHaveBeenCalled();
  });
});

describe('Eero chat text', () => {
  it('passes markup through as text and drops markdown markers', () => {
    expect(plainChatText(`**Hi** ${PAYLOAD}\n\`<b>x</b>\` and *this*`)).toBe(`Hi ${PAYLOAD}\n<b>x</b> and this`);
  });

  it('names related components and tokens after the answer', () => {
    expect(eeroReplyText({ response: 'Use **Button**.', relatedComponents: ['button'], relatedTokens: ['color-primary'] })).toBe(
      'Use Button.\n\nRelated components: button\n\nRelated tokens: color-primary',
    );
  });
});
