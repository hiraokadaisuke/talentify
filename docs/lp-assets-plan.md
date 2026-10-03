# 来店ナビ LP 素材運用メモ

## 方針
- 素材は「全部を先に格納」せず、実際に本番LPで使うものだけGitHubへ追加する。
- 画像は原則 WebP に軽量化してから `talentify-next-frontend/public/images/lp/materials/` に格納する。
- 1回の更新で新規画像は最大1〜2枚。コード変更とは可能な限り分ける。
- 既存素材で表現できる場合は新規画像を増やさない。
- 最終工程で未使用素材は格納しない。表示速度を優先する。

## 現在GitHubに格納済み
- connection-hub.webp — 接続・公開フロー
- data-network.webp — 店舗・演者・一般ユーザー接続セクションのネットワーク背景
- device-mockup.webp — PC・タブレット・スマホ対応イメージ
- future-stage-bg.webp — ヒーロー背景
- glossy-ui-elements.webp — 無料登録メリットセクションのUI装飾
- energy-ring.webp — 最終CTAの発光リング演出
- hero-performer-red.webp — ヒーロー演者
- lens-flare.webp — 光演出
- light-ribbon.webp — 接続・セクション演出
- minimal-tech-bg.webp — ABOUTセクションのミニマルテック背景
- neon-hud-elements.webp — HUD演出
- neon-wave-bg.webp — ダーク背景
- office-leader-tablet.webp — 店舗向け
- orange-ui-hub.webp — 接続セクション中央のオレンジUIハブ
- orange-arrow-elements.webp — 矢印・動線演出
- smartphone-light-trails.webp — 一般公開セクションのスマホ・光軌跡演出
- stage-light-particles.webp — 光粒子
- talent-stage.webp — 演者向け
- timeline-glow.webp — フロー・接続表現
- white-orange-tech-bg.webp — 機能セクションの白×オレンジ背景

## 次に追加候補
必要になった時だけ追加する。


## 進め方
1. 既存20素材でLP本体を完成に近づける
2. 足りない箇所だけ追加素材を1枚ずつ投入
3. PC/SPのレスポンシブ確認
4. 表示速度・画像容量確認
5. 文言・CTA・リンク最終確認
6. 本番確認


## Canonical LP asset library (2026-10-04)

LPの実装素材は `talentify-next-frontend/public/lp/` を正規配置先とする。

- `hero/` — FV専用背景
- `people/` — 店舗担当者・演者
- `ui/` — デバイス・HUD・UI装飾
- `icons/` — 機能・ステップ用アイコン
- `effects/` — 光、矢印、接続線、発光
- `backgrounds/` — White/Navy系セクション背景
- `reference/` — PC/スマホ完成カンプ。Webページには直接表示しない
- `texture/` — grain等の全体テクスチャ

既存の `public/images/lp/materials/` は移行確認が終わるまでロールバック用に残す。LPコード側は `/lp/` を参照する。

今回、6ステップの素材 `/lp/icons/workflow-icons.webp` を「演者を探す → 一般ユーザーが見る」の6段階フローに採用。
