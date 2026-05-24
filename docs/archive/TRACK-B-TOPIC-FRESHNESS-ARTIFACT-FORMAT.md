# Track B — Topic Freshness Artifact Format (Spike)

## File target
Default output path:
- `data/spikes/telegram-topic-freshness.json`

Can be overridden with env:
- `SPIKE_OUTPUT_PATH`

## Top-level shape

```json
{
  "generated_at": "2026-05-24T00:00:00.000Z",
  "source": {
    "source_id": "tg-sijadwalkajian",
    "handle": "sijadwalkajian",
    "mode": "mtproto-auth-spike"
  },
  "auth": {
    "method": "mtproto",
    "has_api_id": true,
    "has_api_hash": true,
    "has_session_string": true
  },
  "run": {
    "status": "ok|blocked|error|needs_setup",
    "message": "human-readable run summary"
  },
  "topics": [
    {
      "topic_id": "string",
      "topic_title": "string",
      "last_post_at": "ISO8601|null",
      "status": "active|stale|dead|blocked|error",
      "checks": [
        { "name": "string", "ok": true, "details": "string" }
      ]
    }
  ]
}
```

## Rules
1. `generated_at` wajib ISO8601 UTC.
2. `source_id` wajib source parent group yang dipantau.
3. `topics[]` hanya berisi metadata freshness (no message body).
4. Jika auth belum siap, gunakan `run.status = needs_setup`.
5. Jika auth siap tapi data topic belum bisa ditarik karena limit akses/surface, gunakan `run.status = blocked`.

## Required env (when implementing real client)
- `TG_API_ID`
- `TG_API_HASH`
- `TG_SESSION_STRING`
- optional:
  - `TG_TARGET_SOURCE_ID`
  - `TG_TARGET_HANDLE`
  - `SPIKE_OUTPUT_PATH`

## Current B3 status
- Script draft sudah ada: `scripts/spikes/telegram-topic-freshness-spike.ts`
- Belum ada MTProto client call real (intentional for B3 draft)
