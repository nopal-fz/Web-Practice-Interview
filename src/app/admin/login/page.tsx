import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAuthenticated } from "@/lib/auth";

export const metadata = { title: "Admin Console" };

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="wrap max-w-sm space-y-6 py-10">
      <div className="space-y-1">
        <p className="eyebrow font-mono">ADMIN_ACCESS</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin Console</h1>
        <p className="text-sm text-fg-muted">
          Akses manajemen soal interview. Autentikasi diperlukan.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
