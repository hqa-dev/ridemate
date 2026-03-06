/** Cast a CSS custom property string so React's CSSProperties accepts it for numeric fields like fontWeight, opacity, zIndex, etc. */
export function cssVar(name: string) {
  return `var(${name})` as unknown as number
}
