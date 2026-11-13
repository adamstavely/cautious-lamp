import { Logger } from '@nestjs/common';
import type { ApplicationsService } from '../applications/applications.service';
import type { DesignSystemService } from '../design-system/design-system.service';
import { DesignComponent, DesignToken } from './governance.types';

/** What governance and accessibility reports need to know about an application */
export interface GovernanceApplication {
  id: string;
  name: string;
  applicationUrl?: string;
  /** Rule ids picked for the application's scans; empty or missing means every enabled rule */
  governanceRules?: string[];
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
  /** Records a completed scan (sets the application's lastScanned) */
  recordScan(id: string, at: Date): Promise<void>;
}

export const APPLICATION_DIRECTORY = Symbol('APPLICATION_DIRECTORY');

/** The design system's own components and tokens (the design-system scan scope) */
export interface DesignSystemSource {
  components(): Promise<DesignComponent[]>;
  tokens(): Promise<DesignToken[]>;
}

export const DESIGN_SYSTEM_SOURCE = Symbol('DESIGN_SYSTEM_SOURCE');

type RegistryApplication = { id: string; name: string; applicationUrl?: string; capabilities?: { governance?: { rules?: string[] } } };

const toApplication = (app: RegistryApplication | undefined): GovernanceApplication | null =>
  app
    ? { id: app.id, name: app.name, applicationUrl: app.applicationUrl || undefined, governanceRules: app.capabilities?.governance?.rules ?? [] }
    : null;

/** Applications from the application registry (ApplicationsService) */
export class RegistryApplicationDirectory implements ApplicationDirectory {
  private readonly logger = new Logger(RegistryApplicationDirectory.name);

  constructor(private readonly registry: Pick<ApplicationsService, 'find' | 'list' | 'markScanned'>) {}

  async get(id: string): Promise<GovernanceApplication | null> {
    return toApplication((await this.registry.find(id)) ?? undefined);
  }

  async list(): Promise<GovernanceApplication[]> {
    return (await this.registry.list()).map((app) => toApplication(app)!);
  }

  async recordScan(id: string, at: Date): Promise<void> {
    try {
      await this.registry.markScanned(id, at);
    } catch (error) {
      this.logger.warn(`Could not record lastScanned for application ${id}: ${(error as Error).message}`);
    }
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
