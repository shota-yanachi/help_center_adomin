"use client";

import { useEffect, useState } from "react";
import { isAuthed, setAuthed } from "@/lib/storage";

const ADMIN_PASSWORD = "miruto";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthedState] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // sessionStorageはサーバーに存在しないため、マウント後にクライアントで読み直す
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthedState(isAuthed());
    setChecked(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed();
      setAuthedState(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) return null;

  if (!authed) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-zinc-100">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xs flex-col gap-3 rounded-lg bg-white p-6 shadow-md"
        >
          <h1 className="text-sm font-semibold text-zinc-900">
            Help Center 管理ダッシュボード
          </h1>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700">パスワード</span>
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              className="input"
            />
          </label>
          {error && (
            <p className="text-xs text-red-600">パスワードが違います</p>
          )}
          <button type="submit" className="btn-primary">
            ログイン
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
