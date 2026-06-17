# Document Encryption Plan — Available Law

Status: **proposal for review** (2026-06-09). Nothing here is built yet.

## Where we are today (baseline — already solid)
- `documents` bucket is **private** (`public = false`).
- Storage RLS: a member can only read/write `‹their-uid›/…`; staff via `is_admin()`.
- Downloads use **60-second signed URLs** (`createSignedUrl(path, 60)`).
- **AES-256 at rest** (Supabase/S3 server-side) + **TLS** in transit.
- MIME allowlist + 25 MB cap.

This already meets a "reasonable security" bar. Envelope encryption is the next tier: it makes file *contents* unreadable to anyone who only has storage/DB access (a Supabase compromise, a leaked DB dump, a rogue infra operator).

## Threat model — what this does and doesn't do
**Protects against:** storage bucket exfiltration, Postgres dump, infrastructure-level snooping — the ciphertext is useless without the key, which lives separately.
**Does NOT protect against:** a compromised attorney/admin account or a compromised decrypt function — by design the firm must be able to read client documents (attorney review + Ava). This is **firm-held-key** encryption, not zero-knowledge. Zero-knowledge (client-only keys) is explicitly rejected: it would lock the firm out of its own clients' files and break Ava.

## Key architecture (envelope / KEK–DEK)
- **KEK (Key Encryption Key):** one master key, 256-bit, stored in **Supabase Vault** (or an external KMS later). Never leaves the server; never sent to the browser. Versioned (`key_version`) for rotation.
- **DEK (Data Encryption Key):** a fresh random 256-bit key per file. Encrypts the file with **AES-256-GCM** (authenticated). The DEK is then *wrapped* (encrypted) by the KEK and stored next to the file's DB row. The plaintext DEK exists only in memory during encrypt/decrypt.

## Schema change (`public.documents`)
```sql
alter table public.documents
  add column if not exists is_encrypted boolean not null default false,
  add column if not exists enc_algo text,             -- 'AES-256-GCM'
  add column if not exists enc_iv text,               -- base64 nonce (12 bytes)
  add column if not exists enc_auth_tag text,         -- base64 GCM tag
  add column if not exists dek_wrapped text,          -- base64 KEK-wrapped DEK
  add column if not exists key_version int;           -- which KEK encrypted the DEK
```
Existing rows stay `is_encrypted = false` and keep working unchanged — back-compatible.

## Flows (all via Edge Functions so the KEK never touches the browser)

**Upload** — new edge function `doc-encrypt-upload`:
1. Member's browser POSTs the file to the function (authenticated; function verifies `auth.uid()` owns the target folder).
2. Function: generate DEK → AES-256-GCM encrypt bytes → `service_role` uploads **ciphertext** to `‹uid›/…` → wrap DEK with current KEK → insert/patch the `documents` row with `is_encrypted=true`, `enc_iv`, `enc_auth_tag`, `dek_wrapped`, `key_version`.
3. Returns the row. (Replaces the current direct `supabase.storage.upload` in `documents/page.tsx`.)

**Download / preview** — new edge function `doc-decrypt`:
1. Caller (member, attorney, or Ava via service role) requests `document_id`.
2. Function authorizes (member owns it, or `is_admin()`), fetches ciphertext + wrapped DEK, unwraps DEK with KEK (by `key_version`), decrypts, and **streams plaintext back** (or writes to a private temp object and returns a 30s signed URL for big files).
3. Browser never sees the key; the signed URL (if used) points at a short-lived decrypted copy that's deleted after.

**Ava** reads documents through the same `doc-decrypt` path (service role) so AI review keeps working.

## Crypto details
- Algorithm: **AES-256-GCM** (confidentiality + integrity; the GCM tag detects tampering).
- IV: 12 random bytes per file, stored per row (never reused with the same key).
- Implemented with Deno/Web Crypto `crypto.subtle` (no external libs) inside the edge functions.

## Key management & rotation
- KEK in **Supabase Vault**; reference by `key_version`.
- Rotation = add KEK v2, set it as current for new wraps, and run a background re-wrap of `dek_wrapped` for old rows (cheap — only unwraps/rewraps the small DEK, never re-encrypts files).
- Document a break-glass recovery: losing the KEK = losing all documents, so the KEK must be backed up in your password manager / a sealed secret.

## Rollout phases
1. **Audit log first (recommended quick win):** a `document_access_log` table + log every decrypt/download (who, doc, when, ip). High trust value, low effort, and you want it regardless. *(Note: you chose to plan encryption — flagging this as the cheap precursor.)*
2. **Encrypt new uploads:** schema migration + `doc-encrypt-upload` + `doc-decrypt`, switch the Documents page over. Old docs stay readable.
3. **Backfill** existing plaintext docs through the encrypt path (one-off job), flip them to `is_encrypted=true`.
4. **Rotation drill** + KEK backup procedure documented.

## Cost / tradeoffs (honest)
- Files transit the edge function → CPU + memory for crypto; fine at 25 MB, watch the function memory cap.
- Preview can no longer use a direct signed URL on the raw object — everything routes through `doc-decrypt`, slightly slower.
- More moving parts to maintain. Worth it for sensitive client matters; the audit log alone covers a lot of the trust story at a fraction of the effort.

## Effort estimate
- Audit log: ~half a day.
- Encrypt-new-uploads (phases 2): ~1–2 days incl. the two edge functions + Documents page rewiring + testing.
- Backfill + rotation: ~half a day.
