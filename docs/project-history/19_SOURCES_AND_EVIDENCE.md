# Avoti, pierādījumi un reprodukcijas robežas

## Aktuālā pirmavota reģistra fiksācija

| Avota ID | Fails | SHA-256 | Jutīgums |
|---|---|---|---|
| SRC-LEGACY-ZIP | `inventarizacija.zip` | `71cfb4fa0f9bc6045051c0efc25fd8c73adaa4f22d5c252eba568a72d87a6f2c` | True |
| SRC-R1-DOCX | `komentari.docx` | `31c6c557769f62f1dab1d5089608ed7aae75656bfb42ce8fbd8493f1e44d53eb` | may contain user metadata |
| SRC-R2-DOCX | `komentari(1).docx` | `5dc249e4fc9496e5acc251aeefcd9c3118364f01e4d1ff890a607071accb5227` | may contain user metadata |

Word piezīmju sākotnējās kārtas izvilktas kā `SRC-R1-C0..C7` (8 komentāri) un `SRC-R2-C0..C9` (10 komentāri). Precīzs teksts un piesaiste dokumenta rindkopai: [`sources/USER_INPUT_REGISTER.json`](sources/USER_INPUT_REGISTER.json).

Avota arhīvā ir uzņēmuma preču kataloga dati un lietotāju kontu dati. **Neiekļaut avota arhīvu, tā SQL dump vai vecās konfigurācijas failus publiskā vai privātā koda repozitorijā bez rūpīgas slepenu datu apstrādes.** Šajā dokumentācijas ZIP tie nav iekļauti.

## Kā iegūts katalogu audits
- Ar `zipfile` atvēra avota ZIP un kā tekstu nolasīja `backup/26-11-21_13-06-34.sql`.
- Ar tikai lasāmu SQL `INSERT` vērtību parseri nolasīja `import` un `precu_katalogs` rindas, pieņemot no dump apstiprinātu 8 kolonnu struktūru.
- Salīdzināja kombināciju `(kods, nosaukums, cena)`, izmantojot precīzu `Decimal` cenu; atšķirīgu `cena_p` vērtību grupas atzīmēja kā konfliktus.
- Rezultāts: `import=6084`, `precu_katalogs=5980`, `konfliktu grupas=37`; vairāk `07_LEGACY_CATALOGUE_AUDIT.md`.
- Pievienots reproducējams, **agregātu-only** rīks: `tools/audit_legacy_dump.py`, kam jānorāda privātā arhīva ceļš.

## Kas NAV pierādīts
- Ka šis SQL dumps ir jaunākā produkcijas datubāzes kopija.
- Ka vecās PHP biznesa loģikas rezultāts vienmēr atbilda grāmatvedības normām.
- Ka konkrētā katalogā izvēlētā plaukta cena ir *pareizā* — tikai ka tā ir **izvēlētā**.
- Ka servera tiesības, ugunsmūris, HTTP publiskums vai autentifikācija bija pareizi konfigurēti.
- Ka finanšu pilns regresijas tests vai datubāzes backup/restore ir veikts.

## Dokumentēšanas uzdevuma avots
`SRC-CHAT-DOCS` reģistrē prasību veidot pārņemamu pakotni un izsekojamu lietotāja inputu. Aģenti bez piekļuves šīs sarunas kontekstam var strādāt ar `AGENTS.md` un šiem failiem.

## v0.1.1: lietotāja precizējums par Time Travel un backup
Jaunais sarunas avots `SRC-CHAT-TIME-TRAVEL` ir saglabāts **verbatim** failos `docs/sources/USER_INPUT_REGISTER.json` un `docs/sources/USER_CHAT_MESSAGES.md`, kopā ar kontekstā izvēlēto iepriekšējo asistenta fragmentu. Nošķirts lietotāja tiešs formulējums, jautājums un asistenta arhitektūras interpretācija. Neviens papildus datubāzes audits un atjaunošanas tests šajā iterācijā nav veikts.

## v0.1.2 — papildu reproducēta statiskā analīze
No nemainītā pirmavota ZIP SQL eksporta parsētas 67 819 `preces` rindas, 5 980 `precu_katalogs` rindas un 6 084 `import` rindas. Rezultāti bez preču nosaukumiem/cenām:

- Tukšs `kods`: 11 208 (`preces`), 1 081 (`precu_katalogs`), 1 102 (`import`).
- PL = 0.00: 0 (`preces`), 1 160 (`precu_katalogs`), 1 256 (`import`).
- PZ = 0.00: 0 visos trīs kopumos.
- Visas 1 160 kataloga nulles PL rindas un visas 1 256 importa nulles PL rindas ir ar izcelsmes gadu 2026.
- Precīzu ienākošo PHP ceļu pārbaude: `index.php` 78–152, `values.php` 27–79, `createCatalogue.php` 11–45, `db2temp.php`, `cat2temp.php`, `importExcel.php`, `includes/parameters.php` un `index.php` 484–486. Avota arhīvā nav atrasts `confYear` pret `date('Y')` brīdinājums; ir `$year != $confYear` brīdinājums. Produkcijas servera versija nav pārbaudīta.

**Publiski mainīgu platformu noteikumu datums:** 2026-11-25; oficiālo URL saraksts un ierobežojumi ir `24_PLATFORM_CONSOLIDATION.md`. Tas nav produkcijas slodzes vai Cloudflare līguma tests.

## v0.1.3 — 2025 slodzes bāzlīnija
Izmantots tas pats nemainītais `SRC-LEGACY-ZIP` SHA-256 no avotu reģistra. Reproducēšana: `python tools/annual_workload_audit.py /privata/vieta/inventarizacija.zip`. Iegūtie 2018–2025 rindu skaiti un UTC pīķi ir `docs/26_ANNUAL_LOAD_AND_CAPACITY.md`. D1 Free kvotas salīdzinātas ar oficiāliem Cloudflare materiāliem 2026-11-25; nav piekļuves faktiskajam D1 usage, DB storage size vai HTTP žurnāliem. `SRC-CHAT-CAPACITY` saglabāts pilnā tekstā.


## v0.1.4 -- hybrid routing and backup sources
- `SRC-CHAT-SUPABASE-LIMITS` and `SRC-CHAT-HYBRID-STACK`: direct user messages, captured verbatim in `sources/USER_INPUT_REGISTER.json` (2026-11-25).
- Official Supabase backup and restore using CLI: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- Current Supabase DB dump CLI exclusions: https://supabase.com/docs/reference/cli/supabase-config
- Supabase backup limitations and Free plan: https://supabase.com/docs/guides/platform/backups ; https://supabase.com/pricing
- Supabase RLS/publishable keys: https://supabase.com/docs/guides/database/secure-data
- Cloudflare static assets, Git deployment and API: https://developers.cloudflare.com/workers/static-assets/ ; https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/
- Cloudflare R2 object storage / S3-compatible API and free quota: https://developers.cloudflare.com/r2/get-started/s3/ ; https://developers.cloudflare.com/r2/pricing/
- R2 billing subscription and lock: https://developers.cloudflare.com/r2/get-started/ ; https://developers.cloudflare.com/r2/buckets/bucket-locks/
- GitHub scheduled workflows reliability: https://docs.github.com/en/actions/how-tos/troubleshoot-workflows

No real Supabase/Cloudflare/GitHub accounts or permissions were examined. Statements about current vendor behavior reflect documentation, not in-account tests.


## v0.1.5 — no-billing preference and Netlify current vendor sources
- Lietotāja oriģinālteksts `SRC-CHAT-NO-BILLING` (2026-11-25) reģistrēts `sources/USER_INPUT_REGISTER.json`.
- Netlify Free: 300 credits / month; hard stop, no auto top-up; Netlify Blobs Beta included: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- Netlify Blobs (private, encryption at rest/transit, site-wide store, default US region, explicit EU region, last-write-wins, Beta): https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Netlify repo types: person-owned private repo supported; organization-owned private repo automatic integration requires paid plans: https://docs.netlify.com/build/git-workflows/overview/
- Netlify Free commercial projects/no-card claim in original Free launch announcement: https://www.netlify.com/blog/introducing-netlify-free-plan/ ; latest credit-based plan must take precedence for quotas.
- Netlify usage credits: 15 credits per production deploy; bandwidth, requests, compute are metered: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- Supabase Free no automatic managed backups: https://supabase.com/docs/guides/platform/backups ; https://supabase.com/pricing
- **Evidence type:** Vendor docs web research. Account-specific card-free signup, storage durability/size caps and deployment functionality NOT TESTED. No production provider selected.


## v0.1.6 — jaunais izvēles avots

- `SRC-CHAT-STACK-SELECT`: precīzs lietotāja teksts saglabāts `docs/sources/USER_INPUT_REGISTER.json` un `docs/sources/USER_CHAT_MESSAGES.md`; apliecina izvēlētu steku, ne reālu servisu konfigurāciju.
- Oficiāli pārbaudīts 2026-11-25: Netlify privātā GitHub repo integrācijas ierobežojumi un Free credits/Blobs beta (`https://docs.netlify.com/build/git-workflows/overview/`, `https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/`, `https://docs.netlify.com/build/data-and-storage/netlify-blobs/`), Supabase Free neaktivitātes apturēšana un backup trūkums (`https://supabase.com/docs/guides/platform/free-project-pausing`, `https://supabase.com/docs/guides/platform/backups`).
- Nav veikta live Netlify/Supabase/GitHub integrācija vai backup restore. Neinterpretēt dokumentu salīdzinājumu kā testu rezultātu.
