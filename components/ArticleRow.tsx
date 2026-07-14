"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Article } from "@/lib/types";

export function ArticleRow({ article }: { article: Article }) {
  const { segments, toggleArticleVisibility } = useDashboard();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const currentSegment = segments.find((s) => s.id === article.user_segment_id);
  const isEveryone = !article.user_segment_id;
  const label = isEveryone ? "全員に公開" : currentSegment?.name ?? `セグメント#${article.user_segment_id}`;

  async function apply(userSegmentId: number | null) {
    setUpdating(true);
    try {
      await toggleArticleVisibility(article.id, userSegmentId);
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 text-sm last:border-b-0 hover:bg-zinc-50">
      <span className="flex-1 truncate text-zinc-900">{article.title}</span>
      <span className="w-16 shrink-0 text-xs text-zinc-400">#{article.id}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
          isEveryone
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        disabled={updating}
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary shrink-0 !px-2 !py-1 text-xs"
      >
        切替
      </button>

      {open && (
        <div className="absolute right-4 top-full z-10 mt-1 w-52 rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg">
          <button
            type="button"
            onClick={() => apply(null)}
            className={`block w-full px-3 py-1.5 text-left hover:bg-zinc-50 ${
              isEveryone ? "font-semibold text-zinc-900" : "text-zinc-700"
            }`}
          >
            全員に公開 (Everyone)
          </button>
          {segments.length === 0 && (
            <p className="px-3 py-1.5 text-xs text-zinc-400">
              セグメントがありません
            </p>
          )}
          {segments.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => apply(s.id)}
              className={`block w-full truncate px-3 py-1.5 text-left hover:bg-zinc-50 ${
                s.id === article.user_segment_id
                  ? "font-semibold text-zinc-900"
                  : "text-zinc-700"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
