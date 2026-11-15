import { Logger } from '@nestjs/common';
import type { ApplicationsService, ScanKind } from '../applications/applications.service';
import type { DesignSystemService } from '../design-system/design-system.service';
import { DesignComponent, DesignToken } from './governance.types';

/** What governance and accessibility reports need to know about an application */
export interface GovernanceApplication {
  id: string;
  name: string;
  applicationUrl?: string;
  /** Rule ids picked for the application's scans; empty or missing means every enabled rule */
  governanceRules?: string[];
  /** Whether governance is turned on for the application */
  governanceEnabled?: boolean;
  /** daily and weekly are run by GovernanceScanScheduler; anything else is manual */
  scanSchedule?: string;
  /** Last governance scan (ISO date). Accessibility reports don't set it. */
  lastScan?: string;
  /** Last accessibility report (ISO date) */
  lastAccessibilityReport?: string;
  /** Owning workspace; null when it has none. Decides who reads its scans and reports (evidence-access.ts). */
  workspaceId?: string | null;
}

/**
 * Where applications come from, and where "this application was scanned" is
 * recorded. Governance and accessibility reports only use this interface,
 * bound to APPLICATION_DIRECTORY, which is the application registry
 * (RegistryApplicationDirectory over ApplicationsService).
 */
export interface ApplicationDirectory {
  get(id: string): Promise<GovernanceApplication | null>;
  list(): Promise<GovernanceApplication[]>;
  /**
   * Records a completed scan of one kind: a governance scan sets the
   * governance lastScan the scheduler reads, an accessibility report only its
   * own timestamp. Both set lastScanned.
   */
  recordScan(id: string, at: Date, kind: ScanKind): Promise<void>;
  /** Runs `listener` after an application is deleted, so its dependants can be removed */
  onDeleted?(listener: (applicationId: string) => Promise<void>): void;
}

export const APPLICATION_DIRECTORY = Symbol('APPLICATION_DIRECTORY');

/** The design system's own components and tokens (the design-system scan scope) */
export interface DesignSystemSource {
  /** Every component, with its workspace fields; scans filter them by the caller's read scope */
  components(): Promise<DesignComponent[]>;
  tokens(): Promise<DesignToken[]>;
}

export const DESIGN_SYSTEM_SOURCE = Symbol('DESIGN_SYSTEM_SOURCE');

type RegistryApplication = {
  id: string;
  name: string;
  applicationUrl?: string;
  workspaceId?: string | null;
  lastAccessibilityReport?: string;
  capabilities?: { governance?: { enabled?: boolean; rules?: string[]; scanSchedule?: string; lastScan?: string } };
};

const toApplication = (app: RegistryApplication | undefined): GovernanceApplication | null => {
  if (!app) return null;
  const governance = app.capabilities?.governance;
  return {
    id: app.id,
    name: app.name,
    applicationUrl: app.applicationUrl || undefined,
    governanceRules: governance?.rules ?? [],
    governanceEnabled: !!governance?.enabled,
    scanSchedule: governance?.scanSchedule ?? 'manual',
    lastScan: governance?.lastScan,
    lastAccessibilityReport: app.lastAccessibilityReport,
    workspaceId: app.workspaceId ?? null,
  };
};

/** Applications from the application registry (ApplicationsService) */
export class RegistryApplicationDirectory implements ApplicationDirectory {
  private readonly logger = new Logger(RegistryApplicationDirectory.name);

  constructor(private readonly registry: Pick<ApplicationsService, 'find' | 'list' | 'markScanned'> & Partial<Pick<ApplicationsService, 'onDeleted'>>) {}

  async get(id: string): Promise<GovernanceApplication | null> {
    return toApplication((await this.registry.find(id)) ?? undefined);
  }

  async list(): Promise<GovernanceApplication[]> {
    return (await this.registry.list()).map((app) => toApplication(app)!);
  }

  async recordScan(id: string, at: Date, kind: ScanKind): Promise<void> {
    try {
      await this.registry.markScanned(id, at, kind);
    } catch (error) {
      this.logger.warn(`Could not record lastScanned for application ${id}: ${(error as Error).message}`);
    }
  }

  onDeleted(listener: (applicationId: string) => Promise<void>): void {
    this.registry.onDeleted?.((app) => listener(app.id));
  }
}

/** Components and tokens as DesignSystemService keeps them today */
export class DesignSystemServiceSource implements DesignSystemSource {
  constructor(private readonly designSystem: DesignSystemService) {}

  async components(): Promise<DesignComponent[]> {
    return (await this.designSystem.getAllComponents()) ?? [];
  }

  async tokens(): Promise<DesignToken[]> {
    return (await this.designSystem.getAllTokens()) ?? [];
  }
}
