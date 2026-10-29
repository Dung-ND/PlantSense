import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { seedProducts } from "@/data/seed-products";
import { productSchema } from "@/lib/products/schema";

/** Folder for the database and uploaded images. Back this folder up. */
export const DATA_DIR = path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || path.join(process.cwd(), "data"));
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const globalForDb = globalThis as unknown as { plantsenseDb?: Database.Database };

export function db() {
  if (globalForDb.plantsenseDb) return globalForDb.plantsenseDb;

  mkdirSync(UPLOADS_DIR, { recursive: true });
  const conn = new Database(path.join(DATA_DIR, "plantsense.db"));
  conn.pragma("journal_mode = WAL");
  conn.pragma("busy_timeout = 5000");
  conn.exec(`
    CREATE TABLE IF NOT EXISTS products (
      slug        TEXT PRIMARY KEY,
      status      TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 100,
      data        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS product_revisions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL,
      action      TEXT NOT NULL,
      data        TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_revisions_slug ON product_revisions(slug, id);
  `);

  const { n } = conn.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (n === 0) {
    const insert = conn.prepare("INSERT INTO products (slug, status, sort_order, data) VALUES (?, ?, ?, ?)");
    conn.transaction(() => {
      for (const raw of seedProducts) {
        const p = productSchema.parse(raw);
        insert.run(p.slug, p.status, p.sortOrder, JSON.stringify(p));
      }
    })();
  }

  globalForDb.plantsenseDb = conn;
  return conn;
}
