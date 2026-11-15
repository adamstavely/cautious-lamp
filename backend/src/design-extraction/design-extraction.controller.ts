import { Controller, Post, Body } from '@nestjs/common';
import { DesignExtractionService } from './design-extraction.service';
import { ExtractRequestDto } from './design-extraction.dto';
import { strictBody } from '../governance/governance.dto';

@Controller('api/v1/design-extraction')
export class DesignExtractionController {
  constructor(
    private readonly extractionService: DesignExtractionService,
  ) {}

  @Post('extract')
  async extract(
    @Body(strictBody()) body: ExtractRequestDto,
  ) {
    // The service rejects non-public addresses and maps failures to 4xx/5xx
    const result = await this.extractionService.extractAndTransform(
      body.url,
      { ...body.options },
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
