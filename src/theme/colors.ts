/**
 * Raw colour values for places where a className cannot be used
 * (navigator options, icon `color` props, StatusBar, etc.).
 * Keep in sync with the tokens in global.css.
 */
export const colors = {
  primary: "#2563EB",
  background: "#F8FAFC",
  surface: "#F1F5F9",
  card: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#334155",
  textTertiary: "#64748B",
  icon: "#64748B",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
} as const;
