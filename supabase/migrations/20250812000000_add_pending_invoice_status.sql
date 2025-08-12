-- invoice_status に 'pending' を追加（既存値は draft, submitted, approved, rejected）
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'pending';
