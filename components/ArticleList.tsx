"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ArticleRow } from "./ArticleRow";

export function ArticleList() {
  const { articles, loadingArticles, articlesError, removeArticles } =
    useDashboard();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 記事一覧が入れ替わったら選択状態をリセットする（レンダー中に調整する公式パターン）
  const [prevArticles, setPrevArticles] = useState(articles);
  if (prevArticles !== articles) {
    setPrevArticles(articles);
    setSelected(new Set());
    setDeleteError(null);
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === articles.length ? new Set() : new Set(articles.map((a) => a.id))
    );
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (
      !window.confirm(
        `選択した${selected.size}件の記事をアーカイブします（Zendesk管理画面から復元・完全削除が可能です）。よろしいですか？`
      )
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await removeArticles(Array.from(selected));
      if (result.failed.length > 0) {
        setDeleteError(
          `${result.succeeded}/${selected.size}件アーカイブしました。失敗: ${result.failed
            .map((f) => `#${f.id}(${f.message})`)
            .join(", ")}`
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loadingArticles) {
    return <p className="px-6 py-4 text-sm text-zinc-400">読み込み中...</p>;
  }
  if (articlesError) {
    return <p className="px-6 py-4 text-sm text-red-600">{articlesError}</p>;
  }
  if (articles.length === 0) {
    return (
      <p className="px-6 py-4 text-sm text-zinc-400">
        このセクションにはまだ記事がありません。
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-4 py-2">
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          <input
            type="checkbox"
            checked={selected.size > 0 && selected.size === articles.length}
            onChange={toggleAll}
          />
          すべて選択
        </label>
        <button
          type="button"
          disabled={selected.size === 0 || deleting}
          onClick={handleDeleteSelected}
          className="btn-secondary !px-2 !py-1 text-xs text-red-600 disabled:text-zinc-400"
        >
          {deleting ? "アーカイブ中..." : `選択した記事をアーカイブ (${selected.size})`}
        </button>
        {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      </div>
      <div className="divide-y divide-zinc-100">
        {articles.map((article) => (
          <ArticleRow
            key={article.id}
            article={article}
            selected={selected.has(article.id)}
            onToggleSelect={() => toggle(article.id)}
          />
        ))}
      </div>
    </div>
  );
}
