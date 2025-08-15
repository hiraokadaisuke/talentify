'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const supabase = createClient()

export default function CompanyProfileEditPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    company_name: '',
    display_name: '',
    address: '',
    tel: '',
    description: '',
    avatar_url: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('ユーザー取得失敗:', authError)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('companies')
        .select('company_name, display_name, address, tel, description, avatar_url')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      } else {
        console.error('プロフィール読み込みエラー:', error)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('ユーザー取得失敗:', authError)
      alert('ユーザー情報の取得に失敗しました')
      return
    }

    const updateData = {
      company_name: profile.company_name,
      display_name: profile.display_name || null,
      address: profile.address || null,
      tel: profile.tel || null,
      description: profile.description || null,
      avatar_url: profile.avatar_url || null,
      user_id: user.id,
      is_setup_complete: true,
    }

    const { error } = await supabase
      .from('companies')
      .upsert(updateData, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase更新エラー:', error)
      alert('保存に失敗しました')
    } else {
      alert('保存しました')
    }
  }

  if (loading) return <p className='p-4'>読み込み中...</p>

  return (
    <main className='max-w-2xl mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>企業プロフィール編集</h1>
      <div className='space-y-4'>
        <div>
          <label className='block font-medium'>会社名</label>
          <Input name='company_name' value={profile.company_name} onChange={handleChange} />
        </div>
        <div>
          <label className='block font-medium'>表示名</label>
          <Input name='display_name' value={profile.display_name} onChange={handleChange} />
        </div>
        <div>
          <label className='block font-medium'>住所</label>
          <Input name='address' value={profile.address ?? ''} onChange={handleChange} />
        </div>
        <div>
          <label className='block font-medium'>電話番号</label>
          <Input name='tel' value={profile.tel ?? ''} onChange={handleChange} />
        </div>
        <div>
          <label className='block font-medium'>自己紹介</label>
          <Textarea name='description' value={profile.description ?? ''} onChange={handleChange} rows={4} />
        </div>
        <div>
          <label className='block font-medium'>アバター画像URL</label>
          <Input name='avatar_url' value={profile.avatar_url ?? ''} onChange={handleChange} type='url' />
        </div>
        <Button onClick={handleSave} className='mt-4'>保存する</Button>
      </div>
    </main>
  )
}
