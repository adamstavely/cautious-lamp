/**
 * Class strings shared by the workspace and application pages, matching the
 * existing look (light/dark chosen by `isDarkMode`).
 */
export const ui = (isDark) => ({
  card: isDark ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200',
  subCard: isDark ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200',
  modal: isDark ? 'bg-slate-800' : 'bg-white',
  heading: isDark ? 'text-white' : 'text-gray-900',
  text: isDark ? 'text-gray-300' : 'text-gray-700',
  muted: isDark ? 'text-gray-400' : 'text-gray-600',
  faint: isDark ? 'text-gray-500' : 'text-gray-500',
  border: isDark ? 'border-gray-700' : 'border-gray-200',
  label: isDark ? 'text-gray-300' : 'text-gray-700',
  input: isDark ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900',
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  disabled: isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed',
  secondary: isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  chip: isDark ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50',
  tab: (active) =>
    active
      ? isDark ? 'text-indigo-400' : 'text-indigo-600'
      : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900',
  roleBadge: (role) =>
    role === 'owner'
      ? isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
      : role === 'admin'
        ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
        : role === 'editor'
          ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
});

export const inputClass = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';

const RANK = { owner: 4, admin: 3, editor: 2, viewer: 1 };

/** Whether a workspace's effectiveRole (from the API) is at least `role` */
export const atLeast = (effectiveRole, role) => (RANK[effectiveRole] ?? 0) >= RANK[role];

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');
