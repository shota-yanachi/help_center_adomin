"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useDashboard } from "@/context/DashboardContext";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useDashboard();
  const [workerUrl, setWorkerUrl] = useState(settings.workerUrl);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({ workerUrl: workerUrl.trim() });
    onClose();
  }

  return (
    <Modal title="接続設定" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Worker URL</span>
          <input
            type="url"
            required
            placeholder="https://help-center-proxy.example.workers.dev"
            value={workerUrl}
            onChange={(e) => setWorkerUrl(e.target.value)}
            className="input"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button type="submit" className="btn-primary">
            保存
          </button>
        </div>
      </form>
    </Modal>
  );
}
