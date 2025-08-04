## テーブル構成（スキーマ）

### companies
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid
- company_name: text
- address: text
- tel: text
- description: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- avatar_url: text
- is_setup_complete: boolean, DEFAULT false
- display_name: text

### invoices
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- store_id: uuid
- talent_id: uuid
- amount: integer, NOT NULL
- invoice_url: text
- created_at: timestamp without time zone, DEFAULT now()
- updated_at: timestamp without time zone, DEFAULT now()
- status: USER-DEFINED
- due_date: date
- invoice_number: text

### messages
- created_at: timestamp with time zone
- is_read: boolean
- private: boolean
- id: uuid, NOT NULL
- inserted_at: timestamp without time zone
- updated_at: timestamp without time zone
- event: text
- payload: jsonb
- extension: text
- topic: text
- content: text
- receiver_id: uuid
- sender_id: uuid

### messages_old
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- sender_id: uuid, NOT NULL
- receiver_id: uuid, NOT NULL
- content: text, NOT NULL
- created_at: timestamp with time zone, DEFAULT now()
- is_read: boolean, DEFAULT false
- updated_at: timestamp with time zone, DEFAULT now()

### notifications
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid, NOT NULL
- type: USER-DEFINED, NOT NULL
- data: jsonb
- is_read: boolean, DEFAULT false
- created_at: timestamp without time zone, DEFAULT now()
- read_at: timestamp without time zone

### offers
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- talent_id: uuid
- user_id: uuid
- date: timestamp with time zone
- message: text
- created_at: timestamp with time zone, DEFAULT timezone('utc'::text, now())
- status: USER-DEFINED
- respond_deadline: timestamp with time zone
- is_read_by_talent: boolean, DEFAULT false
- updated_at: timestamp with time zone, DEFAULT now()
- event_name: text
- start_time: timestamp without time zone
- end_time: timestamp without time zone
- reward: integer
- question_allowed: boolean, DEFAULT false
- notes: text
- store_id: uuid
- agreed: boolean
- time_range: text
- paid: boolean, DEFAULT false
- paid_at: timestamp with time zone
- invoice_date: date
- invoice_amount: integer
- bank_name: text
- bank_branch: text
- bank_account_number: text
- bank_account_holder: text
- invoice_submitted: boolean, DEFAULT false
- contract_url: text

`date` は `timestamp with time zone` 型で、`YYYY-MM-DD` もしくは ISO 8601 形式で送信する必要があります。`status` では `draft` / `pending` / `approved` / `rejected` / `completed` の値を使用でき、オファー作成時のデフォルトは `pending` です。

### payments
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- amount: integer, NOT NULL
- status: USER-DEFINED, NOT NULL
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- invoice_url: text

### public_talent_profiles
- display_name: text
- stage_name: text
- genre: text
- area: text
- avatar_url: text
- rating: numeric
- rate: numeric
- phone: text
- bio: text

### reviews
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- store_id: uuid
- talent_id: uuid
- rating: integer
- comment: text
- created_at: timestamp without time zone, DEFAULT now()

### schedules
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid, NOT NULL
- date: timestamp with time zone, NOT NULL
- description: text, DEFAULT ''::text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- start_time: timestamp with time zone
- end_time: timestamp with time zone
- related_offer_id: uuid
- role: text

### stores
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- user_id: uuid
- store_name: text
- contact_name: text
- contact_phone: text
- store_prefect: text
- bio: text
- created_at: timestamp with time zone, DEFAULT now()
- updated_at: timestamp with time zone, DEFAULT now()
- avatar_url: text
- is_setup_complete: boolean, DEFAULT false
- contact_email: text
- store_address: text
- is_profile_complete: boolean, DEFAULT false

### talents
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- name: text, NOT NULL
- skills: ARRAY, DEFAULT '{}'::text[]
- experience_years: integer, DEFAULT 0
- avatar_url: text, DEFAULT ''::text
- social_links: ARRAY, DEFAULT '{}'::text[]
- bio: text, DEFAULT ''::text
- location: text, DEFAULT ''::text
- rate: numeric, DEFAULT 0
- availability: text, DEFAULT ''::text
- created_at: timestamp with time zone, DEFAULT now()
- profile: text
- area: text
- sns_links: json
- video_url: text
- rating: numeric
- user_id: uuid
- company_id: uuid
- stage_name: text
- display_name: text
- phone: text
- is_setup_complete: boolean, DEFAULT false
- twitter_url: text
- instagram_url: text
- youtube_url: text
- media_appearance: text
- is_profile_complete: boolean, DEFAULT false
- achievements: text
- genre: text
- instagram: text
- twitter: text
- youtube: text
- residence: text
- notes: text
- photos: ARRAY
- transportation: text
- min_hours: text
- updated_at: timestamp with time zone, DEFAULT now()
- bio_hobby: text
- bio_certifications: text
- birthdate: date
- birthplace: text
- height_cm: integer
- agency_name: text
- social_tiktok: text
- gender: USER-DEFINED

### visits
- id: uuid, NOT NULL, DEFAULT gen_random_uuid()
- offer_id: uuid
- talent_id: uuid
- store_id: uuid
- visited_at: timestamp without time zone
- created_at: timestamp without time zone, DEFAULT now()
- updated_at: timestamp without time zone, DEFAULT now()
- status: USER-DEFINED
