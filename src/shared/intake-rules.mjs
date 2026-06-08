// Single source of truth for contribution-intake validation + slug rules.
//
// Imported by BOTH the CI validator (scripts/validate-contributions.mjs) and the
// in-app contribution form (src/app/lib/contribution-intake.ts), so the two can never
// drift. Must stay free of Node-only APIs (no `node:` imports) so it bundles in the
// browser.

export const ALLOWED_PLATFORMS = new Set(["tg", "yt", "ig", "web", "wa"]);
export const ALLOWED_TYPES = new Set(["channel", "group", "topic", "site", "profile"]);
export const REQUIRED_FIELDS = [
  "name",
  "platform",
  "source_type",
  "url",
  "handle",
  "region",
  "evidence_url",
  "submitted_by",
];

/** @param {unknown} value */
export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

/** @param {unknown} value */
export function isValidHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** @param {unknown} value */
export function canonicalSegment(value) {
  return String(value ?? "")
    .replace(/^@+/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** @param {unknown} value */
export function canonicalHandle(value) {
  return String(value ?? "")
    .replace(/^@+/, "")
    .trim()
    .toLowerCase();
}

/**
 * @param {unknown} id
 * @param {string} platform
 */
export function stripPlatformPrefix(id, platform) {
  const prefix = `${platform}-`;
  return String(id ?? "").startsWith(prefix) ? String(id).slice(prefix.length) : String(id ?? "");
}

/**
 * Filename slug for the pending intake file (without `.json`).
 * @param {Record<string, any>} item
 */
export function buildSlug(item) {
  if (item.source_type === "topic") {
    const parent = canonicalSegment(stripPlatformPrefix(item.parent_id, item.platform));
    return `${parent}-topic-${item.topic_id}`;
  }
  return canonicalSegment(item.handle);
}

export const REPO = {
  owner: process.env.NEXT_PUBLIC_REPO_OWNER ?? "t-onluring",
  repo: process.env.NEXT_PUBLIC_REPO_NAME ?? "vibathon-2026",
};

/** @param {unknown} value */
function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Canonical pending-intake JSON string. Key order matches the example in
 * docs/CONTRIBUTING.md so the promote script consumes it unchanged. Empty optionals
 * omitted. 2-space indent + trailing newline (matches existing files).
 * @param {Record<string, any>} item
 * @returns {string}
 */
export function buildIntakeJSON(item) {
  /** @type {Record<string, unknown>} */
  const out = {
    name: item.name,
    platform: item.platform,
    source_type: item.source_type,
    url: item.url,
    handle: item.handle,
    region: item.region,
  };

  if (item.source_type === "topic") {
    if (item.parent_id) out.parent_id = item.parent_id;
    if (item.topic_id) out.topic_id = String(item.topic_id);
  }

  if (hasItems(item.category)) out.category = item.category;
  if (hasItems(item.tags)) out.tags = item.tags;

  out.evidence_url = item.evidence_url;
  out.submitted_by = item.submitted_by;

  if (typeof item.notes === "string" && item.notes.trim() !== "") out.notes = item.notes.trim();

  return `${JSON.stringify(out, null, 2)}\n`;
}

/**
 * GitHub "new file" URL with filename + content prefilled (zero-backend path).
 * @param {string} slug
 * @param {string} json
 * @returns {string}
 */
export function buildGithubNewFileUrl(slug, json) {
  const filename = `data/contributions/pending/${slug}.json`;
  const params = new URLSearchParams({ filename, value: json });
  return `https://github.com/${REPO.owner}/${REPO.repo}/new/main?${params.toString()}`;
}

/**
 * Validate a single intake item.
 *
 * `errors` block submission; `warnings` (e.g. duplicates against the existing
 * registry) are non-blocking in the form but the CI validator escalates them to
 * failures so the registry stays clean.
 *
 * @param {Record<string, any>} item
 * @param {{ sources?: Array<Record<string, any>> }} [opts]
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateIntake(item, opts = {}) {
  const sources = Array.isArray(opts.sources) ? opts.sources : [];
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  for (const field of REQUIRED_FIELDS) {
    if (!isNonEmptyString(item[field])) errors.push(`missing required field '${field}'`);
  }

  if (!ALLOWED_PLATFORMS.has(item.platform)) {
    errors.push(`platform '${item.platform}' is invalid (use tg/yt/ig/web/wa)`);
  }
  if (!ALLOWED_TYPES.has(item.source_type)) {
    errors.push(`source_type '${item.source_type}' is invalid (use channel/group/topic/site/profile)`);
  }
  if (!isValidHttpUrl(item.url)) {
    errors.push("url must be a valid http/https URL");
  }
  if (!isValidHttpUrl(item.evidence_url)) {
    errors.push("evidence_url must be a valid http/https URL");
  }

  if (item.category !== undefined && (!Array.isArray(item.category) || item.category.some((v) => !isNonEmptyString(v)))) {
    errors.push("category must be an array of non-empty strings when provided");
  }
  if (item.tags !== undefined && (!Array.isArray(item.tags) || item.tags.some((v) => !isNonEmptyString(v)))) {
    errors.push("tags must be an array of non-empty strings when provided");
  }

  if (item.source_type === "topic") {
    if (!isNonEmptyString(item.parent_id)) {
      errors.push("parent_id is required for source_type=topic");
    } else if (!sources.some((s) => s.id === item.parent_id)) {
      errors.push(`parent_id '${item.parent_id}' does not exist in the registry`);
    }
    if (!isNonEmptyString(item.topic_id)) {
      errors.push("topic_id is required for source_type=topic");
    } else if (!/^\d+$/.test(String(item.topic_id))) {
      errors.push("topic_id must be numeric for source_type=topic");
    }
  }

  // Duplicate checks against the existing registry (warnings).
  const urlKey = String(item.url ?? "").toLowerCase();
  if (urlKey) {
    const dup = sources.find((s) => String(s.url).toLowerCase() === urlKey);
    if (dup) warnings.push(`url duplicates existing source '${dup.id}'`);
  }
  if (item.source_type !== "topic") {
    const handleKey = `${item.platform}::${canonicalHandle(item.handle)}`;
    const dup = sources.find((s) => `${s.platform}::${canonicalHandle(s.handle)}` === handleKey);
    if (dup) warnings.push(`handle duplicates existing source '${dup.id}'`);
  }

  return { errors, warnings };
}
