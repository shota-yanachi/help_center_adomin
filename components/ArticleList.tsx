"use client";

import { useDashboard } from "@/context/DashboardContext";
import { ArticleRow } from "./ArticleRow";

export function ArticleList() {
  const { articles, loadingArticles, articlesError } = useDashboard();

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
    <div className="divide-y divide-zinc-100">
      {articles.map((article) => (
        <ArticleRow key={article.id} article={article} />
      ))}
    </div>
  );
}
