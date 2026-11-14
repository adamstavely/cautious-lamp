import { Injectable, NotFoundException, ServiceUnavailableException, UnprocessableEntityException, Logger, Optional } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IRISAnalysisResult,
  IrisAnalysisError,
  IrisLocation,
  IrisSettings,
  IrisUnavailableError,
  irisSettingsFromEnv,
  locateIris,
  runIris,
} from './iris-runner';

export type { IRISAnalysisResult } from './iris-runner';

const SUMMARY_INDEX = 'design-system-photosensitivity';

export interface IRISSummary {
  totalFrames: number;
  /** Frames failing for luminance flashes: flash failures and extended failures */
  luminanceFailures: number;
  /** Of those, extended failures (2-3 flashes per second sustained over 5 seconds) */
  luminanceExtendedFailures: number;
  redFailures: number;
  redExtendedFailures: number;
  patternFailures: number;
  /** Frames that pass with a warning (approaching the flash threshold) */
  luminanceWarnings: number;
  redWarnings: number;
  maxLuminanceTransitions: number;
  maxRedTransitions: number;
  hasFailures: boolean;
  hasWarnings: boolean;
  status: 'pass' | 'warning' | 'failure';
}

@Injectable()
export class PhotosensitivityService {
  private readonly logger = new Logger(PhotosensitivityService.name);
  private readonly iris: IrisSettings;
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'videos');

  constructor(@Optional() private readonly elasticsearchService?: ElasticsearchService) {
    this.iris = irisSettingsFromEnv();
    // Multer writes uploads here before analysis
    fs.mkdir(this.uploadsDir, { recursive: true }).catch((error) =>
      this.logger.error(`Failed to create the upload directory: ${(error as Error).message}`),
    );
  }

  /**
   * Analyses a video with IRIS. The uploaded video and IRIS's output are
   * deleted afterwards; only the summary is kept. 503 when IRIS isn't
   * installed, 422 when it can't analyse the video.
   */
  async analyzeVideo(
    videoPath: string,
    options: { enablePatternDetection?: boolean } = {},
  ): Promise<{ summary: IRISSummary; results: IRISAnalysisResult[] }> {
    try {
      const results = await runIris(videoPath, { patternDetection: options.enablePatternDetection !== false }, this.iris);
      return { summary: this.generateSummary(results), results };
    } catch (error) {
      if (error instanceof IrisUnavailableError) throw new ServiceUnavailableException(error.message);
      if (error instanceof IrisAnalysisError) {
        this.logger.warn(`IRIS analysis failed: ${error.message}`);
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }

  /** Whether IRIS can run here, without running it */
  status(): Promise<IrisLocation> {
    return locateIris(this.iris);
  }

  /**
   * Store an analysis summary so it can be fetched again later
   */
  async saveSummary(record: {
    videoName: string;
    applicationName: string;
    summary: IRISSummary;
    resultsCount: number;
  }): Promise<string> {
    const analysisId = randomUUID();
    if (!this.elasticsearchService) return analysisId;
    try {
      await this.elasticsearchService.index({
        index: SUMMARY_INDEX,
        id: analysisId,
        document: { ...record, analysisId, createdAt: new Date().toISOString() },
      });
    } catch (error: any) {
      // The analysis itself succeeded, so return it; it just can't be looked up later
      this.logger.warn(`Could not store photosensitivity summary: ${error.message}`);
    }
    return analysisId;
  }

  async getSummary(analysisId: string) {
    if (!this.elasticsearchService) {
      throw new ServiceUnavailableException('Analysis storage is not configured');
    }
    try {
      const result = await this.elasticsearchService.get({ index: SUMMARY_INDEX, id: analysisId });
      return result._source;
    } catch (error: any) {
      if (error?.meta?.statusCode === 404) {
        throw new NotFoundException(`Analysis ${analysisId} not found`);
      }
      throw new ServiceUnavailableException('Analysis storage is unavailable, please try again later');
    }
  }

  /**
   * Generate summary from analysis results
   */
  private generateSummary(results: IRISAnalysisResult[]): IRISSummary {
    // IRIS FlashResult: 1 pass with warning, 2 extended failure, 3 flash failure
    const count = (pick: (r: IRISAnalysisResult) => boolean) => results.filter(pick).length;
    const luminanceFailures = count((r) => r.luminanceFrameResult >= 2);
    const redFailures = count((r) => r.redFrameResult >= 2);
    const patternFailures = count((r) => r.patternFrameResult === 1);
    const luminanceWarnings = count((r) => r.luminanceFrameResult === 1);
    const redWarnings = count((r) => r.redFrameResult === 1);
    const hasFailures = luminanceFailures > 0 || redFailures > 0 || patternFailures > 0;
    const hasWarnings = luminanceWarnings > 0 || redWarnings > 0;

    return {
      totalFrames: results.length,
      luminanceFailures,
      luminanceExtendedFailures: count((r) => r.luminanceFrameResult === 2),
      redFailures,
      redExtendedFailures: count((r) => r.redFrameResult === 2),
      patternFailures,
      luminanceWarnings,
      redWarnings,
      maxLuminanceTransitions: results.reduce((max, r) => Math.max(max, r.luminanceTransitions), 0),
      maxRedTransitions: results.reduce((max, r) => Math.max(max, r.redTransitions), 0),
      hasFailures,
      hasWarnings,
      status: hasFailures ? 'failure' : hasWarnings ? 'warning' : 'pass',
    };
  }

  /**
   * Convert IRIS results to compliance checks for rules engine
   */
  convertToComplianceChecks(
    summary: IRISSummary,
    applicationName: string,
    videoPath?: string
  ): Array<{
    id: string;
    rule: string;
    status: 'pass' | 'warning' | 'error';
    message: string;
    application?: string;
    file?: string;
    impact?: 'minor' | 'moderate' | 'serious' | 'critical';
  }> {
    const checks = [];

    // Luminance flash failures
    if (summary.luminanceFailures > 0) {
      checks.push({
        id: `iris-luminance-failure-${Date.now()}`,
        rule: 'Photosensitivity: Luminance Flashes',
        status: 'error' as const,
        message: `Detected ${summary.luminanceFailures} frames failing for luminance flashes: more than 3 flashes in a second${summary.luminanceExtendedFailures ? `, or 2-3 flashes a second sustained over 5 seconds (${summary.luminanceExtendedFailures} of them)` : ''}. This may cause photosensitive epileptic seizures.`,
        application: applicationName,
        file: videoPath,
        impact: 'critical' as const,
      });
    }

    // Red saturation flash failures
    if (summary.redFailures > 0) {
      checks.push({
        id: `iris-red-failure-${Date.now()}`,
        rule: 'Photosensitivity: Red Saturation Flashes',
        status: 'error' as const,
        message: `Detected ${summary.redFailures} frames failing for red saturation flashes: more than 3 flashes in a second${summary.redExtendedFailures ? `, or 2-3 flashes a second sustained over 5 seconds (${summary.redExtendedFailures} of them)` : ''}. This may cause photosensitive epileptic seizures.`,
        application: applicationName,
        file: videoPath,
        impact: 'critical' as const,
      });
    }

    // Pattern failures
    if (summary.patternFailures > 0) {
      checks.push({
        id: `iris-pattern-failure-${Date.now()}`,
        rule: 'Photosensitivity: Spatial Patterns',
        status: 'error' as const,
        message: `Detected ${summary.patternFailures} frames with harmful spatial patterns (present for ≥0.5 seconds). This may cause photosensitive epileptic seizures.`,
        application: applicationName,
        file: videoPath,
        impact: 'critical' as const,
      });
    }

    // Luminance warnings
    if (summary.luminanceWarnings > 0) {
      checks.push({
        id: `iris-luminance-warning-${Date.now()}`,
        rule: 'Photosensitivity: Luminance Flashes',
        status: 'warning' as const,
        message: `Detected ${summary.luminanceWarnings} frames with luminance flash warnings (more than 2 flashes in a second, below the failure threshold). Review for potential issues.`,
        application: applicationName,
        file: videoPath,
        impact: 'serious' as const,
      });
    }

    // Red warnings
    if (summary.redWarnings > 0) {
      checks.push({
        id: `iris-red-warning-${Date.now()}`,
        rule: 'Photosensitivity: Red Saturation Flashes',
        status: 'warning' as const,
        message: `Detected ${summary.redWarnings} frames with red saturation flash warnings (more than 2 flashes in a second, below the failure threshold). Review for potential issues.`,
        application: applicationName,
        file: videoPath,
        impact: 'serious' as const,
      });
    }

    // Pass check if no issues
    if (!summary.hasFailures && !summary.hasWarnings) {
      checks.push({
        id: `iris-pass-${Date.now()}`,
        rule: 'Photosensitivity Analysis',
        status: 'pass' as const,
        message: 'No photosensitivity issues detected. Video content appears safe for photosensitive viewers.',
        application: applicationName,
        file: videoPath,
        impact: 'minor' as const,
      });
    }

    return checks;
  }
}
