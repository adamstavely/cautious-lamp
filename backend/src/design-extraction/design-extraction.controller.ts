import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DesignExtractionService } from './design-extraction.service';
import { DesignSystemService } from '../design-system/design-system.service';

export interface ExtractRequestDto {
  url: string;
  options?: {
    darkMode?: boolean;
    mobile?: boolean;
    slow?: boolean;
  };
}

@Controller('api/v1/design-extraction')
export class DesignExtractionController {
  constructor(
    private readonly extractionService: DesignExtractionService,
    private readonly designSystemService: DesignSystemService,
  ) {}

  private extractApiKey(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return authHeader;
  }

  private validateRequest(authHeader: string | undefined): void {
    const apiKey = this.extractApiKey(authHeader);
    if (!apiKey || !this.designSystemService.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
  }

  @Post('extract')
  async extract(
    @Body() body: ExtractRequestDto,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);

    // Validate request body
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Request body is required');
    }

    if (!body.url || typeof body.url !== 'string') {
      throw new BadRequestException('URL is required and must be a string');
    }

    // Validate URL format
    const urlTrimmed = body.url.trim();
    if (!urlTrimmed) {
      throw new BadRequestException('URL cannot be empty');
    }

    // Check if URL looks valid (basic check)
    if (urlTrimmed.includes('Cannot POST') || urlTrimmed.includes('Error') || urlTrimmed.startsWith('http://localhost') || urlTrimmed.includes('/api/')) {
      throw new BadRequestException(`Invalid URL format: ${urlTrimmed}. Please provide a valid website URL.`);
    }

    try {
      const result = await this.extractionService.extractAndTransform(
        urlTrimmed,
        body.options || {},
      );

      return {
        success: true,
        url: body.url,
        extractedAt: result.raw.extractedAt,
        raw: result.raw,
        dtcg: result.dtcg,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to extract design tokens: ${error.message}`,
      );
    }
  }
}

