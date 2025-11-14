# Terminal UI (TUI) Design System Standard

This standard governs the design, behavior, accessibility, and interaction patterns of Terminal User Interfaces (TUIs) across all command-line and console-based applications in the organization. It applies to:

- CLI tools
- Agentic assistant shells (LLM-aided workflows, Claude/MCP/OpenAI tools)
- ncurses-style full-screen TUIs
- Text UI dashboards and wizards
- Remote environments (SSH, tmux, headless CI)

TUIs are a first-class UI surface in our ecosystem. They must be intentional, consistent, scriptable, and accessible.

## 1. Purpose and Audience

TUIs serve:

- Engineers
- Analysts in secure / remote / no-GUI environments
- Automation workflows and pipelines
- Incident response and operational debugging

TUIs must therefore:

- Be fast (0 UI friction)
- Be consistent (no learning new affordances per tool)
- Support non-interactive usage (for CI & scripting)

This standard ensures interoperability and familiar ergonomics.

## 2. Design Foundations

### 2.1 Guiding Principles

| Principle | Definition | Required Behavior |
|-----------|------------|-------------------|
| **Command-Line First** | Default interaction assumes no mouse. | All functionality must be fully keyboard-accessible. |
| **Minimal Cognitive Overhead** | Users should recognize, not recall. | Show contextual hints, inline help, autocomplete. |
| **Deterministic Output** | The same input must always produce the same structured output. | Stable JSON schemas, stable field order, no random logging noise. |
| **Progress Transparency** | Users must always know what is happening. | Display status, elapsed time, cancellation cue. |
| **Recoverability** | Nothing should feel "trapped." | `q`, `Esc`, and `Ctrl+C` should always safely exit / cancel. |

### 2.2 Core Principles (Expanded)

| Principle | What It Means | Required Outcomes |
|-----------|---------------|-------------------|
| **Discoverability Without Documentation** | Users should discover commands & keybindings in-session. | Visible key-hints, autocomplete, structured help. |
| **Scriptability by Design** | CLI/TUI must support automation as a first-class consumer. | Stable structured outputs, quiet modes, human and machine modes. |
| **Predictable Errors** | Errors should explain what happened and how to fix it. | Clear messages, exit codes, recovery suggestions. |
| **State Transparency** | Users should always know "where they are" and what is selected. | Stable headers, selection indicators, breadcrumbs. |
| **No Dead Ends** | Users must be able to cancel or back out. | `Esc`, `q`, and `Ctrl+C` are consistently honored. |

## 3. Information Architecture for TUIs

### 3.1 Standard Layout (Full-Screen Mode)

```
┌─────────────────────────────────────────────┐
│ Header: Context • Path • Mode • Status      │ ← stable location
├─────────────────────────────────────────────┤
│ Main Content Region                         │
│ (lists, detail views, logs, tables, forms)  │
├─────────────────────────────────────────────┤
│ Footer Keyhint Bar                          │ ← always visible
│ (↑↓ move • Enter select • / search • q quit)│
└─────────────────────────────────────────────┘
```

### 3.2 Standard Layout (Non-Interactive CLI)

- **Default**: human readable
- **--json**: structured output
- **--quiet**: minimal outputs (for scripting)
- **Errors always → stderr**
- **Final results always → stdout**

## 4. Typography, Color, and Styling

### 4.1 Font & Text Behavior

- **Monospace required**
- **No italics** (not universally supported in terminals)
- **Bold allowed only for active selection and section headers**
- **Avoid ASCII art** unless it improves comprehension

### 4.2 Color Usage Rules

Terminal compatibility varies. Therefore:

| Meaning | Color | Non-Color Fallback | Example |
|---------|-------|---------------------|---------|
| Success | Green | `✓` prefix | `✓ Deployment complete` |
| Error | Red | `!` prefix | `! Connection failed` |
| Warning | Yellow | `⚠` prefix | `⚠ Missing config value` |
| Interactive focus | Bright highlight + inverse | `>` prefix + underline | `> selected-item` |

**Never depend on color alone to indicate state.**

### 4.3 Contrast

- Minimum 4.5:1 contrast ratio
- Test in dark mode, light mode, and 16-color terminals

## 5. Interaction Patterns

### 5.1 Global Keyboard Map (Mandatory)

| Action | Keys | Requirement |
|--------|------|-------------|
| Quit | `q` | Always exits the current screen safely |
| Help Overlay | `?` | Opens contextual help panel |
| Search/Filter | `/` | Prompts filter input |
| Confirm | `Enter` | Executes or enters submenu |
| Cancel/Back | `Esc` | Returns to previous screen |
| Navigation | `↑`, `↓`, `←`, `→` | Moves focus or selection |
| Interrupt | `Ctrl+C` | Cancels active process; never corrupts state |

**If any screen overrides these keys → that is a design violation.**

### 5.2 Forms and Prompts

**Input Prompt Format:**
```
Enter project name:
> █
```

**Yes/No Rules:**

Never assume "Yes" by default on destructive operations.

Require either:
- Explicit confirmation string (`DELETE`, name, etc.), or
- `--yes` CLI flag to skip interaction.

### 5.3 Keyboard Chord Conflict-Prevention

To avoid inconsistent shortcuts:

- Reserved keys: `q`, `?`, `/`, `Esc`, `Enter`, `Ctrl+C`
- Namespace rules: Use `Ctrl+` combinations for advanced features
- Document all shortcuts in help overlay

## 6. Component Specifications

### 6.1 List Views

```
 service-api
> service-auth   [running]   12 logs
  service-ui     [stopped]
```

**Rules:**
- Only one highlighted item at a time
- Highlight uses both color + symbol (e.g., `>` or `●`)
- Status badges use consistent terminology (`running` / `stopped` / `error`)

### 6.2 Tables

| Field | Rules |
|-------|-------|
| **Columns** | Must align text to type (names left, numbers right) |
| **Truncation** | End with `…`, never break columns |
| **Sorting** | `/` opens filter; `s` cycles sort columns |

**Example:**
```
NAME             STATUS     REQUESTS   ERRORS
service-api      running        520         2
service-auth     running        301         0
```

### 6.3 Logs / Streaming Output

```
14:02:17  INFO  Connected to cluster
14:02:19  WARN  Retry #1 (timeout)
14:02:21  INFO  Deployment complete ✓
```

**Rules:**
- Timestamp required
- Levels must be consistently colored / prefixed

## 7. Discoverability & Help Surfaces

TUIs must reduce the recall burden.

### 7.1 Always Present a Keyhint Bar

```
↑↓ move • Enter select • / search • ? help • q quit
```

This is required, not optional.

### 7.2 Help Overlay (`?`)

The help overlay must include:

- Available navigation keys
- Screen actions & shortcuts
- Context description
- Exit instructions

### 7.3 Command Help (`--help`)

For every subcommand:

```
command [subcommand] --help
```

Must show:

- Purpose (1 sentence)
- Arguments
- Examples
- Exit codes (if relevant)

## 8. Output Modes & Scriptability

| Mode | Description | Formatting Rules |
|------|-------------|-----------------|
| **Default (Human mode)** | For interactive users. | Colors allowed, tables allowed. |
| **--json** | For automation, pipelines, MCP agents, LangChain, Claude Tools. | No ANSI, stable field order, versioned schema. |
| **--quiet** | For scripting & CI logs. | Print only the final result. |
| **--no-interactive** | For non-TTY environments. | Disable full-screen UI; fall back to line output. |

### 8.1 Output Routing Rules

| Stream | Use |
|--------|-----|
| **stdout** | Final output / structured data |
| **stderr** | Progress, logs, warnings, status messages |

This prevents pipelines from breaking.

## 9. Error Messaging

Errors must be:

- **Actionable** (state the likely fix)
- **Consistent in tone**
- **Not verbose** unless `--verbose` is provided

### 9.1 Error Format Example

```
! Failed to connect to cluster "prod-us-east-1".

Possible causes:
  • Network access restricted
  • Credentials expired (`tool auth refresh`)

Run with --verbose for details.

exit code: 7
```

### 9.2 Error Messaging Format

Every error must include a recovery suggestion.

```
! Failed to fetch configuration
Suggestion: Verify your API token with `tool auth status`
```

## 10. Agentic / Claude / MCP TUI Guidance

LLM-assisted TUIs introduce session-state, permissions, and execution authority concerns.

### 10.1 Permission Prompts

When the system is about to:

- Write files
- Modify resources
- Execute external commands

A structured preview must be shown:

```
The assistant intends to modify:
  ./src/auth/session.ts  (add token-refresh logic)

Review changes? (y/n/diff)
```

### 10.2 Session Policy Display

Always show active session trust / scope in header:

```
mode: Assistant (edit allowed: ./src/* only)
```

### 10.3 Dry-Run First Rule (Mandatory)

Every agentic execution path must support:

- `--dry-run`

## 11. Navigation & Screen Structure

TUIs must use a consistent navigation model.

### 11.1 Screen Stack Model (Required)

Screens are pushed and popped like routes:

```
Root → List → Detail → Confirmation → Result
```

- `Esc` returns to the previous screen
- `q` exits to root (or exits entirely if at root)

### 11.2 Breadcrumb Header Pattern

```
project-manager › project-alpha › deployments
```

If space is limited:

```
 project-manager / project-alpha / …
```

### 11.3 Modal / Dialog Pattern

```
──────── Confirm Action ────────
Delete project "alpha"? This cannot be undone.

[Cancel]    [Delete]
```

Modal overlays must not obscure the footer key-hints.

## 12. Multi-Step Workflow Pattern

Many tasks are wizards. These must show progress + reversibility.

```
Step 2 of 4: Configure environment
────────────────────────────────────────
[form content]
────────────────────────────────────────
Back • Next • Cancel
```

**Rules:**

- User must be able to go backward (`← Back`)
- Do not change previously entered values
- Show a completion summary before execution

## 13. State Persistence & Session Memory

If a user navigates away from a form / wizard / list and returns:

**State must restore.**

That includes:

- scroll position
- selection
- partially entered text
- filters and search terms

This is mandatory. TUIs must feel non-destructive.

## 14. Undo & Revert Model

Especially critical for agentic flows.

### 14.1 All modifying operations must support:

- `--dry-run`
- A preview diff (if files are involved)
- Undo if technically possible, otherwise rollback instructions

**Example:**

```
Changes applied.

To undo:
  git restore --source=HEAD~1 ./src/auth/session.ts
```

If undo is not possible → warn the user before action.

## 15. Notifications, Alerts & System Messages

TUIs require a way to surface ephemeral messages without breaking flow.

### 15.1 Message Line Pattern (Required)

Appears above the footer:

```
⚠ Connection lost, retrying…  (Ctrl+C to cancel)
↑↓ move • Enter open • q quit
```

### 15.2 Message Severity Language

| Level | Prefix | Example |
|-------|--------|---------|
| Info | `•` | `• Saved.` |
| Warning | `⚠` | `⚠ API token expires soon.` |
| Error | `!` | `! Failed to push changes.` |
| Success | `✓` | `✓ Deployment complete.` |

## 16. Density, Alignment & Visual Hierarchy

Because terminals have limited space:

| Element | Rule |
|---------|------|
| Minimum left padding | 1 column |
| Maximum panel width | 100 characters before truncation |
| Lists | Never show more than 18 items without scrolling |
| Group related items | With exactly one blank line |
| Align text to function | Names left, values right |

**Example of correct vertical rhythm:**

```
Project ID:   alpha
Owner:        ops-team
Deployments:
  • prod
  • staging
```

## 17. Search, Fuzzy Matching & Filtering

### 17.1 `/` Opens Search Prompt (Required)

Search is always fuzzy by default. No regex unless explicitly requested.

### 17.2 Filter Indicator

When active, show:

```
Filter: "staging"
```

### 17.3 Clear Filter

`Esc` clears search → does not exit screen.

## 18. System State Indicators (Global Awareness)

TUIs should show what the system knows about the world.

**Examples:**

- Cluster connection state
- Synchronization lag
- Active Git branch
- Agent execution mode (readonly vs write-enabled)

**Shown in header:**

```
Connected: prod-us-east-1 · branch: main · mode: safe-edit
```

If disconnected:

```
! Offline (retrying…) · branch: main · mode: safe-edit
```

This prevents "WTF is it doing?" moments.

## 19. Environment & Terminal Capability Detection

Your TUI must detect and gracefully degrade when:

| Capability Missing | Fallback Behavior |
|-------------------|-------------------|
| Truecolor not supported | Use basic 16-color palette |
| Unicode unsupported | Replace icons with ASCII equivalents |
| Terminal too small (<80×24) | Switch to paginated non-interactive list |
| No TTY (CI/pipe) | Force `--no-interactive` mode |

**Never fail because the terminal is limited.**

## 20. OpenTUI / Bubble Tea / Textual Implementation Rules

### 20.1 State Model

Your UI must be built as a single state machine, not ad-hoc event handlers.

**Absolutely no business logic in view rendering.**

### 20.2 Pane & Panel Layout Patterns

When multiple regions are shown:

```
┌ Sidebar (nav) ─────┬─ Main Panel (detail/action) ─────────┐
│ item list           │ status / content                      │
│ filters              │ logs / forms / tables                 │
└─────────────────────┴───────────────────────────────────────┘
```

Panels should not reflow unpredictably on resize — just truncate.

## 21. Performance & Feedback

### 21.1 Progress Indicators

Must show:

- Action being performed
- Current step
- Estimated remaining time (if safe to approximate)
- How to cancel

**Example:**

```
⧗ Deploying service-auth… 45s elapsed (Ctrl+C to cancel)
```

### 21.2 Error Messaging Format

```
! Failed to fetch configuration
Suggestion: Verify your API token with `tool auth status`
```

Every error must include a recovery suggestion.

## 22. Accessibility Standards

| Requirement | Details |
|-------------|---------|
| **Keyboard-only operation** | Must be complete and equivalent to mouse behavior |
| **No color-only state** | Always back with symbol or text |
| **Terminal resizing** | Must maintain readability down to 80×24 |
| **Screen readers** | Enable optional `--no-ansi --no-interactive` mode |
| **Animations** | Prefer static or step-progress (no spinner required) |

## 23. Testing Requirements

| Test Type | Goal |
|-----------|------|
| **Render snapshot** | Ensure UI does not regress visually |
| **Keyboard navigation simulation** | Validate selection and flow |
| **Zero-color mode test** | Validate non-ANSI environments |
| **Headless CI mode** | Validate JSON output and noninteractive flows |
| **Resize test** | Ensure layout stability at various widths |

## 24. When to Use TUI vs. GUI

**Use TUI when:**

- Work is procedural, repeatable, scripted, or operational
- Users operate in SSH / terminal-only environments
- Latency matters more than visual layout

**Use GUI when:**

- The task requires spatial reasoning (diagrams, dashboards, UIs)
- The user performs rare or exploratory actions

## 25. The Mandatory TUI Compliance Checklist

Every TUI screen must meet all of these:

| Category | Requirement | Pass/Fail |
|----------|-------------|-----------|
| **Discoverability** | Keyhint Bar visible | ☐ |
| **Help** | `?` overlay functional | ☐ |
| **Navigation** | `↑↓←→`, `Enter`, `Esc`, `q`, `Ctrl+C` work globally | ☐ |
| **Output** | `--json` produces no ANSI | ☐ |
| **Automation** | Supports `--quiet` and `--no-interactive` | ☐ |
| **Errors** | Show recovery steps | ☐ |
| **Accessibility** | No color-only semantic encoding | ☐ |
| **Terminal Safety** | Degrades gracefully in low capability terminals | ☐ |
| **Agentic Safety** | If modifying files/resources, preview required | ☐ |
| **Testing** | Snapshot, resize, and key simulation tests present | ☐ |

This checklist will be required in PR review.

## 26. Minimal Required Interaction Patterns

| Action | Pattern | Notes |
|--------|---------|-------|
| Quit | `q` | Always works |
| Search | `/` | Incremental fuzzy filtering |
| Help | `?` | Must be discoverable |
| Confirmation | Explicit text OR `--yes` | Never auto-assume destructive confirm |
| Cancel | `Esc` or `Ctrl+C` | Must not corrupt state |
