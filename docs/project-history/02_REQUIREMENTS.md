# Prasību reģistrs — cilvēkam pārbaudāma versija

**Versija v0.1.2, 2026-11-25.** Avots: sākotnējais pieprasījums, 18 Word komentāri un vēlākie lietotāja precizējumi.

**Statusi:** `CONFIRMED_BY_USER` ir lietotāja prasība; `UNDER_INVESTIGATION` ir neizšķirts algoritms; `PROPOSED_NEEDS_CONFIRMATION` ir piedāvājums; `PREFERENCE_NOT_FINAL` ir priekšroka, ne galīgā platforma; `DEFERRED` ir atlikts.

**Svarīgi:** biznesa prasība nav automātiski apliecinājums konkrētai datubāzes realizācijai.

| ID | Prasība | Prioritāte | Statuss | Avoti / tests |
|---|---|---|---|---|
| **REQ-001** | Grāmatvediskā precizitāte | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-INIT / TC-010 |
| **REQ-002** | Nemaināma ievades vēsture | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-INIT, SRC-R1-C0, SRC-R2-C0 / TC-003 |
| **REQ-003** | Atsevišķi preces pievienojumi | MUST | `CONFIRMED_BY_USER` | SRC-R1-C0 / TC-001 |
| **REQ-004** | Aktuālo ierakstu apkopošana | MUST | `CONFIRMED_BY_USER` | SRC-R1-C0, SRC-R2-C0, SRC-LEGACY-ZIP / TC-001 |
| **REQ-005** | Parastā lietotāja labošana | MUST | `CONFIRMED_BY_USER` | SRC-R2-C0, SRC-R1-C0 / TC-002 |
| **REQ-006** | Vēstures redzamība administratoram | MUST | `CONFIRMED_BY_USER` | SRC-R2-C0 / TC-004 |
| **REQ-007** | Parastais skats bez vēstures | MUST | `CONFIRMED_BY_USER` | SRC-R2-C0 / TC-004 |
| **REQ-008** | Administratora režīmu pārslēgšana | SHOULD | `CONFIRMED_BY_USER` | SRC-R2-C0 / TC-012 |
| **REQ-009** | Lietotāju administrēšana | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-INIT / TC-013 |
| **REQ-010** | Bilances piekļuve | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-INIT, SRC-R1-C4 / TC-014 |
| **REQ-011** | Gada kataloga sākums | MUST | `CONFIRMED_BY_USER` | SRC-R1-C2, SRC-R2-C2 / TC-016 |
| **REQ-012** | Atkārtots pavadzīmju imports | MUST | `CONFIRMED_BY_USER` | SRC-R1-C2 / TC-017 |
| **REQ-013** | Kataloga importa priekšskatījums | MUST | `CONFIRMED_BY_USER` | SRC-R1-C2 / TC-018 |
| **REQ-014** | Preces izcelsmes norāde | MUST | `CONFIRMED_BY_USER` | SRC-R1-C2 / TC-019 |
| **REQ-015** | Cenu prioritātes algoritms | MUST | `UNDER_INVESTIGATION` | SRC-R1-C1, SRC-R2-C1, SRC-LEGACY-ZIP, SRC-CHAT-PRICE-YEAR / TC-020 |
| **REQ-016** | Barkoda ievade ar kameru | MUST | `CONFIRMED_BY_USER` | SRC-R2-C7, SRC-CHAT-INIT / TC-021 |
| **REQ-017** | Skenējuma uzticamība | MUST | `PROPOSED_NEEDS_CONFIRMATION` | SRC-R2-C7 / TC-022 |
| **REQ-018** | Pakāpeniska svītrkodu vārdnīca | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-INIT, SRC-R1-C3 / TC-023 |
| **REQ-019** | Vairākas atbilstības vienam kodam | MUST | `CONFIRMED_BY_USER` | SRC-R1-C3, SRC-R2-C3 / TC-024 |
| **REQ-020** | Sākotnēji tikai online | MUST | `CONFIRMED_BY_USER` | SRC-R2-C8, SRC-R1-C7 / TC-006 |
| **REQ-021** | Idempotents saglabāšanas API | MUST | `PROPOSED_NEEDS_CONFIRMATION` | SRC-R1-C7, SRC-R2-C8 / TC-005 |
| **REQ-022** | Responsive un ātrs PWA | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-INIT / TC-025 |
| **REQ-023** | Supabase un privāts GitHub | SHOULD | `PREFERENCE_NOT_FINAL` | SRC-R1-C6, SRC-R2-C4, SRC-CHAT-HOST-CONSOLIDATION / TC-026 |
| **REQ-024** | Neatkarīgas rezerves kopijas | MUST | `PROPOSED_NEEDS_CONFIRMATION` | SRC-R2-C5, SRC-R2-C6, SRC-CHAT-HOST-CONSOLIDATION / TC-027 |
| **REQ-025** | Gada slēgšana un eksports | MUST | `CONFIRMED_BY_USER` | SRC-R2-C2 / TC-028 |
| **REQ-026** | Vizualizācijas un analītika | COULD | `DEFERRED` | SRC-CHAT-INIT / TC-029 |
| **REQ-027** | Norēķinu datu precizitāte | MUST | `PROPOSED_NEEDS_CONFIRMATION` | SRC-CHAT-INIT, SRC-LEGACY-ZIP / TC-010 |
| **REQ-028** | Piekļuves kontroles un drošība | MUST | `CONFIRMED_BY_USER` | SRC-R1-C5, SRC-LEGACY-ZIP / TC-014 |
| **REQ-029** | Vēsturiskās migrācijas salīdzinājums | MUST | `PROPOSED_NEEDS_CONFIRMATION` | SRC-CHAT-INIT, SRC-R2-C9 / TC-030 |
| **REQ-030** | Cilvēkam lasāma specifikācija | MUST | `CONFIRMED_BY_USER` | SRC-R2-C9, SRC-CHAT-DOCS / TC-031 |
| **REQ-031** | Aģentu pārņemamība | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-DOCS / TC-032 |
| **REQ-032** | Offline nākotnē | COULD | `DEFERRED` | SRC-R2-C8, SRC-R1-C7 / TC-033 |
| **REQ-033** | Administrators skatās stāvokli pagātnē | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-TIME-TRAVEL / TC-034 |
| **REQ-034** | Vēsturiskās bilances reproducēšana | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-TIME-TRAVEL / TC-035 |
| **REQ-035** | Kataloga pieaugums inventarizācijā un importos | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-TIME-TRAVEL / TC-036 |
| **REQ-036** | Loģiska vēsturiska stāvokļa atgriešana | SHOULD | `PREFERENCE_NOT_FINAL` | SRC-CHAT-TIME-TRAVEL / TC-037 |
| **REQ-037** | Lietotāju dati atjaunošanas tvērumā | MUST | `PREFERENCE_NOT_FINAL` | SRC-CHAT-TIME-TRAVEL / TC-038 |
| **REQ-038** | Platformneatkarīga datu saglabāšanas arhitektūra | SHOULD | `CONFIRMED_BY_USER` | SRC-CHAT-TIME-TRAVEL / TC-039 |
| **REQ-039** | Atjaunojami stāvokļa momentuzņēmumi | COULD | `PROPOSED_NEEDS_CONFIRMATION` | SRC-CHAT-TIME-TRAVEL / TC-040 |
| **REQ-040** | Nezināma plaukta cena pavadzīmes importā | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP / TC-041 |
| **REQ-041** | Nulles cenas brīdinājums, ne aizliegums | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-PRICE-YEAR / TC-042 |
| **REQ-042** | Tukšs preces kods ir atļauts | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP / TC-043 |
| **REQ-043** | Konfigurētā gada neatbilstības brīdinājums | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP / TC-044 |
| **REQ-044** | Saglabāt un pierādīt vecās kataloga cenas aktualizācijas uzvedību | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP / TC-045 |
| **REQ-045** | Samazināt pastāvīgo platformu skaitu | SHOULD | `CONFIRMED_BY_USER` | SRC-CHAT-HOST-CONSOLIDATION / TC-046 |
| **REQ-046** | Privātums pilnā sistēmas tvērumā | MUST | `CONFIRMED_BY_USER` | SRC-CHAT-HOST-CONSOLIDATION, SRC-CHAT-INIT / TC-047 |
| **REQ-047** | Backup ārpus primārās kļūmju vides | MUST | `PROPOSED_NEEDS_CONFIRMATION` | SRC-CHAT-HOST-CONSOLIDATION, SRC-CHAT-TIME-TRAVEL / TC-048 |

## Prasību skaidrojums, ieviešanas robežas un izcelsme

### REQ-001 — Grāmatvediskā precizitāte

Finanšu aprēķiniem jābūt deterministiskiem, reproducējamiem un pārbaudāmiem; noapaļošanas noteikumi vēl jāapstiprina.

- **Avots:** SRC-CHAT-INIT
- **Tests:** TC-010
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Invariant, not a claim of verified legacy accuracy.

### REQ-002 — Nemaināma ievades vēsture

Sākotnējie ievades notikumi un korekcijas netiek pārrakstīti vai fiziski dzēsti ar aplikācijas lietotāja tiesībām.

- **Avots:** SRC-CHAT-INIT, SRC-R1-C0, SRC-R2-C0
- **Tests:** TC-003
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Backend/RLS grants and append-only event strategy are proposed implementation.

### REQ-003 — Atsevišķi preces pievienojumi

Vienas preces pievienojumi vairākos piegājienos paliek atsevišķi loģiski ieraksti.

- **Avots:** SRC-R1-C0
- **Tests:** TC-001
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Do not merge raw inventory entries.

### REQ-004 — Aktuālo ierakstu apkopošana

Vienas grupas aktuālie pievienojumi UI tiek sasummēti; atverot grupu, redz katru atsevišķi. Grupēšanas atslēga vēl precizējama.

- **Avots:** SRC-R1-C0, SRC-R2-C0, SRC-LEGACY-ZIP
- **Tests:** TC-001
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Legacy key: code,name,invoice price,shelf price,cash; units not grouped.

### REQ-005 — Parastā lietotāja labošana

Parasts lietotājs drīkst labot aktuālus inventarizācijas ierakstus, bet nevar labot RAW notikumu.

- **Avots:** SRC-R2-C0, SRC-R1-C0
- **Tests:** TC-002
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Confirm exact allowed fields when building forms.

### REQ-006 — Vēstures redzamība administratoram

Adminam ir izvēle Rādīt vēsturi; labotās versijas gaišākā/dzeltenā un dzēstās sarkanā ar datumu, laiku un aktoru.

- **Avots:** SRC-R2-C0
- **Tests:** TC-004
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Use text/icon status in addition to color for accessibility.

### REQ-007 — Parastais skats bez vēstures

Parastais lietotājs un admina noklusētais skats rāda tikai aktuālos ierakstus.

- **Avots:** SRC-R2-C0
- **Tests:** TC-004
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** History may remain server-side auditable.

### REQ-008 — Administratora režīmu pārslēgšana

Administratoram ir vienkāršotais/vieglais un pilnais UI režīms; pilnais optimizēts desktop; arī admin var strādāt telefonā.

- **Avots:** SRC-R2-C0
- **Tests:** TC-012
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Presentation mode must not modify server privileges.

### REQ-009 — Lietotāju administrēšana

Administrators pievieno, labo un deaktivizē lietotājus; identitāšu un notikumu vēsturi saglabā.

- **Avots:** SRC-CHAT-INIT
- **Tests:** TC-013
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Soft deactivation is implementation recommendation; avoid breaking audit FKs.

### REQ-010 — Bilances piekļuve

Finanšu kopsavilkumu un bilances API drīkst pieprasīt administrators; darbiniekam ir preču labošana, tādēļ visas izmaksas nav noslēpjamas.

- **Avots:** SRC-CHAT-INIT, SRC-R1-C4
- **Tests:** TC-014
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Server-level checks, not CSS hiding.

### REQ-011 — Gada kataloga sākums

Jaunā gada katalogu sagatavo no iepriekšējā noslēgtā inventarizācijas gada unikālajām precēm.

- **Avots:** SRC-R1-C2, SRC-R2-C2
- **Tests:** TC-016
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** What defines uniqueness is pending.

### REQ-012 — Atkārtots pavadzīmju imports

Gada laikā papildpavadzīmes drīkst importēt atkārtoti, ar skatu uz atšķirībām pirms apstiprināšanas.

- **Avots:** SRC-R1-C2
- **Tests:** TC-017
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Raw file imports should preserve source batch and checksum.

### REQ-013 — Kataloga importa priekšskatījums

Mazām partijām individuālas izmaiņas; lielām statistika, aizdomīgu rindu izcelšana; tikai pēc apstiprinājuma maina aktīvo katalogu.

- **Avots:** SRC-R1-C2
- **Tests:** TC-018
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Threshold for small/large is open.

### REQ-014 — Preces izcelsmes norāde

Precei jābūt izsekojamai līdz iepriekšējā gada datiem vai konkrētai jaunā gada pavadzīmes importēšanai.

- **Avots:** SRC-R1-C2
- **Tests:** TC-019
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Separate origin year vs inventory year.

### REQ-015 — Cenu prioritātes algoritms

Precīza cenu un plaukta cenas prioritāte konfliktos jānoskaidro no koda un datiem, jāprezentē lietotājam apstiprināšanai.

- **Avots:** SRC-R1-C1, SRC-R2-C1, SRC-LEGACY-ZIP, SRC-CHAT-PRICE-YEAR
- **Tests:** TC-020
- **Statuss:** `UNDER_INVESTIGATION`
- **Piezīme:** Legacy PHP verified: adding/editing variant may INSERT a new exact tuple and DELETE matching zero-price placeholder; it does NOT UPDATE a single last-wins price. Details docs/25_LEGACY_PRICE_AND_YEAR_RULES.md. Conflict-group SQL still not deterministic.

### REQ-016 — Barkoda ievade ar kameru

Kamera tikai nolasa kodu; neuzglabā svītrkoda foto vai kameras kadrus.

- **Avots:** SRC-R2-C7, SRC-CHAT-INIT
- **Tests:** TC-021
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Latest user comment supersedes original idea to photograph code.

### REQ-017 — Skenējuma uzticamība

Pēc skenēšanas kodam jābūt precīzam: lietot standarta kontrolciparu validāciju un neskaidru skenējumu atkārtot.

- **Avots:** SRC-R2-C7
- **Tests:** TC-022
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** Validation flow is proposal, accuracy goal is user-confirmed.

### REQ-018 — Pakāpeniska svītrkodu vārdnīca

Nezināmu kodu var sasaistīt ar preci; ar katru gadu iekšējā svītrkodu datubāze pieaug.

- **Avots:** SRC-CHAT-INIT, SRC-R1-C3
- **Tests:** TC-023
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** No barcode-only assumption for price.

### REQ-019 — Vairākas atbilstības vienam kodam

Ja skenētam kodam ir vairākas atbilstošas cenas/pozīcijas, UI piedāvā nepārprotamu izvēli.

- **Avots:** SRC-R1-C3, SRC-R2-C3
- **Tests:** TC-024
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Product barcode identity and price option are separate.

### REQ-020 — Sākotnēji tikai online

V1 nesaglabā inventarizācijas rakstījumus offline režīmā; saglabāts tikai pēc servera apstiprinājuma.

- **Avots:** SRC-R2-C8, SRC-R1-C7
- **Tests:** TC-006
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Offline future backlog only.

### REQ-021 — Idempotents saglabāšanas API

Atkārtots vai kavēts identisks iesniegums nedrīkst izveidot vēl vienu uzskaites ierakstu.

- **Avots:** SRC-R1-C7, SRC-R2-C8
- **Tests:** TC-005
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** Server-issued/caller-generated idempotency key with unique DB constraint proposed.

### REQ-022 — Responsive un ātrs PWA

Lietotāja ievades režīmam jābūt ātram un lietojamam desktop un mobilajās ierīcēs.

- **Avots:** SRC-CHAT-INIT
- **Tests:** TC-025
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** No final framework selection.

### REQ-023 — Supabase un privāts GitHub

Lietotājs vēlas privātu un bezmaksas/zemas izmaksas risinājumu, pašam neuzturot serveri; sākotnējā Supabase+GitHub priekšroka ir mainīta uz vienotas aplikācijas un backup platformas izvēli. Konkrēta platforma NAV apstiprināta.

- **Avots:** SRC-R1-C6, SRC-R2-C4, SRC-CHAT-HOST-CONSOLIDATION
- **Tests:** TC-026
- **Statuss:** `PREFERENCE_NOT_FINAL`
- **Piezīme:** Cloudflare (Workers/Pages + D1 + R2 + Access) under consideration; app backend is separate from Git source-control. Free limits, R2 subscription and payment-method risks require testing.

### REQ-024 — Neatkarīgas rezerves kopijas

Saglabāt neatkarīgu atjaunojamu datubāzes rezerves kopiju; admin lejupielāde kā papildu iespēja.

- **Avots:** SRC-R2-C5, SRC-R2-C6, SRC-CHAT-HOST-CONSOLIDATION
- **Tests:** TC-027
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** Storage provider/retention policy pending.

### REQ-025 — Gada slēgšana un eksports

Pēc inventarizācijas saskaņot datus ar grāmatvedību, noslēgt gada stāvokli un eksportēt rezultātu.

- **Avots:** SRC-R2-C2
- **Tests:** TC-028
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Detailed accounting reconciliation intentionally deferred.

### REQ-026 — Vizualizācijas un analītika

Vēsturisku finanšu rādītāju analītikas panelis administratoram, no atvasinātajiem datiem.

- **Avots:** SRC-CHAT-INIT
- **Tests:** TC-029
- **Statuss:** `DEFERRED`
- **Piezīme:** Charts/statistics not yet specified.

### REQ-027 — Norēķinu datu precizitāte

Finanšu aprēķiniem jābūt precīziem bez binary floating-point uzskaites kļūdām; PostgreSQL NUMERIC vai SQLite sistēmā mērogoti veseli skaitļi ir izvērtējamas realizācijas. Noapaļošana jāapstiprina.

- **Avots:** SRC-CHAT-INIT, SRC-LEGACY-ZIP
- **Tests:** TC-010
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** Proposed technical control for confirmed business invariant.

### REQ-028 — Piekļuves kontroles un drošība

Lietotāju autentifikācija, servera lomu pārbaudes, stingrs RLS, nekādu plain-text paroļu vai klienta admin atslēgu.

- **Avots:** SRC-R1-C5, SRC-LEGACY-ZIP
- **Tests:** TC-014
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Complete threat model before launch.

### REQ-029 — Vēsturiskās migrācijas salīdzinājums

Pirms pārslēgšanās aprēķināt salīdzināmas vecās un jaunās atskaites un apstiprināt katru atšķirību.

- **Avots:** SRC-CHAT-INIT, SRC-R2-C9
- **Tests:** TC-030
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** Use anonymized fixtures in repository.

### REQ-030 — Cilvēkam lasāma specifikācija

Katrs aprēķina un uzvedības noteikums aprakstīts ar ievadi, formulu, piemēru, pieņemšanas testu un saiti uz oriģinālo komentāru.

- **Avots:** SRC-R2-C9, SRC-CHAT-DOCS
- **Tests:** TC-031
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Documentation as project deliverable.

### REQ-031 — Aģentu pārņemamība

Katram nākamajam aģentam ir jāatjauno wishlist, prasību statuss, lēmumi, testu žurnāls un versijas izmaiņas, saglabājot oriģinālo lietotāja inputu.

- **Avots:** SRC-CHAT-DOCS
- **Tests:** TC-032
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Do not silently overwrite user rationale.

### REQ-032 — Offline nākotnē

Pilns offline režīms ir atsevišķs, pēc V1 apsverams produkta virziens, nevis klusām pievienota V1 funkcija.

- **Avots:** SRC-R2-C8, SRC-R1-C7
- **Tests:** TC-033
- **Statuss:** `DEFERRED`
- **Piezīme:** Do not cache unsynced writes in current release.

### REQ-033 — Administrators skatās stāvokli pagātnē

Administratoram ir tikai-lasāms datuma/laika izvēles režīms, kas rekonstruē aktīvās inventarizācijas ievades situāciju noteiktā brīdī.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-034
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Historical view; not a destructive DB restore.

### REQ-034 — Vēsturiskās bilances reproducēšana

Par izvēlēto brīdi var iegūt inventarizācijas stāvokli un bilanci, ieskaitot tajā brīdī zināmās preces un cenu versijas; precīza cenu un retroaktīvu labojumu semantika jāapstiprina.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-035
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Separate what was known then vs retrospective recalculation; no guessing of price rule.

### REQ-035 — Kataloga pieaugums inventarizācijā un importos

Jauna iepriekš nezināma prece var tikt pievienota inventarizācijas ievades procesā; pavadzīmju apstiprināšana arī papildina katalogu. Jāsaglabā izcelsmes saites un laika vēsture.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-036
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Exact authorization and confirmation stages remain open (Q-015).

### REQ-036 — Loģiska vēsturiska stāvokļa atgriešana

Iespēja administratoram ar priekšskatījumu atcelt vai kompensēt nevēlamas izmaiņas, nepārrakstot RAW vēsturi; masveida rollback tvērums un apstiprināšana vēl nav nolemti.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-037
- **Statuss:** `PREFERENCE_NOT_FINAL`
- **Piezīme:** User said "varētu"; do not implement an unconditional revert button.

### REQ-037 — Lietotāju dati atjaunošanas tvērumā

Rezerves kopiju/atjaunošanas projektā jāņem vērā lietotāju konti, profili un tiesību iestatījumi, ne tikai inventarizācijas rindas; atsevišķi noskaidrot auth servisa atjaunošanu.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-038
- **Statuss:** `PREFERENCE_NOT_FINAL`
- **Piezīme:** User said "Ak, lietotāji arī"; do not assume auth secrets can be recovered from DB-only dump.

### REQ-038 — Platformneatkarīga datu saglabāšanas arhitektūra

Sākotnējā datu saglabāšanas, vēsturiskās rekonstrukcijas un katastrofu atjaunošanas loģika nedrīkst paļauties uz vienas platformas specifiskām iespējām.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-039
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Supabase remains candidate; backup design neutral.

### REQ-039 — Atjaunojami stāvokļa momentuzņēmumi

Apsvērt atvasinātus stāvokļa momentuzņēmumus un pakāpeniskas rezerves kopijas, lai nebūtu katru reizi jāveido pilnīga aktuālo datu kopija.

- **Avots:** SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-040
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** Performance snapshots are not independent backups; backup delta integrity must be verified.

### REQ-040 — Nezināma plaukta cena pavadzīmes importā

Pavadzīmes imports sniedz pavadzīmes cenu, bet parasti ne plaukta cenu; 0.00 importa katalogā ir vēsturisks marķieris nezināmai PL cenai. Jaunajā modelī nezināmo cenu konceptuāli atšķirt no lietotāja ievadītas 0.00.

- **Avots:** SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP
- **Tests:** TC-041
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Business meaning confirmed; implementation via nullable field is a proposal, not mandatory physical DB design.

### REQ-041 — Nulles cenas brīdinājums, ne aizliegums

Aktīvā inventarizācijas ievadē cena 0.00 rada nepārprotamu brīdinājumu, tomēr lietotājs drīkst šo ievadi apstiprināt.

- **Avots:** SRC-CHAT-PRICE-YEAR
- **Tests:** TC-042
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Specify separately for PZ and PL; an imported unknown PL is not equivalent to a user-entered zero price.

### REQ-042 — Tukšs preces kods ir atļauts

Preces kods var būt tukšs; tukša koda dēļ ievade, meklēšana vai kataloga importēšana netiek bloķēta vai automātiski sapludināta ar nesaistītu preci.

- **Avots:** SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP
- **Tests:** TC-043
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Verify fallback matching rules; blank is not barcode.

### REQ-043 — Konfigurētā gada neatbilstības brīdinājums

Ja konfigurētais inventarizācijas gads neatbilst servera pašreizējam kalendāra gadam, lietotājam skaidri izcelt brīdinājumu. Atsevišķi saglabāt brīdinājumu, ja apskatāmais gads atšķiras no konfigurētā.

- **Avots:** SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP
- **Tests:** TC-044
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Legacy index.php lines 484-486 only compare viewed year to configured year; user recalls additional behavior, not present in archive.

### REQ-044 — Saglabāt un pierādīt vecās kataloga cenas aktualizācijas uzvedību

Pirms mainīt katalogu, reproducēt esošo precīzo variantu pievienošanas, cenas 0.00 aizstāšanas un citu jau zināmo cenu variantu saglabāšanas loģiku, arī tās robežgadījumus.

- **Avots:** SRC-CHAT-PRICE-YEAR, SRC-LEGACY-ZIP
- **Tests:** TC-045
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** User confirmed intent to preserve refined behavior; specific existing implementation is LEGACY_OBSERVED, not approved flawless algorithm.

### REQ-045 — Samazināt pastāvīgo platformu skaitu

Vēlams, lai viena privāta online platforma nodrošinātu PWA, API, datubāzi un backup krātuvi; GitHub vai cits Git serviss tikai pirmkodam. Platforma jāizvēlas pēc precizitātes, drošības, izmaksu un atjaunošanas testiem.

- **Avots:** SRC-CHAT-HOST-CONSOLIDATION
- **Tests:** TC-046
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Cloudflare candidate only; platform-count objective is confirmed; selection not confirmed.

### REQ-046 — Privātums pilnā sistēmas tvērumā

Lietotne, API, datubāze, backups, projekta pirmkods un izstrādes priekšskatījumi jāsargā ar autentifikāciju, lomām un minimālām pieejas tiesībām; publiskais internets nedrīkst atklāt datus.

- **Avots:** SRC-CHAT-HOST-CONSOLIDATION, SRC-CHAT-INIT
- **Tests:** TC-047
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Privacy does not mean internet hostname is secret; auth and server checks must be enforced.

### REQ-047 — Backup ārpus primārās kļūmju vides

Lai gan viens pakalpojumu sniedzējs ir vēlamais ekspluatācijas modelis, papildus viena konta ietvaros glabātām kopijām jāparedz periodiska pārbaudīta ārpus-konta šifrēta kopija vai līdzvērtīga aizsardzība pret konta zaudējumu.

- **Avots:** SRC-CHAT-HOST-CONSOLIDATION, SRC-CHAT-TIME-TRAVEL
- **Tests:** TC-048
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`
- **Piezīme:** External cold backup can be stored offline by company; need not create continuously active fifth SaaS account.


## v0.1.4 -- hybrid architecture candidate (user has NOT selected a production provider)

### REQ-048 -- Cloudflare PWA/API plus Supabase PostgreSQL/Auth candidate
Evaluate the new hybrid split instead of mandating Cloudflare D1; GitHub remains the private source repository. **Source:** SRC-CHAT-HYBRID-STACK, SRC-CHAT-SUPABASE-LIMITS. **Status:** `PREFERENCE_NOT_FINAL`. **Test:** TC-052.

### REQ-049 -- Encrypted, fully restorable Supabase backup in private R2
Investigate a scheduled complete logical DB export that restores data, ledger/catalogue, roles, Auth identities and dependent configuration; validate separate backup/restoration paths. **Source:** SRC-CHAT-HYBRID-STACK, SRC-CHAT-TIME-TRAVEL. **Status:** `PROPOSED_NEEDS_CONFIRMATION`. **Tests:** TC-053/054.

### REQ-050 -- Seasonal uptime and independent Free-plan operational constraints
Free plan pausing, CI scheduling reliability, Workers compute and R2 billing can prevent successful backup or inventory use. Define visible degraded-state handling and monitoring. **Source:** SRC-CHAT-HYBRID-STACK, SRC-CHAT-SUPABASE-LIMITS. **Status:** `PROPOSED_NEEDS_CONFIRMATION`. **Tests:** TC-055/056.


## v0.1.5 — bezmaksas bez norēķinu abonementa

### REQ-051 — Izvairīties no maksājumu saistībām

Lietotājam Supabase nav iebildumu, bet Cloudflare norēķinu abonements (īpaši R2 aktivizēšanai) nav pieņemama vēlamā izvēle. Izvērtēt Free hostingu un privātu backup ar 0 EUR **maksas riska griestiem** (ne tikai bezmaksas sākuma apjomu); nepieļaut automātiskas piemaksas bez skaidri atsevišķi saskaņota lēmuma. Vienlaikus dokumentēt Free plāna apturēšanas risku, ja kvota izsmelta.

- **Avots:** `SRC-CHAT-NO-BILLING` (precīzs teksts `sources/USER_INPUT_REGISTER.json`).
- **Statuss:** `CONFIRMED_USER_PREFERENCE`.
- **Testi:** `TC-057..058`.
- **Robeža:** neliecina par aizliegumu lietot Cloudflare Pages Free vai citas platformas bez billing; lietotājs nav izvēlējies Netlify.

### REQ-052 — Pārbaudīt Netlify Free + Blobs kā alternatīvu

Izvērtēt Netlify bezmaksas PWA izvietošanu un site-wide privātu, pirms augšupielādes šifrētu backup glabāšanu Netlify Blobs; PostgreSQL un Auth atstāt Supabase, avota pirmkodu GitHub privātā repozitorijā. Pārbaudīt Free 300 kredītu limitu, Blobs Beta statusu, repo piederības ierobežojumus, EU region izvēli, privātumu, atjaunošanu un ārpus-konta rezerves kopijas.

- **Avots:** `SRC-CHAT-NO-BILLING` (lietotāja iebildums) un arhitektūras pētījums `docs/28_NO_BILLING_PLATFORM_OPTION.md` (aģenta piedāvājums).
- **Statuss:** `PROPOSED_NEEDS_CONFIRMATION`.
- **Testi:** `TC-058..060`.


## v0.1.6 — apstiprināta platformu izvēle

### REQ-053 — Netlify + Supabase + GitHub kā izvēlētais izstrādes steks

Lietotni izstrādā kā Netlify izvietotu PWA ar Supabase PostgreSQL/Auth un privātu GitHub repozitoriju pirmkodam, migrācijām un dokumentācijai. Platformu izvēle ir galīga pašreizējā izstrādes plānā; tajā nav iekļauta autorizācija pieslēgt kontus, ievadīt maksājumu datus vai iedarbināt migrāciju.

- **Avots:** SRC-CHAT-STACK-SELECT
- **Lēmums:** DEC-035
- **Testi:** TC-061, TC-062, TC-063, TC-065
- **Statuss:** `CONFIRMED_BY_USER`
- **Piezīme:** Supabase Free un Netlify Free ir iespējami sākuma plāni, ne garantēta produkcijas nepārtrauktība.

### REQ-054 — Rezerves kopiju glabātuves verifikācija izvēlētajā stekā

Izvērtēt privātu, pirms augšupielādes šifrētu datubāzes dump glabāšanu Netlify Blobs, kā arī neatkarīgu ārpus konta kopiju un pilnīgas atjaunošanas testu, pirms šo risinājumu apstiprina faktiskai grāmatvedības uzskaitei. Šī prasība ir **vēl izpētāma**, nevis netieši lietotāja apstiprināts konkrēts backup mehānisms.

- **Avots:** SRC-CHAT-NO-BILLING, SRC-CHAT-STACK-SELECT, SRC-CHAT-TIME-TRAVEL
- **Lēmums:** DEC-036
- **Tests:** TC-064
- **Statuss:** `UNDER_INVESTIGATION`
