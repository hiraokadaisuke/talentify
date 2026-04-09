# `auth.getUser()` 残件棚卸し（`app/api` 以外）

作成日: 2026-04-09  
対象: `talentify-next-frontend` 配下で `auth.getUser()` を直接呼び出している箇所（`app/api` を除外）

## 集計サマリー

- 対象ファイル数: **23**
- 呼び出し総数: **28**
- 分類別
  - client component: **14 ファイル / 18 呼び出し**
  - server component: **2 ファイル / 2 呼び出し**
  - utility: **4 ファイル / 4 呼び出し**
  - lib: **3 ファイル / 5 呼び出し**
  - middleware 相当: **0**
  - その他: **0**

## Phase 1: 洗い出し（分類つき）

| ファイル | 呼び出し数 | 分類 | 用途メモ |
|---|---:|---|---|
| `components/modals/OfferModal.tsx` | 1 | client component | オファー送信 submit 前のログイン確認 |
| `components/modals/ReviewModal.tsx` | 1 | client component | レビュー投稿 submit 前のログイン確認 |
| `components/ProfileProgressCard.tsx` | 1 | server component | サーバー描画時にプロフィール進捗を取得 |
| `components/messages/MessagesPage.tsx` | 1 | client component | inbox 初期化時に userId をセット |
| `utils/getOffersForStore.ts` | 1 | utility | ストア向けオファー一覧取得の前提 user 特定 |
| `utils/getTalentId.ts` | 1 | utility | `talents.id` 解決のため user 取得 |
| `utils/getInvoicesForStore.ts` | 1 | utility | 請求一覧取得前にストア user を特定 |
| `utils/getCompletedOffersForStore.ts` | 1 | utility | 完了オファー取得前にストア user を特定 |
| `lib/getServerUserRole.ts` | 1 | lib | サーバー側 role 判定 |
| `lib/supabase/offerMessages.ts` | 2 | lib | メッセージ送信 / read receipt 更新 |
| `lib/auth/getCurrentUser.ts` | 1 | lib | 既存 helper 本体（`getUser` の集約ポイント） |
| `lib/queries/dashboard.ts` | 2 | lib | ダッシュボード指標取得（talent/store） |
| `lib/contracts.ts` | 1 | lib | 契約一覧取得前にストア user を特定 |
| `lib/getUserRole.ts` | 1 | lib | role/name 判定ロジック |
| `app/talents/[id]/TalentDetailPageClient.tsx` | 1 | client component | 画面初期表示で userId を設定 |
| `app/talents/[id]/offer/page.tsx` | 1 | client component | オファー送信時のログイン確認 |
| `app/company/edit/page.tsx` | 2 | client component | 初期ロード / 保存時の user 取得 |
| `app/talent/offers/[id]/page.tsx` | 1 | client component | 画面初期化で userId を設定 |
| `app/talent/edit/EditClient.tsx` | 2 | client component | 初期ロード / 保存時の user 取得 |
| `app/talent/schedule/ScheduleCalendar.tsx` | 1 | client component | スケジュール取得前の user 取得 |
| `app/store/offers/[id]/page.tsx` | 1 | server component | サーバー描画時に閲覧者 user を取得 |
| `app/store/edit/EditClient.tsx` | 2 | client component | 初期ロード / 保存時の user 取得 |
| `app/store/schedule/page.tsx` | 1 | client component | スケジュール初期化で user 取得 |

## Phase 2: 優先順位付け

評価軸:
- **置換しやすさ**: 呼び出し箇所の局所性、UI 依存度
- **影響範囲**: 再利用される共通層か、単一画面か
- **Auth 差し替え重要度**: 将来の provider 差し替えの障壁になる度合い

### P0（最優先）: 共通層で横断的に効く箇所

1. `lib/getUserRole.ts`（M）
   - 置換しやすさ: 中
   - 影響範囲: 高（role 判定の基盤）
   - 重要度: 高
   - 判断: **今すぐ着手候補**

2. `lib/queries/dashboard.ts`（H）
   - 置換しやすさ: 中
   - 影響範囲: 高（複数ダッシュボード）
   - 重要度: 高
   - 判断: **今すぐ着手候補**

3. `lib/supabase/offerMessages.ts`（M）
   - 置換しやすさ: 中
   - 影響範囲: 中〜高（メッセージ機能）
   - 重要度: 高
   - 判断: **今すぐ着手候補（Realtime を触らない範囲で）**

4. `lib/contracts.ts` / `lib/getServerUserRole.ts`（L-M）
   - 置換しやすさ: 中〜高
   - 影響範囲: 中
   - 重要度: 中〜高
   - 判断: **P0 後続**

### P1（中優先）: utility の集約ポイント

- `utils/getOffersForStore.ts`
- `utils/getCompletedOffersForStore.ts`
- `utils/getInvoicesForStore.ts`
- `utils/getTalentId.ts`

共通特性:
- 置換しやすさ: 高（処理が単純）
- 影響範囲: 中（複数 UI から参照され得る）
- 重要度: 中
- 判断: **P0 完了後にまとめて対応**

### P2（後回し可）: 画面ローカルの client component

- `app/company/edit/page.tsx`
- `app/talent/edit/EditClient.tsx`
- `app/store/edit/EditClient.tsx`
- `app/store/schedule/page.tsx`
- `app/talent/schedule/ScheduleCalendar.tsx`
- `app/talent/offers/[id]/page.tsx`
- `app/talents/[id]/TalentDetailPageClient.tsx`
- `app/talents/[id]/offer/page.tsx`
- `components/modals/OfferModal.tsx`
- `components/modals/ReviewModal.tsx`
- `components/messages/MessagesPage.tsx`

共通特性:
- 置換しやすさ: 高
- 影響範囲: 低〜中（単画面局所）
- 重要度: 中〜低
- 判断: **共通層の置換方針確定後に一括置換**

### P2（後回し可）: server component

- `components/ProfileProgressCard.tsx`
- `app/store/offers/[id]/page.tsx`

共通特性:
- 置換しやすさ: 中（server helper の責務整理が必要）
- 影響範囲: 低〜中
- 重要度: 中
- 判断: **server 向け helper 仕様確定後**

## Phase 3: 提案

### 残件一覧（短縮版）

- **共通層（優先）**: `lib/*` の `getUser` 直呼び出し（role/dashboard/messages/contracts/server-role）
- **中間層**: `utils/*` の store/talent 解決系
- **画面層**: `app/*` と `components/*` のイベントハンドラ／初期化処理

### 次に着手すべき最小単位

1. `lib/getUserRole.ts` の `auth.getUser()` を `getCurrentUser()` 経由へ寄せる
2. `lib/queries/dashboard.ts`（2 箇所）を同様に寄せる
3. `lib/supabase/offerMessages.ts` は `SupabaseClient` 引数設計を維持したまま、
   - `user` 解決を小さな helper に切り出し
   - Realtime 非対象の CRUD だけ置換対象に限定

> この 3 ステップは API 契約に触れず、差分を小さく保ちながら横断効果が高い。

### 置換方針（提案）

- 既存の `lib/auth/getCurrentUser.ts` を中心に、次の 2 系統に整理
  - **server 用**: cookie/session 前提の `getCurrentUser()`
  - **client 用**: 必要なら `getCurrentUserClient()` を追加（署名を単純化）
- 画面ローカルの直接呼び出しは、共通層の置換が終わった後に codemod 的に一括置換
- `auth.getUser()` の残件監視用に CI で `rg "auth\.getUser\("` を警告化（段階導入）

## 補足（今回の非対象）

- Realtime 周辺挙動の変更
- API 契約変更
- 大規模な画面改修
