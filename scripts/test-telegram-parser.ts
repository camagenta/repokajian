import assert from "node:assert/strict";
import { parseTelegramHtml } from "./lib/fetch-telegram.js";
import {
  confidenceScoreFromMetrics,
  freshnessScore,
  statusFromAge,
} from "./lib/score.js";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`✅ ${name}`);
}

// ---- fixtures -------------------------------------------------------------

function channelHtml(opts: {
  counterValue?: string;
  counterType?: string;
  postDates?: string[];
}): string {
  const counter =
    opts.counterValue !== undefined
      ? `<div class="tgme_channel_info_counter"><span class="counter_value">${opts.counterValue}</span><span class="counter_type">${opts.counterType ?? "subscribers"}</span></div>`
      : "";
  const posts = (opts.postDates ?? [])
    .map((d) => `<div class="tgme_widget_message_date"><time datetime="${d}"></time></div>`)
    .join("");
  return `<html><body><div class="tgme_channel_info">${counter}</div>${posts}</body></html>`;
}

const HOUR_MS = 3_600_000;
function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR_MS).toISOString();
}

// ---- parseTelegramHtml ----------------------------------------------------

test("parseTelegramHtml: subscribers + latest post date", () => {
  const html = channelHtml({
    counterValue: "12.5K",
    counterType: "subscribers",
    postDates: [
      "2026-06-01T10:00:00+00:00",
      "2026-06-05T10:00:00+00:00", // latest
      "2026-06-03T10:00:00+00:00",
    ],
  });
  const m = parseTelegramHtml(html);
  assert.equal(m.subscribers, 12_500, "12.5K → 12500");
  assert.equal(m.last_post_at, "2026-06-05T10:00:00.000Z", "picks latest datetime");
  assert.ok(typeof m.last_post_age_hours === "number" && m.last_post_age_hours! > 0);
});

test("parseTelegramHtml: members counter (group) parsed, no post dates", () => {
  const html = channelHtml({ counterValue: "1 234", counterType: "members" });
  const m = parseTelegramHtml(html);
  assert.equal(m.subscribers, 1_234, "'1 234' → 1234");
  assert.equal(m.last_post_at, null, "no message dates → null");
  assert.equal(m.last_post_age_hours, null);
});

test("parseTelegramHtml: 'M' suffix human number", () => {
  const m = parseTelegramHtml(channelHtml({ counterValue: "1.2M", counterType: "subscribers" }));
  assert.equal(m.subscribers, 1_200_000);
});

test("parseTelegramHtml: empty/garbage HTML → all null", () => {
  const m = parseTelegramHtml("<html><body>nothing here</body></html>");
  assert.equal(m.subscribers, null);
  assert.equal(m.last_post_at, null);
  assert.equal(m.last_post_age_hours, null);
});

test("parseTelegramHtml: age reflects recency (~48h)", () => {
  const m = parseTelegramHtml(channelHtml({ postDates: [isoHoursAgo(48)] }));
  assert.ok(m.last_post_age_hours !== null);
  assert.ok(
    Math.abs(m.last_post_age_hours! - 48) < 1,
    `expected ~48h, got ${m.last_post_age_hours}`,
  );
});

// ---- score.ts -------------------------------------------------------------

test("statusFromAge: active/stale/dead boundaries", () => {
  assert.equal(statusFromAge(0), "active");
  assert.equal(statusFromAge(167), "active"); // < 168h (7d)
  assert.equal(statusFromAge(168), "stale"); // >= 7d, < 30d
  assert.equal(statusFromAge(719), "stale");
  assert.equal(statusFromAge(720), "dead"); // >= 30d
  assert.equal(statusFromAge(null), "error");
});

test("freshnessScore: tiered buckets", () => {
  assert.equal(freshnessScore(null), 0);
  assert.equal(freshnessScore(1), 100); // < 72h
  assert.equal(freshnessScore(100), 80); // < 168h
  assert.equal(freshnessScore(200), 50); // < 336h
  assert.equal(freshnessScore(500), 20); // < 720h
  assert.equal(freshnessScore(1000), 0); // >= 720h
});

test("confidenceScoreFromMetrics: weighted signals", () => {
  assert.equal(
    confidenceScoreFromMetrics({ subscribers: 100, last_post_at: "2026-06-05T10:00:00.000Z" }),
    1,
  ); // 0.4 + 0.35 + 0.25
  assert.equal(confidenceScoreFromMetrics({ subscribers: 100, last_post_at: null }), 0.75); // 0.4 + 0.35
  assert.equal(confidenceScoreFromMetrics({ subscribers: null, last_post_at: null }), 0.4); // 0.4 only
});

console.log(`\n✅ telegram parser + score tests passed (${passed})`);
