import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { Permission } from '../../rbac/rbac.service';
import { ReviewFilesService } from '../review-files.service';
import { ActingUser, ReviewDoc, Team } from '../review.types';
import { ReviewsService } from '../reviews.service';
import { TeamsService } from '../teams.service';
import { InMemoryStore } from './in-memory-store';

/** A ReviewsService over in-memory stores and a temporary upload directory */
export function createHarness() {
  const dir = mkdtempSync(path.join(tmpdir(), 'reviews-test-'));
  const saved = {
    REVIEW_UPLOAD_DIR: process.env.REVIEW_UPLOAD_DIR,
    REVIEW_FILE_SECRET: process.env.REVIEW_FILE_SECRET,
  };
  process.env.REVIEW_UPLOAD_DIR = dir;
  process.env.REVIEW_FILE_SECRET = 'test-secret';
  const store = new InMemoryStore<ReviewDoc>();
  const teamStore = new InMemoryStore<Team>();
  const files = new ReviewFilesService();
  const service = new ReviewsService(store, teamStore, files);
  const teams = new TeamsService(teamStore);
  return {
    dir,
    store,
    teamStore,
    files,
    service,
    teams,
    cleanup() {
      rmSync(dir, { recursive: true, force: true });
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    },
  };
}

export const designer: ActingUser = { email: 'sarah@example.com', name: 'Sarah Johnson' };
export const reviewer: ActingUser = { email: 'client@example.com', name: 'Client' };
export const anonymous: ActingUser = { email: null, name: null };

const decide = new Set<string>([Permission.REVIEW_VIEW, Permission.REVIEW_APPROVE, Permission.REVIEW_REJECT]);
/** Signed-in users holding each stage's role (review-access.ts STAGE_ROLES) */
export const client: ActingUser = { email: 'client@example.com', name: 'Client', roles: ['client'], permissions: decide };
export const artDirector: ActingUser = { email: 'ad@x.com', name: 'AD', roles: ['art_director'], permissions: decide };
export const creativeDirector: ActingUser = { email: 'cd@x.com', name: 'CD', roles: ['creative_director'], permissions: decide };
export const reviewAdmin: ActingUser = {
  email: 'manager@x.com',
  name: 'Manager',
  roles: ['review_manager'],
  permissions: new Set<string>([...decide, Permission.REVIEW_ADMIN]),
};

/** Smallest valid file bodies for each accepted type */
export const SAMPLE_FILES = {
  pdf: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]),
  svg: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
};
