# Token and design sync

Two pages read Figma and Penpot files:

- **Token sync** (`/tokens/sync`, `/api/v1/token-sync`) pulls tokens from a design file, shows how they differ from the design system's tokens (`/api/v1/tokens`), and applies the changes you choose.
- **Design sync** (`/design-sync`, `/api/v1/design-sync`) compares the file's components with the component library.

Both only **read** design files. Nothing is written to Figma or Penpot, and no component code is generated from designs.

Adobe XD is not supported: Adobe has discontinued the XD plugin and cloud document APIs a sync would read from. Token sync connections saved for XD earlier still load, are marked "not supported", and can be deleted. New ones can't be created.

## Connections

A connection belongs to the person who created it (holders of `admin:users` see all of them). It stores:

| Field | |
|---|---|
| `tool` | `figma` or `penpot` |
| `apiKey` | Figma personal access token, or Penpot access token. Encrypted at rest; responses only say `hasApiKey`. |
| `fileId` | Figma: a file key or a figma.com `file`, `design`, `proto` or `board` URL (a branch URL reads the branch). Penpot: a file uuid, or a workspace URL (`…/#/workspace?…&file-id=<uuid>`). |
| `fileUrl` | Penpot only, optional: the instance for self-hosted Penpot. Defaults to the instance in the workspace URL, then `PENPOT_BASE_URL`, then `https://design.penpot.app`. |
| `autoSync`, `syncIntervalHours` | Scheduled pulls (see below), every 1 to 168 hours, default 24. |

### Figma

- Auth: `X-Figma-Token: <personal access token>` against `https://api.figma.com`.
- Reads `GET /v1/files/:key` (components, component sets, styles), `GET /v1/files/:key/nodes?ids=…` (colour and text style values), and `GET /v1/files/:key/variables/local`.
- The token needs the `file_content:read` scope, and `file_variables:read` for variables.
- **Variables need a full seat in a Figma Enterprise organization.** When Figma answers 403 (`Limited by Figma plan`, `Incorrect account type` or `Invalid scope`), the pull carries on with styles, and the run says why variables are missing (`variables.status: "unavailable"` with the message, also shown on the page).
- Only each variable collection's default mode is read; other modes are listed in the run's notes. Library (remote) variables, components and styles aren't read; they belong to the library file.

### Penpot

- Auth: `Authorization: Token <access token>`; self-hosted instances need the `enable-access-tokens` flag.
- Reads `POST /api/rpc/command/get-file` with `{ "id": "<file uuid>" }` and `Accept: application/json`.
- Tokens come from the file's library colours (solid only), typographies, and design tokens (`data.tokensLib`) when they are in a readable sets-of-tokens form. Penpot doesn't document the JSON form of its token library, so anything else is reported in the run's notes rather than guessed at.
- Components with a `variantId` are grouped into one component with variants. Penpot has no per-node links, so Penpot components have no "open in design tool" link.

### Egress

Every call goes through the same checks as the governance page fetch (`design-tools/design-tool-http.ts`): http(s) only, every address the host resolves to must be public (checked before the call and again at connect time against DNS rebinding), no redirects, a 20 second deadline (`DESIGN_TOOL_TIMEOUT_MS`) and a 25 MB cap. A self-hosted Penpot on a private network is refused with "Refused to contact …".

## Token sync

### Mapping

| Design tool | Token | Type, category |
|---|---|---|
| Colour variable, colour style (solid fill), Penpot colour or colour token | `color.<name>` | `color`, `colors` |
| Number variable scoped to gaps, or named spacing/gap/padding/margin; Penpot spacing token | `spacing.<name>` | `dimension`, `spacing` |
| Number variable scoped to corner radius, or named radius; Penpot borderRadius token | `border.radius.<name>` | `dimension`, `borders` |
| Number variable scoped to width/height, or named size; Penpot sizing token | `size.<name>` | `dimension`, `sizing` |
| Text style, Penpot typography | `typography.fontFamily.<name>`, `.fontSize.`, `.fontWeight.`, `.lineHeight.` | per facet, `typography` |
| Font-family string variable, font size/weight/line-height variables | as above | |

Names are lower case, split on `/` and `.`, with leading words that repeat the prefix dropped: `Colors/Primary/500` becomes `color.primary.500`, `Radius/sm` becomes `border.radius.sm`. A connection's `mappings` (`designToolTokenId` → `designSystemTokenName`) override the name for one token. Colours are hex (alpha only when not opaque), sizes px. Aliases become references to the token their target maps to (`{color.primary}`).

Values are compared loosely: `1rem` equals `16px`, `#FFF` equals `#ffffff`.

### The diff

`POST /token-sync/connections/:id/sync` reads the file and records a **run** with the diff. No tokens are written. Each connection keeps a baseline: the design and code values of each token the last time its changes were applied. Against it, each item is:

- **added**: in the design file, not in code. Default: take design.
- **changed**: the design value moved and code didn't (or it's the token's first sync). Default: take design.
- **conflict**: both sides moved since the baseline, the types differ, code holds a reference the design value would replace, or code deleted a synced token. Default: skip.
- **removed**: synced before, gone from the design file, still in code. Default: skip.

Tokens only changed in code since the last sync aren't proposed (code wins). Tokens only in code that never came from this file aren't "removed".

### Applying

`POST /token-sync/runs/:runId/apply` with `{ "choices": { "<token name>": "take-design" | "keep-code" | "skip" } }`. Items left out get their default, which is never destructive.

- **take-design** writes the design value: creates the token (`token:create`), updates it (`token:edit`) or, for a removal, deletes it (`token:delete`). The whole apply is refused with 403 if a chosen change needs a permission you don't have.
- **keep-code** leaves the token and records the design value in the baseline, so the same design value isn't proposed again; a later design change is.
- **skip** changes nothing; the item comes back on the next pull.

A token changed after the diff was made isn't overwritten, on whichever server the change was made: each write checks the stored value against the one the diff was made from in the same compare-and-swap, and an item that no longer matches fails with "Changed in code since this diff was made".

A run is applied once. Applying first claims the run with a compare-and-swap; only the caller whose claim lands writes anything, and a second caller at the same time gets 409. Each item's outcome is recorded on the run as it is written, and the claim is renewed with it. If an apply stops part-way (an error, or the server stopping), the run stays `applying` with its outcomes so far; once its claim lapses (immediately after an error, two minutes after a server stopped), applying it again finishes it with the choices it was started with. Items already recorded aren't written again, and a token that already holds its design value counts as written. The Token sync page shows **Finish applying** for such a run.

Of the diffs waiting for review, only the latest pull (by start time) can be applied; the others are marked superseded, including when two pulls finish at the same time or an earlier pull finishes later. The connection's `lastRunId` always names that latest pull.

### History

Runs are stored in Elasticsearch (`design-system-sync-runs`): when, who started it (or the schedule), the file name and version, counts, notes, the diff, and who applied what with each item's outcome. `GET /token-sync/connections/:id/runs` lists them (newest first, the last 50 per connection), `GET /token-sync/runs/:runId` returns one with its items.

## Design sync

`POST /design-sync/connections/:id/sync` reads the file's components and records a compare run (`kind: "components"`). Component sets count once, with their variants. Library components (not workspace ones) are matched in this order:

1. a **link** someone set (`PUT /design-sync/connections/:id/links` with `{ componentId, designNodeId }`; `designNodeId: null` unlinks);
2. the design node matched last time (a new name there is reported as **renamed**);
3. the same name (`Text Field`, `text-field` and `TextField` match).

What's left is **missing in code** or **missing in design**; a close pair of leftover names is reported as a possible rename. `GET /design-sync/connections/:id/file` returns the file's components live; `GET …/versions` the file versions seen by compares. Figma components link to their node in Figma.

`direction` other than `design-to-code` is refused: writing to design files isn't supported.

## Scheduled pulls

With `autoSync` on (`POST …/connections/:id/auto-sync` with `{ "intervalHours": 24 }`, or `autoSync`/`syncIntervalHours` on the connection), each server checks every `DESIGN_SYNC_SCHEDULER_INTERVAL_MS` (default 5 minutes) for connections that are due, claims each one, and pulls. The claim is a compare-and-swap write of a 10-minute lease, made before the design file is read, so only one instance runs an occurrence. The next occurrence is only scheduled (an interval after this one was first claimed) once the pull has recorded an outcome: a diff, a compare, or a failed run when the file can't be read. If a server stops mid-pull, the lease lapses and the next instance to check retries the occurrence; after 3 tries that never finish it is recorded as a failed run ("Gave up after 3 scheduled tries…") and the schedule moves on. Each connection keeps `lastAutoSync` (when, `ran`/`failed`/`gave-up`, how many tries, any error). A token pull only prepares a diff for review; nothing is applied until someone chooses. A design compare is recorded in the history. Disabled connections are skipped. Turn the scheduler off with `DESIGN_SYNC_SCHEDULER_ENABLED=false`; it never runs under `NODE_ENV=test`.

## Not verified against live services

The Figma and Penpot clients are tested against recorded-shape stubs of their APIs (`backend/src/design-tools/testing/fake-design-tools.ts`), not live accounts. Penpot's JSON form of the design token library is undocumented and handled defensively.
