'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProfileEditPage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) throw new Error('ログイン情報が取得できません')

        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, bio')
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error
        if (data) {
          setDisplayName(data.display_name || '')
          setBio(data.bio || '')
        }
      } catch (e) {
        console.error(e)
        setMessage('プロフィールの読み込みに失敗しました')
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) throw new Error('ログイン情報が取得できません')

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio
        })
        .eq('user_id', session.user.id)

      if (error) throw error

      setMessage('保存しました')
    } catch (err) {
      console.error(err)
      setMessage('更新に失敗しました')
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">表示名</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">自己紹介</label>
          <textarea
            className="w-full p-2 border rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        {message && <p>{message}</p>}
        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded">
          保存
        </button>
      </form>
    </main>
  )
}
