// Code patterns: reusable solutions to common UI problems, each with a Vue,
// React and HTML version, an example of using it, and accessibility notes.
// Every pattern page (/patterns/<slug>) shows this code; nothing is a stub.

/** The frameworks a code pattern can be written in, in tab order */
export const FRAMEWORKS = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'html', label: 'HTML' },
];

export const COMPLEXITY_TONES = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' };

export const patternSnippets = [
  {
    id: 'form-validation',
    slug: 'form-validation',
    title: 'Form validation',
    description: 'Validate an email field on submit, show the error next to it and tell assistive technology.',
    category: 'Forms',
    icon: 'file-text',
    tags: ['form', 'validation', 'accessibility'],
    complexity: 'Intermediate',
    usage: 'Use it for any form field that needs checking before the form is sent: show the error beside the field and keep it linked to the input.',
    code: {
      vue: `<template>
  <form novalidate @submit.prevent="handleSubmit">
    <label for="email">Email</label>
    <input
      id="email"
      v-model="email"
      type="email"
      autocomplete="email"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="error ? 'email-error' : undefined"
    />
    <p v-if="error" id="email-error" class="error">{{ error }}</p>
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);
const email = ref('');
const error = ref('');

const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

const handleSubmit = () => {
  error.value = EMAIL.test(email.value) ? '' : 'Enter an email address, like name@example.com';
  if (error.value) {
    document.getElementById('email').focus();
    return;
  }
  emit('submit', { email: email.value });
};
</script>`,
      react: `import { useRef, useState } from 'react';

const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export function EmailForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const input = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = EMAIL.test(email) ? '' : 'Enter an email address, like name@example.com';
    setError(message);
    if (message) {
      input.current.focus();
      return;
    }
    onSubmit({ email });
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        ref={input}
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'email-error' : undefined}
      />
      {error && <p id="email-error" className="error">{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}`,
      html: `<form id="email-form" novalidate>
  <label for="email">Email</label>
  <input id="email" type="email" autocomplete="email" aria-invalid="false" />
  <p id="email-error" class="error" hidden></p>
  <button type="submit">Submit</button>
</form>

<script>
  const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  const form = document.getElementById('email-form');
  const input = document.getElementById('email');
  const error = document.getElementById('email-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const valid = EMAIL.test(input.value);
    error.hidden = valid;
    error.textContent = valid ? '' : 'Enter an email address, like name@example.com';
    input.setAttribute('aria-invalid', String(!valid));
    if (valid) {
      input.removeAttribute('aria-describedby');
      form.dispatchEvent(new CustomEvent('valid-submit', { detail: { email: input.value } }));
    } else {
      input.setAttribute('aria-describedby', 'email-error');
      input.focus();
    }
  });
</script>`,
    },
    props: [{ name: 'submit', type: 'event', required: false, description: 'Emitted with { email } once the address is valid', default: '' }],
    usageExamples: [
      {
        title: 'Several fields with their own rules',
        description: 'Each field checks itself when it loses focus and again on submit; the first field in error takes focus.',
        code: `<template>
  <form novalidate @submit.prevent="handleSubmit">
    <div v-for="field in fields" :key="field.name" class="field">
      <label :for="field.name">{{ field.label }}</label>
      <input
        :id="field.name"
        v-model="values[field.name]"
        :type="field.type"
        :autocomplete="field.autocomplete"
        :aria-invalid="errors[field.name] ? 'true' : 'false'"
        :aria-describedby="errors[field.name] ? field.name + '-error' : undefined"
        @blur="validateField(field)"
      />
      <p v-if="errors[field.name]" :id="field.name + '-error'" class="error">{{ errors[field.name] }}</p>
    </div>
    <button type="submit">Create account</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['submit']);

const fields = [
  { name: 'name', label: 'Full name', type: 'text', autocomplete: 'name', check: (v) => (v.trim() ? '' : 'Enter your name') },
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', check: (v) => (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v) ? '' : 'Enter an email address, like name@example.com') },
  { name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', check: (v) => (v.replace(/\\D/g, '').length >= 10 ? '' : 'Enter a phone number with at least 10 digits') },
];

const values = reactive({ name: '', email: '', phone: '' });
const errors = reactive({});

const validateField = (field) => {
  errors[field.name] = field.check(values[field.name]);
  return !errors[field.name];
};

const handleSubmit = () => {
  const invalid = fields.filter((field) => !validateField(field));
  if (invalid.length) {
    document.getElementById(invalid[0].name).focus();
    return;
  }
  emit('submit', { ...values });
};
</script>`,
      },
    ],
    accessibility: [
      'Give every input a visible `<label>` tied to it with `for` and `id`.',
      'Set `aria-invalid="true"` on a field in error and point `aria-describedby` at its message.',
      'Move focus to the first field in error after a failed submit, so screen reader users hear the problem.',
      'Say how to fix the problem ("Enter an email address, like name@example.com"), not only that it is wrong.',
      'Use `novalidate` and your own messages so errors look and read the same in every browser.',
    ],
    related: [
      { title: 'Form patterns', to: '/patterns/forms', body: 'Labels, layout and validation guidance for whole forms.' },
      { title: 'Login form', to: '/patterns/login-form', body: 'The same validation approach for signing in.' },
      { title: 'Error handling', to: '/guidelines/patterns/error-handling', body: 'Writing errors that explain what went wrong and how to recover.' },
    ],
  },
  {
    id: 'accessible-modal',
    slug: 'accessible-modal',
    title: 'Accessible modal',
    description: 'A modal dialog built on the native dialog element: focus stays inside, Escape closes it and focus returns to the trigger.',
    category: 'Feedback',
    icon: 'maximize',
    tags: ['modal', 'dialog', 'accessibility'],
    complexity: 'Advanced',
    usage: 'Use it when the user must deal with something before carrying on: a confirmation, a short form, a blocking error.',
    code: {
      vue: `<template>
  <dialog ref="dialog" class="modal" :aria-labelledby="titleId" @close="emit('update:open', false)">
    <header class="modal-header">
      <h2 :id="titleId">{{ title }}</h2>
      <button type="button" aria-label="Close" @click="close">&times;</button>
    </header>
    <div class="modal-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="modal-footer">
      <slot name="footer" :close="close" />
    </footer>
  </dialog>
</template>

<script setup>
import { onMounted, ref, useId, watch } from 'vue';

// showModal() makes the rest of the page inert, keeps focus inside the dialog,
// closes on Escape and returns focus to the element that opened it
const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
});
const emit = defineEmits(['update:open']);

const dialog = ref(null);
const titleId = useId();

const sync = (open) => {
  if (open && !dialog.value.open) dialog.value.showModal();
  if (!open && dialog.value.open) dialog.value.close();
};
const close = () => sync(false);

onMounted(() => sync(props.open));
watch(() => props.open, sync);
</script>`,
      react: `import { useEffect, useId, useRef } from 'react';

// showModal() makes the rest of the page inert, keeps focus inside the dialog,
// closes on Escape and returns focus to the element that opened it
export function Modal({ open, title, onClose, footer, children }) {
  const dialog = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog ref={dialog} className="modal" aria-labelledby={titleId} onClose={onClose}>
      <header className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <button type="button" aria-label="Close" onClick={() => dialog.current.close()}>&times;</button>
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-footer">{footer}</footer>}
    </dialog>
  );
}`,
      html: `<button type="button" id="open-dialog">Delete project</button>

<dialog id="confirm-dialog" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete this project?</h2>
  <p>Its files and history go too. You can't undo this.</p>
  <form method="dialog">
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete project</button>
  </form>
</dialog>

<script>
  const dialog = document.getElementById('confirm-dialog');

  // showModal() traps focus and closes on Escape; closing returns focus to the opener
  document.getElementById('open-dialog').addEventListener('click', () => dialog.showModal());

  // A <form method="dialog"> closes the dialog and sets returnValue to the button's value
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'delete') {
      document.dispatchEvent(new CustomEvent('project-delete-confirmed'));
    }
  });
</script>`,
    },
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Whether the dialog is showing; use v-model:open', default: 'false' },
      { name: 'title', type: 'string', required: true, description: 'The heading, which also names the dialog', default: '' },
    ],
    usageExamples: [
      {
        title: 'Confirming a destructive action',
        description: 'The page opens the modal from a button and only deletes once the user confirms.',
        code: `<template>
  <button type="button" @click="confirming = true">Delete project</button>

  <Modal v-model:open="confirming" title="Delete this project?">
    <p>{{ project.name }}, its files and its history will be deleted. You can't undo this.</p>
    <template #footer="{ close }">
      <button type="button" autofocus @click="close">Cancel</button>
      <button type="button" class="danger" @click="remove">Delete project</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';

const props = defineProps({ project: { type: Object, required: true } });
const emit = defineEmits(['deleted']);
const confirming = ref(false);

const remove = async () => {
  await fetch(\`/api/projects/\${props.project.id}\`, { method: 'DELETE' });
  confirming.value = false;
  emit('deleted', props.project.id);
};
</script>`,
      },
    ],
    accessibility: [
      'Open it with `showModal()`: the page behind becomes inert and focus stays inside the dialog.',
      'Name the dialog with `aria-labelledby` pointing at its heading.',
      'Give the close button an accessible name such as `aria-label="Close"`.',
      'Let Escape close it, and return focus to the button that opened it (the native dialog does both).',
      'Put initial focus on the safest action with `autofocus`, usually Cancel.',
    ],
    related: [
      { title: 'Notifications', to: '/patterns/notifications', body: 'When a modal is the right choice, and when a banner or toast is better.' },
      { title: 'Feedback patterns', to: '/patterns/feedback', body: 'Alerts, loading states and confirmations.' },
      { title: 'Buttons', to: '/components/buttons', body: 'Primary, secondary and danger buttons for dialog actions.' },
    ],
  },
  {
    id: 'sortable-data-table',
    slug: 'sortable-data-table',
    title: 'Sortable data table',
    description: 'A table with search, sortable columns that announce their order, and pagination.',
    category: 'Data display',
    icon: 'table-2',
    tags: ['table', 'data', 'sorting'],
    complexity: 'Advanced',
    usage: 'Use it for lists of records people compare or scan: search narrows them, column headers sort them and pages keep them short.',
    code: {
      vue: `<template>
  <div>
    <label for="table-search">Search</label>
    <input id="table-search" v-model="query" type="search" @input="page = 1" />

    <table>
      <caption>{{ caption }}</caption>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col" :aria-sort="ariaSort(column.key)">
            <button type="button" @click="sortBy(column.key)">
              {{ column.label }}
              <span aria-hidden="true">{{ sortKey === column.key ? (ascending ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in pageRows" :key="row.id">
          <td v-for="column in columns" :key="column.key">{{ row[column.key] }}</td>
        </tr>
        <tr v-if="!pageRows.length">
          <td :colspan="columns.length">No rows match "{{ query }}"</td>
        </tr>
      </tbody>
    </table>

    <nav aria-label="Table pages">
      <button type="button" :disabled="page === 1" @click="page--">Previous</button>
      <span aria-live="polite">Page {{ page }} of {{ pageCount }}</span>
      <button type="button" :disabled="page === pageCount" @click="page++">Next</button>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  caption: { type: String, required: true },
  columns: { type: Array, required: true }, // [{ key, label }]
  rows: { type: Array, required: true }, // objects with an id and a value for each column key
  pageSize: { type: Number, default: 10 },
});

const query = ref('');
const sortKey = ref('');
const ascending = ref(true);
const page = ref(1);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.rows;
  return props.rows.filter((row) => props.columns.some((c) => String(row[c.key]).toLowerCase().includes(q)));
});

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value;
  const direction = ascending.value ? 1 : -1;
  return [...filtered.value].sort((a, b) =>
    String(a[sortKey.value]).localeCompare(String(b[sortKey.value]), undefined, { numeric: true }) * direction,
  );
});

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)));
const pageRows = computed(() => sorted.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize));

const sortBy = (key) => {
  ascending.value = sortKey.value === key ? !ascending.value : true;
  sortKey.value = key;
  page.value = 1;
};

const ariaSort = (key) => (sortKey.value === key ? (ascending.value ? 'ascending' : 'descending') : 'none');
</script>`,
      react: `import { useMemo, useState } from 'react';

export function DataTable({ caption, columns, rows, pageSize = 10 }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? rows.filter((row) => columns.some((c) => String(row[c.key]).toLowerCase().includes(q))) : rows;
    if (!sortKey) return filtered;
    const direction = ascending ? 1 : -1;
    return [...filtered].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true }) * direction);
  }, [rows, columns, query, sortKey, ascending]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const sortBy = (key) => {
    setAscending(sortKey === key ? !ascending : true);
    setSortKey(key);
    setPage(1);
  };

  const ariaSort = (key) => (sortKey === key ? (ascending ? 'ascending' : 'descending') : 'none');

  return (
    <div>
      <label htmlFor="table-search">Search</label>
      <input id="table-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />

      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" aria-sort={ariaSort(column.key)}>
                <button type="button" onClick={() => sortBy(column.key)}>
                  {column.label}
                  <span aria-hidden="true">{sortKey === column.key ? (ascending ? '▲' : '▼') : ''}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}
            </tr>
          ))}
          {!pageRows.length && (
            <tr><td colSpan={columns.length}>No rows match "{query}"</td></tr>
          )}
        </tbody>
      </table>

      <nav aria-label="Table pages">
        <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span aria-live="polite">Page {page} of {pageCount}</span>
        <button type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button>
      </nav>
    </div>
  );
}`,
      html: `<label for="table-search">Search</label>
<input id="table-search" type="search" />

<table id="people">
  <caption>Team members</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="none"><button type="button" data-key="name">Name</button></th>
      <th scope="col" aria-sort="none"><button type="button" data-key="email">Email</button></th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<nav aria-label="Table pages">
  <button type="button" id="prev">Previous</button>
  <span id="page-info" aria-live="polite"></span>
  <button type="button" id="next">Next</button>
</nav>

<script>
  // Replace with your own rows, e.g. from fetch()
  const rows = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
    { id: 3, name: 'Alan Turing', email: 'alan@example.com' },
  ];
  const pageSize = 10;
  const state = { query: '', sortKey: '', ascending: true, page: 1 };

  const table = document.getElementById('people');
  const body = table.querySelector('tbody');

  function visibleRows() {
    const q = state.query.toLowerCase();
    let list = rows.filter((row) => !q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q));
    if (state.sortKey) {
      const direction = state.ascending ? 1 : -1;
      list = [...list].sort((a, b) => a[state.sortKey].localeCompare(b[state.sortKey]) * direction);
    }
    return list;
  }

  function render() {
    const list = visibleRows();
    const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
    state.page = Math.min(state.page, pageCount);
    body.replaceChildren(
      ...list.slice((state.page - 1) * pageSize, state.page * pageSize).map((row) => {
        const tr = document.createElement('tr');
        for (const key of ['name', 'email']) {
          const td = document.createElement('td');
          td.textContent = row[key];
          tr.append(td);
        }
        return tr;
      }),
    );
    table.querySelectorAll('th').forEach((th) => {
      const key = th.querySelector('button').dataset.key;
      th.setAttribute('aria-sort', key === state.sortKey ? (state.ascending ? 'ascending' : 'descending') : 'none');
    });
    document.getElementById('page-info').textContent = \`Page \${state.page} of \${pageCount}\`;
    document.getElementById('prev').disabled = state.page === 1;
    document.getElementById('next').disabled = state.page === pageCount;
  }

  document.getElementById('table-search').addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    state.page = 1;
    render();
  });
  table.querySelectorAll('th button').forEach((button) => {
    button.addEventListener('click', () => {
      state.ascending = state.sortKey === button.dataset.key ? !state.ascending : true;
      state.sortKey = button.dataset.key;
      state.page = 1;
      render();
    });
  });
  document.getElementById('prev').addEventListener('click', () => { state.page--; render(); });
  document.getElementById('next').addEventListener('click', () => { state.page++; render(); });

  render();
</script>`,
    },
    props: [
      { name: 'caption', type: 'string', required: true, description: 'Names the table for assistive technology', default: '' },
      { name: 'columns', type: 'array', required: true, description: 'The columns, as { key, label }', default: '' },
      { name: 'rows', type: 'array', required: true, description: 'The records, each with an id and a value per column key', default: '' },
      { name: 'pageSize', type: 'number', required: false, description: 'Rows per page', default: '10' },
    ],
    usageExamples: [
      {
        title: 'Loading rows from an API',
        description: 'The page fetches the records once and hands them to the table, with a loading and an error state of its own.',
        code: `<template>
  <p v-if="loading" role="status">Loading team members…</p>
  <p v-else-if="error" role="alert">{{ error }}</p>
  <DataTable v-else caption="Team members" :columns="columns" :rows="people" :page-size="20" />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import DataTable from './DataTable.vue';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'team', label: 'Team' },
];
const people = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const response = await fetch('/api/people');
    if (!response.ok) throw new Error(\`The people list didn't load (\${response.status})\`);
    people.value = await response.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>`,
      },
    ],
    accessibility: [
      'Give the table a `<caption>` and its headers `scope="col"`.',
      'Make each sortable header a `<button>` so it is reachable and operable from the keyboard.',
      'Set `aria-sort` on the sorted column ("ascending" or "descending") and "none" on the others.',
      'Hide the sort arrows from screen readers with `aria-hidden="true"`; `aria-sort` already says the order.',
      'Announce the page number with `aria-live="polite"` when it changes.',
    ],
    related: [
      { title: 'Data display patterns', to: '/patterns/data-display', body: 'Tables, lists and cards, and when to use each.' },
      { title: 'Pattern status', to: '/patterns/status', body: 'A live table of the patterns library built the same way.' },
      { title: 'Data visualization', to: '/guidelines/patterns/data-visualization', body: 'When a chart says more than a table.' },
    ],
  },
  {
    id: 'login-form',
    slug: 'login-form',
    title: 'Login form',
    description: 'A sign-in form with autocomplete hints, a busy state and an error message that is announced.',
    category: 'Authentication',
    icon: 'lock',
    tags: ['auth', 'form', 'security'],
    complexity: 'Intermediate',
    usage: 'Use it for any username-and-password sign-in. The page passes in the function that signs the user in; the form handles input, the busy state and errors.',
    code: {
      vue: `<template>
  <form @submit.prevent="handleLogin">
    <label for="username">Email or username</label>
    <input id="username" v-model="username" type="text" autocomplete="username" required />

    <label for="password">Password</label>
    <input id="password" v-model="password" type="password" autocomplete="current-password" required />

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <button type="submit" :disabled="loading" :aria-busy="loading">
      {{ loading ? 'Signing in…' : 'Sign in' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

// login({ username, password }) signs the user in and throws an Error with a readable message on failure
const props = defineProps({ login: { type: Function, required: true } });
const emit = defineEmits(['signed-in']);

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const user = await props.login({ username: username.value.trim(), password: password.value });
    emit('signed-in', user);
  } catch (e) {
    error.value = e.message || "That email and password don't match. Check them and try again.";
    password.value = '';
  } finally {
    loading.value = false;
  }
};
</script>`,
      react: `import { useState } from 'react';

// login({ username, password }) signs the user in and throws an Error with a readable message on failure
export function LoginForm({ login, onSignedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login({ username: username.trim(), password });
      onSignedIn(user);
    } catch (e) {
      setError(e.message || "That email and password don't match. Check them and try again.");
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <label htmlFor="username">Email or username</label>
      <input id="username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <p className="error" role="alert">{error}</p>}

      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}`,
      html: `<form id="login-form">
  <label for="username">Email or username</label>
  <input id="username" type="text" autocomplete="username" required />

  <label for="password">Password</label>
  <input id="password" type="password" autocomplete="current-password" required />

  <p id="login-error" class="error" role="alert" hidden></p>

  <button type="submit">Sign in</button>
</form>

<script>
  const form = document.getElementById('login-form');
  const error = document.getElementById('login-error');
  const button = form.querySelector('button');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    button.disabled = true;
    button.textContent = 'Signing in…';
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.value.trim(),
          password: form.password.value,
        }),
      });
      if (!response.ok) throw new Error("That email and password don't match. Check them and try again.");
      window.location.assign('/');
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
      form.password.value = '';
    } finally {
      button.disabled = false;
      button.textContent = 'Sign in';
    }
  });
</script>`,
    },
    props: [
      { name: 'login', type: 'function', required: true, description: 'Signs the user in with { username, password }; throws an Error with a readable message on failure', default: '' },
      { name: 'signed-in', type: 'event', required: false, description: 'Emitted with whatever login() returned', default: '' },
    ],
    usageExamples: [
      {
        title: 'Signing in against your API',
        description: 'The page supplies login(), turns a failed response into a readable error and moves on once signed in.',
        code: `<template>
  <LoginForm :login="login" @signed-in="router.push('/')" />
</template>

<script setup>
import { useRouter } from 'vue-router';
import LoginForm from './LoginForm.vue';

const router = useRouter();

const login = async ({ username, password }) => {
  const response = await fetch('/api/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (response.status === 401) throw new Error("That email and password don't match. Check them and try again.");
  if (!response.ok) throw new Error('Signing in is not working right now. Try again in a few minutes.');
  return response.json();
};
</script>`,
      },
    ],
    accessibility: [
      'Use `autocomplete="username"` and `autocomplete="current-password"` so password managers can fill the form.',
      'Keep visible labels; placeholders disappear as soon as someone types.',
      'Put the sign-in error in an element with `role="alert"` so it is announced.',
      'Say the form is busy with `aria-busy` and a changed button label while it signs in.',
      "Don't say which of the two fields was wrong; that tells attackers which usernames exist.",
    ],
    related: [
      { title: 'Form validation', to: '/patterns/form-validation', body: 'Field-level errors that are linked and announced.' },
      { title: 'Form patterns', to: '/patterns/forms', body: 'Input, layout and validation guidance.' },
      { title: 'Error handling', to: '/guidelines/patterns/error-handling', body: 'Messages that explain the problem and the way out.' },
    ],
  },
  {
    id: 'responsive-navigation',
    slug: 'responsive-navigation',
    title: 'Responsive navigation',
    description: 'A navigation bar that collapses into a menu button on small screens, with disclosure submenus.',
    category: 'Navigation',
    icon: 'menu',
    tags: ['navigation', 'menu', 'responsive'],
    complexity: 'Intermediate',
    usage: 'Use it for a site or app header with a handful of sections, some with a short list of child pages.',
    code: {
      vue: `<template>
  <nav aria-label="Main">
    <button type="button" class="menu-toggle" :aria-expanded="String(menuOpen)" aria-controls="main-menu" @click="menuOpen = !menuOpen">
      Menu
    </button>
    <ul id="main-menu" :class="['menu', { open: menuOpen }]" @keydown.esc="closeAll">
      <li v-for="item in items" :key="item.href">
        <template v-if="item.children">
          <button type="button" :aria-expanded="String(openItem === item.href)" @click="toggle(item.href)">
            {{ item.label }}
          </button>
          <ul v-show="openItem === item.href">
            <li v-for="child in item.children" :key="child.href">
              <a :href="child.href" :aria-current="current === child.href ? 'page' : undefined">{{ child.label }}</a>
            </li>
          </ul>
        </template>
        <a v-else :href="item.href" :aria-current="current === item.href ? 'page' : undefined">{{ item.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  items: { type: Array, required: true }, // [{ label, href, children?: [{ label, href }] }]
  current: { type: String, default: '' }, // href of the page being shown
});

const menuOpen = ref(false);
const openItem = ref(null);

const toggle = (href) => {
  openItem.value = openItem.value === href ? null : href;
};
const closeAll = () => {
  openItem.value = null;
  menuOpen.value = false;
};
</script>

<style>
.menu { display: none; }
.menu.open { display: block; }
@media (min-width: 48rem) {
  .menu-toggle { display: none; }
  .menu { display: flex; gap: 1.5rem; }
}
</style>`,
      react: `import { useState } from 'react';

export function Navigation({ items, current = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  const closeAll = (event) => {
    if (event.key !== 'Escape') return;
    setOpenItem(null);
    setMenuOpen(false);
  };

  return (
    <nav aria-label="Main">
      <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="main-menu" onClick={() => setMenuOpen(!menuOpen)}>
        Menu
      </button>
      <ul id="main-menu" className={menuOpen ? 'menu open' : 'menu'} onKeyDown={closeAll}>
        {items.map((item) => (
          <li key={item.href}>
            {item.children ? (
              <>
                <button type="button" aria-expanded={openItem === item.href} onClick={() => setOpenItem(openItem === item.href ? null : item.href)}>
                  {item.label}
                </button>
                <ul hidden={openItem !== item.href}>
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <a href={child.href} aria-current={current === child.href ? 'page' : undefined}>{child.label}</a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <a href={item.href} aria-current={current === item.href ? 'page' : undefined}>{item.label}</a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}`,
      html: `<nav aria-label="Main">
  <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="main-menu">Menu</button>
  <ul id="main-menu" class="menu">
    <li><a href="/" aria-current="page">Home</a></li>
    <li>
      <button type="button" aria-expanded="false" aria-controls="about-menu">About</button>
      <ul id="about-menu" hidden>
        <li><a href="/about/team">Team</a></li>
        <li><a href="/about/history">History</a></li>
      </ul>
    </li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<style>
  .menu { display: none; }
  .menu.open { display: block; }
  @media (min-width: 48rem) {
    .menu-toggle { display: none; }
    .menu { display: flex; gap: 1.5rem; }
  }
</style>

<script>
  // Every button with aria-controls shows or hides the element it names
  document.querySelectorAll('nav [aria-controls]').forEach((button) => {
    const target = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      if (target.classList.contains('menu')) target.classList.toggle('open', open);
      else target.hidden = !open;
    });
  });

  // Escape closes any open submenu and returns focus to its button
  document.getElementById('main-menu').addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('#main-menu [aria-expanded="true"]').forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
      document.getElementById(button.getAttribute('aria-controls')).hidden = true;
      button.focus();
    });
  });
</script>`,
    },
    props: [
      { name: 'items', type: 'array', required: true, description: 'Links as { label, href, children? }', default: '' },
      { name: 'current', type: 'string', required: false, description: 'The href of the current page, marked with aria-current', default: "''" },
    ],
    usageExamples: [
      {
        title: 'In a Vue Router app',
        description: 'The layout passes its sections and the current route so the active link is marked.',
        code: `<template>
  <header class="site-header">
    <a href="/" class="logo">Acme</a>
    <Navigation :items="items" :current="route.path" />
  </header>
  <main id="main"><router-view /></main>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Navigation from './Navigation.vue';

const route = useRoute();

const items = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'All products', href: '/products' },
      { label: 'Pricing', href: '/products/pricing' },
    ],
  },
  { label: 'Support', href: '/support' },
];
</script>`,
      },
    ],
    accessibility: [
      'Wrap the links in `<nav>` with an `aria-label` such as "Main".',
      'Give the menu button and submenu buttons `aria-expanded`, and point them at what they open with `aria-controls`.',
      'Mark the link to the current page with `aria-current="page"`.',
      'Let Escape close an open submenu.',
      'Use a text label ("Menu") or an accessible name on the toggle, not just an icon.',
    ],
    related: [
      { title: 'Navigation patterns', to: '/patterns/navigation', body: 'Sidebars, top bars and breadcrumbs, and when to use each.' },
      { title: 'Layout patterns', to: '/patterns/layout', body: 'Grids and breakpoints the navigation sits in.' },
      { title: 'Content organization', to: '/guidelines/content-organization-navigation', body: 'Structuring sections before you build the menu.' },
    ],
  },
  {
    id: 'toast-notification',
    slug: 'toast-notification',
    title: 'Toast notification',
    description: 'Short-lived status messages that are announced to screen readers and can be dismissed.',
    category: 'Feedback',
    icon: 'bell',
    tags: ['notification', 'toast', 'feedback'],
    complexity: 'Beginner',
    usage: 'Use it to confirm something worked ("Saved") or report a problem that needs no immediate action. Anything the user must act on belongs in a banner or a dialog.',
    code: {
      vue: `<template>
  <div class="toast-region" role="status" aria-live="polite">
    <div v-for="toast in toasts" :key="toast.id" :class="['toast', 'toast-' + toast.type]">
      <span>{{ toast.message }}</span>
      <button type="button" aria-label="Dismiss" @click="dismiss(toast.id)">&times;</button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';

const toasts = ref([]);
const timers = new Map();
let nextId = 0;

const dismiss = (id) => {
  clearTimeout(timers.get(id));
  timers.delete(id);
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

/** show('Saved', 'success') — errors stay until dismissed */
const show = (message, type = 'info', duration = 5000) => {
  const id = nextId++;
  toasts.value.push({ id, message, type });
  if (type !== 'error' && duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration));
  return id;
};

defineExpose({ show, dismiss });
onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>`,
      react: `import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export const Toasts = forwardRef(function Toasts(_, ref) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  // show('Saved', 'success') — errors stay until dismissed
  const show = useCallback((message, type = 'info', duration = 5000) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, type }]);
    if (type !== 'error' && duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);

  useImperativeHandle(ref, () => ({ show, dismiss }), [show, dismiss]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={'toast toast-' + toast.type}>
          <span>{toast.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => dismiss(toast.id)}>&times;</button>
        </div>
      ))}
    </div>
  );
});`,
      html: `<div id="toasts" class="toast-region" role="status" aria-live="polite"></div>

<script>
  const region = document.getElementById('toasts');

  // showToast('Saved', 'success') — errors stay until dismissed
  function showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    const text = document.createElement('span');
    text.textContent = message; // textContent, never innerHTML, for messages
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', () => toast.remove());

    toast.append(text, close);
    region.append(toast);
    if (type !== 'error' && duration > 0) setTimeout(() => toast.remove(), duration);
  }
</script>`,
    },
    props: [
      { name: 'show(message, type, duration)', type: 'method', required: false, description: 'Adds a toast; type is info, success, warning or error; errors stay until dismissed', default: "type 'info', duration 5000" },
      { name: 'dismiss(id)', type: 'method', required: false, description: 'Removes a toast early', default: '' },
    ],
    usageExamples: [
      {
        title: 'Confirming a save',
        description: 'One toast region for the app; any page reaches it through provide/inject and reports the result of an action.',
        code: `<!-- App.vue -->
<template>
  <router-view />
  <Toasts ref="toasts" />
</template>

<script setup>
import { provide, ref } from 'vue';
import Toasts from './Toasts.vue';

const toasts = ref(null);
provide('toast', (...args) => toasts.value.show(...args));
</script>

<!-- SettingsPage.vue -->
<template>
  <form @submit.prevent="save">
    <label for="display-name">Display name</label>
    <input id="display-name" v-model="name" autocomplete="nickname" />
    <button type="submit">Save</button>
  </form>
</template>

<script setup>
import { inject, ref } from 'vue';

const toast = inject('toast');
const name = ref('');

const save = async () => {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value }),
  });
  if (response.ok) toast('Your profile is saved', 'success');
  else toast("Your profile couldn't be saved. Try again.", 'error');
};
</script>`,
      },
    ],
    accessibility: [
      'Render toasts inside one live region (`role="status"`, `aria-live="polite"`) that is on the page before any toast appears.',
      'Keep error toasts on screen until they are dismissed; never auto-hide something the user has to read.',
      'Give the dismiss button an accessible name such as `aria-label="Dismiss"`.',
      'Leave at least five seconds before an informational toast disappears.',
      "Don't put links or actions only in a toast; offer them somewhere that stays.",
    ],
    related: [
      { title: 'Notifications', to: '/patterns/notifications', body: 'Choose between a toast, a banner, a dialog and a modal.' },
      { title: 'Feedback patterns', to: '/patterns/feedback', body: 'Alerts, loading states and confirmations.' },
      { title: 'Empty and loading states', to: '/guidelines/patterns/empty-loading-states', body: 'Feedback while content is on its way.' },
    ],
  },
];

/** The code pattern a /patterns/<slug> page shows, or null */
export const snippetForSlug = (slug) => patternSnippets.find((p) => p.slug === slug) ?? null;
