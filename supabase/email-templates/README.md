# 来店ナビ Auth email branding

Hosted Supabase Auth uses Dashboard-managed email templates.

Confirmation email:
- Subject: `【来店ナビ】メールアドレスの確認`
- Body: `confirmation.html`

For production sender branding, configure Custom SMTP in Supabase Auth and set the sender name to `来店ナビ`.
The default Supabase SMTP is intended for development/testing and may show Supabase-style sender information.
