"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-fg-muted">
        Username
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          className="field px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-fg-muted">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="field px-3 py-2"
        />
      </label>

      {state.error && (
        <p role="alert" className="notice notice-err">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full px-4 py-2.5"
      >
        {pending ? "VERIFYING..." : "MASUK"}
      </button>
    </form>
  );
}