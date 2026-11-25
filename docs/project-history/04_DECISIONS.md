# Lēmumu žurnāls (ADR-lite)

**Noteikums:** `CONFIRMED` nozīmē lietotāja lēmumu; `PROPOSED` nozīmē arhitektūras piedāvājumu, kuru nedrīkst pasniegt kā apstiprinātu. Vecos lēmumus nedzēš, bet pievieno `SUPERSEDED_BY` saiti un jaunu rindu.

| ID | Datums | Statuss | Lēmums / pamatojums | Sākotnējais avots | Aizstāj |
|---|---|---|---|---|---|
| DEC-001 | 2026-11-25 | CONFIRMED | Inventarizācijas ierakstus drīkst labot; katrs pievienojums paliek neatkarīgs, UI rāda summu. | SRC-R1-C0, SRC-R2-C0 | — |
| DEC-002 | 2026-11-25 | CONFIRMED | RAW ievades vēsturei jābūt nemainīgai; labojumi notiek ar atsevišķiem auditētiem notikumiem. | SRC-CHAT-INIT, SRC-R1-C0 | veco PHP `UPDATE/DELETE` pieeja konceptuāli noraidīta |
| DEC-003 | 2026-11-25 | CONFIRMED | Parastais UI rāda tikai aktuālo; adminam ir `Rādīt vēsturi` (labots/dzēsts, aktors, laiks), pilnais/vieglais režīms. | SRC-R2-C0 | — |
| DEC-004 | 2026-11-25 | CONFIRMED | V1 darbojas online-only; offline ievades/sinhronizācijas atliktas. | SRC-R2-C8 | agrākais offline variants atlikts |
| DEC-005 | 2026-11-25 | CONFIRMED | Svītrkodi jālasa ar kameru, neglabājot attēlus; glabā tikai atpazīto kodu. | SRC-R2-C7 | sākotnējā foto glabāšanas ideja |
| DEC-006 | 2026-11-25 | CONFIRMED | Katalogs izveidojams no iepriekšējā gada unikālajām precēm, papildināms ar atkārtotiem pavadzīmju importiem un priekšskatījumu. | SRC-R1-C2 | manuālā procesa saglabāšana bez izmaiņām |
| DEC-007 | 2026-11-25 | CONFIRMED | Gada beigas: saskaņošanas korekcijas, noslēgums, eksports; detalizētā specifikācija vēlāk. | SRC-R2-C2 | — |
| DEC-008 | 2026-11-25 | CONFIRMED | Administratoram piekļuve bilancei; darbinieks redz cenu laukus un var labot datus; pieņemts, ka bilanci var teorētiski izrēķināt pats. | SRC-CHAT-INIT, SRC-R1-C4 | — |
| DEC-009 | 2026-11-25 | UNDER_INVESTIGATION | Cenu prioritātes algoritmu NEAPSTIPRINĀT, kamēr nav analizēti 37 konfliktu gadījumi un cenu semantika. | SRC-R1-C1, SRC-R2-C1, SRC-LEGACY-ZIP | — |
| DEC-010 | 2026-11-25 | PREFERENCE_NOT_FINAL | Pamatvirziens Supabase/PostgreSQL + privāts GitHub; Cloudflare Pages kā hostinga kandidāts; negribas uzturēt savu serveri. | SRC-R1-C6, SRC-R2-C4 | agrāko PHP servera saglabāšanas piedāvājumu kā galveno virzienu |
| DEC-011 | 2026-11-25 | PROPOSED | Finanšu NUMERIC/DECIMAL, servera aprēķini un idempotences UUID nodrošina pārbaudāmu precizitāti. | SRC-CHAT-INIT, SRC-R1-C7, SRC-LEGACY-ZIP | — |
| DEC-012 | 2026-11-25 | PROPOSED | Automātiskas neatkarīgas off-site šifrētas rezerves kopijas un periodiski atjaunošanas testi; adminam papildu drošs eksports pēc vajadzības. | SRC-R2-C5, SRC-R2-C6 | — |
| DEC-013 | 2026-11-25 | CONFIRMED | Izstrādes dokumentiem jābūt pārnesamiem uz citu čatu/aģentu; katrai funkcijai jāsaglabā lietotāja izcelsme un motivācija. | SRC-CHAT-DOCS | — |
| DEC-014 | 2026-11-25 | PROPOSED | Lietotāju deaktivizēt, nevis fiziski izdzēst, lai nepazaudētu aktora saites audita vēsturē. | SRC-CHAT-INIT, SRC-R1-C5 | — |

| DEC-015 | 2026-11-25 | CONFIRMED | Vēlama administratoram pieejama vēsturiska inventarizācijas stāvokļa un bilances apskate pēc datuma/laika; tā ir tikai lasīšana, nevis DB restore. | SRC-CHAT-TIME-TRAVEL | — |
| DEC-016 | 2026-11-25 | CONFIRMED | Katalogu papildina gan jauna prece inventarizācijas ievadē, gan apstiprināti pavadzīmju importi; jāsaglabā izcelsme. | SRC-CHAT-TIME-TRAVEL | — |
| DEC-017 | 2026-11-25 | CONFIRMED | Datu vēstures un rezerves kopiju principi jāprojektē neatkarīgi no izvēlētā hostinga/DB pakalpojuma; Supabase paliek kandidāts, ne saistošs projektēšanas ierobežojums. | SRC-CHAT-TIME-TRAVEL | — |
| DEC-018 | 2026-11-25 | PROPOSED | Loģisku atgriešanu īstenot ar jauniem kompensējošiem notikumiem un skaidru apstiprinājumu; nekad neapgriezt RAW žurnālu vai nepalaist produkcijas PITR kā ikdienas UI operāciju. | SRC-CHAT-TIME-TRAVEL | — |
| DEC-019 | 2026-11-25 | PROPOSED | Atšķirt sistēmā reģistrēšanas laiku un biznesa spēkā esamības laiku; laika atlasei precizēt bitemporālu rezultātu un transakciju secību. | SRC-CHAT-TIME-TRAVEL | — |
| DEC-020 | 2026-11-25 | PROPOSED | DB iekšējie snapshots tikai paātrināšanai, ne katastrofu atjaunošanai; patiesam backup vajag atsevišķu kļūmju domēnu, pārbaudītu atjaunošanu un visu datu atkarību tvērumu. | SRC-CHAT-TIME-TRAVEL | — |


## Kā pievienot lēmumu
1. `DEC-021` (nākamais ID), datumā lieto ISO `YYYY-MM-DD`.
2. Statuss, skaidra **izvēlētā uzvedība**, alternatīvas un ietekmētie `REQ-/TC-` numuri.
3. Avota ID un, ja ir, `SUPERSEDES: DEC-...`.
4. Aģenta piedāvājums ar `PROPOSED` **nekļūst CONFIRMED** tikai tādēļ, ka aģents to dokumentējis.

## v0.1.2 — precizējumu un platformu ieraksti

| ID | Datums | Statuss | Lēmums / fakts | Avots | Saistība |
|---|---|---|---|---|---|
| DEC-021 | 2026-11-25 | CONFIRMED | Pavadzīmes `PL=0.00` ir nezināmas plaukta cenas vēsturisks marķieris; nevienam reālam produktam tas nav zināms fakts par cenu. Aktīvas ievades `0.00` drīkst saglabāt ar brīdinājumu. | SRC-CHAT-PRICE-YEAR | REQ-040/041 |
| DEC-022 | 2026-11-25 | CONFIRMED | Tukšs preces kods ir bieži sastopams un ir atļauts. | SRC-CHAT-PRICE-YEAR | REQ-042 |
| DEC-023 | 2026-11-25 | CONFIRMED | Ja konfigurācijas gads atšķiras no aktuālā kalendāra gada, jāparādās īpašam brīdinājumam; apskates gadu atšķirība ir cits brīdinājums. | SRC-CHAT-PRICE-YEAR | REQ-043 |
| DEC-024 | 2026-11-25 | LEGACY_OBSERVED | `index.php` ievade/labojums papildina katalogu ar precīzu cenu variantu un var dzēst tam atbilstošu nulles PL placeholder; nenulles PL variantu vēsture paliek. Nav vispārēja `UPDATE catalogue SET price=latest`. | SRC-LEGACY-ZIP | REQ-044; skat. docs/25 |
| DEC-025 | 2026-11-25 | CONFIRMED_PREFERENCE | Samazināt pastāvīgo pakalpojumu skaitu; vēlama viena privāta online platforma aplikācijai, DB un backup, ar atsevišķu privātu Git. | SRC-CHAT-HOST-CONSOLIDATION | REQ-045; pārskata DEC-010, bet neapstiprina konkrētu piegādātāju |
| DEC-026 | 2026-11-25 | PROPOSED | Cloudflare Workers/Pages + D1 + Access + R2 ir konsolidēts kandidāts, tikai pēc grāmatvediskās aritmētikas, veiktspējas, lietotāju drošības un backup atjaunošanas testiem. | SRC-CHAT-HOST-CONSOLIDATION | REQ-045/046 |
| DEC-027 | 2026-11-25 | PROPOSED | R2 iekšējās kopijas papildināt ar retiem šifrētiem ārpus-konta offline atjaunojamiem eksportiem; vienas platformas konts nav pilnīgi neatkarīgs recovery domēns. | SRC-CHAT-HOST-CONSOLIDATION | REQ-047 |

**Lēmumu statuss:** produkcijas platforma NAV izvēlēta; cenu konfliktu prioritātes algoritms NAV finalizēts. DEC-024 ir pirmkoda novērojums, ne lietotāja akcepts katram robežgadījumam.


## v0.1.4 -- hybrid split evaluated, not approved
| ID | Date | Status | Proposal or observation | Source | Links |
|---|---|---|---|---|---|
| DEC-028 | 2026-11-25 | PREFERENCE_NOT_FINAL | User proposed Cloudflare for PWA/API and R2 for backups, Supabase for PostgreSQL/Auth and private GitHub for source. This is now the preferred architecture *candidate*, not authorization to deploy. | SRC-CHAT-HYBRID-STACK | REQ-048, TC-052; reinterpret but do not delete DEC-025/026 |
| DEC-029 | 2026-11-25 | PROPOSED | Nightly encrypted pg_dump/Supabase CLI export via scheduled GitHub Actions -> private R2, plus explicit full restore proof and alerts. No fourth always-on provider. | SRC-CHAT-HYBRID-STACK | REQ-049, TC-053/054 |
| DEC-030 | 2026-11-25 | TECHNICAL_CONSTRAINT | Standard Cloudflare Worker cannot simply run the usual pg_dump executable; generic API row export is not a substitute for consistent Postgres disaster recovery. | Public vendor docs | REQ-049 |
| DEC-031 | 2026-11-25 | UNDER_INVESTIGATION | Supabase Free pausing and R2 subscription/billing are unresolved even if Cloudflare app hosting is reliable. Keep service behavior and recovery explicit. | SRC-CHAT-SUPABASE-LIMITS, SRC-CHAT-HYBRID-STACK | REQ-050, TC-055/056 |


## v0.1.5 — norēķinu abonementa nosacījums un alternatīva

| ID | Datums | Statuss | Lēmums / ierobežojums | Avots | Saite |
|---|---|---|---|---|---|
| DEC-032 | 2026-11-25 | CONFIRMED_PREFERENCE | Supabase platforma lietotājam nav iebildumu. Cloudflare norēķinu abonements (R2), kas prasa billing aktivizāciju, ir nevēlams. Saglabāt nošķīrumu starp billing aktivizāciju un bezmaksas hostingu. | SRC-CHAT-NO-BILLING | REQ-051; pārskata, bet nedzēš DEC-028/031 |
| DEC-033 | 2026-11-25 | PROPOSED | Netlify Free aplikācijas PWA hostings + Netlify Blobs Beta neatkarīgam šifrētam backup, Supabase autoritatīvai datubāzei un privāts GitHub pirmkodam; NOT SELECTED. | SRC-CHAT-NO-BILLING + publiska dokumentācija | REQ-052; TC-058..060 |
| DEC-034 | 2026-11-25 | SECURITY_CONSTRAINT | Ja izmanto Netlify Blobs, site-wide privātu backup glabāt ar versijotām atslēgām, klienta puses šifrēšanu un atsevišķu ārpus-konta kopiju; Beta nav pierādīta vienīgā recovery kopija. | arhitektūras drošības novērtējums | REQ-024/047/052 |


## v0.1.6 — lietotāja izvēlētā platformu kombinācija

| ID | Datums | Statuss | Lēmums | Avots | Aizstāj / ierobežo |
|---|---|---|---|---|---|
| DEC-035 | 2026-11-25 | **CONFIRMED_BY_USER** | Izstrādāt lietotni ar **Netlify (PWA/hostings), Supabase (PostgreSQL/Auth) un privātu GitHub (pirmkods/dokumentācija)**. Netlify + Supabase + GitHub ir izvēlētais attīstības virziens; konkrēta produkcijas izvietošana vēl nav veikta. | SRC-CHAT-STACK-SELECT | Aizstāj platformu kandidātus DEC-028 un DEC-033 *hostinga izvēles* daļā; nav izvēlēta D1/R2 arhitektūra. |
| DEC-036 | 2026-11-25 | PROPOSED_NEEDS_CONFIRMATION | Netlify Blobs izmantot kā vienu šifrētas, ārpus Supabase glabātas rezerves kopijas vietu. Beta statuss, retence un pilna atjaunošana jāpārbauda; Blobs vienīgā backup vieta NAV apstiprināta. | SRC-CHAT-NO-BILLING, SRC-CHAT-STACK-SELECT | Nepieņemt, ka DEC-035 automātiski apstiprina backup stratēģiju. |
| DEC-037 | 2026-11-25 | TECHNICAL_CONSTRAINT | Netlify Free privāta GitHub repo automātiskā integrācija atkarīga no repo īpašnieka (personīgais vai organizācijas); jāpārbauda faktiska saderība un Netlify kredītu kvotas. | Oficiālā Netlify dokumentācija | TC-061, TC-065. |

**Aktuālais lēmuma statuss (v0.1.6): platformu kombinācija IZVĒLĒTA.** Atvērtie jautājumi par backup, repo īpašnieku, produkcijas gatavību un cenu algoritmu saglabājas. Vecās rindas `NOT SELECTED` ir agrāku iterāciju vēsturiskie ieraksti, ne pašreizējais statuss.
