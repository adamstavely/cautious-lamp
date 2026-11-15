# VS Code Design System Extension: operating notes

What the extension does when things go wrong, and how to build and ship it. For what's tested, see [STATUS.md](./STATUS.md).

## API behaviour

- **Authentication**: `designSystem.apiKey` is sent as `Authorization: Bearer <key>`. Every API route needs a key, so without one the extension warns at start-up and tokens and components stay empty. There is no default key.
- **Timeouts and retries**: each request waits `designSystem.requestTimeout` ms (10 s by default). Timeouts, dropped connections and 5xx answers are retried twice, waiting 1 s then 2 s. 4xx answers (401 bad key, 404 wrong URL) fail at once, since asking again gets the same answer.
- **Caching**: tokens and components are cached for 5 minutes each. When a refresh fails, the last data loaded is kept; with none, features show nothing rather than guessing.
- **Logging**: every load, retry and error goes to the "Design System" output channel (`Design System: Show Output`).

## Build and package

```bash
cd vscode-design-system-extension
npm ci
npm run compile
npm test
npm run package   # design-system-extension.vsix
```

`@vscode/vsce` is a dev dependency, so nothing needs installing globally. `.vscodeignore` keeps sources, tests and source maps out of the `.vsix`.

## Publishing

Not set up: there is no Marketplace publisher or token for `design-system`. Until there is, distribute the `.vsix` from the CI artifact.

## Troubleshooting

1. Open `Design System: Show Output`.
2. "Unauthorized": set or fix `designSystem.apiKey`.
3. "Endpoint not found": `designSystem.apiUrl` must end in `/api/v1`.
4. "Cannot connect": the backend isn't running at `designSystem.apiUrl`.
5. "Request timeout": raise `designSystem.requestTimeout` or check the network.
