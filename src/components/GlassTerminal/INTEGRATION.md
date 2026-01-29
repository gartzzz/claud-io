# GlassTerminal Integration Guide

This guide shows how to integrate the GlassTerminal component into your Claud.io pages.

## Quick Start

### 1. Import the Component

```tsx
import { GlassTerminal, Terminal } from '@/components/GlassTerminal';
```

### 2. Basic Usage

```tsx
export default function Page() {
  return (
    <div className="p-8">
      <GlassTerminal
        title="OUTPUT"
        onTerminalReady={(term) => {
          term.writeln('Ready');
          term.write('$ ');
        }}
      />
    </div>
  );
}
```

## Integration Patterns

### Pattern 1: Side-by-Side with ClaudeCore

Display Claude's thinking alongside terminal output:

```tsx
import { ClaudeCore } from '@/components/ClaudeCore';
import { GlassTerminal } from '@/components/GlassTerminal';

export default function ThinkingPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Left: Visual State */}
        <div className="flex items-center justify-center">
          <ClaudeCore state="thinking" size="lg" />
        </div>

        {/* Right: Terminal Output */}
        <GlassTerminal
          title="THINKING PROCESS"
          elevated
          className="h-[600px]"
          onTerminalReady={(term) => {
            term.writeln('\x1b[1;33m// Claude is thinking...\x1b[0m');
            term.writeln('');
          }}
        />
      </div>
    </div>
  );
}
```

### Pattern 2: Bottom Panel (Split View)

Terminal as a bottom panel, like VSCode:

```tsx
export default function SplitViewPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Top: Main Content */}
      <div className="flex-1 p-8">
        <ClaudeCore state="working" size="md" />
      </div>

      {/* Bottom: Terminal */}
      <div className="h-80 border-t border-amber-wire/20 p-4">
        <GlassTerminal
          title="CONSOLE"
          className="h-full"
          onTerminalReady={(term) => {
            term.write('$ ');
          }}
        />
      </div>
    </div>
  );
}
```

### Pattern 3: Multiple Terminals (Tabs/Grid)

Show different output streams:

```tsx
'use client';

import { useState } from 'react';
import { GlassTerminal } from '@/components/GlassTerminal';

export default function MultiTerminalPage() {
  const [activeTab, setActiveTab] = useState('output');

  const tabs = [
    { id: 'output', label: 'OUTPUT' },
    { id: 'thoughts', label: 'THOUGHTS' },
    { id: 'tools', label: 'TOOLS' },
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 font-mono text-xs uppercase tracking-wider
              rounded-lg transition-all
              ${activeTab === tab.id
                ? 'bg-amber-subtle text-amber-electric border border-amber-electric/30'
                : 'bg-void-mid text-smoke-mid hover:text-smoke-bright'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Terminal Views */}
      {activeTab === 'output' && (
        <GlassTerminal title="OUTPUT" elevated />
      )}
      {activeTab === 'thoughts' && (
        <GlassTerminal title="THOUGHTS" elevated />
      )}
      {activeTab === 'tools' && (
        <GlassTerminal title="TOOLS" elevated />
      )}
    </div>
  );
}
```

### Pattern 4: Real-time Streaming

Stream Claude's thinking process in real-time:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { GlassTerminal, Terminal } from '@/components/GlassTerminal';

export default function StreamingPage() {
  const terminalRef = useRef<Terminal | null>(null);

  useEffect(() => {
    // Simulate receiving Claude events
    const interval = setInterval(() => {
      if (terminalRef.current) {
        const timestamp = new Date().toLocaleTimeString();
        terminalRef.current.writeln(
          `\x1b[2m[${timestamp}]\x1b[0m Processing...`
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <GlassTerminal
        title="LIVE STREAM"
        elevated
        className="h-[600px]"
        onTerminalReady={(term) => {
          terminalRef.current = term;
          term.writeln('\x1b[1;33m// Streaming output\x1b[0m');
          term.writeln('');
        }}
      />
    </div>
  );
}
```

### Pattern 5: Full Page Terminal

Immersive terminal experience:

```tsx
export default function FullTerminalPage() {
  return (
    <div className="h-screen p-4">
      <GlassTerminal
        title="CLAUDE TERMINAL"
        elevated
        className="h-full"
        onTerminalReady={(term) => {
          term.writeln('\x1b[1;33mClaud.io v1.0.0\x1b[0m');
          term.writeln('');
          term.writeln('Type "help" for available commands');
          term.writeln('');
          term.write('$ ');

          // Add interactivity
          let currentLine = '';
          term.onData((data) => {
            const code = data.charCodeAt(0);
            if (code === 13) {
              term.writeln('');
              if (currentLine === 'help') {
                term.writeln('Available commands:');
                term.writeln('  help  - Show this message');
                term.writeln('  clear - Clear terminal');
              }
              currentLine = '';
              term.write('$ ');
            } else if (code === 127) {
              if (currentLine.length > 0) {
                currentLine = currentLine.slice(0, -1);
                term.write('\b \b');
              }
            } else if (code >= 32) {
              currentLine += data;
              term.write(data);
            }
          });
        }}
      />
    </div>
  );
}
```

## Adding to Existing page.tsx

To add a terminal to the current Claud.io page:

```tsx
// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ClaudeCore, ClaudeState } from '@/components/ClaudeCore';
import { GlassCard } from '@/components/GlassCard';
import { GlassTerminal } from '@/components/GlassTerminal'; // Add this

export default function Home() {
  const [state, setState] = useState<ClaudeState>('idle');
  // ... existing code ...

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-28px)] p-8">
      {/* ... existing header ... */}

      {/* Main Core Visualization */}
      <div className="flex-1 flex items-center justify-center">
        <ClaudeCore state={state} size="lg" />
      </div>

      {/* Add Terminal Below Core */}
      <GlassTerminal
        title="OUTPUT"
        className="w-full max-w-2xl h-64 mb-4"
        onTerminalReady={(term) => {
          term.writeln('\x1b[1;33m// Claud.io Terminal\x1b[0m');
          term.writeln('');
          term.writeln('Watching Claude think...');
          term.writeln('');
        }}
      />

      {/* ... existing event info and controls ... */}
    </div>
  );
}
```

## Common ANSI Codes

```tsx
// Colors
term.writeln('\x1b[33mAmber\x1b[0m');        // Yellow (amber)
term.writeln('\x1b[32mGreen\x1b[0m');        // Success
term.writeln('\x1b[31mRed\x1b[0m');          // Error
term.writeln('\x1b[34mBlue\x1b[0m');         // Info

// Styles
term.writeln('\x1b[1mBold\x1b[0m');          // Bold
term.writeln('\x1b[2mDim\x1b[0m');           // Dim
term.writeln('\x1b[4mUnderline\x1b[0m');     // Underline

// Combined
term.writeln('\x1b[1;32mBold Green\x1b[0m'); // Bold + Green
```

## Responsive Sizing

```tsx
// Fixed height
<GlassTerminal className="h-96" />

// Full viewport
<GlassTerminal className="h-screen" />

// Percentage of parent
<GlassTerminal className="h-3/4" />

// Responsive breakpoints
<GlassTerminal className="h-64 md:h-96 lg:h-[600px]" />
```

## Best Practices

1. **Always set a height**: Terminals need explicit height
2. **Use onTerminalReady**: Initialize content in the callback
3. **Store terminal ref**: If you need to write to it later
4. **Clear on unmount**: Terminal cleanup is automatic
5. **Test WebGL fallback**: Not all browsers support it
6. **Limit scrollback**: Default 10k lines is good for most cases
7. **Use ANSI codes**: More performant than React rendering

## Troubleshooting

### Terminal doesn't show
- Check that container has explicit height
- Verify xterm CSS is imported
- Check browser console for errors

### Text doesn't fit
- FitAddon auto-resizes
- Ensure no fixed width constraints
- Check parent container flex/grid settings

### WebGL warning
- Normal fallback behavior
- Terminal still works with canvas
- Check browser WebGL support

### Performance issues
- Reduce scrollback buffer
- Limit write frequency
- Use writeln() batch writes
- Enable WebGL if available

---

**Next Steps**: See `GlassTerminal.example.tsx` for complete working examples.
