import AuthErrorCard from './AuthErrorCard'

type AuthErrorPageProps = {
  searchParams?: {
    error?: string
    error_code?: string
  }
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  return (
    <AuthErrorCard
      initialError={searchParams?.error}
      initialErrorCode={searchParams?.error_code}
    />
  )
}
