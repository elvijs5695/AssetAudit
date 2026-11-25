# Projekta stāvoklis / nodošana nākamajam aģentam

**Datums:** 2026-11-25  
**Dokumentācijas versija:** v0.1.1  
**Lietotnes versija:** nav izveidota  
**Konfigurēti ārējie pakalpojumi:** neviena (šī darba ietvaros)  
**Produkcijas datubāze:** nav atvērta, nav modificēta

## Avoti
1. `inventarizacija.zip`: vecā PHP/MariaDB projekta arhīvs ar SQL dump, lietotāju datiem, tehniskiem noslēpumiem; jātur privāti. SHA-256: `19_SOURCES_AND_EVIDENCE.md`.
2. `komentari.docx`: 1. kārta, 8 Word komentāri; precīzs teksts `sources/USER_INPUT_REGISTER.json`.
3. `komentari(1).docx`: 2. kārta, 10 Word komentāri; precīzs teksts `sources/USER_INPUT_REGISTER.json`.
4. Lietotāja sākotnējais un dokumentācijas pieprasījums šajā sarunā; atslēgas daļas reģistrētas.

## Paveikts
- Dokumentēta produktu funkcionalitāte, izmaiņu motivācija, pirmā prasību un lēmumu ķēde.
- Apstiprinātas 2026. gada SQL eksporta importa un gala kataloga rindas 6 084/5 980; konstatētas 37 plaukta cenu konfliktu grupas.
- Izdalīts zināmais un nezināmais par grupēšanu, cenu izvēli, gadu atvēršanu/slēgšanu, svītrkodu un drošību.
- Sagatavots arhitektūras variants, `REQ`/`DEC`/`TC` reģistri, backlog, lietotāja komentāru oriģinālteksti, apstiprināšanas testi un migrācijas plāns.

## Nav izdarīts — NEUZRĀDĪT KĀ PABEIGTU
- Nav uzbūvēts PWA, kamera vai Supabase datubāze, nav GitHub repozitorija un Cloudflare izvietojuma.
- Nav pilnībā auditētas visas 2018.–2025. finanšu rindas pret akceptētu politiku.
- Nav veikta ievade/rediģēšana, stresa tests, divu lietotāju autorizācijas tests, RLS pārbaudes vai atjaunošana no backup.
- Nav definēts galīgais cenu prioritāšu un nulles cenu algoritms.

## Pašreizējie bīstamākie riski
- **RISK-01:** neapstiprināta cenu prioritāte un nedeterministisks `GROUP BY` vecajā kodā.
- **RISK-02:** konfidenciālas paroles un komercdati vecajā ZIP; nedrīkst augšupielādēt nepārbaudītā Git repozitorijā.
- **RISK-03:** jaunas sistēmas naudas aprēķini var atšķirties no vecajiem, ja precizitāte/noapaļošana netiek saskaņota.
- **RISK-04:** Free Supabase neaktivitāte un rezerves kopiju trūkums sezonālai aplikācijai.
- **RISK-05:** idempotence un dažādu lietotāju vienlaicīga labošana jārisina datubāzē.

## Nākamā aģenta pirmie 3 drošie uzdevumi
1. Prezentēt un saskaņot `Q-001..Q-006`: cenas, preces identitāte, `kase`, vienības, `0/NULL`.
2. Sagatavot finanšu testa fikstūru ar zināmām precīzām summām, neaizskarot produkcijas datus.
3. Ar lietotāju izvēlēties Supabase/backup un UI ekrānu prototipa plānu, pirms uzsākt implementāciju.

**Šajā versijā izmainīti tikai dokumentācijas pakotnes faili.**

## Pārņemšanas papildinājums v0.1.1 — 2026-11-25
- Izveidots jauns sarunas avots `SRC-CHAT-TIME-TRAVEL`, oriģinālais teksts ir saglabāts.
- Apstiprināta vajadzība apskatīt inventarizāciju/bilanci uz izvēlētu datumu un laiku. Kataloga papildinājumu vēsture jāaptver no **diviem avotiem** (inventarizācijas ievade + pavadzīmes).
- Atvērts: cena uz vēsturisku brīdi, bitemporālā politika, selektīva rollback drošība, backup RPO/RTO, autentifikācijas un objektu failu atjaunošanas tvērums.
- `23_TEMPORAL_HISTORY_AND_RECOVERY.md` ir **dizaina skice**, ne Supabase migration.
- Testi `TC-034..040` nav izpildīti. Produkcijas datubāze, ārējie pakalpojumi un pirmkods nav mainīti.
- Nākamajam aģentam jāsāk ar `Q-018`, `Q-019`, `Q-022`; nevajag pāriet uz viena servisa backup konfigurāciju, kamēr nav definēts domēna datu modelis.

## v0.1.2 — 2026-11-25
- Novērotas 67 819 vēsturisko inventarizācijas rindu, 5 980 kataloga un 6 084 importa rindas; pārbaudīti tukšu kodu un nulles cenu skaiti (skat. `25_LEGACY_PRICE_AND_YEAR_RULES.md`). **Tikai SQL tekstu analīze, ne produkcijas DB.**
- Pārskatīts sākotnējās PHP aplikācijas `index.php`, `values.php`, `createCatalogue.php`, `importExcel.php`, `db2temp.php`, `cat2temp.php`, `includes/parameters.php`: cenu variantu papildināšanas un nulles placeholder dzēšanas nosacījumi. Programmētā lietotāja pieminētā config-vs-calendar year pārbaude iesūtītajā arhīvā nav redzama; ir viewed-vs-config pārbaude.
- Salīdzināti Cloudflare, Appwrite, Supabase un Firebase publiskie ierobežojumi un backup atkarības; **konts nav izveidots, tests nav palaists, platforma nav izvēlēta**.
- Pievienoti `REQ-040..047`, `DEC-021..027`, `TC-041..048`, `SRC-CHAT-PRICE-YEAR`, `SRC-CHAT-HOST-CONSOLIDATION` un divi analīzes dokumenti. `REQ-001..039` saglabāti; REQ-023/027 un REQ-015 precizēti, ne izdzēsti.
- **Nekas nav mainīts esošajā PHP, SQL, lietotāja datubāzē vai produkcijas vidē.**

## v0.1.3 — 2026-11-25 slodzes apkopojums
- Jauns pirmavota uzdevums `SRC-CHAT-CAPACITY`, nodrošināta precīza lietotāja formulējuma saglabāšana.
- Visas `preces` INSERT rindas parsētas tikai-lasīšanas režīmā: 67 819 kopā; 2025: 6 331; 2025 maksimums 740 dienā/220 stundā/7 minūtē; 2019 maksimums 3 519 dienā/445 stundā/15 minūtē. Pirmavota SQL dumps nesaspiests ir 7 587 502 baiti.
- Bez maksas D1 500MB/DB un 100k rows_written/d nebūtu galvenais ierobežojums šādai intensitātei; lielākais risks ir 5m rows_read/d pie nenoindeksētiem kataloga meklējumiem. **Tā ir scenārija modelēšana, ne reāls cloud usage.**
- Dokumentācija `26_ANNUAL_LOAD_AND_CAPACITY.md` un lasāms rīks `tools/annual_workload_audit.py` pievienoti. Jaunās aplikācijas/koda/DB/live infrastruktūras nav. Pieņemšanas un slodzes testi **NAV palaisti**.


## v0.1.4 -- 2026-11-25 hybrid provider candidate
- User sources `SRC-CHAT-SUPABASE-LIMITS` and `SRC-CHAT-HYBRID-STACK` registered verbatim. Updated the evaluation of Cloudflare D1 vs Supabase and the provider-count objective; 3-provider hybrid is **proposed**, not finalized.
- Added `docs/27_HYBRID_CLOUDFLARE_SUPABASE.md`, REQ-048..050, DEC-028..031, TC-052..056 (all NOT_RUN), WL-023..025, Q-026..029, and revised machine-readable indexes.
- Vendor documentation reviewed. No application implementation, migration, credential storage, hosted deployment, backup export, cloud billing activation or restoration was performed.
- Key unresolved blockers: exact business price rules, Supabase Free pause/seasonal availability, full backup capture of Auth/roles, secure encryption key management, CI scheduled job monitoring and full clean-room restore.
- Safe next step: approve or adjust the hybrid split as a candidate and define backup RPO/RTO and the minimal RLS/full-restore proof with synthetic data.


## v0.1.5 — 2026-11-25 maksājumu ierobežojums
- Lietotājs norādīja: `Par supabase nav iebildumu. Cloudflare man nepatīk norēķinu abonements...` (jauns avots `SRC-CHAT-NO-BILLING`, saglabāts verbatim).
- Cloudflare R2 vairs NAV pirmā izvēle privātajai backup krātuvei, jo tās aktivizācijai ir billing abonements; neatmest Cloudflare Pages Free kā iespēju tikai nosaukuma dēļ.
- Jauns **neapstiprināts** Netlify Free PWA + Blobs Beta + Supabase + GitHub variants; salīdzinājums `28_NO_BILLING_PLATFORM_OPTION.md`, REQ-051/052, DEC-032..034, TC-057..060, visi NOT_RUN.
- Nenotika nekādas izvietošanas, piekļuves atslēgu izmantošanas, maksājumu piesaistes, datu migrācijas vai produkcijas backup/restore. Nākamais solis: apstiprināt piemērotību un sintētisku end-to-end atjaunošanas pārbaudi.


## v0.1.6 — 2026-11-25 galīgā platformu izvēle

- **Apstiprināts lietotāja lēmums:** `SRC-CHAT-STACK-SELECT` (precīzs teksts saglabāts); `DEC-035`. **Netlify + Supabase + GitHub ir izvēlētais steks**, ne vairs tikai platformu kandidāts.
- **Ko nozīmē:** PWA izvietošana Netlify, PostgreSQL/Auth Supabase, privāts GitHub kodam/dokumentācijai. Netlify Blobs backup paliek izpētes jautājums (`DEC-036`), netiek uzskatīts par vienīgo pieņemto glabātuvi.
- **Dokumentācija:** `docs/29_SELECTED_STACK_IMPLEMENTATION_GATE.md`, `REQ-053/054`, `TC-061..065`, jauns `SRC` ieraksts, lēmumu/machine reģistri, riski un testi aktualizēti.
- **Nav izdarīts:** nav GitHub repo, Supabase projekta, Netlify site, CI secrets, backup, datubāzes migrāciju vai produkcijas datu importa. TC-061..065 = **NOT_RUN**. Veikta tikai oficiālās pakalpojumu dokumentācijas pārbaude un dokumentācijas ZIP integritātes kontrole.
- **Pārņemšanas kritiskās nianses:** personīgs vai organizācijas privātais GitHub repo Netlify Free integrācijai; Netlify Blobs Beta; Netlify Free 300 credits/hard cap; Supabase Free pēc ~7 dienām mazaktivitātes var apturēt DB; neatkarīga backup atjaunošana, RLS un naudas matemātika ir obligāti testi.
- **Nākamais solis:** noteikt GitHub repo īpašnieku un sagatavot sintētisku, testējamu sākotnējo Netlify/Supabase/GitHub projektu; bez atsevišķas atļaujas neveikt sensitīvu datu importu vai norēķinu abonēšanu.
