/**
 * AXIS Props Type Utility
 *
 * Hard lock on className/style props for all composites.
 * Makes it impossible to pass className by accident at the type level.
 */

/**
 * Type utility that prevents className and style props
 *
 * @example
 * ```ts
 * export type PageHeaderProps = AxisProps<{
 *   title: string;
 *   // ... other props
 * }>;
 *
 * // This will cause a TypeScript error:
 * <PageHeader className="..." /> // ❌ Type error
 * ```
 */
export type AxisProps<P> = P & {
  className?: never;
  style?: never;
};
