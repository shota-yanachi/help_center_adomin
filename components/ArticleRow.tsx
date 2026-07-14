"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Article } from "@/lib/types";

export function ArticleRow({
  article,
  selected,
  onToggleSelect,
}: {
  article: Article;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const { segments, toggleArticleVisibility, editArticle } = useDashboard();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(article.title);
  const [bodyDraft, setBodyDraft] = useState(article.body ?? "");
  const [labelsDraft, setLabelsDraft] = useState(
    (article.label_names ?? []).join(", ")
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  function startEditing() {
    setTitleDraft(article.title);
    setBodyDraft(article.body ?? "");
    setLabelsDraft((article.label_names ?? []).join(", "));
    setSaveError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await editArticle(article.id, {
        title: titleDraft.trim(),
        body: bodyDraft,
        label_names: labelsDraft
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      });
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-zinc-100 text-sm last:border-b-0">
      <div className="relative flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
          aria-label={`${article.title}を選択`}
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex flex-1 items-center gap-2 truncate text-left"
        >
          <span className="shrink-0 text-zinc-400">{expanded ? "▾" : "▸"}</span>
          <span className="truncate text-zinc-900">{article.title}</span>
        </button>
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

      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-3">
          {editing ? (
            <div className="flex flex-col gap-3">
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">タイトル</span>
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">本文（HTML）</span>
                <textarea
                  value={bodyDraft}
                  onChange={(e) => setBodyDraft(e.target.value)}
                  rows={8}
                  className="input font-mono text-xs"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">
                  ラベル（カンマ区切り）
                </span>
                <input
                  value={labelsDraft}
                  onChange={(e) => setLabelsDraft(e.target.value)}
                  className="input"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="btn-primary"
                >
                  {saving ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                {article.label_names && article.label_names.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {article.label_names.map((l) => (
                      <span
                        key={l}
                        className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={startEditing}
                  className="btn-secondary shrink-0 !px-2 !py-1 text-xs"
                >
                  編集
                </button>
              </div>
              {article.body ? (
                <div
                  className="article-body text-sm text-zinc-800"
                  dangerouslySetInnerHTML={{ __html: article.body }}
                />
              ) : (
                <p className="text-sm text-zinc-400">本文がありません</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
