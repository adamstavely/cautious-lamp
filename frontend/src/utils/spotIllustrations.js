// Trench Coat spot illustrations, inlined so they follow the app's .dark class.
const spots = import.meta.glob('../assets/illustrations/spot/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const spot = (name) => spots[`../assets/illustrations/spot/${name}.svg`] ?? '';
