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
      className="rounded px-2 py-2 text-sm text-rose-600 underline underline-offset-2 hover:text-rose-700 dark:text-rose-400"
    >
      {label}
    </button>
  );
}
