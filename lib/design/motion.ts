/**
 * Motion Tokens - Animation & Transition System
 *
 * Consistent motion design for AXIS composites.
 * Uses Tailwind CSS animate utilities with custom timing.
 */

/**
 * Entry animations - for elements appearing
 */
export const enter = {
  fadeIn: "animate-in fade-in duration-200",
  fadeInSlow: "animate-in fade-in duration-500",
  slideUp: "animate-in slide-in-from-bottom-4 fade-in duration-300",
  slideDown: "animate-in slide-in-from-top-4 fade-in duration-300",
  slideLeft: "animate-in slide-in-from-right-4 fade-in duration-300",
  slideRight: "animate-in slide-in-from-left-4 fade-in duration-300",
  scaleIn: "animate-in zoom-in-95 fade-in duration-200",
  scaleInSlow: "animate-in zoom-in-90 fade-in duration-300",
} as const;

/**
 * Exit animations - for elements disappearing
 */
export const exit = {
  fadeOut: "animate-out fade-out duration-150",
  fadeOutSlow: "animate-out fade-out duration-300",
  slideUp: "animate-out slide-out-to-top-4 fade-out duration-200",
  slideDown: "animate-out slide-out-to-bottom-4 fade-out duration-200",
  slideLeft: "animate-out slide-out-to-left-4 fade-out duration-200",
  slideRight: "animate-out slide-out-to-right-4 fade-out duration-200",
  scaleOut: "animate-out zoom-out-95 fade-out duration-150",
} as const;

/**
 * Stagger delays - for list animations
 * Usage: className={`${enter.fadeIn} ${stagger(index)}`}
 */
export function stagger(index: number, baseMs = 50): string {
  const delay = index * baseMs;
  return `delay-[${delay}ms]`;
}

/**
 * Stagger class generator for inline styles
 * (for when Tailwind JIT doesn't support dynamic values)
 */
export function staggerStyle(index: number, baseMs = 50): React.CSSProperties {
  return { animationDelay: `${index * baseMs}ms` };
}

/**
 * Duration presets
 */
export const duration = {
  instant: "duration-0",
  fast: "duration-100",
  normal: "duration-200",
  slow: "duration-300",
  slower: "duration-500",
  slowest: "duration-700",
} as const;

/**
 * Easing presets
 */
export const easing = {
  linear: "ease-linear",
  in: "ease-in",
  out: "ease-out",
  inOut: "ease-in-out",
} as const;

/**
 * Transition presets - for hover/focus states
 */
export const transition = {
  none: "transition-none",
  all: "transition-all duration-200 ease-out",
  colors: "transition-colors duration-150 ease-out",
  opacity: "transition-opacity duration-200 ease-out",
  shadow: "transition-shadow duration-200 ease-out",
  transform: "transition-transform duration-200 ease-out",
  /** For interactive elements */
  interactive: "transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]",
  /** For cards/panels on hover */
  lift: "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
} as const;

/**
 * Pulse animations - for loading/attention states
 */
export const pulse = {
  subtle: "animate-pulse",
  slow: "animate-pulse [animation-duration:2s]",
  fast: "animate-pulse [animation-duration:0.75s]",
} as const;

/**
 * Spin animations - for loading indicators
 */
export const spin = {
  normal: "animate-spin",
  slow: "animate-spin [animation-duration:2s]",
  fast: "animate-spin [animation-duration:0.5s]",
} as const;

/**
 * Bounce animations - for attention
 */
export const bounce = {
  normal: "animate-bounce",
  subtle: "animate-bounce [animation-duration:2s]",
} as const;

/**
 * Combined export for convenience
 */
export const motion = {
  enter,
  exit,
  stagger,
  staggerStyle,
  duration,
  easing,
  transition,
  pulse,
  spin,
  bounce,
} as const;
