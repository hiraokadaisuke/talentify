import ProfileEditForm from '@/components/ProfileEditForm'

export default function ProfileEditPage() {
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      <ProfileEditForm talentId="replace-with-id" />
    </main>
  )
}
