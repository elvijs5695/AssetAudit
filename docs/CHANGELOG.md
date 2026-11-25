# v0.2.1 — 2026-11-25

- Lietotāja prasība: izslēgt darbinieku e-pasta ielūgumus; administrators izveido lietotājvārdu/paroli.
- Atsevišķa Supabase migrācija unikālam username un auditētai profila izveidei.
- Netlify admin endpoint veido Supabase Auth kontu bez e-pasta apstiprināšanas. Paroles maiņa tikai serverī.
- Dokumentēta privātā GitHub integrācija Supabase, neieslēdzot bīstamu automātisku datubāzes migrāciju.
- No pirmkoda pakotnes izņemti reālo finanšu summu salīdzinājumi un QA ekrānattēli.
- Neizpildītie testi: dzīvais Supabase Auth, `.invalid` domēna pieņemšana, jaunās atslēgas, RLS, backup restore.

# Izmaiņu reģistrs

## v0.2.0 — 2026-11-25 — Pirmais izstrādes kandidāts

### Pievienots
- Latviska PWA (2 darba sadaļas visiem, 2 papildus adminam), desktop + mobilā navigācija.
- Vēsturiskā JSON lokāla read-only apskate, kataloga un inventarizācijas pārskatīšana, detaļu skats, admin statistika.
- Supabase migrācijas **kandidāts** ar RAW un append-only tabulām, idempotenci, RLS, tiesību pārbaudi, NUMERIC.
- Netlify administratīvās servera funkcijas kandidāts, admin/staff piekļuves modelis.
- 67 819 + 5 980 ierakstu datu reproducējama konversija un transakcionāls importa SQL, vēsturisko grupu / summu salīdzinājums.
- 35 grāmatvedības/kataloga noteikumu izskatīšanas dokuments ar izcelsmi un lēmumu vietām.
- Neizpildīto testu / produkcijas bloķētāju reģistrs.

### Testēšana
- Lokālās datu konsistences pārbaudes PASS; desktop + mobile Chromium PWA read-only smoke PASS; 5 mock auth server testi PASS; 3 matemātikas/laika testi PASS; statiskās drošības pārbaudes PASS.
- Supabase SQL un reāla RLS/backup restore testēšana **NAV VEIKTA**; tas ir produkcijas bloķētājs.

### Neieviests
- Gada katalogu ģenerējošs pavadzīmju imports; automātiskie backup; pilnvērtīgs cross-browser svītrkodu OCR/ZXing; produkcijas izvietošana.


## v0.2.2 — 2026-11-25 — Supabase table privilege hardening
- BUG-SEC-001: explicit revoke of all grants to PUBLIC/anon/authenticated on private application tables; regrant only profile/config SELECT to authenticated. No data alteration.
- Full pinpointed grant test, read-only diagnosis, RLS flags and 7 immutable triggers check.
- Live Supabase execution/2-user tests NOT verified. Accounting data and calculations unchanged.


## v0.2.3 — 2026-11-25 — Piecas sadaļas, kataloga ievades plūsma un e-pasta Auth

- Minimāls datu-first UI; darbiniekiem 3 sadaļas, administratoram visas 5.
- Datu ievades meklētājs izmanto katalogu, ne ievadītās inventarizācijas grupas; Preču saraksts atsevišķi.
- Datu ievades forma no oriģinālās PHP: kods, nosaukums, PZ/PL cena, kase, daudzums, mērvienība, komentārs; papildus svītrkods. Daudzuma +/− un manuāla ievade.
- Svītrkoda precīza meklēšana ar 0/1/vairāku variantu uzvedību. `BarcodeDetector` ja pieejams, citādi manuāls kods.
- Supabase Auth: lietotāja e-pasts un parole, administrēta profila izveide, servera parole reset. `.invalid` alias lietotājvārdu sistēma aizstāta.
- 004 SQL migrācija pievieno e-pasta profilu/reģistrācijas RPC un precīzu svītrkoda lookup; nekādas vēsturisku datu maiņas.
- Client supports `sb_publishable_` and server `sb_secret_` keys (real provider compatibility NOT tested).
- Izmaiņu izcelsme: REQ-068..075, TC-066..081. Grāmatvedības algoritms nav mainīts.
- Lokāli tests pass; produkcijai NO-GO.
