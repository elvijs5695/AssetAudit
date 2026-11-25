# Inventarizācija — AssetAudit v0.2.3

Latviska, funkcionāla PWA. **Šis ir testa kandidāts, nevis ekspluatācijai apstiprināta uzskaites sistēma.**

## Sadaļas

| Sadaļa | Lietotājs | Administrators | Datu avots |
|---|---|---|---|
| Datu ievade | Jā | Jā | Katalogs, jaunās ievades forma |
| Preču saraksts | Jā | Jā | Grupēti, jau inventarizācijā ievadītie dati |
| Katalogs | Jā | Jā, ar labošanu | Kataloga varianti un to vēsture |
| Statistika | Nē | Jā | Serverī autorizēti finanšu kopsavilkumi |
| Administrācija | Nē | Jā | Gads, e-pasta konti, tiesības |

Datu ievades meklēšana izmanto **katalogu**, nevis jau ievadīto inventarizāciju. Produkta izvēle aizpilda kodu, nosaukumu, cenas un svītrkodu. Kase, mērvienība, daudzums un komentārs paliek rediģējami. Daudzumu maina ar `+`, `−` vai tieši ievadot skaitli. Svītrkoda nolasīšana izmanto **precīzu** svītrkoda atbilstību; neatrasts kods aizpilda tikai svītrkoda lauku. Pašlaik kamera izmanto pārlūka `BarcodeDetector`, ja atbalstīts; citādi kods jāievada manuāli.

## Arhitektūra

- **GitHub**: personīgā konta **privāts** repozitorijs, pirmkods, migrācijas un izstrādes vēsture.
- **Netlify**: statiskā PWA un servera administrēšanas funkcija; `node scripts/build_site.mjs`, publicēt `dist/`.
- **Supabase**: PostgreSQL, Supabase Auth (**e-pasts + parole**), `staff`/`admin` profili, RLS, nemaināmu notikumu tabulas, kontrolēti RPC.
- Kontus veido **administrators**, publiska reģistrēšanās ir izslēgta. E-pasta apstiprināšana kontiem, kurus administrators izveido ar Auth Admin API, tiek veikta serverī. **Supabase `service_role`/`sb_secret` atslēgu nekad nepublicēt pārlūkā.**

## Lokāls priekšskatījums (tikai lasāms)

1. Instalēt Node.js 22+ un/vai Python 3.
2. Šajā mapē `npm run build`, pēc tam `cd dist` un `python -m http.server 8765` (Windows `py -m http.server 8765`). Var izmantot arī `start_preview_windows.bat`.
3. Atvērt `http://localhost:8765` un izvēlēties **vēsturiskā eksporta JSON** no **atsevišķi** glabātās, konfidenciālās datu pakotnes (`legacy_snapshot.json`).
4. Šis režīms ir tikai lasāms, un failu nedrīkst iepakot PWA izvietošanai.

Sākotnējā MySQL eksporta kontroles: **67 819** inventarizācijas ieraksti 2018–2025 un **5 980** katalogā. Divas aritmētikas neatbilstības un sešas jauktas mērvienību grupas nav labotas. Skatīt `docs/ACCOUNTING_COMPARISON.md` (konfidenciāls — nav jāpublicē GitHub) un `docs/catalogue_accounting_rules.md` (audita projekts).

## Esošas Supabase TEST datubāzes atjaunināšana

Lietotājs jau piemērojis migrācijas **001, 002 un 003**; `tests/security_checks.sql` izpildīts sekmīgi (`Success. No rows returned`). **NEATKĀRTOT šīs migrācijas.**

Jaunā v0.2.3 migrācija ir **tikai** `supabase/migrations/202611250004_email_auth.sql`. Izpildīt vienreiz tajā pašā testa projektā **pēc koda pārbaudes un pirms kontu veidošanas**, nevis darba datubāzē. Tur saglabājas iepriekšējā `username` kolonna kā vēsturisks elements, bet tiek pārtraukta vecā lietotājvārdu reģistrācijas funkcijas publiskā izmantošana.

Ieviešanas secība un atslēgu norādījumi: `docs/EMAIL_AUTH_AND_DEPLOY_V023.md`. Sadaļu UX un skenēšanas nosacījumi: `docs/UI_FLOW_V023.md`. Drošības/finanšu testu reģistrs: `docs/V023_TEST_MATRIX.md`.

## Testi

```bash
npm run test:security
npm run test:static
npm run test:math
npm run build
python3 tests/e2e_smoke.py
```

`npm run test:history` izmanto **privāti pieejamos kontrolsummu failus** ārpus publicējamiem datiem. Nav pabeigti: **reāla 004 migrācija, 2 lietotāju RLS, Supabase Auth/Netlify noslēpumu saderības tests, pilns datubāzes backup+restore, Android kameras tests un grāmatveža audits**. Līdz tam produkcijai **NO-GO**.

## Nākamajam aģentam

`AGENTS.md` → `docs/IMPLEMENTATION_STATUS.md` → `docs/REQUIREMENT_TRACE_2026-11-25.md` → `docs/project-history/` → `docs/catalogue_accounting_rules.md`. Nekādus reālos inventarizācijas datus, SQL kopijas, QA ekrānattēlus vai paroles neievietot repozitorijā vai Netlify `dist/`.
