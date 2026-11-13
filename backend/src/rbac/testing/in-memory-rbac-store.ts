import { DocVersion, StoredDoc, VersionConflictError } from '../../reviews/document-store';
import { RbacStore, RoleDoc, UserRoleDoc, assignmentId } from '../rbac.store';

/** In-memory RbacStore with the same semantics as the Elasticsearch one, for tests */
export class InMemoryRbacStore implements RbacStore {
  readonly roles = new Map<string, { doc: RoleDoc; seqNo: number }>();
  readonly assignments = new Map<string, UserRoleDoc>();
  private seq = 0;
  /** Set to make every call fail like an unreachable Elasticsearch */
  failWith?: Error;

  async init(): Promise<void> {
    this.check();
  }

  async getRole(id: string): Promise<StoredDoc<RoleDoc> | null> {
    this.check();
    const entry = this.roles.get(id);
    if (!entry) return null;
    return { doc: structuredClone(entry.doc), version: { seqNo: entry.seqNo, primaryTerm: 1 } };
  }

  async listRoles(): Promise<RoleDoc[]> {
    this.check();
    return [...this.roles.values()].map((entry) => structuredClone(entry.doc));
  }

  async createRole(role: RoleDoc): Promise<boolean> {
    this.check();
    if (this.roles.has(role.id)) return false;
    this.roles.set(role.id, { doc: structuredClone(role), seqNo: ++this.seq });
    return true;
  }

  async replaceRole(role: RoleDoc, version: DocVersion): Promise<void> {
    this.check();
    const entry = this.roles.get(role.id);
    if (!entry || entry.seqNo !== version.seqNo) throw new VersionConflictError(role.id);
    this.roles.set(role.id, { doc: structuredClone(role), seqNo: ++this.seq });
  }

  async putAssignment(assignment: UserRoleDoc): Promise<void> {
    this.check();
    this.assignments.set(assignmentId(assignment.userId, assignment.roleId), structuredClone(assignment));
  }

  async deleteAssignment(userId: string, roleId: string): Promise<boolean> {
    this.check();
    return this.assignments.delete(assignmentId(userId, roleId));
  }

  async assignmentsForUsers(userIds: string[]): Promise<UserRoleDoc[]> {
    this.check();
    const wanted = new Set(userIds);
    return [...this.assignments.values()].filter((a) => wanted.has(a.userId)).map((a) => structuredClone(a));
  }

  async assignmentsForRoles(roleIds: string[]): Promise<UserRoleDoc[]> {
    this.check();
    const wanted = new Set(roleIds);
    return [...this.assignments.values()].filter((a) => wanted.has(a.roleId)).map((a) => structuredClone(a));
  }

  private check(): void {
    if (this.failWith) throw this.failWith;
  }
}
