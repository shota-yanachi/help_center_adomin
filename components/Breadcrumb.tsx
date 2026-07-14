"use client";

import { useDashboard } from "@/context/DashboardContext";

export function Breadcrumb() {
  const { categories, sectionsByCategory, selectedCategoryId, selectedSectionId } =
    useDashboard();

  const category = categories.find((c) => c.id === selectedCategoryId);
  const section = selectedCategoryId
    ? (sectionsByCategory[selectedCategoryId] ?? []).find(
        (s) => s.id === selectedSectionId
      )
    : undefined;

  if (!category || !section) {
    return (
      <div className="border-b border-zinc-200 px-6 py-3 text-sm text-zinc-400">
        セクション未選択
      </div>
    );
  }

  return (
    <div className="border-b border-zinc-200 px-6 py-3 text-sm text-zinc-600">
      <span>{category.name}</span>
      <span className="mx-2 text-zinc-300">／</span>
      <span className="font-medium text-zinc-900">{section.name}</span>
    </div>
  );
}
