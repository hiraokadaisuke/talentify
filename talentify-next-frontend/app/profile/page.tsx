// app/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
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
  }, [supabase]); // ✅ 依存配列に supabase を追加（警告解消）

  if (loading) return <p>読み込み中...</p>;

  if (!profile) return <p>プロフィールが見つかりません</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">プロフィール</h1>
      <p><strong>名前：</strong>{profile.name}</p>
      <p><strong>自己紹介：</strong>{profile.bio}</p>
    </div>
  );
}
