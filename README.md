# Design System Platform

**Unifying the Mission; One UI at a Time**

The Agency's Design System for Digital Experiences. Guidelines, components, tokens, patterns, assets; everything you need in one powerful platform.

## 🎯 Overview

This is a comprehensive, enterprise-grade design system platform that provides everything needed to build consistent, accessible, and beautiful digital experiences. It combines design guidelines, component libraries, developer tools, governance, and analytics into a unified platform.

## ✨ Key Features

### Core Capabilities

- **📚 Guidelines & Documentation** - Comprehensive design guidelines powered by VitePress
- **🧩 Component Library** - Full component documentation with live examples, props editors, and code exports
- **🎨 Design Tokens** - Token Studio with Style Dictionary integration for DTCG-compliant token management
- **📐 Patterns Library** - Design patterns and best practices
- **🔤 Typography System** - Font library, scale, stack, and subsetting tools
- **🎭 Design Assets** - Icon library with Material, Lucide, and custom icon support

### Developer Experience

- **💻 Component Playground** - Live code editor with Vue/React export
- **📝 Code Snippets Library** - Pre-built snippets for common use cases
- **🧪 Component Testing Framework** - Integrated testing tools and test generators
- **📖 Documentation Generator** - Auto-generate docs from code comments
- **🔄 Migration Assistant** - Component and token migration tools
- **🔍 Loupe Tool** - Component inspector for design system components
- **📊 Dependency Graph** - Visual map of component relationships

### Design-Dev Collaboration

- **🤝 Design-Dev Handoff** - Spec generation, asset export, measurement tools
- **👁️ Review System** - Design review and approval workflow with Kanban board
- **💬 Feedback & Roadmap** - Component feedback system and public roadmap

### Governance & Compliance

- **⚖️ Governance Engine** - Rules engine with 33+ compliance rules
- **✅ Compliance Scanning** - Scan applications for design system compliance, UX/HCD best practices, and accessibility
- **📋 Audit Logging** - Comprehensive user action auditing
- **🔐 Role-Based Access Control (RBAC)** - Granular permission management
- **🚩 Feature Flags** - OpenFeature-based feature flagging system

### Tools & Utilities

- **🎨 Color Tools**
  - Color Scale Generator (with accessibility checks)
  - Color Converter
  - Color Contrast Checker
  - Gradient Generator
  - Palette Builder

- **📝 Content Tools**
  - Lorem Ipsum Generator (with HTML formatting)
  - SEO Tagging Generator

- **🔬 UX Research Tools**
  - NASA-TLX (Task Load Index)
  - System Usability Scale (SUS)
  - Heuristic Evaluation Checklist
  - User Persona Generator

- **🛠️ Developer Tools**
  - Code Quality Checks
  - Vulnerability Scanner
  - PNG to ICO Converter

### AI & Automation

- **🤖 AI Assistant (Eero)** - AI-powered design system assistant
- **💡 AI-Powered Suggestions** - Component recommendations and accessibility fixes

### Analytics & Monitoring

- **📊 System Health Dashboard** - Real-time system health metrics
- **📈 Design System Analytics** - Component adoption and usage analytics
- **🔔 Change Notifications** - Alerts for component and token changes

### API & Integration

- **🔌 REST API** - Full REST API for tokens, components, and system management
- **📦 JavaScript SDK** - Official SDK for JavaScript/TypeScript
- **⚡ CLI Tool** - Command-line interface for design system operations
- **🔌 ESLint Plugin** - ESLint integration for design system rules
- **💻 VS Code Extension** - Autocomplete, hover info, snippets, and more

### Observability

- **📡 OpenTelemetry Integration** - Full MELT (Metrics, Events, Logs, Traces) observability
- **📊 Elasticsearch Integration** - Centralized logging and analytics

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Vue 3 with Composition API
- Vite for build tooling
- Tailwind CSS for styling
- VitePress for documentation
- Material Symbols for icons
- Lucide Icons for additional icons

**Backend:**
- NestJS (Node.js framework)
- TypeScript
- Elasticsearch for data persistence
- OpenTelemetry for observability

**Developer Tools:**
- ESLint Plugin
- VS Code Extension
- CLI Tool (Commander.js)
- JavaScript SDK

### Project Structure

```
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── design-system/   # Design system service & controller
│   │   ├── feature-flags/   # Feature flagging system
│   │   ├── rbac/            # Role-based access control
│   │   ├── audit/           # Audit logging
│   │   ├── color-palette/   # Color palette tools
│   │   └── observability/   # OpenTelemetry setup
│   └── package.json
│
├── frontend/                # Vue.js application
│   ├── src/
│   │   ├── views/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API services
│   │   ├── composables/    # Vue composables
│   │   ├── router/         # Vue Router config
│   │   └── main.js
│   ├── docs/               # VitePress documentation
│   └── package.json
│
├── cli/                     # CLI tool
│   └── src/
│       └── cli.ts
│
├── sdk/                     # JavaScript SDK
│   └── src/
│       └── index.ts
│
├── eslint-plugin-design-system/  # ESLint plugin
│   └── src/
│
├── vscode-design-system-extension/  # VS Code extension
│   └── src/
│
├── loupe-tool-standalone/   # Standalone Loupe Tool package
│   └── src/
│
└── docs/                    # Additional documentation
    ├── FEATURE_IDEAS.md
    ├── RULES_ENGINE_GUIDE.md
    ├── OPENTELEMETRY_SETUP.md
    └── ...
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Elasticsearch** 8+ (optional, but recommended for full functionality)
- **Git**

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd cautious-lamp
```

2. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Set up Elasticsearch (optional):**
```bash
# Using Docker
docker run -d -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

Or use the provided `docker-compose.yml`:
```bash
docker-compose up -d elasticsearch
```

4. **Configure environment variables (optional):**
```bash
# Backend (.env in backend/)
ELASTICSEARCH_NODE=http://localhost:9200
OTEL_ENABLED=true

# Frontend (.env in frontend/)
VITE_API_BASE_URL=http://localhost:3000
VITE_OTEL_ENABLED=true
```

### Running the Application

**Option 1: Run both services together:**
```bash
npm run dev
```

**Option 2: Run services separately:**

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

5. **Open your browser:**
- Frontend: http://localhost:5174 (or 5173)
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/api/v1/health

## 📖 Documentation

### Getting Started Guides
- [Getting Started Overview](/getting-started)
- [Why a Design System?](/getting-started/why-design-system)
- [Design Principles](/getting-started/principles)
- [Design Themes](/getting-started/themes)
- [Quick Start Guide](/getting-started/quick-start)
- [Installation Guide](/getting-started/installation)
- [Contribution Guide](/getting-started/contribute)

### Core Documentation
- [Design Guidelines](/guidelines) - Comprehensive design system guidelines
- [Component Library](/components) - Component documentation and examples
- [Design Tokens](/tokens) - Token management and usage
- [Patterns](/patterns) - Design patterns and best practices
- [Typography](/fonts) - Font system and typography guidelines

### Developer Resources
- [Design System API Documentation](./API_README.md)
- [Rules Engine Guide](./docs/RULES_ENGINE_GUIDE.md)
- [OpenTelemetry Setup](./docs/OPENTELEMETRY_SETUP.md)
- [Loupe Tool Documentation](./docs/LOUPE_TOOL.md)
- [ESLint Plugin Documentation](./eslint-plugin-design-system/README.md)
- [VS Code Extension Documentation](./vscode-design-system-extension/README.md)

### Additional Resources
- [Feature Ideas & Status](./docs/FEATURE_IDEAS.md)
- [Component Template Guide](./COMPONENT_TEMPLATE_GUIDE.md)
- [WCAG Compliance Guide](./frontend/WCAG_COMPLIANCE.md)

## 🔌 API Documentation

The design system provides a comprehensive REST API. See [API_README.md](./API_README.md) for full documentation.

### Key Endpoints

**Design System:**
- `GET /api/v1/tokens` - Get all design tokens
- `GET /api/v1/components` - Get all components
- `GET /api/v1/components/:id` - Get specific component
- `GET /api/v1/health` - System health check

**Feature Flags:**
- `GET /api/v1/feature-flags` - Get all feature flags
- `GET /api/v1/feature-flags/key/:key` - Get flag by key
- `POST /api/v1/feature-flags` - Create feature flag
- `PUT /api/v1/feature-flags/:id/toggle` - Toggle flag

**Governance:**
- `POST /api/v1/compliance/scan` - Scan code for compliance
- `GET /api/v1/rules/export` - Export rules for linter

**RBAC:**
- `GET /api/v1/rbac/roles` - Get all roles
- `POST /api/v1/rbac/users/:userId/roles` - Assign role to user

**Audit:**
- `GET /api/v1/audit/logs` - Get audit logs
- `GET /api/v1/audit/export` - Export audit logs

See [API_README.md](./API_README.md) for complete API documentation.

## 🛠️ Development

### Available Scripts

**Root:**
```bash
npm run dev              # Run both backend and frontend
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only
npm run build            # Build both projects
```

**Backend:**
```bash
cd backend
npm run start:dev        # Start development server
npm run build            # Build for production
npm run lint             # Run linter
npm run test             # Run tests
```

**Frontend:**
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run docs:dev         # Start VitePress docs server
npm run docs:build       # Build documentation
```

### Code Style

- **Backend**: TypeScript with NestJS conventions
- **Frontend**: Vue 3 Composition API with `<script setup>`
- **Styling**: Tailwind CSS utility classes
- **Linting**: ESLint with design system plugin

### Testing

```bash
# Backend tests
cd backend && npm run test

# Frontend tests (when implemented)
cd frontend && npm run test
```

## 🔐 Authentication & Authorization

The system uses API key authentication for backend access. Default API keys:
- `test-api-key-123` - Default test key
- `dev-key` - Development key

For production, configure proper authentication in `backend/src/design-system/design-system.service.ts`.

## 🎨 Feature Flags

The platform includes a comprehensive feature flagging system powered by OpenFeature. All 50+ features can be toggled on/off from the Admin → Feature Flags page.

**Key Features:**
- Route-based flag protection
- User/group targeting
- Percentage rollouts
- OpenFeature-compatible API

See the Feature Flags admin page for management interface.

## 📊 Observability

The system is instrumented with OpenTelemetry for full observability:

- **Metrics**: System performance and health metrics
- **Events**: User actions and system events
- **Logs**: Structured logging to Elasticsearch
- **Traces**: Distributed tracing across services

See [OPENTELEMETRY_SETUP.md](./docs/OPENTELEMETRY_SETUP.md) for configuration details.

## 🤝 Contributing

We welcome contributions! See [Contribution Guide](/getting-started/contribute) for details.

### Contribution Areas

- **Components**: Add new components or improve existing ones
- **Documentation**: Improve guidelines and documentation
- **Tools**: Build new developer tools
- **Compliance Rules**: Add new governance rules
- **Bug Fixes**: Report and fix issues

## 📦 Packages

This repository includes several distributable packages:

- **CLI Tool** (`cli/`) - Command-line interface for design system operations
- **JavaScript SDK** (`sdk/`) - Official SDK for JavaScript/TypeScript
- **ESLint Plugin** (`eslint-plugin-design-system/`) - ESLint integration
- **VS Code Extension** (`vscode-design-system-extension/`) - VS Code integration
- **Loupe Tool** (`loupe-tool-standalone/`) - Standalone component inspector

## 🏛️ Governance

The platform includes comprehensive governance features:

- **33+ Compliance Rules** covering design system, UX/HCD, and accessibility
- **Application Scanning** - Scan applications for compliance
- **Rules Engine** - Custom rule creation and management
- **Audit Logging** - Track all user actions
- **RBAC** - Role-based access control with 6 default roles

See [RULES_ENGINE_GUIDE.md](./docs/RULES_ENGINE_GUIDE.md) for creating custom rules.

## 🔒 Security

- API key authentication
- Role-based access control (RBAC)
- Audit logging for all actions
- Dependency vulnerability scanning
- WCAG 2.1 AA compliance built-in

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Vue.js](https://vuejs.org/)
- [NestJS](https://nestjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [VitePress](https://vitepress.dev/)
- [OpenTelemetry](https://opentelemetry.io/)
- [OpenFeature](https://openfeature.dev/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Elasticsearch](https://www.elastic.co/elasticsearch/)

## 📞 Support

For questions, issues, or contributions:
- Check the [Getting Started](/getting-started) section
- Review [Documentation](/guidelines)
- Use the in-app AI Assistant (Eero) for design system questions
- Submit feedback via the [Feedback & Roadmap](/feedback) page

---

**Built for the Agency | Unifying the Mission; One UI at a Time**
