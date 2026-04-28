/**
 * Feature flags & integration config.
 *
 * Each AI / 3rd-party feature has a kill switch here. Flip → redeploy → off.
 * Empty strings mean "not yet configured" — the component renders a graceful
 * placeholder instead of crashing.
 */

export const features = {
  /** Live market ticker in header. Falls back to /data/*.json on fetch failure. */
  marketTicker: true,

  /** AI Readiness Diagnostic at /demos/diagnostic. Deterministic rubric, no LLM. */
  aiDiagnostic: true,

  /** Semantic search on /insights using build-time embeddings. */
  semanticSearch: true,

  /** "More like this" widget on insight detail pages (uses same index). */
  relatedInsights: true,

  /** Show the AI summary card at top of insight detail pages. */
  aiSummaries: true,

  /** Plausible analytics. Add domain in Plausible dashboard. */
  plausible: true,
} as const;

export const integrations = {
  /** Plausible — set to your verified site domain. */
  plausibleDomain: 'tsholosetati.com',

  /** Formspree form ID (e.g., 'xyzabc123'). Empty disables submit. */
  formspreeId: '',

  /** Cloudflare Turnstile site key. Empty disables challenge (form still works). */
  turnstileSiteKey: '',
} as const;
