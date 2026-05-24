import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";

type CheckItem = { name: string; ok: boolean; details: string };

type TopicFreshnessItem = {
  topic_id: string;
  topic_title: string;
  last_post_at: string | null;
  status: "active" | "stale" | "dead" | "blocked" | "error";
  checks: CheckItem[];
};

type SpikeArtifact = {
  generated_at: string;
  source: {
    source_id: string;
    handle: string;
    mode: "mtproto-auth-spike";
  };
  auth: {
    method: "mtproto";
    has_api_id: boolean;
    has_api_hash: boolean;
    has_session_string: boolean;
  };
  run: {
    status: "ok" | "blocked" | "error" | "needs_setup";
    message: string;
  };
  topics: TopicFreshnessItem[];
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const OUTPUT_PATH = process.env.SPIKE_OUTPUT_PATH ?? join(ROOT, "data", "spikes", "telegram-topic-freshness.json");

const HOURS = {
  ACTIVE: 24 * 7,
  STALE: 24 * 30,
};

function classifyFreshness(lastPostAt: string | null): "active" | "stale" | "dead" | "blocked" {
  if (!lastPostAt) return "blocked";
  const age = (Date.now() - new Date(lastPostAt).getTime()) / 3_600_000;
  if (!Number.isFinite(age)) return "blocked";
  if (age < HOURS.ACTIVE) return "active";
  if (age < HOURS.STALE) return "stale";
  return "dead";
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

async function fetchForumTopicFreshness(client: TelegramClient, handle: string): Promise<TopicFreshnessItem[]> {
  const entity = await client.getEntity(handle.startsWith("@") ? handle : `@${handle}`);

  const res = await client.invoke(
    new Api.channels.GetForumTopics({
      channel: entity as any,
      offsetDate: 0,
      offsetId: 0,
      offsetTopic: 0,
      limit: 100,
    })
  );

  const topicsRaw = (res as any)?.topics ?? [];
  if (!Array.isArray(topicsRaw) || topicsRaw.length === 0) {
    return [];
  }

  const topMessageIds = topicsRaw
    .map((t: any) => Number(t?.topMessage ?? 0))
    .filter((id: number) => Number.isFinite(id) && id > 0);

  const messageDateById = new Map<number, string | null>();
  if (topMessageIds.length > 0) {
    try {
      const messages = await client.getMessages(entity as any, { ids: topMessageIds });
      const arr = Array.isArray(messages) ? messages : [messages];
      for (const msg of arr as any[]) {
        const id = Number(msg?.id ?? 0);
        if (!id) continue;
        messageDateById.set(id, toIso(msg?.date));
      }
    } catch {
      // keep empty map; topic checks will explain missing date
    }
  }

  const topics: TopicFreshnessItem[] = topicsRaw.map((t: any) => {
    const topicId = String(t?.id ?? "unknown-topic-id");
    const topicTitle = String(t?.title ?? `Topic ${topicId}`);
    const topMessageId = Number(t?.topMessage ?? 0);
    const lastPostAt = messageDateById.get(topMessageId) ?? null;
    const status = classifyFreshness(lastPostAt);

    const checks: CheckItem[] = [
      {
        name: "auth_bootstrap",
        ok: true,
        details: "Authenticated MTProto session connected.",
      },
      {
        name: "forum_topics_fetch",
        ok: true,
        details: `Forum topic metadata loaded for ${topicTitle} (id=${topicId}).`,
      },
      {
        name: "freshness",
        ok: lastPostAt !== null,
        details:
          lastPostAt !== null
            ? `Last post timestamp resolved from topMessage id=${topMessageId}.`
            : "No resolvable last_post_at from topic topMessage in this run.",
      },
    ];

    return {
      topic_id: topicId,
      topic_title: topicTitle,
      last_post_at: lastPostAt,
      status,
      checks,
    };
  });

  return topics;
}

async function main() {
  const handle = process.env.TG_TARGET_HANDLE ?? "sijadwalkajian";
  const sourceId = process.env.TG_TARGET_SOURCE_ID ?? "tg-sijadwalkajian";

  const hasApiId = Boolean(process.env.TG_API_ID);
  const hasApiHash = Boolean(process.env.TG_API_HASH);
  const hasSession = Boolean(process.env.TG_SESSION_STRING);

  const ready = hasApiId && hasApiHash && hasSession;

  if (!ready) {
    const artifact: SpikeArtifact = {
      generated_at: new Date().toISOString(),
      source: { source_id: sourceId, handle, mode: "mtproto-auth-spike" },
      auth: {
        method: "mtproto",
        has_api_id: hasApiId,
        has_api_hash: hasApiHash,
        has_session_string: hasSession,
      },
      run: {
        status: "needs_setup",
        message: "Missing one or more required secrets (TG_API_ID, TG_API_HASH, TG_SESSION_STRING).",
      },
      topics: [],
    };

    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(artifact, null, 2), "utf-8");

    console.log("[track-b-spike] wrote artifact:", OUTPUT_PATH);
    console.log("[track-b-spike] run status:", artifact.run.status);
    console.log("[track-b-spike] message:", artifact.run.message);
    return;
  }

  const apiId = Number(process.env.TG_API_ID);
  const apiHash = String(process.env.TG_API_HASH);
  const sessionString = String(process.env.TG_SESSION_STRING);

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 2,
  });

  let artifact: SpikeArtifact;

  try {
    await client.connect();
    const topics = await fetchForumTopicFreshness(client, handle);

    const hasAnyTopic = topics.length > 0;
    const hasAnyTimestamp = topics.some((t) => t.last_post_at !== null);

    artifact = {
      generated_at: new Date().toISOString(),
      source: { source_id: sourceId, handle, mode: "mtproto-auth-spike" },
      auth: {
        method: "mtproto",
        has_api_id: true,
        has_api_hash: true,
        has_session_string: true,
      },
      run: hasAnyTopic
        ? hasAnyTimestamp
          ? {
              status: "ok",
              message: `Fetched ${topics.length} forum topics and resolved freshness timestamps for ${topics.filter((t) => t.last_post_at !== null).length}.`,
            }
          : {
              status: "blocked",
              message: `Fetched ${topics.length} forum topics but no last_post_at timestamps could be resolved in this run.`,
            }
        : {
            status: "blocked",
            message: "No forum topics were returned from Telegram for the target handle.",
          },
      topics,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    artifact = {
      generated_at: new Date().toISOString(),
      source: { source_id: sourceId, handle, mode: "mtproto-auth-spike" },
      auth: {
        method: "mtproto",
        has_api_id: true,
        has_api_hash: true,
        has_session_string: true,
      },
      run: {
        status: "error",
        message,
      },
      topics: [
        {
          topic_id: "__run__",
          topic_title: "Run Error",
          last_post_at: null,
          status: "error",
          checks: [
            { name: "auth_bootstrap", ok: false, details: message },
            { name: "topic_fetch", ok: false, details: "Topic retrieval failed." },
          ],
        },
      ],
    };
  } finally {
    await client.disconnect().catch(() => undefined);
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(artifact, null, 2), "utf-8");

  console.log("[track-b-spike] wrote artifact:", OUTPUT_PATH);
  console.log("[track-b-spike] run status:", artifact.run.status);
  console.log("[track-b-spike] message:", artifact.run.message);
  console.log("[track-b-spike] topics:", artifact.topics.length);
}

main().catch((err) => {
  console.error("[track-b-spike] FAILED:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
