# 来店ナビ LP 素材運用メモ

2026/10/04、添付47点とmainの既存21点を照合。既存21点のうち14点はデコード不可だったため、元PNGから再書き出し。残りも元PNGから品質と透過を保ってWebP化した。

## 正規配置先

`talentify-next-frontend/public/lp/` に45点の素材と2点の完成カンプを格納。素材の保存とページでの読み込みは分け、必要な場所からだけ参照する。完成カンプをLP本文には表示しない。

- `hero/`：FVの背景・ステージ・装飾ワードマーク
- `people/`：人物、演者カード・検索用のサンプル写真
- `ui/`：デバイス、フレーム、HUD、バッジ
- `icons/`：5機能、6ステップなどのアイコン素材シート
- `effects/`：光、リング、リボン、矢印、フローライン
- `backgrounds/`：白・Navyセクションの背景
- `texture/`：grain。元画像のアルファは0〜8で、すでに低濃度
- `reference/`：PC・スマホ完成カンプの高品質WebP。参照専用

素材45点の合計は約3.23MiB。未使用ファイルや参照カンプはブラウザーへ配信・プリロードしない。旧 `public/images/lp/materials/` はこの更新では変更しない。

## 実装ルール

- 見出し、本文、CTA、サービスUIはHTML/CSS。画像内に架空のUIを描き込まない。
- デバイス素材はフレーム・背景として使い、画面部分は実UIのスクリーンショットまたは実装に沿ったHTMLで構成する。
- 人物はサンプル素材。実在する登録演者や実績の紹介として扱わない。
- ロゴは採用済みの `/brand/raiten-navi-logo.svg`。`hero-wordmark.webp` は装飾に限る。
- FVはPC完成カンプを基準に、人物・ステージ・UIカードを重ねる。モバイルは専用配置にする。
- Below-the-fold画像はlazy load。幅・高さまたは枠の寸法を確保し、CLSを防ぐ。
- 光の動きはtransform/opacity中心。`prefers-reduced-motion` 時は停止。
- 元PNGから出力後、全画像のデコード・WebPのRIFFサイズ・透過保持を検査する。base64の一部をコピーしてアップロードしない。

## 47点の対応一覧

元画像のSHA-256、寸法、透過範囲、出力容量、取り込み前の状態は `docs/lp-assets-manifest.json` に記録。

| 元画像 | 正規パス（`public/lp/` 配下） | 透過 | 取り込み前 |
|---|---|---|---|
| オレンジの未来型UI接続ハブ(2).png | `ui/orange-ui-hub.webp` | あり | 既存・今回修復 |
| オレンジ色の躍動感ある矢印素材集(2).png | `effects/arrows.webp` | あり | 既存・正常 |
| オレンジ色の輝く光跡スウッシュ(2).png | `effects/light-swoosh.webp` | あり | 今回追加 |
| ステージに輝く笑顔のアイドル(2).png | `people/performer-portrait-01.webp` | なし | 今回追加 |
| ステージライトに輝く笑顔の女性(2).png | `people/performer-portrait-02.webp` | なし | 今回追加 |
| ステージ裏で輝く笑顔の女性(2).png | `people/performer-backstage.webp` | なし | 今回追加 |
| タブレットを手にするオフィスリーダー(2).png | `people/store-manager.webp` | なし | 既存・正常 |
| ネイビーとオレンジの未来型配信フレーム(2).png | `ui/stream-frame.webp` | あり | 今回追加 |
| ネオンHUDエレメント素材シート(2).png | `ui/neon-hud-elements.webp` | あり | 既存・今回修復 |
| ネオンウェーブの未来的抽象背景(2).png | `backgrounds/neon-wave-bg.webp` | なし | 既存・正常 |
| プロフィール・連携・ローンチアイコンセット(2).png | `icons/profile-launch-icons.webp` | あり | 今回追加 |
| プロフィール検索と承認書類のアイコンセット(2).png | `icons/function-icons.webp` | あり | 今回追加 |
| モダンな数字カウントダウンバナー(2).png | `ui/countdown-numbers.webp` | あり | 今回追加 |
| ライテンナビ・ダイナミックロゴ(2).png | `hero/hero-wordmark.webp` | あり | 今回追加 |
| 光彩を纏う未来的デバイスモックアップ(2).png | `ui/device-mockup.webp` | あり | 既存・正常 |
| 光沢グラデーションUI素材シート(2).png | `ui/glossy-ui-elements.webp` | あり | 既存・今回修復 |
| 六つの円形ワークフローアイコン(2).png | `icons/workflow-icons.webp` | あり | 既存・今回修復 |
| 四隅を彩る暖色レンズフレアオーバーレイ(2).png | `effects/lens-flare.webp` | あり | 既存・今回修復 |
| 幻想的なステージライトと光の粒子(2).png | `effects/stage-light-particles.webp` | なし | 既存・正常 |
| 建物と人物のカレンダーアイコン(2).png | `icons/store-talent-icons.webp` | あり | 今回追加 |
| 暖かな光に包まれた女性の肖像(2).png | `people/performer-card-03.webp` | なし | 今回追加 |
| 暖かな笑顔のステージポートレート(2).png | `people/performer-card-02.webp` | なし | 今回追加 |
| 未来型データフローUIグラフィック(2).png | `effects/data-flow.webp` | あり | 今回追加 |
| 未来型データ連携ネットワーク(2).png | `effects/data-network.webp` | なし | 既存・今回修復 |
| 未来型データ連携ハブとクリエイターエコシステム(2).png | `backgrounds/connection-hub.webp` | なし | 既存・今回修復 |
| 未来感スマートフォンと光の軌跡(2).png | `ui/smartphone-light-trails.webp` | なし | 既存・今回修復 |
| 未来感ミニマルテック背景(2).png | `backgrounds/minimal-tech-bg.webp` | なし | 既存・正常 |
| 未来派ステージの光彩背景(2).png | `hero/hero-bg.webp` | なし | 既存・正常 |
| 未来的オレンジ光る3Dステージ(2).png | `hero/hero-stage.webp` | あり | 今回追加 |
| 未来的光の軌跡と黄金の閃光(2).png | `backgrounds/gold-light-trails.webp` | なし | 今回追加 |
| 来店ナビのモダンなサービス紹介ページ(2).png | `reference/desktop.webp` | なし | 今回追加 |
| 来店ナビの縦長ランディングページ(2).png | `reference/mobile.webp` | なし | 今回追加 |
| 洗練されたノートパソコンのスタジオ風景(2).png | `ui/laptop-mockup.webp` | なし | 今回追加 |
| 温かな光の笑顔ポートレート(2).png | `people/performer-card-04.webp` | なし | 今回追加 |
| 白とオレンジの流線型テック背景(2).png | `backgrounds/white-pattern.webp` | なし | 既存・今回修復 |
| 笑顔のステージポートレート(2).png | `people/performer-card-01.webp` | なし | 今回追加 |
| 華やかなステージの笑顔 _(1).png | `people/performer-hero.webp` | なし | 既存・今回修復 |
| 赤黒衣装の笑顔のステージポートレート(2).png | `people/performer-stage.webp` | なし | 既存・今回修復 |
| 透明背景のモダンUIバッジセット(2).png | `ui/status-badges.webp` | あり | 今回追加 |
| 透明背景の躍動リボンウェーブ(2).png | `effects/ribbon-wave.webp` | あり | 今回追加 |
| 透明背景の輝く光の波動リボン(2).png | `effects/light-ribbon.webp` | あり | 既存・今回修復 |
| 青から金へ流れる未来の光景(2).png | `backgrounds/blue-gold-flow.webp` | なし | 今回追加 |
| 青から金へ輝く未来のタイムライン(2).png | `effects/timeline-glow.webp` | あり | 既存・今回修復 |
| 青とオレンジのステージ笑顔(2).png | `people/performer-portrait-03.webp` | なし | 今回追加 |
| 鮮やかな光のエネルギーリング(2).png | `effects/energy-ring.webp` | あり | 既存・今回修復 |
| 黒地の微細な白黒ノイズテクスチャ(2).png | `texture/grain.webp` | あり | 今回追加 |
| 青と琥珀の舞台裏 恒一(2).png | `backgrounds/backstage.webp` | なし | 今回追加 |

## 次の仕上げ

PCのFV・5機能 → 6ステップ → 店舗/演者 → 接続/最終CTA → 全体余白 → モバイル専用配置 → リンク・速度監査。1〜2ブロックずつ検証・コミットし、Vercelの同一コミットがREADYになったことを確認する。

`transitions/` は必要な素材を実際に採用する段階で追加する。今は背景とCSSの境界演出を使う。
