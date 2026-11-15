import { onBeforeUnmount, reactive, watch } from 'vue';

// Readable names for path segments that are ids, keyed by the full path
const labels = reactive({});

/** The label a page gave its path, if any (read by Breadcrumbs) */
export const breadcrumbLabelFor = (path) => labels[path];

/**
 * Names the current page's last breadcrumb, e.g. an application's name
 * instead of its id. `path` and `label` are getters; the label is removed
 * when the page goes.
 */
export function useBreadcrumbLabel(path, label) {
  let current = null;
  const stop = watch(
    [path, label],
    ([p, l]) => {
      if (current && current !== p) delete labels[current];
      current = p;
      if (p && l) labels[p] = l;
      else if (p) delete labels[p];
    },
    { immediate: true },
  );
  onBeforeUnmount(() => {
    stop();
    if (current) delete labels[current];
  });
}
