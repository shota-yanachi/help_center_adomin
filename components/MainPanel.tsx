"use client";

import { useDashboard } from "@/context/DashboardContext";
import { ArticleComposer } from "./ArticleComposer";
import { ArticleList } from "./ArticleList";
import { Breadcrumb } from "./Breadcrumb";

export function MainPanel() {
  const { selectedSectionId, isConfigured } = useDashboard();

  if (!isConfigured) {
    return (
      <main className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        左サイドバー下部の⚙から接続設定（Worker URL）を入力してください。
      </main>
    );
  }

  if (!selectedSectionId) {
    return (
      <main className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        左のサイドバーからセクションを選択してください。
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <Breadcrumb />
      <div className="flex-1 overflow-y-auto">
        <ArticleList />
      </div>
      <ArticleComposer />
    </main>
  );
}
