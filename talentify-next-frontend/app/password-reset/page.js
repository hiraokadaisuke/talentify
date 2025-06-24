"use client";
import { useState } from "react";
import Link from "next/link";

export default function PasswordResetPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">パスワード再設定</h1>
      {!submitted ? (
        <>
          <p className="mb-6">登録済みのメールアドレスを入力してください</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">メールアドレス</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              再設定メールを送信
            </button>
          </form>
        </>
      ) : (
        <p className="mb-6">
          入力されたメールアドレス宛に再設定リンクを送信しました。
        </p>
      )}
      <div className="mt-6 text-sm">
        <Link href="/login" className="text-blue-600 underline">
          ログインへ戻る
        </Link>
      </div>
    </main>
  );
}
