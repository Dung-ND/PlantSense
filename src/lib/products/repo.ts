import "server-only";
import { db } from "@/lib/db";
import { productSchema, type Product } from "@/lib/products/schema";

/**
 * The only place that reads or writes products. The admin form, the AI fill
 * and any future integration (e.g. an MCP server) all go through here.
 */

interface Row {
  slug: string;
  status: string;
  data: string;
  updated_at: string;
}

function parseRow(row: Row): Product {
  // Re-parse so old rows pick up defaults for fields added to the template later.
  return productSchema.parse(JSON.parse(row.data));
}

export function listProducts({ includeDrafts = false } = {}): Product[] {
  const rows = db()
    .prepare(`SELECT slug, status, data, updated_at FROM products ${includeDrafts ? "" : "WHERE status = 'published'"} ORDER BY sort_order, slug`)
    .all() as Row[];
  return rows.map(parseRow);
}

export function listProductsWithMeta() {
  const rows = db().prepare("SELECT slug, status, data, updated_at FROM products ORDER BY sort_order, slug").all() as Row[];
  return rows.map((r) => ({ product: parseRow(r), updatedAt: r.updated_at }));
}

export function findProduct(slug: string): Product | null {
  const row = db().prepare("SELECT slug, status, data, updated_at FROM products WHERE slug = ?").get(slug) as Row | undefined;
  return row ? parseRow(row) : null;
}

export class ProductConflictError extends Error {
  constructor(public field: "slug" | "sku", message: string) {
    super(message);
  }
}

/** Creates or updates a product. Pass `originalSlug` when editing (the slug itself may change). */
export function saveProduct(input: unknown, originalSlug?: string): Product {
  const product = productSchema.parse(input);
  const conn = db();

  return conn.transaction(() => {
    if (product.slug !== originalSlug && conn.prepare("SELECT 1 FROM products WHERE slug = ?").get(product.slug)) {
      throw new ProductConflictError("slug", "Another product already uses this URL name.");
    }
    const others = conn.prepare("SELECT data FROM products WHERE slug != ?").all(originalSlug ?? "") as { data: string }[];
    if (others.some((o) => (JSON.parse(o.data) as Product).sku.toLowerCase() === product.sku.toLowerCase())) {
      throw new ProductConflictError("sku", "Another product already uses this SKU.");
    }

    const data = JSON.stringify(product);
    if (originalSlug && conn.prepare("SELECT 1 FROM products WHERE slug = ?").get(originalSlug)) {
      conn
        .prepare("UPDATE products SET slug = ?, status = ?, sort_order = ?, data = ?, updated_at = datetime('now') WHERE slug = ?")
        .run(product.slug, product.status, product.sortOrder, data, originalSlug);
      conn.prepare("INSERT INTO product_revisions (slug, action, data) VALUES (?, 'update', ?)").run(product.slug, data);
    } else {
      conn.prepare("INSERT INTO products (slug, status, sort_order, data) VALUES (?, ?, ?, ?)").run(product.slug, product.status, product.sortOrder, data);
      conn.prepare("INSERT INTO product_revisions (slug, action, data) VALUES (?, 'create', ?)").run(product.slug, data);
    }
    return product;
  })();
}

export function updateProductFields(slug: string, patch: Partial<Pick<Product, "status" | "inStock">>) {
  const current = findProduct(slug);
  if (!current) throw new Error("Product not found");
  return saveProduct({ ...current, ...patch }, slug);
}

export function deleteProduct(slug: string) {
  const conn = db();
  conn.transaction(() => {
    const row = conn.prepare("SELECT data FROM products WHERE slug = ?").get(slug) as { data: string } | undefined;
    if (!row) return;
    conn.prepare("INSERT INTO product_revisions (slug, action, data) VALUES (?, 'delete', ?)").run(slug, row.data);
    conn.prepare("DELETE FROM products WHERE slug = ?").run(slug);
  })();
}

export function listRevisions(slug: string, limit = 20) {
  return db()
    .prepare("SELECT id, action, created_at FROM product_revisions WHERE slug = ? ORDER BY id DESC LIMIT ?")
    .all(slug, limit) as { id: number; action: string; created_at: string }[];
}

export function getRevision(id: number): Product | null {
  const row = db().prepare("SELECT data FROM product_revisions WHERE id = ?").get(id) as { data: string | null } | undefined;
  return row?.data ? productSchema.parse(JSON.parse(row.data)) : null;
}
