"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { EditCategoryModal } from "./EditCategoryModal";
import { EditSectionModal } from "./EditSectionModal";
import { NewCategoryModal } from "./NewCategoryModal";
import { NewSectionModal } from "./NewSectionModal";
import { SettingsModal } from "./SettingsModal";
import { Category, Section } from "@/lib/types";

export function Sidebar() {
  const {
    categories,
    sectionsByCategory,
    selectedSectionId,
    selectSection,
    isConfigured,
    loadingTree,
    treeError,
    removeCategory,
    removeSection,
  } = useDashboard();
  const [modal, setModal] = useState<"category" | "section" | "settings" | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDeleteCategory(categoryId: number, name: string) {
    if (
      !window.confirm(
        `カテゴリ「${name}」を削除します。配下の全セクション・記事も完全に削除され、元に戻せません。よろしいですか？`
      )
    ) {
      return;
    }
    setDeletingId(categoryId);
    try {
      await removeCategory(categoryId);
    } catch (e) {
      alert(`削除に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteSection(
    categoryId: number,
    sectionId: number,
    name: string
  ) {
    if (
      !window.confirm(
        `セクション「${name}」を削除します。配下の記事は全てアーカイブされます。よろしいですか？`
      )
    ) {
      return;
    }
    setDeletingId(sectionId);
    try {
      await removeSection(categoryId, sectionId);
    } catch (e) {
      alert(`削除に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDeletingId(null);
    }
  }

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
              <div key={category.id} className="group/category mb-3">
                <div className="flex items-center gap-1 px-1 py-1">
                  <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    {category.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(category)}
                    className="shrink-0 rounded px-1 text-zinc-600 opacity-0 hover:bg-zinc-800 hover:text-zinc-200 group-hover/category:opacity-100"
                    title="カテゴリを編集"
                    aria-label="カテゴリを編集"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === category.id}
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="shrink-0 rounded px-1 text-zinc-600 opacity-0 hover:bg-zinc-800 hover:text-red-400 group-hover/category:opacity-100"
                    title="カテゴリを削除"
                    aria-label="カテゴリを削除"
                  >
                    ×
                  </button>
                </div>
                <ul>
                  {(sectionsByCategory[category.id] ?? []).map((section) => {
                    const isActive = section.id === selectedSectionId;
                    return (
                      <li
                        key={section.id}
                        className="group/section flex items-center gap-1"
                      >
                        <button
                          type="button"
                          onClick={() => selectSection(category.id, section.id)}
                          className={`flex-1 truncate rounded px-2 py-1.5 text-left text-[13px] ${
                            isActive
                              ? "bg-zinc-700 text-white"
                              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          {section.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSection(section)}
                          className="shrink-0 rounded px-1 text-zinc-600 opacity-0 hover:bg-zinc-800 hover:text-zinc-200 group-hover/section:opacity-100"
                          title="セクションを編集"
                          aria-label="セクションを編集"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === section.id}
                          onClick={() =>
                            handleDeleteSection(category.id, section.id, section.name)
                          }
                          className="shrink-0 rounded px-1 text-zinc-600 opacity-0 hover:bg-zinc-800 hover:text-red-400 group-hover/section:opacity-100"
                          title="セクションを削除"
                          aria-label="セクションを削除"
                        >
                          ×
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
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
      {editingSection && (
        <EditSectionModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
        />
      )}
    </>
  );
}
