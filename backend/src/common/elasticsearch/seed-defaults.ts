import { Logger } from '@nestjs/common';
import { DocumentStore, DuplicateDocumentError } from '../../reviews/document-store';

/** A marker document in a meta index ("the defaults were seeded", "this default was seeded") */
export interface SeedMarker {
  id: string;
  createdAt: string;
}

export const SEED_MARKER_PROPERTIES = {
  id: { type: 'keyword' },
  createdAt: { type: 'date' },
};

/**
 * Seeds a set of default documents once, the way the governance rules are
 * seeded (rules.service.ts). Each default is created and then recorded with
 * its own marker; the completion marker `name` is written only after every
 * default has one. A run that fails part way carries on from where it stopped
 * next time. A default that has a marker but no document was deleted on
 * purpose and is not recreated.
 *
 * Defaults need stable ids, so the markers can name them.
 */
export class DefaultsSeeder<T extends { id: string }> {
  private readonly logger: Logger;
  private seeded: Promise<void> | null = null;

  constructor(
    private readonly store: DocumentStore<T>,
    private readonly meta: DocumentStore<SeedMarker>,
    private readonly name: string,
    private readonly defaults: () => T[],
  ) {
    this.logger = new Logger(`DefaultsSeeder:${name}`);
  }

  /** Seeds on first call; a failed run is retried by the next call */
  ensureSeeded(): Promise<void> {
    if (!this.seeded) {
      this.seeded = this.seed().catch((error) => {
        this.seeded = null;
        throw error;
      });
    }
    return this.seeded;
  }

  /** For onModuleInit: the app starts without Elasticsearch, so a failure is logged and retried on first use */
  seedInBackground(): void {
    this.ensureSeeded().catch((error) => this.logger.warn(`Defaults not seeded yet: ${(error as Error).message}`));
  }

  private async seed(): Promise<void> {
    if (await this.meta.get(this.name)) return;
    const defaults = this.defaults();
    const now = new Date().toISOString();
    let created = 0;
    for (const doc of defaults) {
      if (await this.meta.get(this.markerFor(doc.id))) continue;
      // Document first, then its marker: a marker never stands for a document that wasn't written
      try {
        await this.store.create(doc);
        created++;
      } catch (error) {
        if (!(error instanceof DuplicateDocumentError)) throw error;
      }
      await this.mark(this.markerFor(doc.id), now);
    }
    await this.mark(this.name, now);
    if (created) this.logger.log(`Seeded ${created} default(s)`);
  }

  private markerFor(id: string): string {
    return `${this.name}:${id}`;
  }

  private async mark(id: string, createdAt: string): Promise<void> {
    try {
      await this.meta.create({ id, createdAt });
    } catch (error) {
      if (!(error instanceof DuplicateDocumentError)) throw error;
    }
  }
}
