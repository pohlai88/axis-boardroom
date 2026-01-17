/**
 * Design System Exports
 * 
 * UI never change zone - tokens, typography, motion, UI system
 */

// Export all from tokens (main design tokens file)
export * from './tokens'

// Export motion animations separately (no conflicts)
export * as motion from './motion'

// Re-export typography components (React components, no naming conflict with tokens)
export { Heading1, Heading2, Heading3, Body, Caption } from './typography'

// ui-system is already exported via tokens (tokens imports from ui-system)
// No need to re-export to avoid conflicts

