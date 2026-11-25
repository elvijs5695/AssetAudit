**2026-11-25, v0.1.6:** Netlify (PWA) + Supabase (PostgreSQL/Auth) + privāts GitHub (pirmkods) ir **izvēlētais** steks; sk. [`29_SELECTED_STACK_IMPLEMENTATION_GATE.md`](29_SELECTED_STACK_IMPLEMENTATION_GATE.md). Iepriekšējie “nav galīga hostinga” apgalvojumi šajā dokumentā apraksta *agrākas iterācijas*. Nav veikta platformu uzstādīšana vai kodēšana.

# Sākums: kā pārņemt projektu

## Kas šis ir
Apmēram 10 gadus lietotas PHP + MariaDB inventarizācijas sistēmas pakāpeniska pārbūve ar stingru grāmatvedisko precizitāti. Oriģinālais arhīvs `inventarizacija.zip` un divas lietotāja Word komentāru kārtas ir izpētītas **tikai lasīšanas režīmā**. Modernā aplikācija vēl nav izveidota.

## Kāpēc to pārbūvē
- Pašreizējais ikgadējā kataloga imports ir manuāls un kļūmju jutīgs (Excel/CSV, pagaidu tabulas, SQL, kataloga `TRUNCATE`).
- Inventarizācijas individuālajiem pievienojumiem nav nemaināmas labošanas/dzēšanas vēstures.
- Finanšu un datu drošība jāpārbūvē, saglabājot pareizo aprēķinu nozīmi.
- Vajadzīga ergonomiska mobila ievade, pakāpeniska svītrkodu datubāze, pārskatāma desktop administrācija.

## Piecu minūšu ceļvedis
1. **Ko vajag?** `01_PRODUCT_PURPOSE.md` un `02_REQUIREMENTS.md`.
2. **Kāpēc tas vajadzīgs?** `03_TRACEABILITY_POLICY.md`, `sources/USER_INPUT_REGISTER.json`.
3. **Kas jau nolemts?** `04_DECISIONS.md` un `16_OPEN_QUESTIONS.md`.
4. **Kā tā varētu strādāt?** `05_ARCHITECTURE.md`, `06_DATA_INTEGRITY.md`, `08_YEAR_CYCLE.md`.
5. **Kā pārbaudīt?** `11_FINANCIAL_RULES.md`, `13_ACCEPTANCE_TESTS.md`, `14_MIGRATION_STRATEGY.md`.
6. **Kas darīts pēdējais?** `18_PROJECT_STATUS.md`.

## Prasību notācija
- `REQ-###`: vienas funkcijas/nosacījuma noturīgā identitāte.
- `SRC-R1-C#` / `SRC-R2-C#`: 1. / 2. DOCX kārtas sākotnējais Word komentārs.
- `SRC-CHAT-*`: sākotnējā lietotāja ziņa / dokumentēšanas uzdevums.
- `DEC-###`: apsvērts/apstiprināts lēmums, ar datumu un statusu.
- `TC-###`: pieņemšanas / regresijas tests.
- `Q-###`: atvērts jautājums.

## Galvenais nosacījums
**Ja kāda jaunā funkcija maina naudas aprēķinus, datu grupēšanu vai gadu slēgšanas semantiku, to nedrīkst ieviest bez pieņemšanas scenārija un apstiprinājuma.**

## Jaunā funkciju saime (v0.1.1)
`23_TEMPORAL_HISTORY_AND_RECOVERY.md` ir galvenā skice vēsturiskam inventarizācijas un bilances stāvoklim, kataloga laika versijām un backup/restore robežām. Tā ir platformneatkarīga; **Time Travel nav backup** un vēsturiska apskate nav destruktīvs rollback.

## Jaunākās v0.1.2 izmaiņas
Sākt arī ar `24_PLATFORM_CONSOLIDATION.md` un `25_LEGACY_PRICE_AND_YEAR_RULES.md`. **Nav pieņemts galīgs hostings.** Neizdomāt cenu izvēles algoritmu. Šajā iterācijā apstiprināts semantisks skaidrojums PL 0/unknown, tukšs kods un brīdinājumi; ziņojumu verbatim izcelsme reģistrēta.


## New in v0.1.4
The current preferred hosting **candidate** is `GitHub (source) + Cloudflare (Workers PWA/API + R2 encrypted off-provider backups) + Supabase (PostgreSQL/Auth)`, proposed by the user as a question. Read `27_HYBRID_CLOUDFLARE_SUPABASE.md`. Do not treat it as selected, implemented or tested. The D1-only alternative and previous quota audit remain in the package.


**v0.1.5 platform update:** user accepts Supabase, dislikes Cloudflare R2 billing subscription. New candidate Netlify Free (app + Blobs), Supabase DB/Auth, private GitHub source. Read [28_NO_BILLING_PLATFORM_OPTION.md](28_NO_BILLING_PLATFORM_OPTION.md); candidate only and all tests NOT_RUN.
