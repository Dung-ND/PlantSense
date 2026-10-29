import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "@/lib/db";

export type SubmissionKind = "order" | "contact" | "chat-lead";

export interface Submission {
  id: string;
  kind: SubmissionKind;
  createdAt: string;
  data: Record<string, unknown>;
}

/**
 * Stores orders, contact messages and chatbot leads.
 *
 * - If LEAD_WEBHOOK_URL is set, each submission is POSTed there as JSON
 *   (works with Zapier, Make, n8n, Google Apps Script, Slack/Discord bridges…).
 * - Otherwise (or additionally, when SAVE_SUBMISSIONS_TO_FILE=true) it is appended
 *   to DATA_DIR/submissions.jsonl.
 */
export async function saveSubmission(kind: SubmissionKind, data: Record<string, unknown>): Promise<Submission> {
  const submission: Submission = {
    id: `${kind === "order" ? "PS" : kind === "contact" ? "MSG" : "LEAD"}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    kind,
    createdAt: new Date().toISOString(),
    data,
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  const toFile = !webhook || process.env.SAVE_SUBMISSIONS_TO_FILE === "true";
  const tasks: Promise<unknown>[] = [];

  if (webhook) {
    tasks.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
        signal: AbortSignal.timeout(8000),
      }).then((res) => {
        if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      }),
    );
  }
  if (toFile) {
    tasks.push(mkdir(DATA_DIR, { recursive: true }).then(() => appendFile(path.join(DATA_DIR, "submissions.jsonl"), JSON.stringify(submission) + "\n")));
  }

  const results = await Promise.allSettled(tasks);
  const failures = results.filter((r) => r.status === "rejected");
  failures.forEach((f) => console.error("[submissions] failed to store", kind, (f as PromiseRejectedResult).reason));
  if (failures.length === results.length) throw new Error("Could not store submission");

  return submission;
}
