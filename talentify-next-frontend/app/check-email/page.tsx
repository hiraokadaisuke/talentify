// app/check-email/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">仮登録が完了しました</h1>
      <p className="text-center text-gray-600 mb-6">
        ご入力いただいたメールアドレス宛に確認メールをお送りしました。<br />
        メールに記載されたURLをクリックして、本登録を完了してください。
      </p>
      <p className="text-sm text-gray-500 mb-8">
        ※メールが届かない場合は、迷惑メールフォルダをご確認ください。
      </p>
      <Link href="/">
        <Button>トップページに戻る</Button>
      </Link>
    </div>
  );
}
