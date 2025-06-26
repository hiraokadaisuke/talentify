"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfRes = await fetch(`${API_BASE}/api/csrf-token`, {
        credentials: "include",
      });
      const { csrfToken } = await csrfRes.json();
      const res = await fetch(`${API_BASE}/api/password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">パスワードを再設定</h1>
      <p className="mb-4">
        ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="ご登録のメールアドレス"
          />
        </div>
        {status === "error" && (
          <p className="text-red-600">メールアドレスの送信に失敗しました。</p>
        )}
        {status === "success" && (
          <p className="text-green-600">パスワード再設定用のメールを送信しました。ご確認ください。</p>
        )}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          送信する
        </button>
      </form>
    </main>
  );
}
