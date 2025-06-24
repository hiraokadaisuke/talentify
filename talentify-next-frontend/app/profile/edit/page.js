import dynamic from 'next/dynamic'

const ProfileEditForm = dynamic(() => import('../../../components/ProfileEditForm'), { ssr: false })

export default function ProfileEditPage() {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      <ProfileEditForm />
    </main>
  )
}
