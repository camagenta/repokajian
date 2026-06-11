import type { TopicDiscovery, TopicDiscoveryStatus } from "../../lib/data";
import { formatDateTime, formatRelative } from "../../lib/format";
import { MiniStat } from "./stat";

const TOPIC_STATUS_META: Record<TopicDiscoveryStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "text-[var(--olive)]" },
  stale: { label: "Stale", color: "text-[var(--clay)]" },
  dead: { label: "Dead", color: "text-[var(--clay-d)]" },
  blocked: { label: "Blocked", color: "text-[var(--clay-d)]" },
  ignored: { label: "Ignored", color: "text-[var(--g500)]" },
  error: { label: "Error", color: "text-[var(--clay-d)]" },
};

export function TopicDiscoveryPanel({ discovery }: { discovery: TopicDiscovery | null }) {
  const summary = discovery?.summary;
  const ignoredCount = summary?.ignored ?? 0;
  const blockedCount = (summary?.blocked ?? 0) + (summary?.error ?? 0);
  const promotable = discovery?.topics.filter((topic) =>
    topic.mapped && !topic.ignored && topic.evaluated_status !== "blocked" && topic.evaluated_status !== "error"
  ) ?? [];
  const candidates = promotable.slice(0, 5);

  return (
    <section className="mb-8 rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Track B · Topic Discovery</p>
          <h3 className="font-semibold text-[16px] text-[var(--slate)]">Sijadwal Kajian topic spike</h3>
          <p className="mt-1 max-w-[620px] text-[12.5px] leading-relaxed text-[var(--g700)]">
            Kandidat topic dipantau terpisah dari registry utama. Topic yang stabil bisa dipromosikan ke source resmi.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10.5px]">
            <span className="rounded-full border border-[var(--g300)] px-2 py-0.5 text-[var(--clay)]">discovery layer</span>
            <span className="rounded-full border border-[var(--g300)] px-2 py-0.5 text-[var(--g500)]">data/spikes/*</span>
            <span className="rounded-full border border-[var(--g300)] px-2 py-0.5 text-[var(--olive)]">review before registry</span>
          </div>
        </div>
        {discovery && (
          <div className="font-mono text-[10.5px] text-[var(--g500)]">
            Updated {formatDateTime(discovery.generated_at)} WIB
          </div>
        )}
      </div>

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <MiniStat label="Topics" value={summary.total_topics} />
            <MiniStat label="Active" value={summary.active} accent="jade" />
            <MiniStat label="Stale" value={summary.stale} accent="amber" />
            <MiniStat label="Dead" value={summary.dead} accent="rust" />
            <MiniStat label="Ignored" value={ignoredCount} accent="g500" />
            <MiniStat label="Blocked" value={blockedCount} accent="g500" />
          </div>

          {summary.total_topics === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[var(--g300)] bg-[var(--g100)] px-4 py-3 text-[12.5px] text-[var(--g700)]">
              Belum ada topic dari artifact spike lokal. Jalankan workflow/spike Track B lalu regenerate artifact supaya panel ini terisi.
            </div>
          ) : candidates.length > 0 ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--g500)]">
                  Track B sample candidates
                </span>
                <span className="font-mono text-[10.5px] text-[var(--g500)]">
                  showing {candidates.length} of {promotable.length} ready
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {candidates.map((topic) => (
                  <div key={topic.topic_id} className="rounded-lg border border-[var(--g300)] bg-[var(--ivory)] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-medium text-[var(--slate)]">{topic.topic_title}</span>
                      <span className={`shrink-0 font-mono text-[10.5px] ${TOPIC_STATUS_META[topic.evaluated_status].color}`}>
                        {TOPIC_STATUS_META[topic.evaluated_status].label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10.5px] text-[var(--g500)]">
                      {topic.mapped_region && <span className="capitalize">{topic.mapped_region}</span>}
                      {topic.mapped_source_id && <span>{topic.mapped_source_id}</span>}
                      {topic.last_post_at && <span>{formatRelative(topic.last_post_at)}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-[var(--g300)] bg-[var(--ivory)] px-4 py-3">
                <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--g500)]">
                  Promotion workflow
                </div>
                <div className="grid gap-1.5 font-mono text-[11px] text-[var(--g600)] sm:grid-cols-3">
                  <span>1. topic-promotion-candidates.json</span>
                  <span>2. topic-promotion-review.json</span>
                  <span>3. keep 5-topic dashboard sample</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-[var(--g300)] bg-[var(--ivory)] px-4 py-3 text-[12.5px] text-[var(--g700)]">
              Belum ada candidate siap promosi. Cek blocked/error dan mapping policy sebelum memasukkan topic ke registry utama.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--g300)] bg-[var(--g100)] px-4 py-3 text-[12.5px] text-[var(--g700)]">
          Artifact Track B belum tersedia di <code className="font-mono">data/spikes/telegram-topic-freshness-evaluated.json</code>.
        </div>
      )}
    </section>
  );
}
