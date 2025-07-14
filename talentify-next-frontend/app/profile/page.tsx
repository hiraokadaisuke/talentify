'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Profile {
  name: string
  bio: string | null
  role?: string
  twitter?: string
  instagram?: string
  youtube?: string
}

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  if (loading) return <p>読み込み中...</p>;
  if (!profile) return <p>プロフィールが見つかりません</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">プロフィール</h1>
      <p><strong>名前：</strong>{profile.name}</p>
      <p><strong>自己紹介：</strong>{profile.bio}</p>

      {profile.role === 'talent' && (
        <div className="mt-4 space-y-2">
          <p><strong>Twitter:</strong> {profile.twitter}</p>
          <p><strong>Instagram:</strong> {profile.instagram}</p>
          <p><strong>YouTube:</strong> {profile.youtube}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/talent/profile/edit'}
          >
            プロフィールを編集
          </button>
        </div>
      )}

      {profile.role === 'store' && (
        <div className="mt-4 text-green-700 font-semibold">
          店舗アカウントとしてログイン中です。
        </div>
      )}
    </div>
  );
}
