# Talentify development workflow

Talentify uses GitHub and Supabase as one development system.

## Source of truth

- Application code: `main` branch of this repository.
- Live database schema: Supabase project `talentify-dev` (`kbbnaxmnuizmakyhjyym`).
- Every database schema change must also be recorded in `supabase/migrations/`.
- After database schema changes, regenerate `talentify-next-frontend/types/supabase.ts` from the live Supabase schema.
- Keep `talentify-next-frontend/prisma/schema.prisma` aligned with tables used through Prisma.

## Deployment policy

This project is currently pre-launch. Prefer a simple direct workflow:

1. Inspect the current GitHub code and live Supabase schema.
2. Apply the required Supabase migration.
3. Verify security/performance advisors and a focused test query.
4. Sync generated Supabase TypeScript types.
5. Commit application/schema changes directly to `main`.
6. Let the existing Vercel Git integration deploy `main`.

Pull requests, GitHub Actions, and Supabase development branches are not required by default.

## Cost policy

- Do not create Supabase branches unless explicitly needed; branches can incur additional cost.
- Do not add scheduled or always-on GitHub Actions without a clear need.
- Prefer targeted checks over repeated CI runs while there are no external users.
- Do not add Edge Functions when a normal Next.js API route or database operation is sufficient.
- Review unused indexes only after there is meaningful production traffic; zero-use statistics before launch are not a reason to remove useful indexes.

## Secrets

- Never commit `.env.local` or other local environment files.
- Public browser code may only use Supabase publishable/anon credentials.
- Database connection strings and service-role/secret keys must stay in the deployment environment, not Git.

## Database safety

- All tables exposed through the Supabase Data API must have RLS enabled.
- Prefer `TO authenticated` plus an ownership/authorization predicate.
- SECURITY DEFINER functions must not be executable by `anon` unless explicitly designed as a public endpoint.
- Trigger-only functions should not be callable through the Data API.
- Re-run Supabase security advisors after every schema/RLS/function change.
