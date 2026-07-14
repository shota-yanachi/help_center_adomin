"use client";

import { useState } from "react";
import { Modal, Tabs } from "./Modal";
import { useDashboard } from "@/context/DashboardContext";

export function NewCategoryModal({ onClose }: { onClose: () => void }) {
  const { addCategory, addCategoriesBulk } = useDashboard();
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await addCategory({ name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBulkSummary(null);
    setSubmitting(true);
    try {
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : parsed.categories;
      if (!Array.isArray(items)) throw new Error("JSONは配列、または { categories: [...] } の形式で入力してください");
      const result = await addCategoriesBulk(items);
      const failed = result.results.filter((r) => r.status >= 300);
      if (failed.length === 0) {
        onClose();
      } else {
        setBulkSummary(
          `${result.created}/${result.results.length}件作成に成功しました。失敗: ${failed
            .map((f) => f.response?.description || f.response?.error || f.status)
            .join(", ")}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="新規カテゴリ" onClose={onClose}>
      <Tabs
        tabs={[
          { key: "single", label: "個別入力" },
          { key: "bulk", label: "JSON一括" },
        ]}
        active={tab}
        onChange={(k) => setTab(k as "single" | "bulk")}
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {tab === "single" ? (
        <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
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
              {submitting ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="flex flex-col gap-3">
          <p className="text-xs text-zinc-500">
            例: {`[{"name": "料金について", "description": "任意"}]`}
          </p>
          {bulkSummary && (
            <p className="text-xs text-amber-600">{bulkSummary}</p>
          )}
          <textarea
            required
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={10}
            placeholder='[{"name": "カテゴリ名"}]'
            className="input font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              キャンセル
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "作成中..." : "一括作成"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
