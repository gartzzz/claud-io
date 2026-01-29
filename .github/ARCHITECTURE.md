# Claud.io Architecture

Visual diagrams and architecture documentation for the state synchronization system.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLAUD.IO SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐        ┌──────────────────┐        ┌────────────────┐
│   Claude Code    │        │  State File      │        │  Tauri App     │
│   CLI Process    │───────▶│  (JSON)          │◀───────│  (Desktop)     │
│                  │ writes │                  │ watches│                │
│  • Executes      │        │  ~/.claude/      │        │  • Visualizes  │
│  • Calls hooks   │        │  claud-io-       │        │  • Animates    │
│  • Runs tools    │        │  state.json      │        │  • Displays    │
└──────────────────┘        └──────────────────┘        └────────────────┘
         │                           │                           │
         │                           │                           │
         │                           │                           │
    ┌────▼─────┐              ┌─────▼──────┐           ┌────────▼───────┐
    │  Hook    │              │ File       │           │ React UI       │
    │  System  │              │ Watcher    │           │ Components     │
    └──────────┘              └────────────┘           └────────────────┘
```

## Data Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         STATE FLOW PIPELINE                                │
└───────────────────────────────────────────────────────────────────────────┘

  1. USER INPUT              2. CLAUDE EXECUTION        3. HOOK TRIGGER
┌──────────────┐           ┌──────────────────┐       ┌─────────────────┐
│              │           │                  │       │                 │
│  $ claude    │          │  Claude reads     │       │  Hook receives  │
│    "task"    │──────────▶│  files, runs     │──────▶│  event:         │
│              │           │  tools, thinks   │       │  "PreToolUse"   │
│              │           │                  │       │                 │
└──────────────┘           └──────────────────┘       └─────────────────┘
                                                                │
                                                                │
  4. FILE WRITE              5. TAURI DETECTION        6. EVENT EMISSION
┌──────────────┐           ┌──────────────────┐       ┌─────────────────┐
│              │           │                  │       │                 │
│  Write JSON  │          │  Poll detects     │       │  Emit event to  │
│  to state    │◀──────────│  file modified   │──────▶│  frontend:      │
│  file        │           │  (200ms check)   │       │  "claude-state- │
│              │           │                  │       │   changed"      │
└──────────────┘           └──────────────────┘       └─────────────────┘
                                                                │
                                                                │
  7. REACT UPDATE            8. STORE UPDATE           9. UI RENDER
┌──────────────┐           ┌──────────────────┐       ┌─────────────────┐
│              │           │                  │       │                 │
│  Hook        │          │  Zustand store   │       │  ClaudeCore     │
│  listens,    │──────────▶│  updates with   │──────▶│  animates       │
│  receives    │           │  new state       │       │  based on state │
│  event       │           │                  │       │                 │
└──────────────┘           └──────────────────┘       └─────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TAURI APPLICATION                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      BACKEND (Rust)                              │    │
│  │                                                                   │    │
│  │  ┌─────────────────┐         ┌──────────────────────────┐       │    │
│  │  │ StateManager    │         │ SessionManager           │       │    │
│  │  │                 │         │ (Terminal)               │       │    │
│  │  │ • File watcher  │         │                          │       │    │
│  │  │ • State parser  │         │ • PTY sessions           │       │    │
│  │  │ • Event emitter │         │ • Terminal I/O           │       │    │
│  │  └────────┬────────┘         └────────┬─────────────────┘       │    │
│  │           │                            │                         │    │
│  │           └────────────┬───────────────┘                         │    │
│  │                        │                                         │    │
│  │                  ┌─────▼──────┐                                  │    │
│  │                  │ Tauri Core │                                  │    │
│  │                  │ • IPC      │                                  │    │
│  │                  │ • Commands │                                  │    │
│  │                  │ • Events   │                                  │    │
│  │                  └─────┬──────┘                                  │    │
│  └────────────────────────┼─────────────────────────────────────────┘    │
│                            │ IPC Bridge                                  │
│  ┌─────────────────────────▼──────────────────────────────────────┐     │
│  │                   FRONTEND (React/Next.js)                      │     │
│  │                                                                  │     │
│  │  ┌──────────────────────────────────────────────────────────┐  │     │
│  │  │  Hooks Layer                                              │  │     │
│  │  │                                                            │  │     │
│  │  │  • useClaudeState() ──┐                                   │  │     │
│  │  │  • useStateFilePath() │                                   │  │     │
│  │  └────────────────────────┼───────────────────────────────────┘  │     │
│  │                            │                                     │     │
│  │  ┌─────────────────────────▼──────────────────────────────┐    │     │
│  │  │  State Management (Zustand)                            │    │     │
│  │  │                                                         │    │     │
│  │  │  Store:                                                 │    │     │
│  │  │  • stateData: ClaudeStateData                          │    │     │
│  │  │  • isConnected: boolean                                │    │     │
│  │  │  • messages: TerminalMessage[]                         │    │     │
│  │  │  • eventCount: number                                  │    │     │
│  │  │                                                         │    │     │
│  │  │  Selectors:                                             │    │     │
│  │  │  • useCurrentState()                                   │    │     │
│  │  │  • useIsConnected()                                    │    │     │
│  │  │  • useCurrentEvent()                                   │    │     │
│  │  │  • useCurrentToolName()                                │    │     │
│  │  └─────────────────────────┬──────────────────────────────┘    │     │
│  │                             │                                   │     │
│  │  ┌──────────────────────────▼─────────────────────────────┐    │     │
│  │  │  UI Components                                          │    │     │
│  │  │                                                          │    │     │
│  │  │  ┌────────────────┐  ┌──────────────┐  ┌────────────┐ │    │     │
│  │  │  │ ClaudeCore     │  │ StatusBar    │  │ Terminal   │ │    │     │
│  │  │  │                │  │              │  │            │ │    │     │
│  │  │  │ • Animation    │  │ • Indicators │  │ • Messages │ │    │     │
│  │  │  │ • Particles    │  │ • Stats      │  │ • Events   │ │    │     │
│  │  │  │ • Glow         │  │ • Status     │  │ • Tools    │ │    │     │
│  │  │  └────────────────┘  └──────────────┘  └────────────┘ │    │     │
│  │  │                                                          │    │     │
│  │  │  ┌────────────────┐  ┌──────────────┐                  │    │     │
│  │  │  │ GlassCard      │  │ Background   │                  │    │     │
│  │  │  │                │  │              │                  │    │     │
│  │  │  │ • Glass effect │  │ • Ambient    │                  │    │     │
│  │  │  │ • Borders      │  │ • Gradients  │                  │    │     │
│  │  │  └────────────────┘  └──────────────┘                  │    │     │
│  │  └──────────────────────────────────────────────────────────┘    │     │
│  └──────────────────────────────────────────────────────────────────┘     │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## State Machine

```
                    ┌─────────────────────────────┐
                    │                             │
                    │      STATE MACHINE          │
                    │                             │
                    └─────────────────────────────┘

        SessionStart                        SessionEnd
        ────────────┐                 ┌────────────
                    │                 │
                    ▼                 │
              ┌──────────┐            │
              │          │            │
         ┌────┤   IDLE   │◄───────────┤
         │    │          │            │
         │    └──────────┘            │
         │         │                  │
         │         │ UserPromptSubmit │
         │         │                  │
         │         ▼                  │
         │    ┌──────────┐            │
         │    │          │            │
         │    │ THINKING │            │
         │    │          │            │
         │    └──────────┘            │
         │         │                  │
         │         │ PreToolUse       │
         │         │                  │
         │         ▼                  │
         │    ┌──────────┐            │
         │    │          │◄───────┐   │
         └────┤ WORKING  │        │   │
              │          │────────┘   │
              └──────────┘ PostToolUse│
                   │                  │
                   │ Stop             │
                   │                  │
                   ▼                  │
              ┌──────────┐            │
              │          │            │
              │   DONE   │────────────┘
              │          │
              └──────────┘

     Transitions:
     • idle → thinking:  UserPromptSubmit
     • thinking → working:  PreToolUse
     • working → working:  PostToolUse (loop)
     • working → done:  Stop
     • done → idle:  SessionEnd
     • any → idle:  SessionStart/SessionEnd
```

## File System Layout

```
File System
├── ~/.claude/
│   ├── hooks/
│   │   └── state-notifier.sh          # Hook script
│   └── claud-io-state.json            # State file (watched)
│
└── /path/to/claud-io/
    ├── src-tauri/
    │   ├── src/
    │   │   ├── main.rs                # Entry point
    │   │   ├── lib.rs                 # App setup
    │   │   ├── state.rs               # State management ⭐
    │   │   └── terminal/              # Terminal module
    │   │       ├── mod.rs
    │   │       ├── commands.rs
    │   │       ├── manager.rs
    │   │       ├── session.rs
    │   │       └── pty.rs
    │   └── Cargo.toml                 # Rust dependencies
    │
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx               # Main page
        │   └── globals.css
        │
        ├── lib/
        │   └── store.ts               # Zustand store ⭐
        │
        ├── hooks/
        │   └── useClaudeState.ts      # Sync hook ⭐
        │
        ├── types/
        │   └── tauri.ts               # Type definitions ⭐
        │
        └── components/
            ├── ClaudeCore.tsx         # Main animation
            ├── StatusBar.tsx          # Status display
            ├── GlassTerminal.tsx      # Event log
            ├── GlassCard.tsx          # UI card
            └── AmbientBackground.tsx  # Background

    ⭐ = New files for state sync
```

## Event Flow Sequence

```
Time  │  Claude Code        │  State File         │  Tauri          │  React
──────┼─────────────────────┼────────────────────┼──────────────────┼────────────
  0   │ User runs command   │                    │                  │
      │                     │                    │                  │
  1   │ SessionStart event  │                    │                  │
      │ ↓                   │                    │                  │
  2   │ Hook triggers       │                    │                  │
      │ ↓                   │                    │                  │
  3   │ Write state="idle"  │ ← File updated     │                  │
      │                     │   timestamp: T1    │                  │
      │                     │                    │                  │
 0.2s │                     │                    │ Poll detects ─┐  │
      │                     │                    │ mod time: T1  │  │
      │                     │                    │               │  │
      │                     │                    │ Read & parse  │  │
      │                     │                    │               │  │
      │                     │                    │ Emit event ───┼──┼─→ listen()
      │                     │                    │               │  │   receives
      │                     │                    │               │  │
      │                     │                    │               │  │   Update
      │                     │                    │               │  │   store
      │                     │                    │               │  │
      │                     │                    │               │  │   Render
      │                     │                    │               │  │   (idle)
      │                     │                    │               │  │
  4   │ UserPromptSubmit    │                    │               │  │
      │ ↓                   │                    │               │  │
  5   │ Hook: thinking      │ ← Update T2        │               │  │
      │                     │                    │               │  │
 0.2s │                     │                    │ Poll ─────────┼──┼─→ Update
      │                     │                    │               │  │   (thinking)
      │                     │                    │               │  │
  6   │ PreToolUse: Read    │ ← Update T3        │               │  │
      │                     │                    │               │  │
 0.2s │                     │                    │ Poll ─────────┼──┼─→ Update
      │                     │                    │               │  │   (working)
      │                     │                    │               │  │   tool:Read
```

## Technology Stack

```
┌────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                         │
└────────────────────────────────────────────────────────────┘

Frontend                Backend                 Tools
────────                ───────                 ─────
React 19.2             Rust 1.77+              TypeScript 5
Next.js 16.1           Tauri 2.9               Cargo
Zustand 5.0            Tokio 1.0               npm/pnpm
Framer Motion 11       Serde 1.0               ESLint
TypeScript 5           Chrono 0.4              Prettier
TailwindCSS 4          Dirs 5.0

State Management       IPC/Events              Build Tools
────────────────       ──────────              ───────────
Zustand                Tauri Events            Turbopack
React Hooks            JSON messages           Cargo
Custom hooks           File watching           Vite (Tauri)

Animation              Serialization           Dev Tools
─────────              ─────────────           ─────────
Framer Motion          Serde JSON              Chrome DevTools
CSS Transitions        Custom parser           Rust Analyzer
Hardware accel         Type-safe               Next.js DevTools
```

## Design Patterns

### Observer Pattern
```
StateManager (Subject)
    ↓ emits events
React Hook (Observer)
    ↓ updates
Zustand Store (Subject)
    ↓ notifies
UI Components (Observers)
```

### Singleton Pattern
```
StateManager: Arc-wrapped, single instance
SessionManager: Arc-wrapped, single instance
Zustand Store: Single global store
```

### Hook Pattern
```
useClaudeState(): Setup & cleanup
useCurrentState(): Selector
useIsConnected(): Selector
useCurrentEvent(): Selector
```

### Command Pattern
```
Tauri Commands:
├── get_claude_state
├── check_state_file_exists
└── get_state_file_path
```

## Performance Profile

```
Operation                  Time        Frequency
─────────────────────────  ──────────  ──────────
File poll check            < 1ms       Every 200ms
File read (on change)      < 5ms       Per state change
JSON parse                 < 1ms       Per state change
Event emit (Tauri)         < 1ms       Per state change
React re-render            16ms        Per state change
Animation frame            16ms        60 FPS

Total Latency (worst case): 200ms + 5ms + 1ms + 1ms + 16ms = ~223ms
Total Latency (best case):  0ms + 5ms + 1ms + 1ms + 16ms = ~23ms
Average Latency:           ~100ms
```

## Security Considerations

```
┌─────────────────────────────────────────────────────┐
│              SECURITY BOUNDARIES                     │
└─────────────────────────────────────────────────────┘

1. File System Access
   ├── Limited to ~/.claude/ directory
   ├── Read-only from Tauri
   └── No user input in file paths

2. IPC Communication
   ├── Type-checked with TypeScript
   ├── Validated in Rust
   └── No arbitrary code execution

3. State Validation
   ├── JSON schema enforced
   ├── Serde type safety
   └── Error handling for malformed data

4. UI Security
   ├── No eval() or dynamic code
   ├── XSS prevention via React
   └── Content sanitization
```

## Error Handling Strategy

```
Level          Strategy                  Recovery
─────────────  ────────────────────────  ──────────────────
File Not Found Return error, continue    Show "waiting"
Invalid JSON   Log error, skip update    Keep previous state
Parse Error    Return error, continue    Show error message
IPC Failure    Retry, then fallback      Manual mode
Event Loss     Next poll recovers        Self-healing
Network Error  N/A (local only)          N/A
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                  DEPLOYMENT MODEL                       │
└────────────────────────────────────────────────────────┘

Development                Production
───────────               ──────────

npm run tauri:dev         npm run tauri:build
       │                         │
       ├─ Next.js dev           ├─ Next.js build
       │  (Turbopack)           │  (optimized)
       │                         │
       ├─ Tauri dev             ├─ Tauri build
       │  (hot reload)          │  (release)
       │                         │
       └─ File watcher          └─ File watcher
          (200ms poll)              (200ms poll)

Output:                   Output:
- Development window     - Native executable
- Hot reload enabled     - Optimized bundle
- Source maps            - Minified code
- Debug symbols          - Release build
```

---

**Maintained by**: Claud.io Team
**Last Updated**: 2026-01-29
**Version**: 0.1.0
