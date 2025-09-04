-- Talentsテーブルに銀行口座情報を追加
ALTER TABLE public.talents
  ADD COLUMN bank_name TEXT,
  ADD COLUMN branch_name TEXT,
  ADD COLUMN account_type TEXT,
  ADD COLUMN account_number TEXT,
  ADD COLUMN account_holder TEXT;
