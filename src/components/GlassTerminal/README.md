# GlassTerminal Component

A terminal component with glass morphism styling, designed for the Claud.io design system. Built on xterm.js with WebGL acceleration and full Claud.io theming.

## Features

- **Glass Morphism**: Backdrop blur with subtle amber borders matching the design system
- **Amber Theme**: Electric amber text (#F5A623) on void background with subtle glow effects
- **WebGL Accelerated**: Hardware-accelerated rendering for smooth performance
- **Auto-Resize**: Automatically fits terminal to container with FitAddon
- **Corner Accents**: Signature corner brackets matching GlassCard
- **Monospace Typography**: Uses "Degular Mono" font family
- **Accessible**: Proper contrast ratios, reduced motion support
- **TypeScript**: Full type safety with exported Terminal type

## Installation

The required dependencies are already installed:

```bash
npm install @xterm/xterm @xterm/addon-fit @xterm/addon-webgl
```

## Basic Usage

```tsx
import { GlassTerminal } from '@/components/GlassTerminal';

function MyComponent() {
  return (
    <GlassTerminal
      title="OUTPUT"
      onTerminalReady={(term) => {
        term.writeln('Welcome to Claud.io');
        term.write('$ ');
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"TERMINAL"` | Header title text |
| `className` | `string` | `""` | Additional CSS classes for container |
| `elevated` | `boolean` | `false` | Use elevated glass style (more blur) |
| `cornerAccents` | `boolean` | `true` | Show corner bracket accents |
| `onTerminalReady` | `(terminal: Terminal) => void` | - | Callback when terminal is initialized |
| `initialContent` | `string` | - | Content to write on initialization |

## Advanced Usage

### Interactive Terminal

```tsx
import { GlassTerminal } from '@/components/GlassTerminal';
import { Terminal } from '@xterm/xterm';

function InteractiveTerminal() {
  const handleReady = (term: Terminal) => {
    let currentLine = '';

    term.write('$ ');

    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) { // Enter
        term.writeln('');
        processCommand(currentLine);
        currentLine = '';
        term.write('$ ');
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code >= 32) {
        currentLine += data;
        term.write(data);
      }
    });
  };

  return <GlassTerminal onTerminalReady={handleReady} />;
}
```

### Streaming Output (Claude Thinking)

```tsx
function ClaudeThinking() {
  const handleReady = (term: Terminal) => {
    term.writeln('\x1b[1;33m// THINKING PROCESS\x1b[0m');
    term.writeln('');

    // Simulate streaming thoughts
    const thoughts = [
      'Analyzing request...',
      'Planning approach...',
      'Generating code...',
      '\x1b[1;32m✓ Complete!\x1b[0m',
    ];

    thoughts.forEach((thought, i) => {
      setTimeout(() => term.writeln(thought), i * 500);
    });
  };

  return <GlassTerminal title="CLAUDE" elevated onTerminalReady={handleReady} />;
}
```

## ANSI Color Support

The terminal supports ANSI escape codes with the Claud.io color palette:

```tsx
term.writeln('\x1b[1;33mAmber text (bold)\x1b[0m');
term.writeln('\x1b[32mGreen (success)\x1b[0m');
term.writeln('\x1b[31mRed (error)\x1b[0m');
term.writeln('\x1b[2mDimmed text\x1b[0m');
```

### Color Mapping

| ANSI Color | Claud.io Token | Hex |
|------------|----------------|-----|
| Foreground | `--amber-electric` | `#F5A623` |
| Background | `--void-mid` | `#16161C` |
| Black | `--void-deepest` | `#08080A` |
| Red | `--state-error` | `#E57373` |
| Green | `--state-success` | `#8BC34A` |
| Yellow | `--amber-bright` | `#FFBA42` |
| White | `--smoke-bright` | `#F0EDE8` |

## Design System Integration

### Glass Effects

- Uses `glass` or `glass-elevated` classes from globals.css
- Applies `--amber-wire` border color
- Matches GlassCard visual hierarchy

### Corner Accents

- Identical to GlassCard corner brackets
- 12px × 12px, 2px border width
- 60% opacity amber electric color

### Typography

- Font family: `var(--font-mono)` (Degular Mono)
- Font size: 13px
- Line height: 1.4
- Letter spacing: Monospace default

### Motion

- Entry animation: 500ms ease-out
- Uses `--ease-out` curve: `cubic-bezier(0.16, 1, 0.3, 1)`
- Respects `prefers-reduced-motion`

## Accessibility

- **Contrast**: Amber on void provides 5.2:1 ratio (AA compliant)
- **Keyboard**: Full keyboard navigation with visible cursor
- **Screen Reader**: Terminal content is accessible to screen readers
- **Focus**: Visible focus indicators on cursor
- **Selection**: High-contrast selection background

## Performance

- **WebGL**: Hardware acceleration when available
- **Fallback**: Graceful degradation to canvas rendering
- **Scrollback**: 10,000 lines buffer
- **Auto-fit**: Efficient resize handling with ResizeObserver

## Examples

See `GlassTerminal.example.tsx` for complete working examples:

- Basic terminal with welcome message
- Interactive command-line interface
- Streaming output simulation
- Full example page layout

## Styling Customization

The component uses CSS-in-JS for terminal-specific styles. To customize:

```tsx
<GlassTerminal
  className="h-[400px] max-w-2xl"
  elevated
  title="CUSTOM"
/>
```

### Available Utility Classes

- Glass: `glass`, `glass-elevated`
- Glow: `glow-subtle`, `glow-medium`, `glow-intense`
- Animation: `animate-fade-in`

## Known Limitations

- WebGL addon may not load in some environments (gracefully handled)
- Minimum height: 300px (recommended for usability)
- No built-in clipboard support (use browser defaults)

## Related Components

- **GlassCard**: Similar glass morphism container
- **ClaudeCore**: Visual state representation
- **LED Indicator**: Status indicators in header

## Browser Support

- Chrome/Edge: Full WebGL support
- Firefox: Full WebGL support
- Safari: Canvas fallback (WebGL context limits)
- Mobile: Limited (desktop-focused component)

---

**Design System**: Claud.io
**Component Version**: 1.0.0
**Last Updated**: 2026-01-29
