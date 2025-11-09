# Adobe XD Live Sync - Technical Specification

## Overview

This document outlines how a live synchronization feature between the Design System Platform and Adobe XD would work. This feature would enable real-time updates of design tokens and component specifications directly in Adobe XD documents, eliminating the need for manual file exports and imports.

**Status:** Not Implemented - Technical Specification Only

## Current Implementation

The current Adobe XD export feature:
- Generates JSON files with design tokens and component specifications
- Downloads files as a ZIP archive
- Requires manual import via third-party plugins
- One-time export with no automatic updates

## Live Sync Architecture

### High-Level Flow

```
Design System Platform (Backend)
  ↓ WebSocket/HTTP API
Adobe XD Plugin (UXP)
  ↓ XD Plugin API
Adobe XD Document (Live Updates)
```

### Components Required

1. **Backend API Extensions**
   - WebSocket server for real-time notifications
   - Token/component change event system
   - Plugin authentication endpoint
   - Sync status tracking

2. **Adobe XD Plugin (UXP)**
   - Plugin installation package
   - WebSocket client or polling mechanism
   - XD API integration for document updates
   - UI panel for configuration

3. **Authentication & Security**
   - API key management for plugins
   - OAuth flow for user authentication
   - Secure WebSocket connections (WSS)

## Technical Implementation

### 1. Backend API Extensions

#### WebSocket Server
```typescript
// Backend: WebSocket endpoint for real-time updates
@WebSocketGateway('/api/v1/sync')
export class SyncGateway {
  @WebSocketServer()
  server: Server;

  // Notify all connected XD plugins when tokens change
  notifyTokenChange(tokenId: string, changes: TokenChange) {
    this.server.emit('token:updated', {
      tokenId,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  // Notify when components are updated
  notifyComponentChange(componentId: string, changes: ComponentChange) {
    this.server.emit('component:updated', {
      componentId,
      changes,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### Change Event System
```typescript
// Backend: Track changes and emit events
@Injectable()
export class DesignSystemService {
  // When token is updated
  updateToken(id: string, updates: Partial<Token>) {
    const token = this.tokens.find(t => t.id === id);
    const changes = this.detectChanges(token, updates);
    
    // Update token
    Object.assign(token, updates);
    
    // Emit change event
    this.syncGateway.notifyTokenChange(id, changes);
  }
}
```

#### Plugin Authentication
```typescript
// Backend: Authenticate XD plugin connections
@Post('sync/authenticate')
authenticatePlugin(@Body() credentials: { apiKey: string }) {
  // Validate API key
  // Return session token for WebSocket connection
  return {
    sessionToken: generateSessionToken(),
    expiresAt: Date.now() + 3600000, // 1 hour
    syncEndpoint: 'wss://api.designsystem.com/sync'
  };
}
```

### 2. Adobe XD Plugin (UXP)

#### Plugin Structure
```
adobe-xd-plugin/
├── manifest.json          # Plugin metadata
├── main.js                # Main plugin code
├── ui.html                # Plugin UI panel
├── lib/
│   ├── sync-client.js     # WebSocket/polling client
│   ├── xd-api.js          # XD API wrapper
│   └── token-mapper.js    # Map tokens to XD colors/styles
└── package.json
```

#### Plugin Manifest
```json
{
  "id": "design-system-sync",
  "name": "Design System Sync",
  "version": "1.0.0",
  "host": {
    "app": "XD",
    "minVersion": "33.0.0"
  },
  "entrypoints": [
    {
      "type": "panel",
      "id": "syncPanel"
    }
  ],
  "permissions": [
    "network",
    "read",
    "write"
  ]
}
```

#### Main Plugin Code
```javascript
// main.js - Adobe XD Plugin Entry Point
const { syncClient } = require('./lib/sync-client');
const { xdAPI } = require('./lib/xd-api');
const { tokenMapper } = require('./lib/token-mapper');

// Show UI panel
const panel = require('@adobe/xd-plugin-toolkit').panel;
panel.show();

// Initialize sync client
let syncClientInstance = null;

// Connect to Design System Platform
async function connectToDesignSystem(apiKey) {
  // Authenticate
  const authResponse = await fetch('https://api.designsystem.com/sync/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  
  const { sessionToken, syncEndpoint } = await authResponse.json();
  
  // Establish WebSocket connection
  syncClientInstance = new syncClient(syncEndpoint, sessionToken);
  
  // Listen for token updates
  syncClientInstance.on('token:updated', async (data) => {
    await updateXDColors(data.tokenId, data.changes);
  });
  
  // Listen for component updates
  syncClientInstance.on('component:updated', async (data) => {
    await updateXDComponents(data.componentId, data.changes);
  });
}

// Update XD document colors when tokens change
async function updateXDColors(tokenId, changes) {
  const selection = require('scenegraph').selection;
  const root = require('scenegraph').root;
  
  // Get all color swatches in document
  const swatches = root.document.swatches;
  
  // Find matching swatch by name
  const swatch = swatches.find(s => s.name === tokenId);
  
  if (swatch && changes.value) {
    // Update swatch color
    swatch.color = parseColor(changes.value);
    
    // Update all elements using this swatch
    updateElementsWithSwatch(swatch, root);
  }
}

// Update XD components when component specs change
async function updateXDComponents(componentId, changes) {
  // Find component symbol in XD
  const symbols = require('scenegraph').root.document.symbols;
  const symbol = symbols.find(s => s.name === componentId);
  
  if (symbol && changes.props) {
    // Update symbol properties
    // Note: XD API limitations may require manual updates
    notifyUser(`Component ${componentId} updated. Review changes in symbol library.`);
  }
}
```

#### Sync Client (WebSocket/Polling)
```javascript
// lib/sync-client.js
class SyncClient {
  constructor(endpoint, sessionToken) {
    this.endpoint = endpoint;
    this.sessionToken = sessionToken;
    this.ws = null;
    this.listeners = {};
    this.pollingInterval = null;
  }
  
  connect() {
    // Try WebSocket first
    try {
      this.ws = new WebSocket(`${this.endpoint}?token=${this.sessionToken}`);
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      };
      
      this.ws.onerror = () => {
        // Fallback to polling
        this.startPolling();
      };
    } catch (error) {
      // Fallback to HTTP polling
      this.startPolling();
    }
  }
  
  startPolling() {
    this.pollingInterval = setInterval(async () => {
      const response = await fetch(`${this.endpoint}/poll?token=${this.sessionToken}`);
      const updates = await response.json();
      
      updates.forEach(update => {
        this.emit(update.type, update.payload);
      });
    }, 5000); // Poll every 5 seconds
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}
```

### 3. Token Mapping & Updates

#### Color Token Sync
```javascript
// lib/token-mapper.js
class TokenMapper {
  // Map design system color token to XD color swatch
  mapColorToken(token) {
    return {
      name: token.name,
      color: this.parseColor(token.value),
      type: 'color'
    };
  }
  
  // Update XD document swatches
  async updateSwatches(tokens) {
    const { root } = require('scenegraph');
    const swatches = root.document.swatches;
    
    tokens.forEach(token => {
      let swatch = swatches.find(s => s.name === token.name);
      
      if (!swatch) {
        // Create new swatch
        swatch = swatches.add(token.name, this.parseColor(token.value));
      } else {
        // Update existing swatch
        swatch.color = this.parseColor(token.value);
      }
    });
  }
  
  parseColor(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b, a: 1 };
  }
}
```

#### Component Spec Sync
```javascript
// Component specifications are more complex
// XD doesn't have direct component prop mapping
// Would need to:
// 1. Update symbol documentation
// 2. Create/update component library references
// 3. Show notifications for manual review
async function syncComponentSpec(component) {
  // Update symbol metadata
  const symbol = findSymbol(component.id);
  if (symbol) {
    symbol.metadata = {
      description: component.description,
      props: component.props,
      usage: component.usage
    };
  }
  
  // Show notification panel
  showNotification({
    title: `Component ${component.name} Updated`,
    message: 'Review changes in symbol library',
    actions: ['View Symbol', 'Dismiss']
  });
}
```

## User Workflow

### Initial Setup

1. **Install Plugin**
   - User downloads plugin from Design System Platform
   - Installs plugin in Adobe XD (Plugins > Development > Import Plugin)
   - Plugin appears in XD plugin menu

2. **Authenticate**
   - User opens plugin panel in XD
   - Enters API key from Design System Platform
   - Plugin authenticates and establishes connection

3. **Configure Sync**
   - User selects which tokens/components to sync
   - Chooses sync mode (automatic vs. manual)
   - Sets update preferences (notify vs. auto-apply)

### Ongoing Sync

1. **Automatic Updates**
   - Designer updates token in Design System Platform
   - Backend emits change event via WebSocket
   - Plugin receives notification
   - XD document colors/styles update automatically
   - User sees notification of change

2. **Conflict Resolution**
   - If user has manually edited color in XD
   - Plugin detects conflict
   - Shows conflict resolution dialog
   - User chooses: Keep XD version, Use platform version, or Merge

3. **Component Updates**
   - Component spec changes in platform
   - Plugin updates symbol metadata
   - Shows notification for manual review
   - Designer reviews and applies changes

## Technical Requirements

### Backend Requirements

- **WebSocket Server**
  - Real-time event broadcasting
  - Connection management
  - Session handling
  - Reconnection logic

- **Change Detection**
  - Track token/component modifications
  - Emit granular change events
  - Maintain change history

- **API Endpoints**
  - `POST /api/v1/sync/authenticate` - Plugin authentication
  - `GET /api/v1/sync/tokens` - Get all tokens
  - `GET /api/v1/sync/components` - Get all components
  - `GET /api/v1/sync/status` - Sync status check

### Adobe XD Plugin Requirements

- **UXP SDK**
  - Adobe XD Plugin SDK
  - Scene graph API access
  - UI panel framework
  - Network permissions

- **Dependencies**
  - WebSocket client library (or HTTP polling)
  - Color parsing utilities
  - XD API wrappers

### Limitations & Considerations

1. **Adobe XD API Limitations**
   - Limited programmatic access to some document properties
   - Component props don't map directly to XD symbols
   - Some updates may require manual intervention

2. **Network Requirements**
   - Requires internet connection
   - WebSocket may be blocked by corporate firewalls
   - Fallback to HTTP polling needed

3. **Version Compatibility**
   - Plugin must support multiple XD versions
   - API changes between XD versions
   - Backward compatibility considerations

4. **Performance**
   - Large token libraries may cause slowdowns
   - Frequent updates could impact XD performance
   - Need efficient change detection

5. **User Experience**
   - Automatic updates might surprise users
   - Need clear notifications
   - Undo/redo support for synced changes
   - Conflict resolution UI

## Alternative Approaches

### 1. Polling Instead of WebSocket
- Simpler implementation
- No WebSocket server needed
- Less real-time (5-10 second delay)
- More server load

### 2. Manual Sync Button
- User-initiated sync
- No automatic updates
- More predictable behavior
- Less "magic" but more control

### 3. Hybrid Approach
- Automatic sync for tokens (low risk)
- Manual sync for components (high complexity)
- User configurable sync preferences

## Comparison: Export vs. Live Sync

| Feature | Current Export | Live Sync |
|---------|---------------|-----------|
| **Update Frequency** | One-time | Real-time |
| **User Action Required** | Download → Import | Automatic (optional) |
| **Plugin Required** | Third-party | Custom plugin |
| **Token Updates** | Manual re-import | Automatic |
| **Component Updates** | Manual re-import | Automatic (with review) |
| **Offline Support** | Yes (files) | No (requires connection) |
| **Complexity** | Low | High |
| **Maintenance** | Low | High (plugin updates) |

## Implementation Effort Estimate

### Backend Development
- WebSocket server: 2-3 weeks
- Change detection system: 1-2 weeks
- Authentication & security: 1 week
- Testing & documentation: 1 week
**Total: 5-7 weeks**

### Adobe XD Plugin Development
- Plugin structure & UI: 2 weeks
- Sync client implementation: 1-2 weeks
- XD API integration: 2-3 weeks
- Token/component mapping: 1-2 weeks
- Testing & debugging: 2 weeks
**Total: 8-10 weeks**

### Total Estimated Effort
**13-17 weeks** (3-4 months) for a complete implementation

## Conclusion

Live sync with Adobe XD would provide significant value by eliminating manual export/import workflows and ensuring designers always have the latest design tokens. However, it requires:

1. Significant development effort (3-4 months)
2. Ongoing maintenance of the XD plugin
3. Handling of Adobe XD API limitations
4. User education and support

The current export approach, while less automated, provides:
- Lower maintenance burden
- Works with any XD version
- No dependency on custom plugins
- Simpler user workflow

**Recommendation:** Consider live sync as a future enhancement if:
- There's strong user demand
- Resources are available for plugin development
- The team can commit to ongoing plugin maintenance
- Adobe XD remains a primary design tool for the organization

