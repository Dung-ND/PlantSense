// Safe online backup of the database + uploaded photos, even while the site is running.
// Usage: npm run backup [-- backup-folder]   (default DATA_DIR/backups, keeps the last 14)
import Database from "better-sqlite3";
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(process.env.DATA_DIR || "data");
const root = path.resolve(process.argv[2] || path.join(dataDir, "backups"));
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const target = path.join(root, stamp);
mkdirSync(target, { recursive: true });

const db = new Database(path.join(dataDir, "plantsense.db"), { readonly: true });
await db.backup(path.join(target, "plantsense.db"));
db.close();
cpSync(path.join(dataDir, "uploads"), path.join(target, "uploads"), { recursive: true });
for (const extra of ["submissions.jsonl"]) {
  try { cpSync(path.join(dataDir, extra), path.join(target, extra)); } catch {}
}

const old = readdirSync(root).sort().slice(0, -14);
for (const dir of old) rmSync(path.join(root, dir), { recursive: true, force: true });
console.log(`Backup written to ${target}`);
