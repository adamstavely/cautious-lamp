import { EncryptionService } from '../../common/security/encryption.service';
import { Project as SrProject, SessionReplayService } from '../../session-replay/session-replay.service';
import { InMemoryQueryableStore } from '../../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../../workspaces/workspace-access.service';
import { WorkspaceDoc } from '../../workspaces/workspace.types';
import { ProjectAccessService, ProjectCreator } from '../project-access';
import { VisualRegressionService } from '../visual-regression.service';
import { ProjectDoc, TestRunDoc } from '../visual-regression.types';

/**
 * Visual-regression and session-replay services over in-memory stores, sharing
 * one workspace store. Pass `workspaceStore` to check access against existing workspaces.
 */
export function createProjectServices(workspaceStore = new InMemoryQueryableStore<WorkspaceDoc>()) {
  const encryption = new EncryptionService();
  const access = new ProjectAccessService(new WorkspaceAccessService(workspaceStore));
  const vrProjects = new InMemoryQueryableStore<ProjectDoc>();
  const vrRuns = new InMemoryQueryableStore<TestRunDoc>();
  const srProjects = new InMemoryQueryableStore<SrProject>();
  const visualRegression = new VisualRegressionService(vrProjects, vrRuns, access, encryption);
  const sessionReplay = new SessionReplayService(srProjects, access, encryption);
  return { encryption, access, workspaceStore, vrProjects, vrRuns, srProjects, visualRegression, sessionReplay };
}

export const SYSTEM_CREATOR: ProjectCreator = { type: 'user', id: 'usr_test', name: 'Test User' };
