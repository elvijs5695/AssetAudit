# Wishlist / backlog ar prioritātēm un pamatojumu

*Lietotāja prasības ir `REQ`; wishlist priekšlikumi ir vēl nerisināti. "P0" nenozīmē atļauju veikt darbu produkcijā.*

| ID | Prioritāte | Iecere un ieguvums | Statuss | Saistība |
|---|---|---|---|---|
| WL-001 | P0 | Precīzi definēt cenas/dublikātu izvēli, lai nenotiktu klusa finanšu datu maiņa | IZPĒTE | REQ-015, Q-001 |
| WL-002 | P0 | Decimālo cenu un summu aprēķins ar pierādāmiem piemēriem | PRIEKŠLIKUMS | REQ-001, REQ-027 |
| WL-003 | P0 | Append-only ierakstu labojumi/anulēšana ar auditoru vēsturi | APSTIPRINĀTA VAJADZĪBA | REQ-002, REQ-006 |
| WL-004 | P0 | Lietotāju autorizācija/RLS, veco atklāto paroļu likvidēšana | APSTIPRINĀTA VAJADZĪBA | REQ-028 |
| WL-005 | P0 | Pilnvērtīga neatkarīga backup un restore procedūra | JĀAPSTIPRINA POLITIKA | REQ-024 |
| WL-006 | P1 | Atkārtota pavadzīmju importa preview, anomālijas un idempotence | APSTIPRINĀTA VAJADZĪBA | REQ-011..014 |
| WL-007 | P1 | Mobilā skenera plūsma bez attēlu glabāšanas | APSTIPRINĀTA VAJADZĪBA | REQ-016..019 |
| WL-008 | P1 | Administratora pilnais desktop / vieglais mobilais režīms un vēstures slēdzis | APSTIPRINĀTA VAJADZĪBA | REQ-006..008 |
| WL-009 | P1 | Skaidrs gada slēgšanas, eksporta un salīdzinājuma process | PAMATVAJADZĪBA; DETAĻAS ATLIKTAS | REQ-025 |
| WL-010 | P1 | Lietotāju kontu pārvaldība bez atklātām parolēm | APSTIPRINĀTA VAJADZĪBA | REQ-009, REQ-028 |
| WL-011 | P1 | Katras nākamās izmaiņas saite uz lietotāja oriģinālo norādi, lēmumu, testu | APSTIPRINĀTA VAJADZĪBA | REQ-030..031 |
| WL-012 | P2 | Analītika: vēsturiskas PZ/PL summas, bilances izmaiņas, cenu anomālijas | ATLIKTS | REQ-026 |
| WL-013 | P2 | Opcija no admin paneļa lejupielādēt droši veidotu DB backup/eksportu | PRIEKŠLIKUMS | REQ-024 |
| WL-014 | P2 | PWA kameras ātruma salīdzinājums ar native Android uz reālām ierīcēm | PĒTĪJUMS | REQ-016, REQ-022 |
| WL-015 | P3 | Bezsaistes darba režīms tikai ar pierādāmu idempotenci un konfliktu risināšanu | ATLIKTS | REQ-032 |
| WL-016 | P3 | Plašāks noliktavas funkciju kopums starp ikgadējām inventarizācijām | IDEJA | SRC-R2-C2 |
| WL-017 | P2 | Pavadzīmju automātiska formātu pārbaude un pārskatāms imports bez phpMyAdmin | APSTIPRINĀTA VAJADZĪBA | REQ-012, REQ-013 |
| WL-018 | P1 | Administratora "Laika mašīna": kalendārs + laiks, tikai lasāma vēsturiskā inventarizācija un bilance | LIETOTĀJA VĒLME; DETALIZĀCIJA ATVĒRTA | REQ-033, REQ-034, Q-018 |
| WL-019 | P2 | Auditējama selektīva "atgriešana" ar izmaiņu priekšskatījumu un kompensējošiem notikumiem | IDEJA; NAV APSTIPRINĀTA SEMANTIKA | REQ-036, Q-019 |
| WL-020 | P2 | Sākt skata atjaunošanu no pārbaudīta snapshot un piemeklēt nākamos RAW notikumus | ARHITEKTŪRAS PRIEKŠLIKUMS | REQ-039, TC-040 |
| WL-021 | P1 | Platformneatkarīgs inkrementāls/off-site backup ar atjaunošanas testu, nevis vienīgi DB iekšēja shēma | STRATĒĢIJA JĀPRECIZĒ | REQ-024, REQ-038, Q-020, Q-023 |
| WL-022 | P1 | Atjaunojama un auditējama lietotāju profilu, lomu un kontu dzīves cikla vēsture | TVĒRUMS JĀPRECIZĒ | REQ-037, Q-020 |


**Neiekļaut automātiski:** foto glabāšana (lietotājs skaidri noraidīja), pašpietiekams offline V1, cena pēc svītrkoda bez apstiprinājuma, automātiski "pieskaņot" grāmatvedības summas bez izsekojamiem koriģējošiem notikumiem.

## v0.1.2 — UX un infrastruktūras prasības
- [MUST] Brīdinājums par aktīvi ievadītu 0.00 PZ un/vai PL cenu bez ievades bloķēšanas (`REQ-041`).
- [MUST] Koda ievades lauks nav obligāts; tukša koda preces meklējamas pēc nosaukuma (`REQ-042`).
- [MUST] Divi neatkarīgi izteikti gada brīdinājumi: konfigurācija pret aktuālo kalendāro gadu; skatāmais gads pret konfigurāciju (`REQ-043`).
- [MUST] Preservēt zināmu PL cenu vēsturi un nezināmas importētās PL vērtības semantiku (`REQ-040/044`).
- [SHOULD] 2 platformu ekspluatācijas modelis: privāts Git + viena aplikācijas platforma, kas satur arī DB un privātu backup (`REQ-045`).
- [MUST] Pieejas kontrole visam lietotnes resursu perimetram, tostarp preview, API un backup (`REQ-046`).
- [PROPOSED] Periodisks ārpus konta šifrēts offline backups (`REQ-047`).


## v0.1.4 -- new architectural candidates
- **WL-023 (P0, PROPOSED):** Test Cloudflare Workers static assets and admin API with Supabase PostgreSQL/Auth under real RLS conditions; preserve `NUMERIC` arithmetic and business transactional updates (`REQ-048`, `TC-052`).
- **WL-024 (P0, PROPOSED):** Encrypted scheduled logical database backup using existing GitHub Actions runner to private R2, monitored with retention and actual clean-room restore (`REQ-049`, `TC-053/054`).
- **WL-025 (P1, INVESTIGATE):** Operational alerts and degraded-mode UX for Supabase Free pause and skipped jobs; project availability must not be inferred from Cloudflare frontend availability (`REQ-050`, `TC-055/056`).


## v0.1.5
- **WL-026 (P1, CONFIRMED preference):** izvairīties no Cloudflare R2 norēķinu abonementa vai jebkura automātiskas piemaksas režīma (REQ-051).
- **WL-027 (P2, PROPOSED):** pārbaudīt Netlify Free PWA + private Blobs Beta backup ar Supabase un GitHub (REQ-052).
- **WL-028 (P1, SECURITY):** periodiska uz uzņēmuma kontrolēta šifrēta diska glabāta neatkarīga recovery kopija, ja Cloud storage Beta vai Free kvotu ierobežojumi nav pietiekami (REQ-024/047/052).


## v0.1.6 — izvēlētais steks

- **WL-029 (P0, CONFIRMED):** izveidot Netlify + Supabase + privāta GitHub sākotnējo, pilnībā pārbaudītu PWA izstrādes vidi ar dokumentāciju un versētām migrācijām (REQ-053; DEC-035; TC-061..063).
- **WL-030 (P0, UNDER_INVESTIGATION):** Netlify Blobs privātas šifrētas kopijas un periodiska neatkarīga atjaunošanas kopija, testēt faktisku restore; nepiespiest vēl neakceptētu Beta risinājumu kā vienīgo (REQ-054; TC-064).
- **WL-031 (P0, SECURITY):** pārbaudīt Netlify Free kvotas, privāta repo pieslēgšanas nosacījumus, Supabase Free apturēšanas risku un neaktivizēt norēķinu abonementu bez atļaujas (REQ-051/053; TC-065).
