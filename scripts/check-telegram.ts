import { main } from "./check-sources.js";

console.warn("[health-check] check:telegram is deprecated; use check:sources instead.");

main().catch((err) => {
  console.error("[health-check] FAILED:", err);
  process.exit(1);
});
