import { InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService, esStatusCode, isEsNotFound } from '../common/elasticsearch/es-index.service';
import { DocVersion, StoredDoc, VersionConflictError } from '../reviews/document-store';

export const ROLES_INDEX = 'design-system-rbac-roles';
export const USER_ROLES_INDEX = 'design-system-rbac-user-roles';

/** Injection token for the RBAC storage */
export const RBAC_STORE = Symbol('RBAC_STORE');

export interface RoleDoc {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  /**
   * Default permissions already granted to this role by a release. Init only
   * adds defaults missing from this list, so a permission an admin removed
   * isn't re-added on the next restart.
   */
  defaultsApplied?: string[];
}

export interface UserRoleDoc {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy?: string;
}

/** What RbacService needs from storage. Kept small so tests can use an in-memory double. */
export interface RbacStore {
  /** Creates the indices if they don't exist */
  init(): Promise<void>;
  getRole(id: string): Promise<StoredDoc<RoleDoc> | null>;
  listRoles(): Promise<RoleDoc[]>;
  /** Returns false when a role with that id already exists */
  createRole(role: RoleDoc): Promise<boolean>;
  /** Throws VersionConflictError when the role changed since it was read */
  replaceRole(role: RoleDoc, version: DocVersion): Promise<void>;
  putAssignment(assignment: UserRoleDoc): Promise<void>;
  /** Returns false when there was no such assignment */
  deleteAssignment(userId: string, roleId: string): Promise<boolean>;
  assignmentsForUsers(userIds: string[]): Promise<UserRoleDoc[]>;
  assignmentsForRoles(roleIds: string[]): Promise<UserRoleDoc[]>;
}

/** One assignment per user and role */
export function assignmentId(userId: string, roleId: string): string {
  return `${userId}-${roleId}`;
}

const PAGE_SIZE = 1000;
const ROLE_LIMIT = 1000;
/** Most ids sent in one `terms` query */
const TERMS_CHUNK = 1000;

const keyword = { type: 'keyword' };
const date = { type: 'date' };

const ROLE_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  description: { type: 'text' },
  permissions: keyword,
  defaultsApplied: keyword,
  createdAt: date,
  updatedAt: date,
};

const USER_ROLE_PROPERTIES = {
  userId: keyword,
  roleId: keyword,
  assignedAt: date,
  assignedBy: keyword,
};

/** Elasticsearch-backed RBAC storage. Every failure throws: nothing is reported as saved that wasn't. */
export class EsRbacStore implements RbacStore {
  private readonly logger = new Logger(EsRbacStore.name);

  constructor(
    private readonly es: ElasticsearchService,
    private readonly esIndex: EsIndexService,
  ) {}

  async init(): Promise<void> {
    await this.esIndex.assertAvailable();
    await this.ensureIndex(ROLES_INDEX, ROLE_PROPERTIES);
    await this.ensureIndex(USER_ROLES_INDEX, USER_ROLE_PROPERTIES);
    await this.warnOnTextMappedIds();
  }

  /**
   * Assignment lookups are exact `term` queries. An index created before the
   * keyword index template existed maps userId/roleId as text, where those
   * queries silently match nothing.
   */
  private async warnOnTextMappedIds(): Promise<void> {
    try {
      const res = await this.es.indices.getMapping({ index: USER_ROLES_INDEX });
      const props = (Object.values(res)[0] as any)?.mappings?.properties ?? {};
      for (const field of ['userId', 'roleId']) {
        if (props[field] && props[field].type !== 'keyword') {
          this.logger.error(
            `${USER_ROLES_INDEX}.${field} is mapped as ${props[field].type}, not keyword: role lookups will fail. ` +
              'Reindex it into a new index with a keyword mapping.',
          );
        }
      }
    } catch (error) {
      this.logger.warn(`Could not check the ${USER_ROLES_INDEX} mapping: ${(error as Error)?.message}`);
    }
  }

  async getRole(id: string): Promise<StoredDoc<RoleDoc> | null> {
    try {
      const res = await this.es.get<RoleDoc>({ index: ROLES_INDEX, id });
      return { doc: res._source as RoleDoc, version: { seqNo: res._seq_no, primaryTerm: res._primary_term } };
    } catch (error) {
      if (isEsNotFound(error)) return null;
      throw this.mapError(error, 'read role');
    }
  }

  async listRoles(): Promise<RoleDoc[]> {
    // Roles are only created by init, so there are a handful; one page is plenty
    try {
      const res = await this.es.search<RoleDoc>({ index: ROLES_INDEX, size: ROLE_LIMIT, query: { match_all: {} } });
      return res.hits.hits.map((hit) => hit._source as RoleDoc);
    } catch (error) {
      if (isEsNotFound(error)) return [];
      throw this.mapError(error, 'list roles');
    }
  }

  async createRole(role: RoleDoc): Promise<boolean> {
    try {
      await this.es.index({ index: ROLES_INDEX, id: role.id, document: role, op_type: 'create', refresh: 'wait_for' });
      return true;
    } catch (error) {
      if (esStatusCode(error) === 409) return false;
      throw this.mapError(error, 'create role');
    }
  }

  async replaceRole(role: RoleDoc, version: DocVersion): Promise<void> {
    try {
      await this.es.index({
        index: ROLES_INDEX,
        id: role.id,
        document: role,
        if_seq_no: version.seqNo,
        if_primary_term: version.primaryTerm,
        refresh: 'wait_for',
      });
    } catch (error) {
      if (esStatusCode(error) === 409) throw new VersionConflictError(role.id);
      throw this.mapError(error, 'update role');
    }
  }

  async putAssignment(assignment: UserRoleDoc): Promise<void> {
    try {
      await this.es.index({
        index: USER_ROLES_INDEX,
        id: assignmentId(assignment.userId, assignment.roleId),
        document: assignment,
        refresh: 'wait_for',
      });
    } catch (error) {
      throw this.mapError(error, 'assign role');
    }
  }

  async deleteAssignment(userId: string, roleId: string): Promise<boolean> {
    try {
      await this.es.delete({ index: USER_ROLES_INDEX, id: assignmentId(userId, roleId), refresh: 'wait_for' });
      return true;
    } catch (error) {
      if (isEsNotFound(error)) return false;
      throw this.mapError(error, 'remove role');
    }
  }

  async assignmentsForUsers(userIds: string[]): Promise<UserRoleDoc[]> {
    return this.assignmentsWhere('userId', userIds);
  }

  async assignmentsForRoles(roleIds: string[]): Promise<UserRoleDoc[]> {
    return this.assignmentsWhere('roleId', roleIds);
  }

  private async assignmentsWhere(field: 'userId' | 'roleId', values: string[]): Promise<UserRoleDoc[]> {
    const results: UserRoleDoc[] = [];
    for (let i = 0; i < values.length; i += TERMS_CHUNK) {
      const chunk = values.slice(i, i + TERMS_CHUNK);
      results.push(...(await this.searchAllAssignments({ terms: { [field]: chunk } })));
    }
    return results;
  }

  /**
   * Every matching assignment, a page at a time with search_after (userId and
   * roleId together are unique), so there is no fixed cap
   */
  private async searchAllAssignments(query: Record<string, unknown>): Promise<UserRoleDoc[]> {
    const results: UserRoleDoc[] = [];
    let searchAfter: unknown[] | undefined;
    try {
      for (;;) {
        const res = await this.es.search<UserRoleDoc>({
          index: USER_ROLES_INDEX,
          size: PAGE_SIZE,
          query: query as any,
          sort: [{ userId: { order: 'asc' } }, { roleId: { order: 'asc' } }],
          search_after: searchAfter as any,
        });
        const hits = res.hits.hits;
        results.push(...hits.map((hit) => hit._source as UserRoleDoc));
        if (hits.length < PAGE_SIZE) return results;
        searchAfter = hits[hits.length - 1].sort as unknown[];
      }
    } catch (error) {
      if (isEsNotFound(error)) return results;
      throw this.mapError(error, 'search role assignments');
    }
  }

  private async ensureIndex(index: string, properties: Record<string, unknown>): Promise<void> {
    try {
      if (await this.es.indices.exists({ index })) return;
      await this.es.indices.create({ index, mappings: { properties: properties as any } });
    } catch (error) {
      const type = (error as { meta?: { body?: { error?: { type?: string } } } })?.meta?.body?.error?.type;
      if (type === 'resource_already_exists_exception') return;
      throw this.mapError(error, `create index ${index}`);
    }
  }

  private mapError(error: unknown, op: string): Error {
    const status = esStatusCode(error);
    this.logger.error(`Elasticsearch ${op} failed: ${(error as Error)?.message}`);
    if (!status || status >= 500 || status === 429) {
      return new ServiceUnavailableException('Storage is unavailable, please try again later');
    }
    return new InternalServerErrorException('Storage request failed');
  }
}
