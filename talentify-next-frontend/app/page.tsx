import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const userId = session.user.id;
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (store) {
      redirect('/store/dashboard');
    }

    const { data: talent } = await supabase
      .from('talents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (talent) {
      redirect('/talent/dashboard');
    }
  }

  return <LandingPage />;
}
