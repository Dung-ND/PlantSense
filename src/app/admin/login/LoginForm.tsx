"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { login } from "@/app/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="field-input"
          aria-invalid={!!state?.error}
          aria-describedby={state?.error ? "login-error" : undefined}
        />
      </div>
      {state?.error && (
        <p id="login-error" role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <CircleAlert className="size-4" aria-hidden /> {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />} Log in
      </button>
    </form>
  );
}
