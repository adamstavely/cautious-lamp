// Component requests on the roadmap and feedback page: the list comes from the
// API, new requests, votes and comments never send an author (the server takes
// it from the token), the author can edit and delete their own open request,
// and roadmap editors get the triage actions (status, approvals, assignment,
// priority, promote and link) that call their dedicated routes.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ComponentRequests from '../src/components/feedback/ComponentRequests.vue';
import { mountView } from './helpers/mountView.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';

const auth = { user: { id: 'usr_alice', name: 'Alice' }, permissions: new Set() };
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ user: { value: auth.user }, hasPermission: (p) => auth.permissions.has(p) }),
}));

const API = '/api/v1/component-requests';

const request = (overrides = {}) => ({
  id: 'req_1',
  title: 'Data table',
  description: 'Sortable table',
  category: 'data-display',
  priority: 'medium',
  status: 'submitted',
  requestedBy: 'usr_alice',
  requestedByName: 'Alice',
  voters: [],
  votes: 0,
  commentCount: 0,
  metadata: { designApproved: false, technicalApproved: false },
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
  ...overrides,
});

let api;
let page;

const mount = async (responses) => {
  api = stubApi(responses);
  page = await mountView(ComponentRequests);
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const buttonLabels = () => [...document.querySelectorAll('button')].map((b) => b.textContent.trim());
const callsTo = (key) => api.calls.filter((call) => call.key === key);

beforeEach(() => {
  auth.user = { id: 'usr_alice', name: 'Alice' };
  auth.permissions = new Set();
});

afterEach(() => {
  page?.unmount();
  page = null;
  api?.restore();
});

describe('Component requests', () => {
  it('lists the stored requests with their authors, or says there are none', async () => {
    await mount({ [`GET ${API}`]: [request({ requestedBy: 'usr_bob', requestedByName: 'Bob', commentCount: 2 })] });
    expect(text()).toContain('Data table');
    expect(text()).toContain('Requested by Bob');
    expect(text()).toContain('2 comments');
    page.unmount();
    api.restore();

    await mount({ [`GET ${API}`]: [] });
    expect(text()).toContain('No requests yet');
  });

  it('shows an error when the requests cannot be loaded', async () => {
    await mount({ [`GET ${API}`]: fail(503, 'Storage is unavailable, please try again later') });
    expect(text()).toContain('Storage is unavailable');
    expect(text()).not.toContain('No requests yet');
  });

  it('submits a request without an author field', async () => {
    await mount({
      [`GET ${API}`]: [],
      [`GET ${API}/duplicates`]: { isDuplicate: false, similar: [] },
      [`POST ${API}`]: (body) => request({ ...body, id: 'req_new' }),
    });
    Object.assign(page.state.createForm, { title: 'Date picker', description: 'Range selection', category: 'form-controls', priority: 'high' });
    await page.state.submitRequest();
    await flush();
    const [post] = callsTo(`POST ${API}`);
    expect(post.data).toEqual({ title: 'Date picker', description: 'Range selection', category: 'form-controls', priority: 'high' });
    expect(page.state.requests.map((r) => r.id)).toEqual(['req_new']);
  });

  it('asks before submitting a request similar to an existing one', async () => {
    await mount({
      [`GET ${API}`]: [request()],
      [`GET ${API}/duplicates`]: { isDuplicate: false, similar: [{ id: 'req_1', title: 'Data table', similarity: 90 }] },
      [`POST ${API}`]: (body) => request({ ...body, id: 'req_new' }),
    });
    Object.assign(page.state.createForm, { title: 'Data tables', description: 'x', category: 'data-display' });
    const pending = page.state.submitRequest();
    await flush();
    expect(page.state.confirmState.message).toContain('Data table');
    page.state.confirmState.resolve(false);
    await pending;
    expect(callsTo(`POST ${API}`)).toHaveLength(0);
  });

  it('votes as the signed-in person and shows the count the server returns', async () => {
    await mount({
      [`GET ${API}`]: [request({ requestedBy: 'usr_bob' })],
      [`POST ${API}/req_1/vote`]: request({ requestedBy: 'usr_bob', votes: 1, voters: ['usr_alice'] }),
    });
    const voteButton = document.querySelector('[aria-label^="Vote for Data table"]');
    expect(voteButton.getAttribute('aria-pressed')).toBe('false');
    voteButton.click();
    await flush();
    expect(callsTo(`POST ${API}/req_1/vote`)[0].data).toBeUndefined();
    expect(document.querySelector('[aria-label^="Vote for Data table"]').getAttribute('aria-pressed')).toBe('true');
    expect(page.state.requests[0].votes).toBe(1);
  });

  it('comments with only the content and shows the comment', async () => {
    await mount({
      [`GET ${API}`]: [request({ requestedBy: 'usr_bob' })],
      [`GET ${API}/req_1`]: { ...request({ requestedBy: 'usr_bob' }), comments: [] },
      [`POST ${API}/req_1/comments`]: (body) => ({ id: 'cmt_1', requestId: 'req_1', author: 'usr_alice', authorName: 'Alice', content: body.content, createdAt: '2026-03-02T10:00:00.000Z' }),
    });
    await page.state.openDetails(page.state.requests[0]);
    await flush();
    page.state.newComment = 'Please add paging';
    await page.state.addComment();
    await flush();
    expect(callsTo(`POST ${API}/req_1/comments`)[0].data).toEqual({ content: 'Please add paging' });
    expect(text()).toContain('Please add paging');
    expect(page.state.requests[0].commentCount).toBe(1);
  });

  describe('the author', () => {
    const detail = (overrides) => ({ ...request(overrides), comments: [] });

    it('edits their own open request', async () => {
      await mount({
        [`GET ${API}`]: [request()],
        [`GET ${API}/req_1`]: detail(),
        [`PUT ${API}/req_1`]: (body) => request(body),
      });
      await page.state.openDetails(page.state.requests[0]);
      await flush();
      expect(buttonLabels()).toEqual(expect.arrayContaining(['Edit request', 'Delete request']));
      expect(buttonLabels()).not.toContain('Assign to me');

      page.state.startEdit();
      Object.assign(page.state.editForm, { title: 'Data grid' });
      await page.state.saveEdit();
      await flush();
      expect(callsTo(`PUT ${API}/req_1`)[0].data).toEqual({ title: 'Data grid', description: 'Sortable table', useCase: '' });
      expect(page.state.requests[0].title).toBe('Data grid');
    });

    it("sees no edit or delete on someone else's or a decided request", async () => {
      await mount({
        [`GET ${API}`]: [request({ requestedBy: 'usr_bob' }), request({ id: 'req_2', status: 'approved' })],
        [`GET ${API}/req_1`]: detail({ requestedBy: 'usr_bob' }),
        [`GET ${API}/req_2`]: detail({ id: 'req_2', status: 'approved' }),
      });
      for (const r of page.state.requests) {
        await page.state.openDetails(r);
        await flush();
        expect(buttonLabels()).not.toContain('Edit request');
        expect(buttonLabels()).not.toContain('Delete request');
      }
    });

    it('deletes after confirming', async () => {
      await mount({
        [`GET ${API}`]: [request()],
        [`GET ${API}/req_1`]: detail(),
        [`DELETE ${API}/req_1`]: { success: true, id: 'req_1' },
      });
      await page.state.openDetails(page.state.requests[0]);
      await flush();
      const pending = page.state.deleteRequest();
      await flush();
      expect(page.state.confirmState.title).toBe('Delete this request?');
      page.state.confirmState.resolve(true);
      await pending;
      await flush();
      expect(callsTo(`DELETE ${API}/req_1`)).toHaveLength(1);
      expect(page.state.requests).toEqual([]);
    });
  });

  describe('roadmap editors', () => {
    beforeEach(() => {
      auth.user = { id: 'usr_rita', name: 'Rita' };
      auth.permissions = new Set(['roadmap:edit']);
    });

    const triageResponses = (status = 'submitted', extra = {}) => ({
      [`GET ${API}`]: [request({ status })],
      [`GET ${API}/req_1`]: { ...request({ status }), comments: [] },
      'GET /api/v1/components': { components: [{ id: 'data-grid', name: 'Data grid' }] },
      ...extra,
    });

    it('moves the status and approves stages through their routes, without a user id', async () => {
      await mount(
        triageResponses('submitted', {
          [`PATCH ${API}/req_1/status`]: (body) => request({ status: body.status }),
          [`POST ${API}/req_1/approve`]: () => request({ status: 'under-review', metadata: { designApproved: true } }),
        }),
      );
      await page.state.openDetails(page.state.requests[0]);
      await flush();
      expect(buttonLabels()).toEqual(expect.arrayContaining(['Start review', 'Reject', 'Assign to me', 'Link component', 'Delete request']));
      expect(buttonLabels()).not.toContain('Promote to system');

      await page.state.transition('under-review');
      await flush();
      expect(callsTo(`PATCH ${API}/req_1/status`)[0].data).toEqual({ status: 'under-review' });
      await page.state.approve('design');
      await flush();
      expect(callsTo(`POST ${API}/req_1/approve`)[0].data).toEqual({ stage: 'design' });
      expect(page.state.selected.metadata.designApproved).toBe(true);
    });

    it('assigns to themselves, unassigns and changes priority', async () => {
      await mount(
        triageResponses('submitted', {
          [`POST ${API}/req_1/assign`]: (body) => request({ assignedTo: body.userId, assignedToName: 'Rita' }),
          [`DELETE ${API}/req_1/assign`]: request(),
          [`PATCH ${API}/req_1/priority`]: (body) => request({ priority: body.priority }),
        }),
      );
      await page.state.openDetails(page.state.requests[0]);
      await flush();
      await page.state.assign(page.state.currentUserId);
      await flush();
      expect(callsTo(`POST ${API}/req_1/assign`)[0].data).toEqual({ userId: 'usr_rita' });
      expect(text()).toContain('Assigned to Rita');
      expect(buttonLabels()).toContain('Unassign');

      await page.state.unassign();
      await page.state.setPriority('critical');
      await flush();
      expect(callsTo(`DELETE ${API}/req_1/assign`)).toHaveLength(1);
      expect(callsTo(`PATCH ${API}/req_1/priority`)[0].data).toEqual({ priority: 'critical' });
      expect(page.state.requests[0].priority).toBe('critical');
    });

    it('promotes an approved request to a component and links or unlinks one', async () => {
      await mount(
        triageResponses('approved', {
          [`POST ${API}/req_1/promote`]: (body) => request({ status: 'in-progress', componentId: body.componentId }),
          [`POST ${API}/req_1/link-component`]: (body) => request({ status: 'completed', componentId: body.componentId }),
          [`POST ${API}/req_1/unlink-component`]: request({ status: 'completed' }),
        }),
      );
      await page.state.openDetails(page.state.requests[0]);
      await flush();
      expect(page.state.componentOptions).toEqual([{ value: 'data-grid', label: 'Data grid' }]);
      expect(buttonLabels()).toContain('Promote to system');

      page.state.componentChoice = 'data-grid';
      await page.state.linkComponent('promote');
      await flush();
      expect(callsTo(`POST ${API}/req_1/promote`)[0].data).toEqual({ componentId: 'data-grid' });
      expect(page.state.selected).toMatchObject({ status: 'in-progress', componentId: 'data-grid' });

      await page.state.linkComponent('link-component');
      await flush();
      expect(callsTo(`POST ${API}/req_1/link-component`)[0].data).toEqual({ componentId: 'data-grid' });
      await page.state.unlinkComponent();
      await flush();
      expect(page.state.requests[0].componentId).toBeUndefined();
    });

    it('rejects with a reason and shows a refused change inline', async () => {
      await mount(
        triageResponses('submitted', {
          [`POST ${API}/req_1/reject`]: (body) => request({ status: 'rejected', metadata: { rejectionReason: body.reason } }),
          [`PATCH ${API}/req_1/status`]: fail(400, 'Invalid status transition from submitted to released'),
        }),
      );
      await page.state.openDetails(page.state.requests[0]);
      await flush();
      await page.state.transition('released');
      await flush();
      expect(text()).toContain('Invalid status transition');

      page.state.rejectReason = 'Out of scope';
      await page.state.reject();
      await flush();
      expect(callsTo(`POST ${API}/req_1/reject`)[0].data).toEqual({ reason: 'Out of scope' });
      expect(text()).toContain('Out of scope');
    });
  });

  it('hides triage from people without roadmap:edit', async () => {
    await mount({
      [`GET ${API}`]: [request({ requestedBy: 'usr_bob' })],
      [`GET ${API}/req_1`]: { ...request({ requestedBy: 'usr_bob' }), comments: [] },
    });
    await page.state.openDetails(page.state.requests[0]);
    await flush();
    for (const label of ['Start review', 'Reject', 'Assign to me', 'Link component', 'Promote to system']) {
      expect(buttonLabels()).not.toContain(label);
    }
    expect(callsTo('GET /api/v1/components')).toHaveLength(0);
  });
});
