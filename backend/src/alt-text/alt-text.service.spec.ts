import { ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';

const create = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  const actual = jest.requireActual('@anthropic-ai/sdk');
  const Anthropic = jest.fn().mockImplementation(() => ({ beta: { messages: { create } } }));
  Object.assign(Anthropic, actual.default ?? actual);
  return { __esModule: true, default: Anthropic };
});

import { AltTextService, ALT_TEXT_MODEL } from './alt-text.service';

describe('AltTextService', () => {
  const originalEnv = { ...process.env };
  const image = Buffer.from('fake-png');

  beforeEach(() => {
    create.mockReset();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 503 when no Anthropic credentials are configured', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_AUTH_TOKEN;
    await expect(new AltTextService().generate(image, 'image/png')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(create).not.toHaveBeenCalled();
  });

  it('sends the image and returns the generated text', async () => {
    create.mockResolvedValue({
      model: ALT_TEXT_MODEL,
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Bar chart of monthly sales rising from March to June' }],
    });

    const result = await new AltTextService().generate(image, 'image/png', 'Quarterly report');

    expect(result.altText).toBe('Bar chart of monthly sales rising from March to June');
    const request = create.mock.calls[0][0];
    expect(request.model).toBe(ALT_TEXT_MODEL);
    expect(request.messages[0].content[0]).toEqual({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: image.toString('base64') },
    });
    expect(request.messages[0].content[1].text).toContain('Quarterly report');
  });

  it('returns empty alt text for decorative images', async () => {
    create.mockResolvedValue({ model: ALT_TEXT_MODEL, stop_reason: 'end_turn', content: [{ type: 'text', text: 'DECORATIVE' }] });
    await expect(new AltTextService().generate(image, 'image/png')).resolves.toMatchObject({ altText: '' });
  });

  it('reports a refusal as 422', async () => {
    create.mockResolvedValue({ model: ALT_TEXT_MODEL, stop_reason: 'refusal', content: [] });
    await expect(new AltTextService().generate(image, 'image/png')).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
