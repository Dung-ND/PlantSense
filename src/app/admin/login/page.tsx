import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="mx-auto mt-12 max-w-sm">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Admin login</h1>
        <p className="mt-1 text-sm text-muted">Manage products and see what customers see.</p>
        {adminConfigured() ? (
          <LoginForm next={typeof next === "string" ? next : ""} />
        ) : (
          <p className="mt-6 rounded-xl bg-sun-100 p-4 text-sm">
            Admin is disabled. Set <code className="font-mono">ADMIN_PASSWORD</code> in the server’s <code className="font-mono">.env.local</code> and restart.
          </p>
        )}
      </div>
    </div>
  );
}
