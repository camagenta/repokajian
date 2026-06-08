// Client-side wrapper around the shared intake rules. No validation logic lives here;
// it re-exports the single source of truth (src/shared/intake-rules.mjs) and adds
// browser-only helpers for building the canonical JSON and the delivery URLs.

import {
  ALLOWED_PLATFORMS,
  ALLOWED_TYPES,
  REQUIRED_FIELDS,
  REPO,
  buildGithubNewFileUrl,
  buildIntakeJSON,
  buildSlug,
  validateIntake,
} from "@/shared/intake-rules.mjs";

export {
  ALLOWED_PLATFORMS,
  ALLOWED_TYPES,
  REQUIRED_FIELDS,
  REPO,
  buildGithubNewFileUrl,
  buildIntakeJSON,
  buildSlug,
  validateIntake,
};

// Resolved by the maintainer (see design doc).
export const NETLIFY_FORMS_ENABLED = process.env.NEXT_PUBLIC_DISABLE_NETLIFY_FORMS !== "true";
export const PRIMARY_SITE_URL = process.env.NEXT_PUBLIC_PRIMARY_SITE_URL ?? "https://repokajian.netlify.app";
export const MAINTAINER_EMAIL = process.env.NEXT_PUBLIC_MAINTAINER_EMAIL ?? "onluring@gmail.com";
export const NETLIFY_FORM_NAME = "source-intake";

export interface IntakeItem {
  name: string;
  platform: string;
  source_type: string;
  url: string;
  handle: string;
  region: string;
  evidence_url: string;
  submitted_by: string;
  category?: string[];
  tags?: string[];
  notes?: string;
  parent_id?: string;
  topic_id?: string;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

/** mailto: link to the maintainer with the JSON in the body. */
export function buildMailto(item: IntakeItem, json: string): string {
  const subject = `[Source Intake] ${item.name || "(tanpa nama)"}`;
  const body = [
    "Usulan source untuk registry kajian sunnah.",
    "",
    "Salin JSON di bawah ini ke data/contributions/pending/:",
    "",
    json,
  ].join("\n");
  const params = new URLSearchParams({ subject, body });
  return `mailto:${MAINTAINER_EMAIL}?${params.toString()}`;
}
