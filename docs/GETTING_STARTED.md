# Getting Started Guide

Welcome to the Design System Platform! This guide will help you get up and running quickly.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Next Steps](#next-steps)

## Overview

The Design System Platform is a comprehensive solution for managing design systems, components, tokens, and integrations with visual regression testing and session replay services.

### Key Features

- **Workspace Management**: Organize your design system resources
- **Component Library**: Manage and version your design components
- **Design Tokens**: Centralized token management and synchronization
- **Visual Regression Testing**: Integration with Argos CI for automated visual testing
- **Session Replay**: Integration with OpenReplay for user session analysis
- **Accessibility Reports**: Automated WCAG compliance checking
- **Component Requests**: Workflow for requesting new components
- **Patterns Library**: Reusable design patterns

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3000

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **Elasticsearch** (optional): For audit logging and search functionality
- **Docker** (optional): For running Elasticsearch via Docker Compose

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env` file):
   ```env
   # Elasticsearch (optional)
   ELASTICSEARCH_NODE=http://localhost:9200

   # Encryption Key (required for production)
   ENCRYPTION_KEY=your-32-byte-hex-key-here

   # Argos Integration (optional)
   ARGOS_BASE_URL=https://app.argos-ci.com

   # OpenReplay Integration (optional)
   OPENREPLAY_BASE_URL=https://api.openreplay.com
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Elasticsearch Setup (Optional)

If you want to use audit logging and search features:

1. Using Docker Compose:
   ```bash
   docker-compose up -d elasticsearch
   ```

2. Or install Elasticsearch locally and start it on port 9200

## Configuration

### API Keys

Create your first API key:

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My First API Key"}'
```

The response will include your API key. **Save it securely** - it won't be shown again!

### Workspace Setup

1. Create a workspace via the UI or API
2. Configure design tokens
3. Set up integrations (Argos, OpenReplay) if needed

See [GETTING_STARTED_WORKSPACES.md](./GETTING_STARTED_WORKSPACES.md) for detailed workspace setup.

## Next Steps

- [Workspace Setup Guide](./GETTING_STARTED_WORKSPACES.md) - Learn how to create and configure workspaces
- [Component Creation Guide](./GETTING_STARTED_COMPONENTS.md) - Create your first component
- [Token Setup Guide](./GETTING_STARTED_TOKENS.md) - Configure design tokens
- [Visual Regression Setup](./GETTING_STARTED_VISUAL_REGRESSION.md) - Set up Argos integration
- [Session Replay Setup](./GETTING_STARTED_SESSION_REPLAY.md) - Set up OpenReplay integration
- [API Documentation](./API_REFERENCE.md) - Complete API reference

## Troubleshooting

If you encounter issues:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Verify all prerequisites are installed
3. Check that ports 3000 (backend) and 5174 (frontend) are available
4. Review backend logs for errors

## Support

For additional help:
- Review the [API Documentation](./API_REFERENCE.md)
- Check [Troubleshooting Guides](./TROUBLESHOOTING.md)
- Review feature-specific getting started guides

