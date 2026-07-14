"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { NewCategoryModal } from "./NewCategoryModal";
import { NewSectionModal } from "./NewSectionModal";
import { SettingsModal } from "./SettingsModal";

export function Sidebar() {
  const {
    categories,
    sectionsByCategory,
    selectedSectionId,
    selectSection,
    isConfigured,
    loadingTree,
    treeError,
  } = useDashboard();
  const [modal, setModal] = useState<"category" | "section" | "settings" | null>(
    null
  );

  return (
    <>
      <aside className="flex h-full w-[170px] shrink-0 flex-col bg-zinc-900 text-zinc-300">
        <div className="border-b border-zinc-800 px-3 py-3">
          <span className="text-xs font-semibold tracking-wide text-zinc-100">
            Help Center
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {!isConfigured && (
            <p className="px-1 py-2 text-[11px] leading-snug text-zinc-500">
              ⚙から接続設定を入力してください
            </p>
          )}
          {isConfigured && loadingTree && (
            <p className="px-1 py-2 text-[11px] text-zinc-500">読み込み中...</p>
          )}
          {isConfigured && treeError && (
            <p className="px-1 py-2 text-[11px] leading-snug text-red-400">
              {treeError}
            </p>
          )}
          {isConfigured &&
            !loadingTree &&
            !treeError &&
            categories.map((category) => (
              <div key={category.id} className="mb-3">
                <div className="truncate px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  {category.name}
                </div>
                <ul>
                  {(sectionsByCategory[category.id] ?? []).map((section) => {
                    const isActive = section.id === selectedSectionId;
                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => selectSection(category.id, section.id)}
                          className={`w-full truncate rounded px-2 py-1.5 text-left text-[13px] ${
                            isActive
                              ? "bg-zinc-700 text-white"
                              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          {section.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-zinc-800 px-2 py-2">
          <button
            type="button"
            onClick={() => setModal("category")}
            className="rounded px-2 py-1.5 text-left text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            ＋新規カテゴリ
          </button>
          <button
            type="button"
            onClick={() => setModal("section")}
            className="rounded px-2 py-1.5 text-left text-[12px] text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            ＋新規セクション
          </button>
          <button
            type="button"
            onClick={() => setModal("settings")}
            className="mt-1 flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-[12px] text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <span aria-hidden>⚙</span> 接続設定
          </button>
        </div>
      </aside>

      {modal === "category" && (
        <NewCategoryModal onClose={() => setModal(null)} />
      )}
      {modal === "section" && <NewSectionModal onClose={() => setModal(null)} />}
      {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
    </>
  );
}
