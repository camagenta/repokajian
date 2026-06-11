import { CHECKERS } from "./lib/checkers/index.js";

const platforms = new Set<string>();

for (const checker of CHECKERS) {
  if (!checker.platform) {
    throw new Error("Checker is missing a platform key");
  }
  if (platforms.has(checker.platform)) {
    throw new Error(`Duplicate checker platform: ${checker.platform}`);
  }
  platforms.add(checker.platform);

  if (typeof checker.canMonitor !== "function") {
    throw new Error(`Checker ${checker.platform} is missing canMonitor()`);
  }
  if (typeof checker.check !== "function") {
    throw new Error(`Checker ${checker.platform} is missing check()`);
  }
}

console.log(`[test-checkers] ${CHECKERS.length} checker(s) registered: ${[...platforms].join(", ")}`);
