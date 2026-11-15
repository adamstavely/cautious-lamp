import { nextTick } from 'vue';
import apiClient from '../../src/services/api.js';

// jsdom has no <dialog> methods; UiDialog and ConfirmDialog open one
HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

/** An axios-style error with a status and, optionally, the server's message */
export const fail = (status, message) => Object.assign(new Error(message ?? `HTTP ${status}`), { response: { status, data: message ? { message } : {} } });

/** Lets pending requests and renders settle */
export const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

/**
 * Answers apiClient requests from `responses`, keyed "METHOD /path"; a value
 * may be data, an Error (rejected) or a function of the request config. Every
 * request is recorded in `calls` with its parsed body. Unknown routes get 404.
 * Returns `restore` to put the real adapter back.
 */
export function stubApi(responses) {
  const calls = [];
  const original = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    const data = config.data ? JSON.parse(config.data) : undefined;
    calls.push({ key, params: config.params, data });
    let answer = responses[key];
    if (typeof answer === 'function') answer = answer(data, config);
    if (answer instanceof Error) return Promise.reject(answer);
    if (answer === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data: structuredClone(answer), headers: {}, config };
  };
  return { calls, restore: () => (apiClient.defaults.adapter = original) };
}
