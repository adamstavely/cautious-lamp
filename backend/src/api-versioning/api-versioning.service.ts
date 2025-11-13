import { Injectable } from '@nestjs/common';

export interface ApiVersion {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  releaseDate: Date;
  sunsetDate?: Date;
  breakingChanges?: string[];
  migrationGuide?: string;
}

@Injectable()
export class ApiVersioningService {
  private versions: Map<string, ApiVersion> = new Map();

  constructor() {
    this.initializeVersions();
  }

  /**
   * Initialize API versions
   */
  private initializeVersions(): void {
    // Version 1.0.0 - Current
    this.versions.set('v1', {
      version: '1.0.0',
      status: 'current',
      releaseDate: new Date('2024-01-01'),
    });

    // Version 2.0.0 - Future (placeholder)
    this.versions.set('v2', {
      version: '2.0.0',
      status: 'current',
      releaseDate: new Date('2024-06-01'),
      breakingChanges: [
        'Component endpoints now require workspace context',
        'Token format changed to support nested structures',
        'Response format standardized across all endpoints',
      ],
      migrationGuide: 'See /api/v2/migration-guide for details',
    });
  }

  /**
   * Get all API versions
   */
  getAllVersions(): ApiVersion[] {
    return Array.from(this.versions.values()).sort((a, b) =>
      b.version.localeCompare(a.version)
    );
  }

  /**
   * Get version info
   */
  getVersion(version: string): ApiVersion | null {
    const key = version.startsWith('v') ? version : `v${version}`;
    return this.versions.get(key) || null;
  }

  /**
   * Get current version
   */
  getCurrentVersion(): ApiVersion {
    const current = Array.from(this.versions.values()).find(v => v.status === 'current');
    return current || this.versions.get('v1')!;
  }

  /**
   * Check if version is supported
   */
  isVersionSupported(version: string): boolean {
    const versionInfo = this.getVersion(version);
    if (!versionInfo) return false;
    return versionInfo.status === 'current' || versionInfo.status === 'deprecated';
  }

  /**
   * Get version routing prefix
   */
  getVersionPrefix(version: string): string {
    const key = version.startsWith('v') ? version : `v${version}`;
    return `/api/${key}`;
  }

  /**
   * Deprecate a version
   */
  deprecateVersion(version: string, sunsetDate?: Date): ApiVersion | null {
    const versionInfo = this.getVersion(version);
    if (!versionInfo) return null;

    versionInfo.status = 'deprecated';
    if (sunsetDate) {
      versionInfo.sunsetDate = sunsetDate;
    }

    const key = version.startsWith('v') ? version : `v${version}`;
    this.versions.set(key, versionInfo);
    return versionInfo;
  }
}




