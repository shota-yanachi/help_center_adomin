"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useDashboard } from "@/context/DashboardContext";
import { Category } from "@/lib/types";

export function EditCategoryModal({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const { editCategory } = useDashboard();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await editCategory(category.id, {
        name: name.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="カテゴリを編集" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">カテゴリ名</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">説明（任意）</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
