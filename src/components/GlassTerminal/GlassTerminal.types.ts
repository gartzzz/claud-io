import { Terminal } from '@xterm/xterm';

/**
 * Props for the GlassTerminal component
 */
export interface GlassTerminalProps {
  /**
   * Optional title for the terminal header
   * @default "TERMINAL"
   */
  title?: string;

  /**
   * Additional CSS classes for the container
   * @default ""
   */
  className?: string;

  /**
   * Whether to use elevated glass style (more blur, stronger shadow)
   * @default false
   */
  elevated?: boolean;

  /**
   * Whether to show corner accents (amber brackets)
   * @default true
   */
  cornerAccents?: boolean;

  /**
   * Callback when terminal is ready and initialized
   * Use this to write initial content or set up event handlers
   * @param terminal - The initialized xterm.js Terminal instance
   */
  onTerminalReady?: (terminal: Terminal) => void;

  /**
   * Initial content to write to terminal on mount
   * Written after terminal is initialized
   */
  initialContent?: string;
}

/**
 * Re-export Terminal type from xterm for convenience
 */
export type { Terminal } from '@xterm/xterm';

/**
 * Xterm.js theme configuration for Claud.io
 */
export interface XtermThemeConfig {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  selectionForeground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

/**
 * Claud.io terminal theme matching design system tokens
 */
export const CLAUD_IO_TERMINAL_THEME: XtermThemeConfig = {
  background: '#16161C', // var(--void-mid)
  foreground: '#F5A623', // var(--amber-electric)
  cursor: '#F5A623',
  cursorAccent: '#16161C',
  selectionBackground: 'rgba(245, 166, 35, 0.15)', // var(--amber-subtle)
  selectionForeground: '#F0EDE8', // var(--smoke-bright)
  black: '#08080A', // var(--void-deepest)
  red: '#E57373', // var(--state-error)
  green: '#8BC34A', // var(--state-success)
  yellow: '#FFBA42', // var(--amber-bright)
  blue: '#B8B5AE', // var(--smoke-mid)
  magenta: '#F5A623', // var(--amber-electric)
  cyan: '#F5A623', // var(--amber-electric)
  white: '#F0EDE8', // var(--smoke-bright)
  brightBlack: '#282832', // var(--void-lighter)
  brightRed: '#E57373',
  brightGreen: '#8BC34A',
  brightYellow: '#FFBA42',
  brightBlue: '#B8B5AE',
  brightMagenta: '#F5A623',
  brightCyan: '#F5A623',
  brightWhite: '#F0EDE8',
};
