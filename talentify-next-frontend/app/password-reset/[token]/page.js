"use client";

import { useState } from "react";

export default function PasswordResetNewPage({ params }) {
  const { token } = params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error" | "mismatch"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("mismatch");
      return;
    }
    try {
      // ここでトークンを用いたパスワード更新APIを呼び出す想定
      // await fetch(`/api/password-reset/${token}`, { method: "POST", body: JSON.stringify({ password }) });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">新しいパスワードを設定</h1>
      <p className="mb-4">新しいパスワードを入力してください。</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">新しいパスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">8文字以上、大文字小文字、数字を含めてください</p>
        </div>
        <div>
          <label className="block mb-1">新しいパスワード（確認用）</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        {status === "mismatch" && (
          <p className="text-red-600">パスワードが一致しません。</p>
        )}
        {status === "error" && (
          <p className="text-red-600">パスワードの更新に失敗しました。</p>
        )}
        {status === "success" && (
          <p className="text-green-600">パスワードを更新しました。</p>
        )}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          パスワードを更新
        </button>
      </form>
    </main>
  );
}
