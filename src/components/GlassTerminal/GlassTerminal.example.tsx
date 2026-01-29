'use client';

import { GlassTerminal } from './GlassTerminal';
import { Terminal } from '@xterm/xterm';

/**
 * Example usage of the GlassTerminal component
 *
 * This demonstrates various integration patterns:
 * 1. Basic terminal with welcome message
 * 2. Interactive terminal with command handling
 * 3. Streaming output simulation (for Claude thinking process)
 */

export function BasicTerminalExample() {
  return (
    <GlassTerminal
      title="OUTPUT"
      onTerminalReady={(term) => {
        term.writeln('\x1b[1;33mWelcome to Claud.io\x1b[0m');
        term.writeln('');
        term.writeln('Type commands or watch Claude think...');
        term.writeln('');
        term.write('$ ');
      }}
    />
  );
}

export function InteractiveTerminalExample() {
  const handleTerminalReady = (term: Terminal) => {
    let currentLine = '';

    term.writeln('\x1b[1;33mClaud.io Interactive Terminal\x1b[0m');
    term.writeln('');
    term.write('$ ');

    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle Enter key
      if (code === 13) {
        term.writeln('');
        if (currentLine.trim()) {
          handleCommand(term, currentLine.trim());
        }
        currentLine = '';
        term.write('$ ');
      }
      // Handle Backspace
      else if (code === 127) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Handle printable characters
      else if (code >= 32) {
        currentLine += data;
        term.write(data);
      }
    });
  };

  const handleCommand = (term: Terminal, cmd: string) => {
    switch (cmd.toLowerCase()) {
      case 'help':
        term.writeln('Available commands:');
        term.writeln('  help     - Show this message');
        term.writeln('  clear    - Clear terminal');
        term.writeln('  status   - Show Claude status');
        term.writeln('  think    - Simulate Claude thinking');
        break;

      case 'clear':
        term.clear();
        break;

      case 'status':
        term.writeln('\x1b[1;32m✓\x1b[0m Connected to Claude');
        term.writeln('\x1b[1;33m⚡\x1b[0m State: idle');
        break;

      case 'think':
        simulateThinking(term);
        break;

      default:
        term.writeln(`\x1b[1;31mCommand not found:\x1b[0m ${cmd}`);
        term.writeln('Type "help" for available commands');
    }
  };

  const simulateThinking = (term: Terminal) => {
    const steps = [
      'Analyzing request...',
      'Loading context...',
      'Processing thoughts...',
      'Generating response...',
      '\x1b[1;32m✓ Complete!\x1b[0m',
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        term.writeln(`\x1b[33m→\x1b[0m ${steps[index]}`);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);
  };

  return (
    <GlassTerminal
      title="INTERACTIVE"
      elevated
      onTerminalReady={handleTerminalReady}
    />
  );
}

export function StreamingOutputExample() {
  const handleTerminalReady = (term: Terminal) => {
    term.writeln('\x1b[1;33m// CLAUDE THINKING PROCESS\x1b[0m');
    term.writeln('');

    // Simulate streaming thought process
    const thoughts = [
      { delay: 500, text: '\x1b[36m[ANALYZE]\x1b[0m Reading user request...' },
      { delay: 800, text: '\x1b[36m[PLAN]\x1b[0m Breaking down into steps:' },
      { delay: 1000, text: '  1. Understand requirements' },
      { delay: 1200, text: '  2. Design component structure' },
      { delay: 1400, text: '  3. Implement with design tokens' },
      { delay: 1600, text: '\x1b[36m[EXECUTE]\x1b[0m Creating GlassTerminal component...' },
      { delay: 2000, text: '  ✓ Base structure defined' },
      { delay: 2200, text: '  ✓ XTerm.js integrated' },
      { delay: 2400, text: '  ✓ Glass morphism applied' },
      { delay: 2600, text: '  ✓ Amber theme configured' },
      { delay: 2800, text: '\x1b[1;32m[DONE]\x1b[0m Component ready!' },
      { delay: 3000, text: '' },
      { delay: 3200, text: '\x1b[2m// Press Ctrl+C to stop\x1b[0m' },
    ];

    thoughts.forEach(({ delay, text }) => {
      setTimeout(() => {
        term.writeln(text);
      }, delay);
    });
  };

  return (
    <GlassTerminal
      title="THINKING"
      onTerminalReady={handleTerminalReady}
    />
  );
}

/**
 * Full example page layout
 */
export function GlassTerminalExamples() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-smoke-bright mb-2">
          GlassTerminal <span className="text-amber-electric">Examples</span>
        </h1>
        <p className="font-mono text-sm text-smoke-dim">
          // Interactive terminal components with glass morphism
        </p>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="font-mono text-xl text-amber-electric mb-4">
            <span className="text-smoke-dim">// </span>
            Basic Terminal
          </h2>
          <BasicTerminalExample />
        </section>

        <section>
          <h2 className="font-mono text-xl text-amber-electric mb-4">
            <span className="text-smoke-dim">// </span>
            Interactive Terminal
          </h2>
          <InteractiveTerminalExample />
        </section>

        <section>
          <h2 className="font-mono text-xl text-amber-electric mb-4">
            <span className="text-smoke-dim">// </span>
            Streaming Output
          </h2>
          <StreamingOutputExample />
        </section>
      </div>
    </div>
  );
}
