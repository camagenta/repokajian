import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = createInterface({ input, output });

  const apiIdRaw = (process.env.TG_API_ID ?? "").trim();
  const apiHash = (process.env.TG_API_HASH ?? "").trim();

  if (!apiIdRaw || !apiHash) {
    console.error("[session-gen] Missing env: TG_API_ID and/or TG_API_HASH");
    console.error("Example:");
    console.error("TG_API_ID=123456 TG_API_HASH=abcdef... npm run spike:session-gen");
    process.exit(1);
  }

  const apiId = Number(apiIdRaw);
  if (!Number.isFinite(apiId)) {
    console.error("[session-gen] TG_API_ID must be numeric.");
    process.exit(1);
  }

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 3,
  });

  try {
    await client.start({
      phoneNumber: async () => (await rl.question("Phone number (e.g. +62812...): ")).trim(),
      password: async () => (await rl.question("2FA password (leave blank if none): ")).trim(),
      phoneCode: async () => (await rl.question("OTP code from Telegram: ")).trim(),
      onError: (err) => console.error("[session-gen] auth error:", err?.message ?? String(err)),
    });

    const str = client.session.save();

    console.log("\n✅ SESSION GENERATED");
    console.log("Name : TG_SESSION_STRING");
    console.log("Value:");
    console.log(str);
    console.log("\n⚠️ Save this in GitHub Secret. Do NOT commit/share it.");
  } finally {
    await client.disconnect().catch(() => undefined);
    rl.close();
  }
}

main().catch((err) => {
  console.error("[session-gen] FAILED:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
