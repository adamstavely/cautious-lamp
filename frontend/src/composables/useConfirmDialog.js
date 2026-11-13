import { reactive } from 'vue';

/**
 * A promise-based replacement for window.confirm(), rendered with
 * <ConfirmDialog :state="confirmState" /> from components/workspaces.
 *
 *   const { confirmState, askConfirm } = useConfirmDialog();
 *   if (!(await askConfirm({ title: 'Delete font?', message: '…', confirmText: 'Delete', danger: true }))) return;
 */
export function useConfirmDialog() {
  const confirmState = reactive({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    danger: false,
    resolve: null,
  });

  const settle = (answer) => {
    const resolve = confirmState.resolve;
    confirmState.open = false;
    confirmState.resolve = null;
    resolve?.(answer);
  };

  const askConfirm = ({ title, message = '', confirmText = 'Confirm', danger = false }) => {
    // A second question cancels the first
    settle(false);
    return new Promise((resolve) => {
      Object.assign(confirmState, { open: true, title, message, confirmText, danger, resolve });
    });
  };

  return { confirmState, askConfirm, settleConfirm: settle };
}
