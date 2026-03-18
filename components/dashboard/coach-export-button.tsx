"use client";

import { useState, useTransition } from "react";
import { Download, FileText, FileJson } from "lucide-react";

type CoachExportButtonProps = {
  conversationId: string;
};

export function CoachExportButton({ conversationId }: CoachExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleExport(format: "markdown" | "json") {
    setIsOpen(false);
    startTransition(async () => {
      try {
        const res = await fetch("/api/coach/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, format }),
        });
        const json = await res.json();
        if (!json.success) return;

        const blob = new Blob([json.data.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = json.data.filename;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // Silent fail
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
        aria-label="Export conversation"
      >
        <Download className="size-3.5" />
        {isPending ? "Exporting..." : "Export"}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 rounded-xl border bg-background p-1 shadow-lg">
          <button
            onClick={() => handleExport("markdown")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
          >
            <FileText className="size-4" />
            Markdown
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
          >
            <FileJson className="size-4" />
            JSON
          </button>
        </div>
      )}
    </div>
  );
}
