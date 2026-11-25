# Cilvēkam saprotamie pieņemšanas un regresijas testi

**Visi zemāk minētie testi ir SCENĀRI, NEVIS izpildīti testi.** `docs/18_PROJECT_STATUS.md` fiksē faktiski veikto.

| Tests | Prasības | Pārbaudes situācija | Sagaidāmais rezultāts |
|---|---|---|---|
| TC-001 | 003,004 | Pievieno vienu preci 3 un 4 vienības kā divus ierakstus | Grupa rāda 7, izvēršot 2 atsevišķus ierakstus |
| TC-002 | 005 | Darbinieks labo pirmo ierakstu no 3 uz 2 | Parastā skatā grupa 6, vecais 3 neiekļaujas summā |
| TC-003 | 002 | Notikums A `create`, B `replace`, C `void` | Visi RAW notikumi saglabāti un RLS liedz tiešu labošanu/dzēšanu |
| TC-004 | 006,007 | Darbinieka, admina default un admina history skats | Darbinieks tikai aktuālo; admins pēc izvēles redz veco dzeltenā/labots, sarkanā/anulēts un datumu/aktoru |
| TC-005 | 021 | Vienu `request_id` nosūta divreiz, arī pēc timeout | Datubāzē tikai viens pievienojums, atgriežas tas pats rezultāts |
| TC-006 | 020 | Pēc Saglabāt pazūd tīkls, nav servera apstiprinājuma | UI nerāda 'Saglabāts'; atkārtojot nav dublikāta; nav lokālas offline rindas V1 |
| TC-010 | 001,027 | Pārbauda desmitdaļu precizitāti un noapaļošanas robežgadījumus | Atbilst lietotāja apstiprinātajai decimālajai politikai, ko vēl jāfiksē |
| TC-012 | 008 | Admins desktop pilnais / mobilajā vieglais | Pieejamas paredzētās darbības; UI režīms nemaina lomas |
| TC-013 | 009 | Admins izveido, deaktivizē lietotāju, pārbauda notikumu vēsturi | Konts vairs nevar autentificēties; vēsturiskais aktors joprojām ir redzams |
| TC-014 | 010,028 | Darbinieka konts mēģina tieši pieprasīt bilances API vai admin importu | Serveris liedz; adminam atļauj |
| TC-016 | 011 | Jauns gads ar iepriekšējo noslēgto inventarizāciju | Iegūti pareizie unikālie kandidāti un to izcelsmes gads |
| TC-017 | 012 | Divi dažādi pavadzīmju faili, pēc tam tas pats fails atkārtoti | Jaunie ieraksti apstiprināmi, nejaušs dubultimports apstādināts |
| TC-018 | 013 | Mazs imports un liels imports ar konflikta rindām | Rādīts atbilstošs priekšskatījums, neapstiprināts imports aktīvo katalogu nemaina |
| TC-019 | 014 | Prece pārnesta no iepriekšējā gada un prece no jaunā faila | Atšķirama precīza izcelsme un importa partija |
| TC-020 | 015 | Vienāds kods/nosaukums/PZ cena, bet dažāda PL cena | Darbība atbilst vēlāk apstiprinātam noteikumam; līdz tam konflikts tiek izcelts |
| TC-021 | 016 | Skenē uz telefona vienu kodu | Saglabāta tikai koda virkne/formāts; nav attēla Storage/DB un nav pastāvīgā kešā |
| TC-022 | 017 | Nepareizs EAN kontrolcipars, nesalasāms kods | Neprecīzu kodu nevar klusām apstiprināt kā precīzu; drošs atkārtojums/ievade |
| TC-023 | 018 | Pirmajā reizē nezināms kods, vēlāk atkal tas pats | Veido pārbaudītu sasaisti, nākamajā reizē atpazīst |
| TC-024 | 019 | Vienam kodam ir vairāki cenu varianti | Parādīta izvēle ar cenu/kontekstu, nevis klusām izvēlēts viens |
| TC-025 | 022 | Tests uz ierīcēm pie preču plaukta un desktop | Lietotāji veic pamatplūsmu bez kritiskas aizkaves; skaitliskās robežas jādefinē |
| TC-026 | 023 | Privāts GitHub un Cloudflare priekšskatījuma builds | Avoti paliek privāti, produkcijas slepenās atslēgas nav build failos |
| TC-027 | 024 | Šifrēts backup un atjaunošana atsevišķā vidē | Dati + RLS + lomas atjaunojami; atjaunošanu cilvēks reāli pārbaudījis |
| TC-028 | 025 | Gada saskaņošana, noslēgšana un atkārtots eksports | Noslēgtā versija reproducējama; neautorizēti labojumi noraidīti |
| TC-029 | 026 | Bilances grafiks par vairākiem gadiem | Precīzi atbilst SQL pārskatam; nav izdomātu skaitļu |
| TC-030 | 029 | Vēsturisko datu migrācijas paralēla salīdzināšana | Katras PZ/PL summu un grupu atšķirības ir atzīmētas un izskaidrotas |
| TC-031 | 030 | Jauna aprēķina specifikācijas pārskatīšana | Ir formula, piemērs, avota ID, apstiprinājums un negatīvie testi |
| TC-032 | 031 | Jauns aģents saņem tikai dokumentācijas pakotni | Bez sarunas konteksta nosauc 5 pamatlēmumus, cenu atvērtos jautājumus un nākamo soli |
| TC-033 | 032 | V1 darbojas bez tīkla | Netiek veikta jaunu ierakstu saglabāšana; nav neapstiprinātu offline datu |
| TC-034 | 033 | E1 izveidots 10:00 ar 12, E2 labots 11:00 uz 10; admin izvēlas 10:30 un 11:30 | 10:30=12, 11:30=10; abas RAW versijas paliek, nav dubultskaitīšanas |
| TC-035 | 034 | Kataloga cena mainīta 11:00; pārskats uz 10:30 un 11:30, pēc tam vēlāk retroaktīvs labojums | "Toreiz zināmais" režīms atgriež iepriekš zināmo; retroaktīvā režīma rezultāts atbilst atsevišķi apstiprinātam cenu noteikumam, nevis klusai pārrakstīšanai |
| TC-036 | 035 | 10:00 ievadē izveidota jauna prece, 11:00 importēta pavadzīme ar vēl vienu jaunu preci | 09:59 neviena jaunā prece nav zināma, 10:30 zināma pirmā, 11:30 abas; izcelsmes saites saglabātas |
| TC-037 | 036 | Admin skatās 10:30, vēlāk mēģina "atgriezt" aktuālo uz 10:30 | Skatīšana nav datu maiņa; eksplīcita atgriešana, ja apstiprināta, rada kompensējošus notikumus un auditu, neizdzēš vēlākos RAW |
| TC-038 | 037 | Lietotājs deaktivizēts pēc inventarizācijas ierakstiem; atjaunota sistēma no backup | Vēsturiskie aktori nav pazaudēti, faktiskā autentifikācijas un lomu atjaunošana ir testēta, ne tikai pieņemta |
| TC-039 | 038 | Iznīcina testvides primāro DB pēc backup un mēģina atjaunot atsevišķā vidē | Atjaunoti RAW, katalogs, lietotāju references, shēma, tiesības un atkarīgie faili; iekšējs tās pašas DB schema snapshot nav ieskaitīts kā neatkarīgs backup |
| TC-040 | 039 | No notikumu žurnāla pārrēķina stāvokli ar un bez snapshot un atjaunošanas kontrolpunktu | Visas summas, produktu skaits, stāvokļa hash un atrisinātās versijas sakrīt; ignorētas/dublētas izmaiņas netiek pieņemtas |


## Testēšanas žurnāla veidne
`datums | vide | commit | TC-ID | PASS/FAIL/NOT_RUN | ievades datu kopa (anonimizēta) | novērojums | pierādījuma fails/link | atbildīgais`

## Finanšu pārbaudes īpašā kārtība
Pirms reāliem datiem izmantot anonimizētus deterministiskus fikstūru ierakstus, tad migrācijas kopijā pārbaudīt gada filtrus, grupēšanu, daudzumus, abas cenu summas, bilanci, nulles un anulēšanu. Neizlīdzināt atšķirības ar manuālu DB pārrakstīšanu — tās ir jāizmeklē.

## v0.1.2 — papildu scenāriji (visi NOT_RUN)

| Tests | Prasības | Pārbaudes situācija | Sagaidāmais rezultāts |
|---|---|---|---|
| TC-041 | 040 | Pavadzīme ar PZ=10.00, PL nav dokumentā; atsevišķi lietotāja manuāla PL=0.00 ievade | Imports rada unknown/NULL, manuālā 0.00 paliek precīza ar brīdinājumu; 0 nekļūst par zināmu plaukta cenu |
| TC-042 | 041 | Lietotājs ievada PZ=0.00, pēc tam PL=0.00 un spiež saglabāt | Brīdinājumi, ne aizliegums; ar skaidru apstiprinājumu ieraksts saglabāts; auth/audits paliek |
| TC-043 | 042 | Kods tukšs vairākiem vienādiem un dažādiem preču nosaukumiem | Ievade pieņemta; dažādas preces nesaplūst kļūdaini, var atrast pēc nosaukuma |
| TC-044 | 043 | Konfigurētais gads atšķiras no aktuālā; skata gads atšķiras no konfigurētā; abi vienādi, bet pagātnē | Pareizais no diviem neatkarīgajiem redzamajiem brīdinājumiem; rakstīšanas tiesību kontrole atbilst periodam |
| TC-045 | 044 | PL=0 variants, precīzs jauns variants, otra nenulles cena, vienāds jau esošs variants | Visi `docs/25_LEGACY_PRICE_AND_YEAR_RULES.md` aprakstītie vecie ceļi reproducēti; atšķirības no jaunā algoritma apstiprinātas |
| TC-046 | 045 | Izveido staging uz vienotas platformas un testē 2018–2025 datu apjomu, vienlaicīgu ievadi, cenu robežas, quota un backup | Precizitāte un restore PASS pirms produkcijas; platforma nepielīdzināta pieņemtai tikai pēc bezmaksas kvotu raksturlielumiem |
| TC-047 | 046 | Neautentificēts apmeklētājs apskata PWA/API/preview/R2; darbinieks sauc admin API | Neviens sensitīvais resurss nav publisks; visi autentificētie konti redz tikai atļautās darbības, ieskaitot API |
| TC-048 | 047 | Lietotnes platformas konts testā nav pieejams; mēģina atjaunot no ārpus-konta šifrētas kopijas | Atjaunota visa atkarību ķēde atsevišķā vidē, kontrolsummas sakrīt, atslēgas nav ievietotas rezerves kopijas publiskā repozitorijā |

**Pārbaudīts šajā iterācijā:** tikai statiska PHP koda analīze, SQL aggreģēšana un publiskās platformu dokumentācijas salīdzinājums. Nav palaista aplikācija vai produkcijas/Cloudflare testvide. Nevienam TC-041..048 nav piešķirts PASS.

## v0.1.3 — jauni kapacitātes testa scenāriji (NOT_RUN)
| Tests | Avots | Pārbaude | Pieņemšanas kritērijs |
|---|---|---|---|
| TC-049 | SRC-CHAT-CAPACITY, REQ-022/045 | Anonimizētas 2025 pīķa dienas 740 ievades, dažādas meklējumu plūsmas | Izmērīti D1 `rows_read`, `rows_written`, API latence; nepārsniegtas plānam nepieciešamās kvotas ar drošības rezervi |
| TC-050 | SRC-CHAT-CAPACITY, REQ-022/045 | Anonimizēta 2019 pīķa diena 3519 ievades un 2–5 paralēli lietotāji | Idempotence, atomiskums un finansu kopsummas PASS; D1/Worker limits un saskarnes atsaucība dokumentēti |
| TC-051 | SRC-CHAT-CAPACITY, REQ-022/045 | Veco SQL rindu bāzlīnijas reproducēšana tikai-lasāmi | Gada rindu skaiti un pieprasījumu UTC pīķi sakrīt ar dokumentēto pirmavota analizatoru; nav izvadīti sensitīvi dati |
**Šajā iterācijā:** TC-049, TC-050, TC-051 nav izpildīti; reproducēts tikai SQL teksta agregātu audits.


## v0.1.4 -- hybrid architecture candidates (ALL NOT_RUN)
| Test | Requirement | Input / exercise | Passing evidence |
|---|---|---|---|
| TC-052 | REQ-048 | Private GitHub -> Cloudflare PWA; employee/admin login through Supabase; parallel inventory+catalogue update | Correct RLS grants/denials and atomic writes, no secret exposed in frontend or previews |
| TC-053 | REQ-049 | Scheduled runner exports Supabase schema + data + roles + auth; encrypts, uploads to private R2 | Manifest, checksums, no access from public or unprivileged user, successful periodic object retention |
| TC-054 | REQ-049 | Restore separate test Supabase project from the R2 copy and redeploy Cloudflare UI | Ledger, prices, catalogue, all accounts/roles and login, RLS and exact balances match fixture; restore instructions reproduced |
| TC-055 | REQ-050 | Paused/unreachable Supabase and missed GitHub scheduled job | Never show unsaved write as saved; show DB unavailable, backup-age warning and appropriate alert |
| TC-056 | REQ-050 | Price and quota review at documented 2019/2025 peak and retention of daily snapshots | Record actual Cloudflare Workers/R2 and Supabase usage, pay-as-you-go exposure and contingency for billing suspensions |

All rows are test *definitions*. No cloud deployment, CI run or real restoration occurred in this turn.


## v0.1.5 — Netlify Free/Blobs kandidāta testi (NOT_RUN)

| Tests | Saistība | Pārbaude | Pieņemšanas kritērijs |
|---|---|---|---|
| TC-057 | REQ-051 | Reģistrēt bezmaksas hosting+storage konfigurāciju bez maksājumu kartes/abonementa | Neviena abonēšanas aktivizācija un nav automātisku piemaksu; Free kvotu izsmelšana skaidri atslēdz funkciju, nevis rada maksu |
| TC-058 | REQ-051/052 | Netlify Free + GitHub privāta personīga/organizācijas repozitorija integrācijas izmēģinājums | Faktiskajam repo īpašniekam pieejams privāts CI/CD; ja organizācijas privātam repo integrācija prasa maksu, piedāvāts pārbaudīts drošs variants bez publiska pirmkoda |
| TC-059 | REQ-052 | Iesniegt no GitHub Actions šifrētu syntētisku PostgreSQL dump uz Netlify Blobs; pārbaudīt privātu piekļuvi, EU reģionu un nepārtrauktību pēc deploy | Neautentificēts pieprasījums/employee nevar nolasīt backup; blob pieejams pēc jaunas izvietošanas; neieraksta paroles/atslēgas CI žurnālos; faila hash sakrīt |
| TC-060 | REQ-052 | Tīrā testvidē no Blobs šifrētās kopijas atjaunot datu struktūru, Auth, RLS, ledger un bilanci | Visi semantiskie un finanšu kontroles testi PASS; atjaunošana reproducējama arī tad, ja primārais Supabase projekts nav pieejams |

**Visi testi NOT_RUN.** Nav izveidots Netlify projekts/Blobs krātuve, nav aktivizēts billing, nav skarti reālie dati.


## v0.1.6 — testi izvēlētajam Netlify + Supabase + GitHub stekam (VISI NOT_RUN)

| Tests | Prasības | Pārbaude | Akceptēšanas nosacījums |
|---|---|---|---|
| TC-061 | REQ-053 | Privāts GitHub repo ar faktisko īpašnieka tipu (personīgs/organizācijas) pieslēgts Netlify Free vai droši izvietots no privāta CI | Netiek publiskots pirmkods, nav vajadzīga neatļauta apmaksa; deploy metode atbilst Netlify noteikumiem |
| TC-062 | REQ-053 | PWA Netlify preview un produkcijas būvējums ar Supabase Auth | Nav servera slepeno atslēgu klienta JS, neautentificēts lietotājs nesaņem privātos datus; korekta sesija un kļūdu režīms |
| TC-063 | REQ-053 | Staff/admin pieslēgumi un divu lietotāju vienlaicīga rakstīšana ar Supabase RLS, RPC | Precīzas summas, izolētas tiesības un unikāli idempotences pieprasījumi; RAW nevar mutēt |
| TC-064 | REQ-054 | Šifrēts dumprestore no Netlify Blobs + neatkarīga offline kopija uz atsevišķu testprojektu | Atjaunojams katalogs, RAW notikumi, cenas, Auth/roles, RLS un identiskas bilances; šifrēšanas atslēga nav uzglabāta kopā ar vienīgo backup |
| TC-065 | REQ-053 | Netlify kredītu izlietojums/bez billing, Supabase Free pausing un neizdevies nakts backup | Zināma kvotu izsmelšanas uzvedība, brīdinājumi un atkopšanas procedūra; nav automātiskas maksas; pieejamības risks fiksēts |

**Testēšanas statuss:** neviena no iepriekš minētajām pārbaudēm nav veikta; tikai oficiālās Netlify un Supabase dokumentācijas pārbaude. Neapgalvot, ka izvēlētā platforma jau strādā.
