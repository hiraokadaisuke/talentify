'use client';


import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUserRole } from '@/utils/useRole';

interface Profile {
  name: string
  profile: string | null
  role?: string
  twitter?: string
  instagram?: string
  youtube?: string
}

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
const { role, loading: roleLoading } = useUserRole();
const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      if (!role) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const table = role === 'talent' ? 'talents' : role === 'company' ? 'companies' : 'stores';
      const { data, error } = await supabase
        .from(table as any)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      } else {
        console.error('プロフィール取得エラー:', error);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase, role]);

  if (loading || roleLoading) return <p>読み込み中...</p>;
  if (!profile) return <p>プロフィールが見つかりません</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">プロフィール</h1>
      <p><strong>名前：</strong>{profile.name}</p>
      <p><strong>自己紹介：</strong>{profile.profile}</p>

      {role === 'talent' && (
        <div className="mt-4 space-y-2">
          <p><strong>Twitter:</strong> {profile.twitter}</p>
          <p><strong>Instagram:</strong> {profile.instagram}</p>
          <p><strong>YouTube:</strong> {profile.youtube}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/talent/edit'}
          >
            プロフィールを編集
          </button>
        </div>
      )}

      {role === 'store' && (
        <div className="mt-4 text-green-700 font-semibold">
          店舗アカウントとしてログイン中です。
        </div>
      )}
    </div>
  );
}
