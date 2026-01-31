/**
 * Apply alpha to colors that are either:
 * - `hsl(45, 100%, 50%)` (legacy comma syntax)  -> `hsla(45, 100%, 50%, a)`
 * - `hsl(var(--token))` (modern space syntax via CSS variables) -> `hsl(var(--token) / a)`
 */
export function withAlpha(color: string, alpha: number) {
  if (color.startsWith('hsla(') || color.startsWith('rgba(')) return color;

  // `hsl(var(--token))` -> `hsl(var(--token) / a)`
  if (color.startsWith('hsl(var(')) {
    // Already has alpha (space syntax): `hsl(var(--token) / 0.5)`
    if (color.includes('/')) return color;

    // Exact form: `hsl(var(--token))`
    const match = color.match(/^hsl\(var\((--[^)]+)\)\)$/);
    if (match) {
      return `hsl(var(${match[1]}) / ${alpha})`;
    }

    // Fallback: try to inject before the final `))`
    return color.replace(/\)\)$/, ` / ${alpha}))`);
  }

  // `hsl(h, s%, l%)` -> `hsla(h, s%, l%, a)`
  if (color.startsWith('hsl(')) {
    // Only convert the legacy comma syntax safely.
    // If it doesn't contain commas, leave it unchanged.
    if (color.includes(',')) {
      return color.replace(/^hsl\(/, 'hsla(').replace(/\)$/, `, ${alpha})`);
    }
  }

  return color;
}
