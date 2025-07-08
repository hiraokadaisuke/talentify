"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';

const mockNotifications = {
  offers: 2,
  messages: 3,
  events: 1,
};

const upcomingEvents = [
  { date: '2025-07-01', title: 'イベントA' },
  { date: '2025-07-15', title: 'イベントB' },
];

const pendingOffers = [
  { id: 1, title: '出演依頼1' },
  { id: 2, title: '出演依頼2' },
];

export default function DashboardPage() {
  const [offers, setOffers] = useState(pendingOffers);

  const handleStatus = async (id, status) => {
    const res = await fetch(`/api/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } else {
      const err = await res.text();
      alert(`更新に失敗しました: ${err}`);
    }
  };

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span>通知</span>
          <Badge>{mockNotifications.offers} オファー</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          <Alert>
            <AlertTitle>メッセージ</AlertTitle>
            <AlertDescription>
              未読メッセージ {mockNotifications.messages} 件
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>イベント</AlertTitle>
            <AlertDescription>
              近日予定 {mockNotifications.events} 件
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>スケジュール</CardHeader>
        <CardContent>
          <Calendar events={upcomingEvents} />
          <Link href="/schedule" className="text-blue-600 underline text-sm mt-2 block">
            スケジュール詳細
          </Link>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>保留中のオファー</CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-1">タイトル</th>
                <th className="py-1">操作</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2">{o.title}</td>
                  <td className="py-2 space-x-2">
                    <button className="text-blue-600">詳細確認</button>
                    <button
                      className="text-green-600"
                      onClick={() => handleStatus(o.id, 'accepted')}
                    >
                      承諾
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleStatus(o.id, 'rejected')}
                    >
                      辞退
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>プロフィール</CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <span>公開設定:</span>
            <Badge variant="secondary">公開</Badge>
          </div>
          <div>平均評価: ★★★★☆</div>
          <div className="space-x-4">
            <Link href="/profile/edit" className="text-blue-600 underline">
              プロフィール編集
            </Link>
            <Link href="/reviews" className="text-blue-600 underline">
              レビューを見る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
