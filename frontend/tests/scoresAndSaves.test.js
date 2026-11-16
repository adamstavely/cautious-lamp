// Scores the pages show match what the server stores (heuristic evaluation,
// NASA-TLX raw score), a photosensitivity result that couldn't be stored says
// so, and a visual regression project can be deleted from its settings.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import HeuristicEvaluation from '../src/views/HeuristicEvaluation.vue';
import NasaTlx from '../src/views/NASA-TLX.vue';
import PhotosensitivityAnalysis from '../src/views/PhotosensitivityAnalysis.vue';
import VisualRegression from '../src/views/VisualRegression.vue';
import VisualRegressionProject from '../src/views/VisualRegressionProject.vue';
import { mountView } from './helpers/mountView.js';

HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

const flush = async () => {
  for (let i = 0; i < 16; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const originalAdapter = apiClient.defaults.adapter;
let responses;
let calls;
let page;

beforeEach(() => {
  calls = [];
  responses = {};
  vi.spyOn(console, 'error').mockImplementation(() => {});
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, data: typeof config.data === 'string' ? JSON.parse(config.data) : config.data });
    let data = responses[key];
    if (typeof data === 'function') data = data(config);
    if (data instanceof Error) return Promise.reject(data);
    if (data === undefined) {
      const error = new Error('not found');
      error.response = { status: 404, data: { message: 'not found' } };
      return Promise.reject(error);
    }
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const text = () => document.body.textContent.replace(/\s+/g, ' ');
const buttonNamed = (name) => [...document.querySelectorAll('button')].find((b) => b.textContent.replace(/\s+/g, ' ').trim() === name);

describe('Heuristic evaluation score', () => {
  const fillAllCritical = (state) => {
    state.form.systemName = 'Admin Dashboard';
    state.form.evaluator = 'Ada';
    state.form.heuristics.forEach((h) => {
      h.severity = 4;
      h.issues = 'Broken';
    });
  };

  it('shows 0/10 for an all-Critical evaluation, as the server stores it', async () => {
    responses['POST /api/v1/heuristic-evaluation'] = (config) => ({ id: 'he_1', ...JSON.parse(config.data), totalIssues: 10, criticalIssues: 10, overallScore: 0 });
    page = await mountView(HeuristicEvaluation);
    fillAllCritical(page.state);
    await page.state.submitEvaluation();
    await flush();
    expect(page.state.results.overallScore).toBe(0);
    expect(text()).toContain('0/10');
  });

  it('displays the score the server returned rather than its own', async () => {
    responses['POST /api/v1/heuristic-evaluation'] = { id: 'he_1', totalIssues: 10, criticalIssues: 10, overallScore: 1.5 };
    page = await mountView(HeuristicEvaluation);
    fillAllCritical(page.state);
    await page.state.submitEvaluation();
    await flush();
    expect(page.state.results.overallScore).toBe(1.5);
  });

  it('falls back to its own score when the server sends none', async () => {
    responses['POST /api/v1/heuristic-evaluation'] = { id: 'he_1' };
    page = await mountView(HeuristicEvaluation);
    fillAllCritical(page.state);
    await page.state.submitEvaluation();
    await flush();
    expect(page.state.results.overallScore).toBe(0);
  });
});

describe('NASA-TLX raw score', () => {
  const fill = (state) => {
    Object.assign(state.form, {
      systemName: 'Mobile App',
      task: 'Check out',
      mentalDemand: 80,
      physicalDemand: 10,
      temporalDemand: 60,
      performance: 30,
      effort: 70,
      frustration: 50,
    });
  };

  it('shows the raw (unweighted) TLX the server computed', async () => {
    responses['POST /api/v1/nasa-tlx'] = (config) => ({ id: 'tlx_1', ...JSON.parse(config.data), rawTlx: 50 });
    page = await mountView(NasaTlx);
    fill(page.state);
    await page.state.submitForm();
    await flush();
    expect(page.state.workload.rawTlx).toBe(50);
    expect(text()).toContain('Raw TLX (unweighted)');
    expect(text()).toContain('50/100');
  });

  it('works the raw TLX out itself when the server sends none', async () => {
    responses['POST /api/v1/nasa-tlx'] = { id: 'tlx_1' };
    page = await mountView(NasaTlx);
    fill(page.state);
    page.state.form.frustration = 51;
    await page.state.submitForm();
    await flush();
    expect(page.state.workload.rawTlx).toBe(50.2);
  });

  it('shows no score when the assessment was not saved', async () => {
    const error = new Error('unavailable');
    error.response = { status: 503, data: { message: 'Survey storage is unavailable' } };
    responses['POST /api/v1/nasa-tlx'] = error;
    page = await mountView(NasaTlx);
    fill(page.state);
    await page.state.submitForm();
    await flush();
    expect(page.state.workload).toBeNull();
    expect(text()).toContain('was not saved');
  });
});

describe('Photosensitivity save status', () => {
  const SUMMARY = { status: 'pass', luminanceFailures: 0, redFailures: 0, patternFailures: 0, luminanceWarnings: 0, redWarnings: 0, totalFrames: 120 };

  const analyze = async () => {
    responses['GET /api/v1/photosensitivity/verify'] = { installed: true };
    page = await mountView(PhotosensitivityAnalysis);
    page.state.selectedFile = new File(['v'], 'clip.mp4', { type: 'video/mp4' });
    await page.state.analyzeVideo();
    await flush();
  };

  it('warns, with the reason, when the result was not saved', async () => {
    responses['POST /api/v1/photosensitivity/analyze'] = {
      analysisId: null, saved: false, saveError: 'Storage is unavailable', videoName: 'clip.mp4', summary: SUMMARY, complianceChecks: [], resultsCount: 120,
    };
    await analyze();
    const callout = document.querySelector('#photosensitivity-results .ui-callout-warning');
    expect(callout?.textContent).toContain("This result wasn't saved");
    expect(callout?.textContent).toContain('Storage is unavailable');
  });

  it('shows no warning when the result was saved', async () => {
    responses['POST /api/v1/photosensitivity/analyze'] = {
      analysisId: 'ps_1', saved: true, videoName: 'clip.mp4', summary: SUMMARY, complianceChecks: [], resultsCount: 120,
    };
    await analyze();
    expect(document.querySelector('#photosensitivity-results')).not.toBeNull();
    expect(text()).not.toContain("wasn't saved");
  });

  it('accepts only the formats the server takes', async () => {
    responses['GET /api/v1/photosensitivity/verify'] = { installed: true };
    page = await mountView(PhotosensitivityAnalysis);
    await flush();
    const accept = document.querySelector('input[type="file"]').getAttribute('accept').split(',');
    expect(accept).toEqual(expect.arrayContaining(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', '.mp4', '.webm', '.mov', '.avi']));
    expect(accept).not.toContain('video/*');

    page.state.handleFileSelect(new File(['v'], 'clip.mkv', { type: 'video/x-matroska' }));
    expect(page.state.selectedFile).toBeNull();
    expect(page.state.error).toContain('MP4, WebM, MOV or AVI');
  });
});

describe('Deleting a visual regression project', () => {
  const PROJECT = {
    id: 'vr_1', name: 'Web', description: '', argosProjectId: 'acme/web', argosBranch: 'develop', config: {}, createdAt: '2026-11-01T10:00:00.000Z', hasWebhookSecret: false,
  };
  const ListPage = { render: () => null };

  const openSettings = async () => {
    Object.assign(responses, {
      'GET /api/v1/visual-regression/projects/vr_1': structuredClone(PROJECT),
      'GET /api/v1/visual-regression/projects/vr_1/runs': { data: [], pagination: { total: 0 } },
      'GET /api/v1/visual-regression/projects/vr_1/analytics': { totalRuns: 0, passedRuns: 0, changedRuns: 0, failedRuns: 0, averageDuration: 0, trends: [] },
    });
    page = await mountView(VisualRegressionProject, {
      path: '/tools/visual-regression/vr_1',
      routes: [
        { path: '/tools/visual-regression', component: ListPage },
        { path: '/tools/visual-regression/:id', component: { render: () => null } },
      ],
    });
    await flush();
    page.state.activeTab = 'settings';
    await flush();
  };

  it('confirms in a dialog naming the project, deletes it and goes back to the list', async () => {
    responses['DELETE /api/v1/visual-regression/projects/vr_1'] = { message: 'Project deleted successfully' };
    await openSettings();
    buttonNamed('Delete project').click();
    await flush();
    const dialog = document.querySelector('dialog.ui-dialog[open]');
    expect(dialog?.textContent).toContain('Delete Web?');
    expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);

    [...dialog.querySelectorAll('button')].find((b) => b.textContent.includes('Delete project')).click();
    await flush();
    expect(calls.map((c) => c.key)).toContain('DELETE /api/v1/visual-regression/projects/vr_1');
    await new Promise((resolve) => setTimeout(resolve, 0)); // the router resolves the navigation on a later task
    expect(page.router.currentRoute.value.path).toBe('/tools/visual-regression');
    page.unmount();

    // The list page says what happened, once
    responses['GET /api/v1/visual-regression/projects'] = [];
    responses['GET /api/v1/workspaces'] = [];
    page = await mountView(VisualRegression, { path: '/tools/visual-regression' });
    await flush();
    expect(text()).toContain('Project "Web" deleted.');
    page.unmount();
    page = await mountView(VisualRegression, { path: '/tools/visual-regression' });
    await flush();
    expect(text()).not.toContain('Project "Web" deleted.');
  });

  it('keeps the page and shows the reason when deleting fails', async () => {
    const error = new Error('forbidden');
    error.response = { status: 403, data: { message: 'You may not manage this project' } };
    responses['DELETE /api/v1/visual-regression/projects/vr_1'] = error;
    await openSettings();
    page.state.openDeleteDialog();
    await flush();
    await page.state.deleteProject();
    await flush();
    expect(page.router.currentRoute.value.path).toBe('/tools/visual-regression/vr_1');
    expect(document.querySelector('dialog.ui-dialog[open] .ui-callout-danger')?.textContent).toContain('You may not manage this project');
  });

  it('cancelling deletes nothing', async () => {
    await openSettings();
    page.state.openDeleteDialog();
    await flush();
    page.state.closeDeleteDialog();
    await flush();
    expect(page.state.deleteDialogOpen).toBe(false);
    expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);
  });
});
