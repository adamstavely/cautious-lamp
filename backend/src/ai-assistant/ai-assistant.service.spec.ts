import { BadGatewayException, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';

const create = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  const actual = jest.requireActual('@anthropic-ai/sdk');
  const Anthropic = jest.fn().mockImplementation(() => ({ beta: { messages: { create } } }));
  // The error classes are named exports; the class's own statics aren't enumerable
  Object.assign(Anthropic, actual);
  return { __esModule: true, default: Anthropic };
});

import { AuthPrincipal } from '../auth/principal';
import { ComponentAccessService } from '../design-system/component-access.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { createDesignSystemService } from '../design-system/testing/in-memory-stores';
import { PatternsLibraryService } from '../patterns-library/patterns-library.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { AI_MODEL, AiAssistantService, conversation } from './ai-assistant.service';

const principal = { type: 'user', id: 'usr_ann', email: 'ann@example.com', name: 'Ann', roles: [], permissions: new Set(), mustChangePassword: false } as AuthPrincipal;

/** A Messages API reply whose text is `output` as JSON */
const reply = (output: unknown, overrides: Record<string, unknown> = {}) => ({
  model: AI_MODEL,
  stop_reason: 'end_turn',
  content: [{ type: 'text', text: typeof output === 'string' ? output : JSON.stringify(output) }],
  ...overrides,
});

describe('AiAssistantService', () => {
  const originalEnv = { ...process.env };
  let designSystem: DesignSystemService;
  beforeAll(async () => {
    designSystem = await createDesignSystemService();
    // Ann may see the library components but not Alpha's private one
    await designSystem.createComponent({ id: 'alpha-secret', name: 'AlphaSecret', description: 'Alpha only', workspaceId: 'ws_alpha' });
  });
  const access = {
    list: jest.fn(async () => designSystem.getAllComponents().filter((c) => !c.workspaceId)),
  } as unknown as ComponentAccessService;
  const service = () => new AiAssistantService(designSystem, access, new PatternsLibraryService(new InMemoryStore(), new InMemoryStore()));

  beforeEach(() => {
    create.mockReset();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reports whether Claude is configured', () => {
    expect(service().status()).toEqual({ configured: true, model: AI_MODEL });
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
    expect(service().status()).toEqual({ configured: false, model: AI_MODEL });
  });

  describe('chat', () => {
    it('returns 503 when no Anthropic credentials are configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_AUTH_TOKEN;
      const result = service().chat(principal, { message: 'Which buttons are there?' });
      await expect(result).rejects.toBeInstanceOf(ServiceUnavailableException);
      await expect(result).rejects.toThrow('Eero is not configured. Set ANTHROPIC_API_KEY on the backend.');
      expect(create).not.toHaveBeenCalled();
    });

    it('sends the conversation with the design system as context and returns the widget shape', async () => {
      create.mockResolvedValue(
        reply({
          answer: 'Button has three variants: primary, secondary and tertiary.',
          followUps: ['What sizes does Button have?', ' ', 'When should I use tertiary?', 'More?', 'Too many'],
          componentIds: ['button', 'Button', 'made-up-widget'],
          tokenNames: ['color.button.primary', 'color.invented'],
        }),
      );

      const result = await service().chat(principal, {
        message: 'Which button variants are there?',
        conversationHistory: [
          { role: 'assistant', content: 'Hi!' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'How can I help?' },
          { role: 'user', content: 'Which button variants are there?' },
        ],
      });

      expect(result).toEqual({
        response: 'Button has three variants: primary, secondary and tertiary.',
        suggestions: ['What sizes does Button have?', 'When should I use tertiary?', 'More?'],
        relatedComponents: ['Button'],
        relatedTokens: ['color.button.primary'],
        model: AI_MODEL,
      });

      const request = create.mock.calls[0][0];
      expect(request.model).toBe('claude-opus-5-5');
      expect(request.output_config.format.type).toBe('json_schema');
      expect(request.messages).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'How can I help?' },
        { role: 'user', content: 'Which button variants are there?' },
      ]);
      const context = request.system.map((block: { text: string }) => block.text).join('\n');
      expect(context).toContain('Button [id: button, production]');
      expect(context).toContain('color.primary = #4f46e5');
      expect(context).toContain('Accessible Modal'); // a pattern
      expect(context).toContain('Hardcoded Colors'); // a compliance rule
      expect(context).toContain('docs/colors.md'); // a guideline doc
      expect(request.system[1].cache_control).toEqual({ type: 'ephemeral' });
    });

    it('only describes components the caller may see', async () => {
      create.mockResolvedValue(reply({ answer: 'There is no such component.', followUps: [], componentIds: ['alpha-secret'], tokenNames: [] }));
      const result = await service().chat(principal, { message: 'tell me about alphasecret' });

      expect(access.list).toHaveBeenCalledWith(principal);
      expect(JSON.stringify(create.mock.calls[0][0].system)).not.toMatch(/alpha-?secret/i);
      expect(result.relatedComponents).toEqual([]);
    });

    it.each([
      ['text that is not JSON', 'Sure! Buttons come in three variants.'],
      ['a missing answer', { answer: '', followUps: [], componentIds: [], tokenNames: [] }],
      ['the wrong types', { answer: 'Hi', followUps: 'none', componentIds: [], tokenNames: [] }],
    ])('rejects %s as a bad gateway', async (_label, output) => {
      create.mockResolvedValue(reply(output));
      await expect(service().chat(principal, { message: 'Hi' })).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('reports a refusal as 422 and a cut-off answer as 502', async () => {
      create.mockResolvedValue(reply('', { stop_reason: 'refusal', content: [] }));
      await expect(service().chat(principal, { message: 'Hi' })).rejects.toBeInstanceOf(UnprocessableEntityException);
      create.mockResolvedValue(reply('{"answer": "Bu', { stop_reason: 'max_tokens' }));
      await expect(service().chat(principal, { message: 'Hi' })).rejects.toBeInstanceOf(BadGatewayException);
    });
  });

  describe('conversation', () => {
    it('keeps the latest turns within the size limits, starting with a person', () => {
      const long = 'x'.repeat(4000);
      const history = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `${i} ${long}` }) as const);
      const messages = conversation('Latest?', history);

      expect(messages.length).toBeLessThanOrEqual(12);
      expect(messages.reduce((sum, m) => sum + String(m.content).length, 0)).toBeLessThanOrEqual(24000);
      expect(messages[0].role).toBe('user');
      expect(messages[messages.length - 1]).toEqual({ role: 'user', content: 'Latest?' });
    });

    it('keeps an oversized latest message on its own', () => {
      expect(conversation('y'.repeat(4000), [{ role: 'user', content: 'z'.repeat(4000) }])).toHaveLength(2);
    });
  });

  describe('suggest', () => {
    it('returns 503 when no Anthropic credentials are configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_AUTH_TOKEN;
      await expect(service().suggest(principal, { code: '<button>x</button>' })).rejects.toThrow(
        'AI suggestions is not configured. Set ANTHROPIC_API_KEY on the backend.',
      );
      expect(create).not.toHaveBeenCalled();
    });

    it('keeps real components and tokens, and drops what the model invented', async () => {
      create.mockResolvedValue(
        reply({
          summary: 'A hand-made button with a hard-coded colour.',
          suggestions: [
            {
              title: 'Use the Button component',
              description: 'The markup re-creates Button.',
              severity: 'warning',
              category: 'components',
              componentIds: ['button', 'super-button'],
              tokenNames: ['{color.button.primary}', 'color.brand.hot-pink'],
              fix: '<Button variant="primary">Save</Button>',
            },
            {
              title: 'Use the SuperGrid component',
              description: 'Does not exist.',
              severity: 'info',
              category: 'components',
              componentIds: ['super-grid'],
              tokenNames: [],
              fix: '',
            },
            {
              title: 'Name the icon button',
              description: 'It has no accessible name.',
              severity: 'error',
              category: 'accessibility',
              componentIds: [],
              tokenNames: [],
              fix: '<button aria-label="Close">',
            },
          ],
        }),
      );

      const result = await service().suggest(principal, { code: '<button style="background:#4f46e5">Save</button>', focus: 'components' });

      expect(result.model).toBe(AI_MODEL);
      expect(result.suggestions).toEqual([
        expect.objectContaining({
          id: 's1',
          title: 'Use the Button component',
          components: [{ id: 'button', name: 'Button' }],
          tokens: [{ name: 'color.button.primary', value: '{color.primary.500}' }],
        }),
        expect.objectContaining({ id: 's2', title: 'Name the icon button', severity: 'error', components: [], tokens: [] }),
      ]);
      expect(result.removedReferences).toEqual(['super-button', 'color.brand.hot-pink', 'super-grid']);

      const request = create.mock.calls[0][0];
      expect(request.messages[0].content).toContain('<button style="background:#4f46e5">Save</button>');
      expect(request.messages[0].content).toContain('Focus on hand-written markup');
      expect(request.output_config).toMatchObject({ effort: 'medium', format: { type: 'json_schema' } });
    });

    it('rejects output that does not match the schema', async () => {
      create.mockResolvedValue(
        reply({ summary: 'x', suggestions: [{ title: 'T', description: 'D', severity: 'critical', category: 'components', componentIds: [], tokenNames: [], fix: '' }] }),
      );
      await expect(service().suggest(principal, { code: 'x' })).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('maps Anthropic errors without leaking them', async () => {
      const { AuthenticationError } = jest.requireActual('@anthropic-ai/sdk');
      create.mockRejectedValue(new AuthenticationError(401, { error: { message: 'bad key' } }, 'bad key', new Headers()));
      await expect(service().suggest(principal, { code: 'x' })).rejects.toThrow('AI suggestions is misconfigured. Check ANTHROPIC_API_KEY.');
    });
  });
});
