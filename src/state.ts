import fs from "fs";

const STATE_FILE = "state.json";

export function loadState(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function saveState(state: Record<string, string>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}