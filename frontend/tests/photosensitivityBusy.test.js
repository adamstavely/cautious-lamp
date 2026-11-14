// S06: the server now refuses analyses beyond its limits with 503
// PHOTOSENSITIVITY_BUSY or 429 PHOTOSENSITIVITY_QUOTA_EXCEEDED. The page must
// say "busy, try again" (a warning), not report a failed analysis.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import PhotosensitivityAnalysis from '../src/views/PhotosensitivityAnalysis.vue';
import { mountView } from './helpers/mountView.js';

const originalAdapter = apiClient.defaults.adapter;
let refusal;
let page;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  apiClient.defaults.adapter = async (config) => {
    if (config.url.endsWith('/verify')) return { status: 200, statusText: 'OK', data: { installed: true }, headers: {}, config };
    const response = { status: refusal.status, statusText: '', data: refusal.data, headers: { 'retry-after': '30' }, config };
    const error = new Error(`Request failed with status code ${refusal.status}`);
    error.response = response;
    error.config = config;
    throw error;
  };
});

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
  page?.unmount();
  page = undefined;
});

const analyze = async () => {
  page = await mountView(PhotosensitivityAnalysis);
  page.state.selectedFile = new File(['v'], 'clip.mp4', { type: 'video/mp4' });
  await page.state.analyzeVideo();
  await nextTick();
  return page.vm.$el.parentNode;
};

describe('PhotosensitivityAnalysis', () => {
  it('shows a busy warning with the wait when the server is full', async () => {
    refusal = { status: 503, data: { statusCode: 503, code: 'PHOTOSENSITIVITY_BUSY', message: 'Too many', retryAfterSeconds: 45 } };
    const root = await analyze();
    expect(page.state.error).toBeNull();
    const callout = root.querySelector('.ui-callout-warning');
    expect(callout?.textContent).toContain('The analyzer is busy');
    expect(callout?.textContent).toContain('Try again in 45 seconds');
    expect(root.querySelector('.ui-callout-danger')).toBeNull();
  });

  it('explains a per-user quota refusal', async () => {
    refusal = { status: 429, data: { statusCode: 429, code: 'PHOTOSENSITIVITY_QUOTA_EXCEEDED', message: 'You already have 2', retryAfterSeconds: 30 } };
    const root = await analyze();
    expect(root.querySelector('.ui-callout-warning')?.textContent).toContain('as many analyses running as you');
  });

  it('still reports other failures as errors', async () => {
    refusal = { status: 422, data: { statusCode: 422, code: 'IRIS_TIMEOUT', message: 'IRIS took longer than 600 seconds' } };
    const root = await analyze();
    expect(root.querySelector('.ui-callout-danger')?.textContent).toContain('IRIS took longer');
    expect(page.state.busy).toBeNull();
  });
});
