"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useDashboard } from "@/context/DashboardContext";
import { Section } from "@/lib/types";

export function EditSectionModal({
  section,
  onClose,
}: {
  section: Section;
  onClose: () => void;
}) {
  const { categories, editSection } = useDashboard();
  const [name, setName] = useState(section.name);
  const [description, setDescription] = useState(section.description ?? "");
  const [categoryId, setCategoryId] = useState(section.category_id);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await editSection(section.id, {
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="セクションを編集" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">所属カテゴリ</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="input"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">セクション名</span>
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
