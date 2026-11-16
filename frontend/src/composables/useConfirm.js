import { ref } from 'vue';

/** The confirmation on screen, if any: its text and how to answer it */
const request = ref(null);

/**
 * Asks the user to confirm in the app's own dialog (ConfirmHost, a native modal
 * <dialog>), in place of window.confirm(). Resolves true when they confirm and
 * false when they cancel, press Escape or close it. Only one is shown at a time;
 * a new request cancels the one before.
 *
 *   if (!(await confirmDialog({ title: 'Delete banner?', message: '…', confirmLabel: 'Delete', danger: true }))) return;
 */
export function confirmDialog({ title, message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    request.value?.resolve(false);
    request.value = { title, message, confirmLabel, cancelLabel, danger, resolve };
  });
}

/** For ConfirmHost: the current request, answered with answerConfirm() */
export function useConfirmRequest() {
  return request;
}

export function answerConfirm(ok) {
  const current = request.value;
  request.value = null;
  current?.resolve(ok);
}
