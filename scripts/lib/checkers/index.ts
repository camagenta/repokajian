import type { PlatformChecker } from "../types.js";
import { telegramChecker } from "./telegram-checker.js";

export const CHECKERS: PlatformChecker[] = [
  telegramChecker,
  // Add future checkers here, e.g. websiteChecker or whatsappChecker.
];
