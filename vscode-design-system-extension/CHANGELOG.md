# Changelog

All notable changes to the Design System VS Code Extension will be documented in this file.

## [1.0.0] - 2024-01-XX

### Added
- Initial release
- Autocomplete for design tokens and components
- Hover information for tokens and components
- Color preview decorations
- Code snippets for Vue, React, JavaScript, TypeScript
- Quick actions to replace hardcoded values with tokens
- Command palette integration
- API integration with Design System backend
- Caching for performance
- Comprehensive error handling
- Output channel for logging
- Retry logic for API calls
- Configuration validation

### Features
- Token autocomplete (`tokens.`)
- Component autocomplete (JSX/Vue templates)
- Hover documentation
- Color decorations
- Code snippets (`ds-button`, `ds-input`, etc.)
- Replace with token quick action
- Insert component/token commands
- Open component documentation
- Refresh cache command
- Show output command

### Configuration
- `designSystem.apiUrl` - API endpoint URL
- `designSystem.apiKey` - API authentication key
- `designSystem.enableAutocomplete` - Enable/disable autocomplete
- `designSystem.enableHover` - Enable/disable hover info
- `designSystem.enableColorPreview` - Enable/disable color previews
- `designSystem.enableSnippets` - Enable/disable snippets

