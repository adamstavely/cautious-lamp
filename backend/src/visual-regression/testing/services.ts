import { EncryptionService } from '../../common/security/encryption.service';
import { DeliveryOptions, DeliveryService } from '../../delivery/delivery.service';
import { DeliveryAttempt } from '../../delivery/delivery.types';
import { MailTransportFactory } from '../../delivery/mail-transport';
import { InMemoryStore } from '../../reviews/testing/in-memory-store';
import { Project as SrProject, SessionReplayService } from '../../session-replay/session-replay.service';
import { InMemoryQueryableStore } from '../../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../../workspaces/workspace-access.service';
import { WorkspaceDoc } from '../../workspaces/workspace.types';
import { ProjectAccessService, ProjectCreator } from '../project-access';
import { VisualRegressionService } from '../visual-regression.service';
import { ProjectDoc, TestRunDoc } from '../visual-regression.types';
import { VisualRegressionNotifier } from '../visual-regression-notifier';

/**
 * Visual-regression and session-replay services over in-memory stores, sharing
 * one workspace store. Pass `workspaceStore` to check access against existing
 * workspaces, and `delivery` to send build notifications somewhere local.
 */
export function createProjectServices(
  workspaceStore = new InMemoryQueryableStore<WorkspaceDoc>(),
  delivery: { options?: Partial<DeliveryOptions>; mail?: MailTransportFactory } = {},
) {
  const encryption = new EncryptionService();
  const access = new ProjectAccessService(new WorkspaceAccessService(workspaceStore));
  const vrProjects = new InMemoryQueryableStore<ProjectDoc>();
  const vrRuns = new InMemoryQueryableStore<TestRunDoc>();
  const srProjects = new InMemoryQueryableStore<SrProject>();
  const deliveryAttempts = new InMemoryStore<DeliveryAttempt>();
  const deliveryService = new DeliveryService(deliveryAttempts, delivery.mail, { smtp: null, ...delivery.options });
  const notifier = new VisualRegressionNotifier(vrProjects, deliveryService, encryption);
  const visualRegression = new VisualRegressionService(vrProjects, vrRuns, access, encryption, notifier);
  const sessionReplay = new SessionReplayService(srProjects, access, encryption);
  return {
    encryption,
    access,
    workspaceStore,
    vrProjects,
    vrRuns,
    srProjects,
    visualRegression,
    sessionReplay,
    deliveryAttempts,
    delivery: deliveryService,
    notifier,
  };
}

export const SYSTEM_CREATOR: ProjectCreator = { type: 'user', id: 'usr_test', name: 'Test User' };
