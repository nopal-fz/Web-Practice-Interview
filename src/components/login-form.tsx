"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--fg-muted)]">
        Username
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          className="field px-3 py-3 sm:py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--fg-muted)]">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="field px-3 py-3 sm:py-2"
        />
      </label>

      {state.error && (
        <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full px-4 py-3 sm:py-2"
      >
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}