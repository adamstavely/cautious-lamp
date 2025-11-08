// Pattern code snippets data
// These are reusable code patterns that solve common UI problems

export const patternSnippets = [
  {
    id: 'form-validation',
    title: 'Form Validation',
    description: 'Complete form validation with error handling and accessibility',
    category: 'forms',
    framework: 'vue',
    tags: ['form', 'validation', 'accessibility'],
    useCase: 'User Input',
    complexity: 'Intermediate',
    code: {
      vue: `<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :aria-invalid="errors.email ? 'true' : 'false'"
        :aria-describedby="errors.email ? 'email-error' : undefined"
      />
      <div v-if="errors.email" id="email-error" role="alert" class="error">
        {{ errors.email }}
      </div>
    </div>
    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';

const form = ref({ email: '' });
const errors = ref({});

const isValid = computed(() => {
  return form.value.email && !errors.value.email;
});

const validateEmail = (email) => {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
};

const handleSubmit = () => {
  errors.value = {};
  if (!validateEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }
  if (isValid.value) {
    // Submit form
  }
};
</script>`,
      react: `import React, { useState } from 'react';

function FormValidation() {
  const [form, setForm] = useState({ email: '' });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" role="alert" className="error">
            {errors.email}
          </div>
        )}
      </div>
      <button type="submit" disabled={!form.email || errors.email}>
        Submit
      </button>
    </form>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Form Validation</title>
</head>
<body>
  <form id="myForm">
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" type="email" required />
      <div id="email-error" role="alert" class="error" style="display: none;"></div>
    </div>
    <button type="submit">Submit</button>
  </form>
  <script>
    document.getElementById('myForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const errorDiv = document.getElementById('email-error');
      const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!re.test(email)) {
        errorDiv.textContent = 'Please enter a valid email address';
        errorDiv.style.display = 'block';
        document.getElementById('email').setAttribute('aria-invalid', 'true');
      } else {
        errorDiv.style.display = 'none';
        document.getElementById('email').setAttribute('aria-invalid', 'false');
        // Submit form
      }
    });
  </script>
</body>
</html>`
    },
    usageExample: 'Use this snippet for any form that requires email validation with proper error handling and accessibility.',
    props: [
      { name: 'email', type: 'string', required: true, description: 'Email address to validate', default: '' }
    ]
  },
  {
    id: 'modal-component',
    title: 'Accessible Modal',
    description: 'Fully accessible modal dialog with focus trap and keyboard support',
    category: 'feedback',
    framework: 'vue',
    tags: ['modal', 'dialog', 'accessibility'],
    useCase: 'User Feedback',
    complexity: 'Advanced',
    code: {
      vue: `<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="modal-header">
        <h2 :id="titleId">{{ title }}</h2>
        <button @click="close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, required: true }
});

const emit = defineEmits(['close']);

const titleId = computed(() => \`modal-title-\${props.title.toLowerCase().replace(/\\s/g, '-')}\`);

const close = () => {
  emit('close');
};

const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>`,
      react: `import React, { useEffect } from 'react';

function Modal({ isOpen, title, onClose, children }) {
  const titleId = \`modal-title-\${title.toLowerCase().replace(/\\s/g, '-')}\`;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Accessible Modal</title>
</head>
<body>
  <button onclick="openModal()">Open Modal</button>
  <div id="modal" class="modal-overlay" style="display: none;" onclick="closeModal(event)">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2 id="modal-title">Modal Title</h2>
        <button onclick="closeModal()" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        Modal content here
      </div>
    </div>
  </div>
  <script>
    function openModal() {
      document.getElementById('modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    function closeModal(e) {
      if (!e || e.target.classList.contains('modal-overlay')) {
        document.getElementById('modal').style.display = 'none';
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') closeModal();
    }
  </script>
</body>
</html>`
    },
    usageExample: 'Use this modal component for any dialog that needs to be accessible and keyboard-friendly.',
    props: [
      { name: 'isOpen', type: 'boolean', required: true, description: 'Controls modal visibility', default: false },
      { name: 'title', type: 'string', required: true, description: 'Modal title', default: '' }
    ]
  },
  {
    id: 'data-table',
    title: 'Sortable Data Table',
    description: 'Data table with sorting, filtering, and pagination',
    category: 'data-display',
    framework: 'vue',
    tags: ['table', 'data', 'sorting'],
    useCase: 'Data Display',
    complexity: 'Advanced',
    code: {
      vue: `<template>
  <div>
    <input v-model="searchQuery" placeholder="Search..." />
    <table>
      <thead>
        <tr>
          <th @click="sort('name')">
            Name
            <span v-if="sortKey === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
          </th>
          <th @click="sort('email')">
            Email
            <span v-if="sortKey === 'email'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedData" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const data = ref([...]);
const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredData = computed(() => {
  return data.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value;
  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];
    return sortOrder.value === 'asc' 
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return sortedData.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(sortedData.value.length / itemsPerPage));

const sort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
</script>`,
      react: `import React, { useState, useMemo } from 'react';

function DataTable({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredData, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const sort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
      <table>
        <thead>
          <tr>
            <th onClick={() => sort('name')}>
              Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => sort('email')}>
              Email {sortKey === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Sortable Data Table</title>
</head>
<body>
  <input id="search" type="text" placeholder="Search..." />
  <table id="dataTable">
    <thead>
      <tr>
        <th onclick="sort('name')">Name <span id="name-sort"></span></th>
        <th onclick="sort('email')">Email <span id="email-sort"></span></th>
      </tr>
    </thead>
    <tbody id="tableBody"></tbody>
  </table>
  <div class="pagination">
    <button onclick="prevPage()" id="prevBtn">Previous</button>
    <span id="pageInfo">Page 1 of 1</span>
    <button onclick="nextPage()" id="nextBtn">Next</button>
  </div>
  <script>
    let data = [...];
    let searchQuery = '';
    let sortKey = '';
    let sortOrder = 'asc';
    let currentPage = 1;
    const itemsPerPage = 10;

    document.getElementById('search').addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderTable();
    });

    function sort(key) {
      if (sortKey === key) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortOrder = 'asc';
      }
      renderTable();
    }

    function renderTable() {
      // Filter, sort, paginate and render
    }

    function nextPage() {
      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    }

    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    }
  </script>
</body>
</html>`
    },
    usageExample: 'Use this table component for displaying large datasets with search, sort, and pagination capabilities.',
    props: [
      { name: 'data', type: 'array', required: true, description: 'Array of data objects to display', default: '[]' },
      { name: 'itemsPerPage', type: 'number', required: false, description: 'Number of items per page', default: 10 }
    ]
  },
  {
    id: 'authentication-form',
    title: 'Login Form',
    description: 'Complete authentication form with validation and error handling',
    category: 'authentication',
    framework: 'vue',
    tags: ['auth', 'form', 'security'],
    useCase: 'Authentication',
    complexity: 'Intermediate',
    code: {
      vue: `<template>
  <form @submit.prevent="handleLogin">
    <div class="form-group">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        required
        autocomplete="username"
      />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        required
        autocomplete="current-password"
      />
    </div>
    <div v-if="error" class="error" role="alert">
      {{ error }}
    </div>
    <button type="submit" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({ username: '', password: '' });
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    // API call
    await login(form.value);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>`,
      react: `import React, { useState } from 'react';

function LoginForm() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // API call
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          autoComplete="username"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Login Form</title>
</head>
<body>
  <form id="loginForm">
    <div class="form-group">
      <label for="username">Username</label>
      <input id="username" type="text" required autocomplete="username" />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input id="password" type="password" required autocomplete="current-password" />
    </div>
    <div id="error" class="error" role="alert" style="display: none;"></div>
    <button type="submit">Login</button>
  </form>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');
      try {
        // API call
        await login({ username, password });
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
      }
    });
  </script>
</body>
</html>`
    },
    usageExample: 'Use this form for user authentication with proper security practices and error handling.',
    props: [
      { name: 'username', type: 'string', required: true, description: 'User username', default: '' },
      { name: 'password', type: 'string', required: true, description: 'User password', default: '' }
    ]
  },
  {
    id: 'navigation-menu',
    title: 'Responsive Navigation',
    description: 'Mobile-responsive navigation menu with dropdowns',
    category: 'navigation',
    framework: 'vue',
    tags: ['navigation', 'menu', 'responsive'],
    useCase: 'Navigation',
    complexity: 'Intermediate',
    code: {
      vue: `<template>
  <nav class="navbar">
    <div class="nav-container">
      <button @click="toggleMobileMenu" class="mobile-toggle" aria-label="Toggle menu">
        ☰
      </button>
      <ul :class="['nav-menu', { active: mobileMenuOpen }]">
        <li v-for="item in menuItems" :key="item.id">
          <a :href="item.href" @click="closeMobileMenu">{{ item.label }}</a>
          <ul v-if="item.children" class="dropdown">
            <li v-for="child in item.children" :key="child.id">
              <a :href="child.href">{{ child.label }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
const menuItems = ref([...]);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>`,
      react: `import React, { useState } from 'react';

function Navigation({ menuItems }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-toggle" aria-label="Toggle menu">
          ☰
        </button>
        <ul className={\`nav-menu \${mobileMenuOpen ? 'active' : ''}\`}>
          {menuItems.map(item => (
            <li key={item.id}>
              <a href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
              {item.children && (
                <ul className="dropdown">
                  {item.children.map(child => (
                    <li key={child.id}>
                      <a href={child.href}>{child.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Responsive Navigation</title>
</head>
<body>
  <nav class="navbar">
    <div class="nav-container">
      <button onclick="toggleMobileMenu()" class="mobile-toggle" aria-label="Toggle menu">☰</button>
      <ul id="navMenu" class="nav-menu">
        <li><a href="#home">Home</a></li>
        <li>
          <a href="#about">About</a>
          <ul class="dropdown">
            <li><a href="#team">Team</a></li>
            <li><a href="#history">History</a></li>
          </ul>
        </li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>
  <script>
    function toggleMobileMenu() {
      document.getElementById('navMenu').classList.toggle('active');
    }
  </script>
</body>
</html>`
    },
    usageExample: 'Use this navigation component for responsive menus that work on both desktop and mobile devices.',
    props: [
      { name: 'menuItems', type: 'array', required: true, description: 'Array of menu items with optional children', default: '[]' }
    ]
  },
  {
    id: 'toast-notification',
    title: 'Toast Notification',
    description: 'Toast notification system for temporary messages',
    category: 'feedback',
    framework: 'vue',
    tags: ['notification', 'toast', 'feedback'],
    useCase: 'User Feedback',
    complexity: 'Beginner',
    code: {
      vue: `<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', \`toast-\${toast.type}\`]"
        role="alert"
      >
        {{ toast.message }}
        <button @click="removeToast(toast.id)" aria-label="Close">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

const showToast = (message, type = 'info', duration = 3000) => {
  const id = toastId++;
  toasts.value.push({ id, message, type });
  setTimeout(() => removeToast(id), duration);
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};
</script>`,
      react: `import React, { useState } from 'react';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  let toastId = 0;

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={\`toast toast-\${toast.type}\`} role="alert">
          {toast.message}
          <button onClick={() => removeToast(toast.id)} aria-label="Close">×</button>
        </div>
      ))}
    </div>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Toast Notification</title>
</head>
<body>
  <div id="toastContainer" class="toast-container"></div>
  <script>
    let toastId = 0;
    function showToast(message, type = 'info', duration = 3000) {
      const id = toastId++;
      const toast = document.createElement('div');
      toast.id = \`toast-\${id}\`;
      toast.className = \`toast toast-\${type}\`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = \`\${message} <button onclick="removeToast(\${id})" aria-label="Close">×</button>\`;
      document.getElementById('toastContainer').appendChild(toast);
      setTimeout(() => removeToast(id), duration);
    }
    function removeToast(id) {
      const toast = document.getElementById(\`toast-\${id}\`);
      if (toast) toast.remove();
    }
  </script>
</body>
</html>`
    },
    usageExample: 'Use this toast system to show temporary success, error, or info messages to users.',
    props: [
      { name: 'message', type: 'string', required: true, description: 'Toast message text', default: '' },
      { name: 'type', type: 'string', required: false, description: 'Toast type (success, error, info, warning)', default: 'info' },
      { name: 'duration', type: 'number', required: false, description: 'Display duration in milliseconds', default: 3000 }
    ]
  }
];

