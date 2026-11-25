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
