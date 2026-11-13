import { Injectable, BadRequestException, NotFoundException, ServiceUnavailableException, Logger, Optional } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const execFileAsync = promisify(execFile);

const SUMMARY_INDEX = 'design-system-photosensitivity';

export interface IRISAnalysisResult {
  frame: number;
  timestamp: string;
  flashAreaLuminance: number;
  averageLuminanceDifferenceAccumulation: number;
  flashAreaRed: number;
  averageRedDifferenceAccumulation: number;
  luminanceTransitions: number;
  redTransitions: number;
  luminanceExtendedFailCount: number;
  redExtendedFailCount: number;
  patternArea: number;
  patternDetectedLines: number;
  luminanceFrameResult: 0 | 1 | 2 | 3; // 0: pass, 1: warning, 2: extended failure, 3: failure
  redFrameResult: 0 | 1 | 2 | 3;
  patternFrameResult: 0 | 1; // 0: pass, 1: failure
}

export interface IRISSummary {
  totalFrames: number;
  luminanceFailures: number;
  redFailures: number;
  patternFailures: number;
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
  private readonly irisExecutablePath: string;
  private readonly uploadsDir: string;
  private readonly resultsDir: string;

  constructor(@Optional() private readonly elasticsearchService?: ElasticsearchService) {
    // IRIS executable path - adjust based on installation
    this.irisExecutablePath = process.env.IRIS_EXECUTABLE_PATH || 'iris';
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
    this.resultsDir = path.join(process.cwd(), 'results', 'iris');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.resultsDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directories: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze video using IRIS. The uploaded video and IRIS's raw output are
   * deleted afterwards; only the summary is kept.
   */
  async analyzeVideo(
    videoPath: string,
    options: {
      enablePatternDetection?: boolean;
      outputJson?: boolean;
    } = {}
  ): Promise<{
    summary: IRISSummary;
    results: IRISAnalysisResult[];
  }> {
    if (!await this.fileExists(videoPath)) {
      throw new BadRequestException('Uploaded video could not be found');
    }

    // The constructor starts creating these without waiting; make sure they exist
    await this.ensureDirectories();
    const outputPath = path.join(this.resultsDir, `${randomUUID()}${options.outputJson ? '.json' : '.csv'}`);
    const args = [
      '-v', videoPath,
      '-p', options.enablePatternDetection !== false ? '1' : '0',
      '-j', options.outputJson ? '1' : '0',
      '-o', outputPath,
    ];

    try {
      // execFile passes arguments directly, with no shell to interpret them
      const { stderr } = await execFileAsync(this.irisExecutablePath, args, {
        timeout: 300000, // 5 minute timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      if (stderr && !stderr.includes('warning')) {
        this.logger.warn(`IRIS stderr: ${stderr}`);
      }

      const results = await this.parseResults(outputPath, options.outputJson);
      return { summary: this.generateSummary(results), results };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`IRIS analysis failed: ${error.message}`);
      throw new ServiceUnavailableException(
        'Video analysis failed. Check that IRIS is installed and IRIS_EXECUTABLE_PATH is set.',
      );
    } finally {
      await Promise.all([fs.rm(videoPath, { force: true }), fs.rm(outputPath, { force: true })]);
    }
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
   * Parse IRIS results from CSV or JSON
   */
  private async parseResults(
    outputPath: string,
    isJson: boolean
  ): Promise<IRISAnalysisResult[]> {
    try {
      const content = await fs.readFile(outputPath, 'utf-8');

      if (isJson) {
        return JSON.parse(content);
      } else {
        // Parse CSV
        const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
          cast: (value, context) => {
            if (context.column === 'Frame') return parseInt(value);
            const columnStr = String(context.column);
            if (columnStr.includes('Area') || columnStr.includes('Accumulation')) {
              return parseFloat(value);
            }
            if (columnStr.includes('Result') || columnStr.includes('Transitions') || columnStr.includes('Count')) {
              return parseInt(value);
            }
            return value;
          },
        });

        return records.map((record: any) => ({
          frame: record.Frame || record.frame,
          timestamp: record['Time Stamp'] || record.timestamp || record['TimeStamp'],
          flashAreaLuminance: parseFloat(record['Flash Area Luminance'] || record.flashAreaLuminance || 0),
          averageLuminanceDifferenceAccumulation: parseFloat(record['Average Luminance Difference Accumulation'] || record.averageLuminanceDifferenceAccumulation || 0),
          flashAreaRed: parseFloat(record['Flash Area Red'] || record.flashAreaRed || 0),
          averageRedDifferenceAccumulation: parseFloat(record['Average Red Difference Accumulation'] || record.averageRedDifferenceAccumulation || 0),
          luminanceTransitions: parseInt(record['Luminance Transitions'] || record.luminanceTransitions || 0),
          redTransitions: parseInt(record['Red Transitions'] || record.redTransitions || 0),
          luminanceExtendedFailCount: parseInt(record['Luminance Extended Fail Count'] || record.luminanceExtendedFailCount || 0),
          redExtendedFailCount: parseInt(record['Red Extended Fail Count'] || record.redExtendedFailCount || 0),
          patternArea: parseFloat(record['Pattern Area'] || record.patternArea || 0),
          patternDetectedLines: parseInt(record['Pattern Detected Lines'] || record.patternDetectedLines || 0),
          luminanceFrameResult: parseInt(record['Luminance Frame Result'] || record.luminanceFrameResult || 0) as 0 | 1 | 2 | 3,
          redFrameResult: parseInt(record['Red Frame Result'] || record.redFrameResult || 0) as 0 | 1 | 2 | 3,
          patternFrameResult: parseInt(record['Pattern Frame Result'] || record.patternFrameResult || 0) as 0 | 1,
        }));
      }
    } catch (error: any) {
      this.logger.error(`Failed to parse IRIS results: ${error.message}`);
      throw new BadRequestException('IRIS produced results that could not be read');
    }
  }

  /**
   * Generate summary from analysis results
   */
  private generateSummary(results: IRISAnalysisResult[]): IRISSummary {
    const luminanceFailures = results.filter(r => r.luminanceFrameResult === 3).length;
    const redFailures = results.filter(r => r.redFrameResult === 3).length;
    const patternFailures = results.filter(r => r.patternFrameResult === 1).length;
    const luminanceWarnings = results.filter(r => r.luminanceFrameResult === 1 || r.luminanceFrameResult === 2).length;
    const redWarnings = results.filter(r => r.redFrameResult === 1 || r.redFrameResult === 2).length;
    
    const maxLuminanceTransitions = Math.max(...results.map(r => r.luminanceTransitions), 0);
    const maxRedTransitions = Math.max(...results.map(r => r.redTransitions), 0);

    const hasFailures = luminanceFailures > 0 || redFailures > 0 || patternFailures > 0;
    const hasWarnings = luminanceWarnings > 0 || redWarnings > 0;

    let status: 'pass' | 'warning' | 'failure' = 'pass';
    if (hasFailures) {
      status = 'failure';
    } else if (hasWarnings) {
      status = 'warning';
    }

    return {
      totalFrames: results.length,
      luminanceFailures,
      redFailures,
      patternFailures,
      luminanceWarnings,
      redWarnings,
      maxLuminanceTransitions,
      maxRedTransitions,
      hasFailures,
      hasWarnings,
      status,
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
        message: `Detected ${summary.luminanceFailures} frames with luminance flash failures (>3 flashes/second). This may cause photosensitive epileptic seizures.`,
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
        message: `Detected ${summary.redFailures} frames with red saturation flash failures (>3 flashes/second). This may cause photosensitive epileptic seizures.`,
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
        message: `Detected ${summary.luminanceWarnings} frames with luminance flash warnings (2-3 flashes/second in 5 consecutive seconds). Review for potential issues.`,
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
        message: `Detected ${summary.redWarnings} frames with red saturation flash warnings (2-3 flashes/second in 5 consecutive seconds). Review for potential issues.`,
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

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify IRIS installation
   */
  async verifyInstallation(): Promise<boolean> {
    try {
      await execFileAsync(this.irisExecutablePath, ['--version'], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

