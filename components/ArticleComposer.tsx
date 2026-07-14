"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ArticleInput } from "@/lib/api";

export function ArticleComposer() {
  return (
    <div className="grid grid-cols-2 divide-x divide-zinc-200 border-t border-zinc-200">
      <SingleArticleForm />
      <BulkArticleForm />
    </div>
  );
}

function SingleArticleForm() {
  const { segments, addArticle } = useDashboard();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [labels, setLabels] = useState("");
  const [everyone, setEveryone] = useState(true);
  const [segmentId, setSegmentId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data: ArticleInput = {
        title: title.trim(),
        body: body.trim() || undefined,
        label_names: labels
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        user_segment_id: everyone ? null : segmentId === "" ? null : segmentId,
      };
      await addArticle(data);
      setTitle("");
      setBody("");
      setLabels("");
      setEveryone(true);
      setSegmentId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        記事を追加（個別入力）
      </h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">タイトル</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">本文</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="input"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">ラベル（カンマ区切り）</span>
        <input
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          placeholder="例: ワクチン, 子猫"
          className="input"
        />
      </label>
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-zinc-700">公開範囲</span>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={everyone}
            onChange={(e) => setEveryone(e.target.checked)}
          />
          全員に公開（Everyone）
        </label>
        {!everyone && (
          <select
            required
            value={segmentId}
            onChange={(e) => setSegmentId(Number(e.target.value))}
            className="input"
          >
            <option value="" disabled>
              セグメントを選択
            </option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-1 self-start"
      >
        {submitting ? "作成中..." : "記事を追加"}
      </button>
    </form>
  );
}

function BulkArticleForm() {
  const { addArticlesBulk } = useDashboard();
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);
    setSubmitting(true);
    try {
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : parsed.articles;
      if (!Array.isArray(items)) {
        throw new Error("JSONは配列、または { articles: [...] } の形式で入力してください");
      }
      const result = await addArticlesBulk(items);
      const failed = result.results.filter((r) => r.status >= 300);
      setSummary(
        `${result.created}/${result.results.length}件作成に成功しました。` +
          (failed.length
            ? ` 失敗: ${failed
                .map((f) => f.response?.description || f.response?.error || f.status)
                .join(", ")}`
            : "")
      );
      if (failed.length === 0) setJson("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        記事を追加（JSON一括入力）
      </h3>
      <p className="text-xs text-zinc-500">
        例:{" "}
        {`[{"title": "記事タイトル", "body": "<p>本文</p>", "user_segment_id": null}]`}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {summary && <p className="text-sm text-amber-600">{summary}</p>}
      <textarea
        required
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={10}
        placeholder='[{"title": "記事タイトル", "body": "<p>本文</p>"}]'
        className="input flex-1 font-mono text-xs"
      />
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary self-start"
      >
        {submitting ? "作成中..." : "一括作成"}
      </button>
    </form>
  );
}
