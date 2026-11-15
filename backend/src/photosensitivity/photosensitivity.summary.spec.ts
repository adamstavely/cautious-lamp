import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { PhotosensitivityService } from './photosensitivity.service';

const user = (id: string, permissions: string[] = []) =>
  ({ type: 'user', id, email: `${id}@example.com`, name: id, roles: [], permissions: new Set(permissions), mustChangePassword: false }) as unknown as AuthPrincipal;

const alice = user('usr_alice');
const bob = user('usr_bob');
const admin = user('usr_admin', [Permission.ADMIN_USERS]);

const record = {
  videoName: 'intro.mp4',
  applicationName: 'Shop',
  summary: { totalFrames: 10 } as any,
  resultsCount: 10,
};

function fakeElasticsearch() {
  const docs = new Map<string, unknown>();
  return {
    docs,
    failWrites: false,
    async index({ id, document }: { id: string; document: unknown }) {
      if (this.failWrites) throw Object.assign(new Error('cluster unavailable'), { meta: { statusCode: 503 } });
      docs.set(id, structuredClone(document));
    },
    async get({ id }: { id: string }) {
      if (!docs.has(id)) throw Object.assign(new Error('not found'), { meta: { statusCode: 404 } });
      return { _source: structuredClone(docs.get(id)) };
    },
  };
}

describe('Photosensitivity summaries', () => {
  it("stores the owner and only shows a summary to them or an admin; others get 404", async () => {
    const es = fakeElasticsearch();
    const service = new PhotosensitivityService(es as any);
    const id = await service.saveSummary(record, alice);
    expect(es.docs.get(id)).toMatchObject({ analysisId: id, owner: { type: 'user', id: 'usr_alice' } });

    expect(await service.getSummary(alice, id)).toMatchObject({ videoName: 'intro.mp4' });
    expect(await service.getSummary(admin, id)).toMatchObject({ videoName: 'intro.mp4' });
    await expect(service.getSummary(bob, id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getSummary(alice, 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps summaries stored before owners were recorded for admins', async () => {
    const es = fakeElasticsearch();
    es.docs.set('old', { ...record, analysisId: 'old' });
    const service = new PhotosensitivityService(es as any);
    await expect(service.getSummary(alice, 'old')).rejects.toBeInstanceOf(NotFoundException);
    expect(await service.getSummary(admin, 'old')).toMatchObject({ analysisId: 'old' });
  });

  it('hands out no id when the summary could not be stored', async () => {
    const es = fakeElasticsearch();
    es.failWrites = true;
    await expect(new PhotosensitivityService(es as any).saveSummary(record, alice)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(es.docs.size).toBe(0);
    await expect(new PhotosensitivityService().saveSummary(record, alice)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
