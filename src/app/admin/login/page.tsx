import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAuthenticated } from "@/lib/auth";

export const metadata = { title: "Masuk admin" };

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Masuk admin</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          Hanya admin yang bisa menambah, mengubah, atau menghapus soal.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
