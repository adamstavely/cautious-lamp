import { createApp, nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

const catchAll = { render: () => null };

/**
 * Mounts a view (with a memory router) into a fresh element and returns its
 * <script setup> state, so tests can drive it like the page does.
 */
export async function mountView(component, { path = '/', routes = [] } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [...routes, { path: '/:pathMatch(.*)*', component: catchAll }],
  });
  await router.push(path);
  await router.isReady();

  const el = document.createElement('div');
  document.body.appendChild(el);
  const app = createApp(component);
  app.use(router);
  app.config.warnHandler = () => {};
  const vm = app.mount(el);
  await nextTick();

  return {
    app,
    router,
    vm,
    state: vm.$.setupState,
    unmount: () => {
      app.unmount();
      el.remove();
    },
  };
}
