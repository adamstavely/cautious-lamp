import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DesignExtractionService } from './design-extraction.service';

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
  ) {}

  @Post('extract')
  async extract(
    @Body() body: ExtractRequestDto,
  ) {

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

    if (urlTrimmed.length > 2048) {
      throw new BadRequestException('URL is too long');
    }

    // The service rejects non-public addresses and maps failures to 4xx/5xx
    const result = await this.extractionService.extractAndTransform(
      urlTrimmed,
      body.options || {},
    );

    return {
      success: true,
      url: result.raw.url,
      extractedAt: result.raw.extractedAt,
      raw: result.raw,
      dtcg: result.dtcg,
    };
  }
}
