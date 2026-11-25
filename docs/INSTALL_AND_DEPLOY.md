# Inventarizācija v0.2.1 — uzstādīšana (username/password)

1. Sākotnēji pārbaudīt lokālo read-only priekšskatījumu bez Supabase; vēsturisko datu ZIP turēt atsevišķi.
2. Personīgajā GitHub kontā izveidot privātu repozitoriju, ievietot tikai `inventarizacija_app_v0.2.1.zip` saturu, bez konfidenciāliem datiem.
3. Supabase izveidot TUKŠU testa projektu (Free). Izpildīt autentifikācijas un GitHub integrācijas soļus no `docs/GITHUB_SUPABASE_USERNAME_SETUP.md`.
4. Supabase GitHub integrācija: `Working directory = .`; `Deploy to production = OFF`, kamēr migrācijas nav pārbaudītas.
5. `supabase/migrations/202611250001_base.sql` un `202611250002_username_accounts.sql` piemērot tieši vienā kontrolētā ceļā — NEKAD gan ar SQL Editor, gan automātisku GitHub deploy.
6. Admina sākotnējais konts caur Auth admin (nevis ielūgumu), pēc tam profils ar SQL; username `admin` un nejauša parole.
7. Netlify Free: importēt privāto personīgo GitHub repo, Build `node scripts/build_site.mjs`, Publish `dist`, Functions `netlify/functions`.
8. Netlify konfigurācijā tikai publiskais URL/API key publiskajam build un JWT-form legacy service role tikai Functions; ja atslēgu režīms neatbilst, pārtraukt, nevis uzminēt pielāgojumu.
9. Pārbaudīt reālu 2 lietotāju login, admin izveidi, paroles maiņu, atslēgšanu, nošķirtas tiesības, RLS, migrācijas, aritmētiku un restore.
10. TIKAI pēc testu iziešanas plānot privāto 2018–2025 RAW datu migrāciju. `legacy_import.sql` neiekļaut GitHub/Netlify.

Līdz tam tiešsaistes aplikācijas lietošana uzņēmuma inventarizācijai ir BLOĶĒTA.
