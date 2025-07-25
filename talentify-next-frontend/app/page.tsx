export const dynamic = 'force-dynamic'

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
type GenericSupabaseClient = {
  from<T>(table: string): any;
};

export default async function HomePage() {
  const supabase = await createClient();
  const sb = supabase as unknown as GenericSupabaseClient;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const userId = session.user.id;
    const { data: store } = await sb
      .from<{ id: string; is_setup_complete: boolean | null }>('stores')
      .select('id, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle();
    const { data: talent } = await sb
      .from<{ id: string; is_setup_complete: boolean | null }>('talents')
      .select('id, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle();
    const { data: company } = await sb
      .from<{ id: string; is_setup_complete: boolean | null }>('companies')
      .select('id, is_setup_complete')
      .eq('user_id', userId)
      .maybeSingle();

    if (store) {
      if (!(store as any).is_setup_complete) redirect('/store/edit');
      else redirect('/store/dashboard');
    } else if (talent) {
      if (!(talent as any).is_setup_complete) redirect('/talent/edit');
      else redirect('/talent/dashboard');
    } else if (company) {
      if (!(company as any).is_setup_complete) redirect('/company/edit');
      else redirect('/company/dashboard');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <main className="flex flex-col items-center text-gray-900 bg-white">
      {/* Hero Section */}
      <section
        className="w-full min-h-screen flex flex-col justify-center items-center bg-cover bg-center text-white text-center px-6"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        <div className="max-w-4xl mt-40 sm:mt-60 md:mt-[300px]">
          <p className="text-2xl md:text-3xl font-semibold text-white mb-10 drop-shadow-md">
            パチンコ店と演者をマッチングする、全く新しいサービス。
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/register?role=store">
              <Button className="px-8 py-3 text-base rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-md">
                店舗として登録
              </Button>
            </Link>
            <Link href="/register?role=talent">
  <Button className="px-8 py-3 text-base rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-md">
    演者として登録
  </Button>
</Link>
          </div>
        </div>
      </section>

{/* 特徴セクション（POINT 1・2） */}
<section className="w-full bg-white py-20 px-6">
  <div className="max-w-6xl mx-auto space-y-24">

    {/* POINT 1 */}
    <div className="flex flex-col md:flex-row items-center gap-10">
      <img src="/images/point1.png" alt="POINT 1" className="w-full md:w-1/2 rounded-xl shadow-md" />
      <div className="md:w-1/2">
        <div className="text-green-600 font-bold text-xl mb-2">POINT 1</div>
        <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
          出演者掲載数No.1の<br className="hidden md:block" />マッチングサービス
        </h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          Talentifyは全国のホールと演者をつなぐ、完全無料のマッチングプラットフォーム。案件掲載、プロフィール作成、スケジュール管理まで、すべてオンラインで完結します。
        </p>
      </div>
    </div>

    {/* POINT 2 */}
    <div className="flex flex-col md:flex-row-reverse items-center gap-10">
      <img src="/images/point2.png" alt="POINT 2" className="w-full md:w-1/2 rounded-xl shadow-md" />
      <div className="md:w-1/2">
        <div className="text-green-600 font-bold text-xl mb-2">POINT 2</div>
        <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
          オファー送信から契約まで<br className="hidden md:block" />すべてオンラインで完結
        </h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          演者へのオファー送信やスケジュール確認、契約確定まで一元管理。やり取りもメッセージ機能で完結するから、電話やFAXは一切不要です。
        </p>
      </div>
    </div>

    {/* POINT 3 */}
    <div className="flex flex-col md:flex-row items-center gap-10">
      <img src="/images/point3.png" alt="POINT 3" className="w-full md:w-1/2 rounded-xl shadow-md" />
      <div className="md:w-1/2">
        <div className="text-green-600 font-bold text-xl mb-2">POINT 3</div>
        <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
          すべて0円でカンタンに使える！
        </h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          初期費用・月額費用・成功報酬、すべて無料。掲載も契約も人数制限なく使えるから、コストゼロで最大のリーチが可能です。
        </p>
      </div>
    </div>

  </div>
</section>



      {/* ナビ代わりセクション */}
      <section className="w-full bg-gray-100 py-4 text-sm text-center text-gray-500 tracking-wide">
        ブランド｜演者｜利用方法｜FAQ｜お問い合わせ
      </section>

      {/* 店舗向けセクション */}
      <SectionBox title="パチンコ店様へ" bg="white">
        <li>最適な演者と出会える</li>
        <li>イベント告知の規制に配慮したサポート</li>
        <li>契約・決済をスムーズに</li>
        <CTA link="/register?role=store" label="店舗として利用開始する" />
      </SectionBox>

      {/* 演者向けセクション */}
      <SectionBox title="演者の皆様へ" bg="gray-50">
        <li>安定した仕事機会の獲得</li>
        <li>自身のブランド力向上</li>
        <li>適切なギャラ交渉をサポート</li>
        <CTA link="/register?role=talent" label="演者として利用開始する" />
      </SectionBox>

      {/* FAQセクション */}
      <SimpleSection title="よくある質問" link="/faq" bg="white" />

      {/* お問い合わせセクション */}
      <SimpleSection title="お問い合わせ" link="/contact" bg="gray-50" />

      {/* Footer */}
      <footer className="w-full bg-black text-white text-center py-12 mt-12">
        <div className="text-lg font-semibold mb-2 tracking-wide">TALENTIFY</div>
        <div className="text-xs opacity-60">© 2025 Talentify Inc. All rights reserved.</div>
      </footer>
    </main>
  );
}

// セクションBox
function SectionBox({ title, children, bg }: { title: string; children: React.ReactNode; bg?: string }) {
  return (
    <section className={`py-16 w-full px-4 sm:px-6 ${bg ? `bg-${bg}` : ''}`}>
  <div className="max-w-4xl mx-auto border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm bg-white">
    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 border-l-4 border-gray-800 pl-4">{title}</h2>
    <ul className="space-y-2 text-gray-700 list-disc list-inside leading-relaxed text-base sm:text-lg">{children}</ul>
  </div>
</section>
  );
}

// CTAリンクボタン
function CTA({ link, label }: { link: string; label: string }) {
  return (
    <div className="text-center mt-6">
      <Link href={link}>
        <Button variant="link" className="text-base text-gray-800 font-semibold hover:underline">
          {label}
        </Button>
      </Link>
    </div>
  );
}

// シンプルセクション（FAQ・Contact）
function SimpleSection({ title, link, bg }: { title: string; link: string; bg?: string }) {
  return (
    <section className={`py-16 w-full px-6 ${bg ? `bg-${bg}` : ''}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <Link href={link}>
          <Button variant="link" className="text-base text-gray-800 font-semibold hover:underline">
            {title}ページへ
          </Button>
        </Link>
      </div>
    </section>
  );
}
