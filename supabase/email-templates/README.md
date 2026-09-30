# Talentify Auth email branding

Hosted Supabase Auth uses Dashboard-managed email templates.

Confirmation email:
- Subject: `【Talentify】メールアドレスの確認`
- Body: `confirmation.html`

For production sender branding, configure Custom SMTP in Supabase Auth and set the sender name to `Talentify`.
The default Supabase SMTP is intended for development/testing and may show Supabase-style sender information.
