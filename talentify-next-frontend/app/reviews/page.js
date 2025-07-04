"use client";
import { useState } from "react";

// Temporary static reviews. Replace with data from database when API is available.
const initialReviews = [
  { id: 1, author: "山田太郎", rating: 5, comment: "素晴らしい出演でした！" },
  { id: 2, author: "佐藤花子", rating: 4, comment: "とても盛り上がりました。" },
];

export default function ReviewsPage() {
  const [reviews] = useState(initialReviews);

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">レビュー</h1>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border rounded p-3">
              <div className="font-semibold">{r.author}</div>
              <div className="text-yellow-500 text-sm">
                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </div>
              <p className="mt-1 text-sm">{r.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>まだレビューはありません</p>
      )}
    </main>
  );
}

