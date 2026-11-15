/**
 * Daily system-health snapshots (Elasticsearch). A snapshot keeps the raw
 * inputs, not just the score: every component's status and every
 * application's compliance score and the components it uses. Each caller's
 * trend is recomputed from the parts of a snapshot they can read, so one
 * workspace's figures never shape another's history.
 */

export const HEALTH_SNAPSHOTS_INDEX = 'design-system-health-snapshots';
export const HEALTH_SNAPSHOT_STORE = Symbol('HEALTH_SNAPSHOT_STORE');

export interface SnapshotComponent {
  id: string;
  status: string;
}

export interface SnapshotApplication {
  id: string;
  /** Latest accessibility report score; null without a report */
  complianceScore: number | null;
  /** Whether a governance scan has recorded its component usage */
  scanned: boolean;
  /** Components that usage includes */
  componentIds: string[];
}

/** What a health score is computed from */
export interface HealthInputs {
  components: SnapshotComponent[];
  applications: SnapshotApplication[];
}

export interface HealthSnapshotDoc extends HealthInputs {
  /** `health-<YYYY-MM-DD>`: one per UTC day, however many instances take it */
  id: string;
  /** The UTC day (YYYY-MM-DD) */
  date: string;
  createdAt: string;
}

export const snapshotId = (date: string) => `health-${date}`;

export const HEALTH_SNAPSHOT_PROPERTIES = {
  id: { type: 'keyword' },
  date: { type: 'keyword' },
  createdAt: { type: 'date' },
};
