# Vēsturiskā slodze un platformas kapacitātes robežas

**Datu avots:** `SRC-LEGACY-ZIP`, `backup/26-11-21_13-06-34.sql` (lasīts tikai tekstuāli). **Lietotāja uzdevums:** `SRC-CHAT-CAPACITY` — «Novērtē slodzi pēc viena gada datubāzes ierakstiem.»
**Audita datums:** 2026-11-25. **Statuss:** apstiprināti vēsturiskā SQL dump agregāti; nav palaistas Cloudflare DB, staging vai reāla slodzes testa. Platforma nav izvēlēta.

## Metode

Parsētas visas `INSERT INTO preces` SQL dump sekcijas. Inventarizācijas gads ir `preces.gads`, kas **nav** vienāds ar faktisko kalendāro ievades gadu. UTC dienas/stundas/minūtes aprēķinātas no `preces.tstamp` (Unix sekundes); vecajā DB ir arī ierakstu modifikāciju `etstamp`, bet nav pilnvērtīga notikumu žurnāla. Rezultāti attiecas uz **datu eksportā saglabātajiem ierakstiem**, ne pilnīgu vēsturisko HTTP pieprasījumu vai labošanas notikumu skaitu. 2018. gada `tstamp=0`, tādēļ tam nav patiesu laika pīķu.

## Inventarizācijas rindu skaits pa gadiem

| Inventarizācijas gads | `preces` rindas |
|---|---:|
| 2018 | 7 477 |
| 2019 | 10 693 |
| 2020 | 9 487 |
| 2021 | 9 627 |
| 2022 | 8 594 |
| 2023 | 8 370 |
| 2024 | 7 240 |
| 2025 | 6 331 |
| **Kopā** | **67 819** |

## Pēdējais pilnais inventarizācijas gads: 2025

| Metrika | Novērotais rezultāts |
|---|---:|
| Rindas | 6 331 |
| Dienas ar vismaz vienu `tstamp` ierakstu (UTC) | 32 |
| Pīķa diena | 740 ieraksti (2025-12-31, UTC) |
| Pīķa stunda | 220 ieraksti |
| Pīķa 5 minūtes | 29 ieraksti |
| Pīķa minūte | 7 ieraksti |
| Pīķa sekunde | 1 ieraksts |
| Novērotie `user` ID | 2 atšķirīgi ID (ID 1: 6329, ID 3: 2) |
| Rindas ar `euser != 0` | 269 (tas nav visu izmaiņu skaits) |
| Izgūto rindu aptuvenais SQL teksta apjoms | ~0,7–0,9 MiB; nav fiziski izmērīts D1 diska izmērs |

Cenas un preču nosaukumi netiek atklāti. Netiek apgalvots, ka pīķa 1 rinda/sekundē nozīmē maksimums 1 pieprasījums/sekundē: meklējumiem, sarakstu ielādei, pogām un importiem ir atsevišķi HTTP/SQL pieprasījumi. Lielākā daļa 2025. gada rindu saistītas ar vienu vecās sistēmas lietotāja ID, bet **tas nepierāda**, ka vienlaikus izmantoja tikai viens cilvēks; dalītas lietotāju sesijas nav izslēgtas.

## Vēsturiskais sliktākās dienas konteksts: 2019

- 2019. gada inventarizācija: 10 693 rindas.
- Pīķa diena: 3 519 rindas **2020-01-02** (rindu `gads=2019`).
- Pīķa stunda: 445; pīķa minūte: 15; pīķa 5 minūtes: 57.
- Gadu filtrēt pēc `gads`, vēsturiskās apskates laikam pēc `tstamp`, nesajaukt šos laukus.

## SQL datu kopējais mērogs

Eksportā: `preces=67 819`, `precu_katalogs=5 980`, `import=6 084`, `table6=1 256`, `users=8` rindas. Pilna sākotnējā SQL dump **nesaspiesta** ietilpība: **7 587 502 baiti (7,59 MB jeb 7,24 MiB)**. Tā ir eksporta teksta mērvienība, ne MySQL/D1 fiziskais diska izmērs. `preces` INSERT datu bloku teksts kopā ap 6,93 MB (ar atstarpju/formatējuma korekcijām).

Jauns append-only modelis ar korekciju, kataloga, importu, lietotāju notikumiem un indeksiem būs lielāks. **Pagaidu plānošanas aplēse** viena gada jaunajiem inventarizācijas notikumiem: daži MB; nav tests un nav garantija. Datu apjoms nav primārais 500 MB D1 Free limits, bet aktīvajā dienā ir svarīgs arī operāciju apjoms. 

## Salīdzinājums ar Cloudflare oficiālajām Free kvotām, pārbaudīts 2026-11-25

D1: maksimums **500 MB/viena DB**, **5 GB/account**, **5 000 000 rows read/day**, **100 000 rows written/day**, **7 d. operatora Time Travel**. Workers Free: **100 000 Worker requests/day**, **10 ms CPU vienam izsaukumam** (ar platformas dokumentācijā noteiktajām niansēm).

- Rakstīšana: 2025 pīķis 740 ieraksti/d ir tikai 0,74% no 100k rakstītu rindu dienas budžeta, **ja katram ievades ierakstam atbilst viena D1 rakstīta rinda**. Ja notikumu un indeksu plūsma raksta 5 rindas uz ievadi, tad aptuveni 3 700 jeb 3,7% no kvotas. Faktiskais rakstīto rindu skaits jāizmēra; cenrādis skaita D1 `rows_written`, ne lietotāja inventarizācijas vienības.
- Pat vēsturiski noslogotākā 2019 gada pīķa diena 3 519 ierakstu, pie 5 DB rindām uz ievadi, ~17 595 rakstītas rindas jeb 17,6% no Free kvotas. Tā ir hipotēze, ne izmērīta DB metriķa.
- Lasīšana: pilna pašreizējā kataloga skenēšana (~5 980 rindas) **apmēram 836 reizes** dienā patērētu ~5 miljonus lasītu rindu. 2025 pīķa 740 ievadēm divi pilni kataloga skenējumi uz katru dotu **8 850 400** lasītu rindu, pārsniedzot 5m kvotu. Šis ir **anti-pattern scenārijs**, ne faktiskā novērotā sistēmas slodze.
- Worker request limits: pie 5 Worker/API izsaukumiem uz vienu no 740 ievadēm ~3 700 pieprasījumu/dienā, kas ir krietni zem 100k/dienā; meklēšanas pieprasījumi, darba sesijas, automātiska atsvaidzināšana un analītika jāskaita atsevišķi.
- D1 viena DB apstrādā vaicājumus secīgi; smagi agregāti vai eksports var kavēt pārējos vaicājumus, lai arī šeit datu apjoms ir neliels. D1 oficiālā metrika pie katra query: `meta.rows_read`, `meta.rows_written`, `duration`, `size_after`.

**Oficiālās dokumentācijas saites:**
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/reference/faq/
- https://developers.cloudflare.com/workers/platform/limits/

## UX/SQL prasības, kas izriet no slodzes (PĀRBAUDĀMI PIEDĀVĀJUMI, ne izpildīta realizācija)

1. Kataloga meklēšanai izmantot indeksētu vai FTS meklēšanu un pēc iespējas `EXPLAIN QUERY PLAN`; nav pieļaujams pilns katalogs uz katru lietotāja ievadīto burtu. Debounce + minimum characters + `LIMIT` + iespējamā lokālā kešošana jāmodelē pēc UX prasībām.
2. Inventarizācijas grupēšanas/finanšu skatam indeksēt gadu, stabilās grupēšanas atslēgas, un vajadzības gadījumā izmantot atjaunojamas projekcijas; atsevišķu RAW datu vaicājumu uz katru tabulas rindu nepieļaut.
3. D1 prototipā pēc datu importēšanas **izmērīt** 2025 vēsturisko pīķi un 2019 stresa maksimumu, ar anonimizētiem ievades datiem; izmantot `meta` metriku un vajadzības gadījumā kvotu drošības robežas.
4. Atsevišķi testēt 2–5 vienlaicīgus ievadītājus, cenu atomiskumu, inventarizācijas + kataloga idempotenci, saskarnes atsaucību un agrāka laika bilances pieprasījumus.
5. 500 MB DB un 10 GB R2 bezmaksas kvotas ir apjoma robežas, ne rezerves kopiju drošības vai bezmaksas pieejamības garantija; glabāt šifrētu ārpus-konta kopiju, kā minēts `24_PLATFORM_CONSOLIDATION.md`.
6. Produkcijas slodze nav verificēta: nav request logu, reālu query plans, rīku telemetrijas, faktisko `rows_read/rows_written` vai HTTP latences.

## Reprodukcija

`python tools/annual_workload_audit.py /private/path/inventarizacija.zip` — tikai **lasāms** SQL parse no privātā arhīva, izvada tikai agregātus; neizvada preču nosaukumus, privātus datus, lietotāju vārdus vai cenas. Aizliegts dump pievienot dokumentācijas ZIP vai Git repozitorijam.

**Interpretācijas robeža:** ievades dienas un stundas ir pēc UTC; lokālās Latvijas dienas var nedaudz atšķirties pie pusnakts. Vecajā sistēmā dzēstie ieraksti vairs nav dump, un labojumi ir pārrakstīti, tādēļ šie aprēķini var būt vēsturisko reālo darbību zemākā robeža.
