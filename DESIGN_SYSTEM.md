# Claud.io - Sistema de Diseño

> "La casa de cristal del pensamiento" - Una interfaz donde ves a Claude trabajar.

---

## 1. Filosofía de Diseño

### Concepto Central: "The Thinking Glass House"

Claud.io es un **atelier de cristal cognitivo** donde el proceso de pensamiento de Claude se materializa como energía visible. No es una caja negra de IA - es una casa de vidrio donde cada razonamiento se convierte en luz y flujo.

**Claude no es un avatar, es una presencia energética:**
- Flujos de luz atravesando la interfaz (pensamientos en movimiento)
- Pulsos de energía al procesar (respiración cognitiva)
- Partículas que se organizan (proceso de construcción)

### Principios

1. **Transparencia** - Todo proceso es visible
2. **Cinética** - Energía en constante movimiento contenido
3. **Precisión** - Quirúrgico, intencional, sin ruido
4. **Vivo** - Respira, pulsa, reacciona
5. **Elegante** - Sofisticación sin ostentación

### Mood

**"Asombro técnico sereno"** - La sensación de ver un motor Ferrari en marcha: potencia extrema con elegancia absoluta.

**Referencias:**
- Her (2013): UI minimalista, cálida
- Iron Man JARVIS: Asistente AI como presencia luminosa
- Nothing Phone: Glyph Interface, LEDs como lenguaje
- Teenage Engineering: Minimalismo funcional

---

## 2. Paleta de Colores

### Filosofía: Monocromía Eléctrica

**UN solo color de acento.** Sin rainbow. Sin vibecoded extravaganza.

### Color Principal: Electric Amber

```css
:root {
  /* ══════════════════════════════════════════════════════════════
     ELECTRIC AMBER - El único acento
     Amarillo eléctrico profundo con carga de naranja
     ══════════════════════════════════════════════════════════════ */

  --amber-electric: #F5A623;        /* Core - el color signature */
  --amber-bright: #FFBA42;          /* Highlights, hover states */
  --amber-deep: #E08A00;            /* Pressed states, depth */
  --amber-glow: rgba(245, 166, 35, 0.4);   /* Glows, shadows */
  --amber-subtle: rgba(245, 166, 35, 0.15); /* Backgrounds sutiles */
  --amber-wire: rgba(245, 166, 35, 0.08);   /* Energywires, borders */

  /* ══════════════════════════════════════════════════════════════
     VOID - Negros (nunca puro)
     ══════════════════════════════════════════════════════════════ */

  --void-deepest: #08080A;          /* El más oscuro, fondos base */
  --void-deep: #0E0E12;             /* Superficies principales */
  --void-mid: #16161C;              /* Cards, elementos elevados */
  --void-light: #1E1E26;            /* Hover sobre void-mid */
  --void-lighter: #282832;          /* Bordes sutiles */

  /* ══════════════════════════════════════════════════════════════
     SMOKE - Blancos (nunca puro)
     ══════════════════════════════════════════════════════════════ */

  --smoke-bright: #F0EDE8;          /* Texto principal */
  --smoke-mid: #B8B5AE;             /* Texto secundario */
  --smoke-dim: #7A7770;             /* Texto terciario, placeholders */
  --smoke-muted: #4A4844;           /* Texto deshabilitado */

  /* ══════════════════════════════════════════════════════════════
     ESTADOS SEMÁNTICOS
     Todos derivados del amber o neutrales
     ══════════════════════════════════════════════════════════════ */

  --state-success: #8BC34A;         /* Verde lima suave, no neón */
  --state-warning: var(--amber-electric); /* El amber ES warning */
  --state-error: #E57373;           /* Rojo coral suave */
  --state-info: var(--smoke-mid);   /* Neutral para info */
}
```

### Uso del Color

| Elemento | Color | Propósito |
|----------|-------|-----------|
| Texto principal | `--smoke-bright` | Legibilidad máxima |
| Texto secundario | `--smoke-mid` | Información de apoyo |
| Fondo base | `--void-deepest` | Profundidad máxima |
| Superficies | `--void-deep` / `--void-mid` | Jerarquía visual |
| Acento único | `--amber-electric` | TODO lo interactivo/importante |
| Glows | `--amber-glow` | Feedback visual, estados activos |
| Energywires | `--amber-wire` | Conexiones, flujos de datos |

### Regla de Oro

> **Si algo necesita destacar, usa amber. Si no, usa void/smoke.**
> No hay tercer color. Nunca.

---

## 3. Tipografía

### Sistema Dual

```css
:root {
  /* Display/Mono - Para código, datos, headers técnicos
     Degular Mono: Retro-futurista, distintivo, signature de SPARK */
  --font-mono: "degular-mono", "SF Mono", monospace;

  /* Body - Para UI, descripciones, texto corrido */
  --font-sans: "Inter", system-ui, sans-serif;
}
```

### Carga de Fuentes (Adobe Fonts / Fontsource)

```html
<!-- Adobe Fonts (si tienes licencia) -->
<link rel="stylesheet" href="https://use.typekit.net/[tu-kit-id].css">

<!-- O via CSS -->
@import url("https://use.typekit.net/[tu-kit-id].css");
```

```css
/* Fallback weights disponibles en degular-mono */
font-weight: 400; /* Regular */
font-weight: 500; /* Medium */
font-weight: 700; /* Bold */
```

### Escala Tipográfica

```css
:root {
  --text-xs: 0.75rem;     /* 12px - timestamps, metadata */
  --text-sm: 0.875rem;    /* 14px - labels, captions */
  --text-base: 1rem;      /* 16px - body text */
  --text-lg: 1.125rem;    /* 18px - emphasized text */
  --text-xl: 1.25rem;     /* 20px - card titles */
  --text-2xl: 1.5rem;     /* 24px - section headers */
  --text-3xl: 2rem;       /* 32px - page titles */
  --text-4xl: 2.5rem;     /* 40px - hero elements */
}
```

### Patrones de Texto

**Headers con prefijo (signature style):**
```html
<h2 class="font-mono uppercase tracking-wide text-amber-electric">
  <span class="text-smoke-dim">//</span> TÍTULO
</h2>
```

**Código/Terminal:**
```html
<code class="font-mono text-smoke-bright bg-void-mid px-2 py-1 rounded">
  const result = await claude.think();
</code>
```

**Etiquetas de estado:**
```html
<span class="font-mono text-xs uppercase tracking-wider text-amber-electric">
  processing
</span>
```

### Características de Degular Mono

- **Estilo:** Retro-futurista, geométrico, distintivo
- **Mejor uso:** Headers, labels, datos, código
- **Tracking:** Ligeramente expandido para legibilidad
- **Peso display:** 500 (Medium) o 700 (Bold) para headers
- **Peso body mono:** 400 (Regular) para código

---

## 4. Espaciado y Layout

### Grid Base: 4px

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 4px;     /* Badges, tags */
  --radius-md: 8px;     /* Buttons, inputs */
  --radius-lg: 12px;    /* Cards */
  --radius-xl: 16px;    /* Modales, panels */
  --radius-full: 9999px; /* Pills, avatars */
}
```

---

## 5. Efectos Visuales

### Glass Effect (Signature SPARK)

```css
.glass {
  background: var(--void-mid);
  backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid var(--amber-wire);
  box-shadow:
    inset 0 1px 0 rgba(240, 237, 232, 0.03),
    0 4px 24px rgba(0, 0, 0, 0.4);
}

.glass-elevated {
  background: rgba(30, 30, 38, 0.9);
  backdrop-filter: blur(20px) saturate(130%);
  border: 1px solid rgba(245, 166, 35, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(240, 237, 232, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.5);
}
```

### Glow System

```css
/* Glow sutil - hover states */
.glow-subtle {
  box-shadow: 0 0 20px var(--amber-glow);
}

/* Glow medio - elementos activos */
.glow-medium {
  box-shadow:
    0 0 20px var(--amber-glow),
    0 0 40px rgba(245, 166, 35, 0.2);
}

/* Glow intenso - Claude trabajando */
.glow-intense {
  box-shadow:
    0 0 30px var(--amber-glow),
    0 0 60px rgba(245, 166, 35, 0.3),
    0 0 100px rgba(245, 166, 35, 0.1);
}
```

### Energywires (Flujo de Datos)

```css
/* Línea base */
.energy-wire {
  stroke: var(--amber-wire);
  stroke-width: 1;
  fill: none;
}

/* Beam viajando */
.energy-beam {
  stroke: var(--amber-electric);
  stroke-width: 2;
  stroke-dasharray: 10 90;
  filter: drop-shadow(0 0 4px var(--amber-glow));
  animation: beam-travel 4s linear infinite;
}

@keyframes beam-travel {
  0% { stroke-dashoffset: 100%; }
  100% { stroke-dashoffset: -100%; }
}
```

### Corner Accents (Estilo AriseHunter)

```css
.corner-accent {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--amber-electric);
  border-style: solid;
  border-width: 0;
  opacity: 0.6;
}

.corner-accent--top-left {
  top: 0; left: 0;
  border-top-width: 2px;
  border-left-width: 2px;
}

.corner-accent--top-right {
  top: 0; right: 0;
  border-top-width: 2px;
  border-right-width: 2px;
}

/* ... bottom corners ... */
```

---

## 6. Sistema de Motion

### Timing Tokens

```css
:root {
  /* Micro - feedback instantáneo */
  --duration-instant: 50ms;
  --duration-swift: 100ms;
  --duration-quick: 150ms;

  /* Standard - transiciones UI */
  --duration-moderate: 250ms;
  --duration-smooth: 350ms;
  --duration-gentle: 500ms;

  /* Dramatic - estados importantes */
  --duration-dramatic: 600ms;

  /* Ambient - loops continuos */
  --duration-breathe: 2000ms;
  --duration-orbit: 3000ms;
  --duration-flow: 4000ms;
}
```

### Easing Curves

```css
:root {
  /* Salidas (elementos apareciendo) */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Bidireccional */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* Especiales Claude */
  --ease-think: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-spark: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Estados de Claude

#### IDLE - Respiración Calmada
```css
@keyframes claude-idle {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
    box-shadow: 0 0 20px var(--amber-glow);
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
    box-shadow: 0 0 30px var(--amber-glow);
  }
}

.claude-idle .core {
  animation: claude-idle var(--duration-breathe) var(--ease-think) infinite;
}
```

#### THINKING - Pulso Contemplativo
```css
@keyframes claude-thinking {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

.claude-thinking .core {
  animation: claude-thinking var(--duration-breathe) var(--ease-think) infinite;
}

.claude-thinking .orbit-particle {
  animation: orbit var(--duration-orbit) linear infinite;
}
```

#### WORKING - Energía Activa
```css
@keyframes claude-working {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.08); }
  30% { transform: scale(1.02); }
}

.claude-working .core {
  animation: claude-working 800ms var(--ease-spark) infinite;
  box-shadow: 0 0 50px var(--amber-glow);
}

.claude-working .energy-wire {
  animation: beam-travel var(--duration-flow) linear infinite;
}
```

#### DONE - Celebración Contenida
```css
@keyframes claude-done {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.claude-done .core {
  animation: claude-done var(--duration-dramatic) var(--ease-out-back);
}

.claude-done .success-ring {
  animation: ring-expand var(--duration-dramatic) var(--ease-out) forwards;
}
```

---

## 7. Componentes Core

### ClaudeCore (El Motor a la Vista)

El componente central que visualiza el estado de Claude.

```
┌─────────────────────────────────────┐
│                                     │
│         ○   ○   ○                   │  ← Partículas orbitando
│       ○           ○                 │
│                                     │
│           ┌─────┐                   │
│           │ ▓▓▓ │  ← Core pulsante  │
│           └─────┘                   │
│                                     │
│       ○           ○                 │
│         ○   ○   ○                   │
│                                     │
│  ══════════════════════             │  ← Energywires
│                                     │
└─────────────────────────────────────┘
```

### GlassCard

```
┌──────────────────────────────────┐
│ ┌─                          ─┐   │  ← Corner accents
│                                  │
│   // HEADER                      │  ← Prefijo mono
│                                  │
│   Contenido de la card...        │
│                                  │
│ └─                          ─┘   │
└──────────────────────────────────┘
     ↑
   Glass effect + amber border sutil
```

### LED Indicator

```css
.led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--amber-electric);
  box-shadow:
    0 0 4px var(--amber-electric),
    0 0 8px var(--amber-glow);
  animation: led-pulse var(--duration-breathe) var(--ease-smooth) infinite;
}

.led--off {
  background: var(--void-lighter);
  box-shadow: none;
  animation: none;
}
```

### Progress Bar

```css
.progress-track {
  height: 4px;
  background: var(--void-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--amber-deep), var(--amber-electric));
  box-shadow: 0 0 10px var(--amber-glow);
  transition: width var(--duration-smooth) var(--ease-out);
}
```

---

## 8. Accesibilidad

### Contraste

- Texto principal sobre void: **7.5:1** (AAA)
- Texto secundario sobre void: **4.8:1** (AA)
- Amber sobre void: **5.2:1** (AA)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 100ms !important;
  }

  /* Mantener estados visuales sin movimiento */
  .claude-working .core {
    box-shadow: 0 0 50px var(--amber-glow);
  }
}
```

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--amber-electric);
  outline-offset: 2px;
}
```

---

## 9. Resumen Visual

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   CLAUD.IO - Paleta Completa                                     │
│                                                                  │
│   ┌────────┐  Electric Amber  #F5A623                           │
│   │████████│  EL ÚNICO ACENTO                                   │
│   └────────┘                                                     │
│                                                                  │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│   │▓▓▓▓▓▓▓▓│ │▒▒▒▒▒▒▒▒│ │░░░░░░░░│ │        │ │        │        │
│   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│   Void Deep   Void Mid   Void Light  Smoke Mid  Smoke Bright    │
│   #0E0E12     #16161C    #1E1E26     #B8B5AE    #F0EDE8         │
│                                                                  │
│   NO: Cyan, Rainbow, Blanco puro, Negro puro                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Implementación

Este sistema se implementará con:

- **Next.js 14+** (App Router)
- **Tailwind CSS** (con config custom)
- **Framer Motion** (animaciones)
- **CSS Variables** (tokens de diseño)

El primer componente a construir será el **ClaudeCore** - el motor visual que muestra el estado de trabajo.

---

*"Nunca más te preguntes qué está haciendo la IA. Con Claud.io, VES a Claude pensar."*
