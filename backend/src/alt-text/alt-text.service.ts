import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

export const ALT_TEXT_MODEL = 'claude-opus-5-5';

export type SupportedImageType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

export interface AltTextResult {
  altText: string;
  model: string;
}

const PROMPT = `Write alt text for this image, for a screen reader user.
- Describe what matters for understanding the image in context, not every detail.
- At most 125 characters. No "Image of" or "Picture of".
- If the image contains meaningful text, include it.
- If the image is purely decorative, reply with exactly: DECORATIVE
Reply with the alt text only.`;

@Injectable()
export class AltTextService {
  private readonly logger = new Logger(AltTextService.name);
  private client: Anthropic | null = null;

  /** Created on first use so the app starts without Anthropic credentials */
  private getClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
      throw new ServiceUnavailableException(
        'Alt text generation is not configured. Set ANTHROPIC_API_KEY on the backend.',
      );
    }
    this.client ??= new Anthropic();
    return this.client;
  }

  async generate(image: Buffer, mediaType: SupportedImageType, context?: string): Promise<AltTextResult> {
    const client = this.getClient();
    const text = context?.trim()
      ? `${PROMPT}\n\nWhere the image appears: ${context.trim().slice(0, 500)}`
      : PROMPT;

    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await client.beta.messages.create({
        model: ALT_TEXT_MODEL,
        max_tokens: 2000,
        output_config: { effort: 'low' },
        // On a safety decline, retry on a fallback model chosen by the API
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: image.toString('base64') } },
              { type: 'text', text },
            ],
          },
        ],
      });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
        this.logger.error(`Anthropic credentials rejected: ${error.message}`);
        throw new ServiceUnavailableException('Alt text generation is misconfigured. Check ANTHROPIC_API_KEY.');
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException('Alt text generation is busy, please try again shortly.');
      }
      if (error instanceof Anthropic.BadRequestError) {
        this.logger.warn(`Anthropic rejected the request: ${error.message}`);
        throw new UnprocessableEntityException('This image could not be processed. Try a PNG or JPEG under 5MB.');
      }
      if (error instanceof Anthropic.APIError) {
        this.logger.error(`Anthropic API error ${error.status}: ${error.message}`);
        throw new BadGatewayException('Alt text generation failed, please try again.');
      }
      throw error;
    }

    if (response.stop_reason === 'refusal') {
      throw new UnprocessableEntityException('Alt text could not be generated for this image.');
    }

    const altText = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('')
      .trim();
    if (!altText) {
      throw new BadGatewayException('Alt text generation returned no text, please try again.');
    }

    return { altText: altText === 'DECORATIVE' ? '' : altText, model: response.model };
  }
}
