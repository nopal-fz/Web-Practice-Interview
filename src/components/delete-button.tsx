"use client";

export function DeleteButton({ label = "Hapus" }: { label?: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Hapus soal ini? Tindakan ini tidak bisa dibatalkan.")) {
          event.preventDefault();
        }
      }}
      className="min-h-[40px] px-2 py-2 text-sm text-[var(--hardt)] underline underline-offset-2 transition-colors"
    >
      {label}
    </button>
  );
}
