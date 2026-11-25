# Lietotāja ievades izcelsme / prasību izsekojamība, turpinājums 2026-11-25

Iepriekšējie sākotnējie komentāri un izmaiņu lēmumi atrodas `project-history/sources/USER_CHAT_MESSAGES.md` un `project-history/02_REQUIREMENTS.md`. Šis fails papildina, nevis aizstāj iepriekšējo izcelsmes žurnālu. Formulējums zemāk ir lietotāja citāts (nav aģenta pieņēmums).

| ID | Lietotāja norāde | Lēmums / ieviešana | Statuss |
|---|---|---|---|
| REQ-055 | “Par interfeisu... Lietotāji jau gadiem pieraduši pie manējā desktop interfeisa.” | Saglabāt darba plūsmu un tabulas principu darbvirsmā; izveidot responsive adaptāciju. | Pirmā UX realizācija |
| REQ-056 | “Kā minimums varētu būt 2 nodaļas: datu ievade un katalogs.” | Darbiniekiem divas galvenās sadaļas. | Ieviesuši UI |
| REQ-057 | “Tad adminam būtu arī trešā sadaļa - statistika un ceturtā - administrācija.” | Administratoram četras sadaļas, RLS servera kontrolē. | UI un SQL realizācija; dzīvā lomu pārbaude NAV veikta |
| REQ-058 | “Aplikācijas valoda - latviešu.” | Latvian UI. | Ieviesuši UI |
| REQ-059 | “Papildus izdod atsevišķu dokumentu ar visiem kataloga izveidošanas un preču pievienošanas, rediģēšanas un dzēšanas nosacījumiem.” | `Gramatvedibas_un_kataloga_noteikumu_audits_v0.2.0.docx`, 35 pārskatāmi lēmumi. | Izveidots; grāmatveža akcepts NAV saņemts |
| REQ-060 | “Github būs privātajā repozitorijā” | Personīgā konta privāts repozitorijs; privātie dati atsevišķā ZIP. | Paredzēts; kontā NAV augšupielādēts |
| REQ-061 | “Aiziet! Radi aplikāciju.” | V0.2.0 pirmās versijas PWA / Supabase SQL / Netlify Functions. | Pirmkods izveidots; izvietošana NAV veikta |
| REQ-062 | “Izmanto esošo datubāzi ar tās datiem. VĒlēšos salīdzināt tos.” | Ielasīt tieši sākotnējos 67 819 + 5 980 ierakstus, saglabāt sākotnējās vērtības, kontrolēt katra gada summas. | Lokāli pārbaudīts; Supabase imports NAV veikts |
| REQ-063 | “Svarīgi! Jau pirmajā versijā radi datu drošu arhitektūru.” | Append-only, RLS, audita RPC, idempotence, servera tiesības; privātu datu neievietošana publiskā būvē. | Pirmkodā; pilna drošības atestācija NAV veikta |
| REQ-064 | “Un datu korektumu no grāmatvedības viedokļa.” | NUMERIC un BigInt, saglabāta vēsturiskā matemātika, 2 aritmētikas izņēmumi un 6 grupas ar mērvienību kolīzijām; grāmatveža noteikumu audits. | Lokāla pārbaude sekmīga, grāmatveža lēmums NAV saņemts |

## Dokumentācijas disciplīna

Ja kāda prasība mainās: nekad neizdzēsiet veco ID; pievienojiet jaunu lēmumu ar vecā ID un jaunās prasības sasaisti, testa numuru, pārbaudes pierādījumu un laiku. Jebkurš neizpildīts tests paliek atsevišķi norādīts līdz faktiska rezultāta iegūšanai. Versija 0.2.0 nav produkcijas versija.

## Papildinājums REQ-065..067 — 2026-11-25

| ID | Lietotāja avots | Realizācija | Tests | Statuss |
|---|---|---|---|---|
| REQ-065 | tikai lietotājvārds/parole, bez darbinieku e-pastiem vai apstiprinājumiem | `site/js/api.js`, `site/js/app.js`, `netlify/functions/users.mjs`, otrā SQL migrācija | 12 servera mock testi, live Supabase nav veikts | daļēji, produkcijai NO-GO |
| REQ-066 | izskaidrot izmaiņas Supabase sagatavošanā | `docs/GITHUB_SUPABASE_USERNAME_SETUP.md` | dzīvas vides iestatīšana vēl nav veikta | dokumentēts |
| REQ-067 | sasaistīt Supabase ar personīgo privāto GitHub | `docs/GITHUB_SUPABASE_USERNAME_SETUP.md` | GitHub Integration vēl nav pieslēgta | instrukcija sagatavota |

Oriģinālo lietotāja tekstu skatīt `docs/USER_DECISIONS_2026-11-25.md`. Neapstiprināt teoretizētas API īpašības kā produkcijas faktu.


## BUG-SEC-001 — 2026-11-25 Supabase dzīvais tests

Lietotāja oriģinālā kļūda: `Failed to run sql query: ERROR:  P0001: Security defect: forbidden direct table privilege CONTEXT: PL/pgSQL function inline_code_block line 8 at RAISE`. Sasaistes prasība: **REQ-063** (datu droša arhitektūra). Koda līmenī v0.2.1 grants nebija pietiekami šauri; pievienota trešā migrācija un detalizēts tests. Neizpildīts: live Supabase verifikācija un divu lietotāju RLS tests.


## v0.2.3 — prasības, kas aizstāj iepriekšējās norādes

| Prasība | Izcelsme | Realizācija | Testi un statuss |
|---|---|---|---|
| REQ-068 | Lietotājs: “Labi, pierunāji. Pārejam uz e-pastu sistēmu.”; iepriekšējās username sistēmas lēmuma atcelšana | `site/js/api.js`, `netlify/functions/users.mjs`, migrācija 004. Kontus veido administrators. | TC-072 MOCK; live login/RLS NOT RUN |
| REQ-069 | Lietotājs apstiprina RLS: “Labi, pierunāji.” | Divas lomas un RLS/RPC; RAW nepārrakstāms | TC-073 STATIC; TC-077 NOT RUN |
| REQ-070 | “Izvairies no mārketinga saukļiem un noformējuma. Aplikācija ir funkcionāla.” | `site/styles.css` un `site/js/app.js` minimāls UI | TC-066 PASS (UI). Lietotāja akcepts vēl nav saņemts |
| REQ-071 | “Datu ievade; Preču saraksts; Katalogs; Statistika; Administrācija” | Piecas sadaļas; staff pirmajās trijās, admin visās | TC-066 PASS; TC-067 MOCK |
| REQ-072 | “Pie datu ievadēm, meklētājs atgriež kataloga ierakstus, nevis inventarizācijas ierakstu datus.” | `entryView`, `lookupEntry`, `inventoryView` | TC-068 PASS |
| REQ-073 | “...lielai pogai, kas aizved uz kameru un koda skenēšanu...” | `startScan`, `catalogue_by_barcode`, precīzs lookup, tikai koda aizpilde, ja neatrod | TC-069 MOCK; TC-081 NOT RUN |
| REQ-074 | “Tad, ir kases izvēle un preču daudzums. Daudzums ērti maināms ar + un - vai ievadāms manuāli...” | Kods (var būt tukšs), nosaukums, cena PZ/PL, barcode, kase, daudzums, mērvienība, komentārs | TC-070 PASS, TC-071 MOCK |
| REQ-075 | Iepriekšējie lietotāja drošības/cenu/gada nosacījumi | Grāmatvedības algoritms nav mainīts; cena 0 brīdina, konfigurācijas gads brīdina, RAW nemainīgs | TC-074,075 PASS; accountant NOT RUN |

**Atcelto lēmumu saites:** REQ-068 aizstāj REQ-065; REQ-071 aizstāj REQ-056/REQ-057 sadaļu skaitu; REQ-072 nodala REQ-055 iepriekšējā interfeisa meklētāju no inventarizācijas saraksta. Vecās prasības saglabāt vēsturei. Pilns lietotāja oriģinālteksts: `docs/USER_DECISIONS_2026-11-25.md` un `docs/project-history/sources/USER_CHAT_MESSAGES.md`.
