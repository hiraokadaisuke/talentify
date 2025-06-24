'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileEditForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [previewData, setPreviewData] = useState(null)

  const uploadFile = async (file, bucket) => {
    if (!file) return ''
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    if (error) {
      console.error(error)
      return ''
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const onSubmit = async (data) => {
    const avatarFile = data.avatar?.[0]
    const avatarUrl = await uploadFile(avatarFile, 'avatars')

    const photos = []
    if (data.photos && data.photos.length) {
      for (let i = 0; i < Math.min(data.photos.length, 5); i++) {
        const url = await uploadFile(data.photos[i], 'photos')
        if (url) photos.push(url)
      }
    }

    const formData = {
      ...data,
      avatar: avatarUrl,
      photos,
    }
    setPreviewData(formData)
  }

  if (previewData) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">プレビュー</h2>
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(previewData, null, 2)}
        </pre>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setPreviewData(null)}
        >
          編集に戻る
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">氏名</label>
        <input
          {...register('name', { required: true })}
          className="w-full p-2 border rounded"
        />
        {errors.name && <span className="text-red-500 text-sm">必須項目です</span>}
      </div>
      <div>
        <label className="block mb-1">芸名・ステージ名</label>
        <input {...register('stageName')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">アバター画像</label>
        <input type="file" accept="image/*" {...register('avatar')} />
      </div>
      <div>
        <label className="block mb-1">所在地</label>
        <input {...register('location')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">出演料(時給等)</label>
        <input {...register('rate')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">得意なスキル・ジャンル</label>
        <input {...register('skills')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">自己紹介</label>
        <textarea {...register('bio')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">主な実績</label>
        <textarea {...register('achievements')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">所属事務所</label>
        <input {...register('agency')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Twitter</label>
        <input {...register('twitter')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Instagram</label>
        <input {...register('instagram')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">YouTube</label>
        <input {...register('youtube')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">TikTok</label>
        <input {...register('tiktok')} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">写真(最大5枚)</label>
        <input type="file" accept="image/*" multiple {...register('photos')} />
      </div>
      <div>
        <label className="block mb-1">動画URLまたはID(カンマ区切り)</label>
        <input {...register('videos')} className="w-full p-2 border rounded" />
      </div>
      <div className="flex items-center">
        <input type="checkbox" {...register('isPublic')} className="mr-2" />
        <label>プロフィールを公開する</label>
      </div>
      <div className="flex items-center">
        <input type="checkbox" {...register('notifyOffers')} className="mr-2" />
        <label>オファー通知を受け取る</label>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        プレビュー
      </button>
    </form>
  )
}
