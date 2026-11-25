# Versiju, izmaiņu un turpmāko aģentu darba protokols

## Katrai nākamajai iterācijai
Aģents pievieno sesijas ierakstu `docs/18_PROJECT_STATUS.md`, atzīmējot:
- Uzdevuma datums, īss mērķis, apstiprinātie pieņēmumi un lietotāja oriģinālie `SRC-xxx`.
- Skartie `REQ-xxx`, `DEC-xxx`, `TC-xxx`; kodā mainītie faili un migrācijas.
- **Apstiprināti fakti** pret **aģenta priekšlikumiem** un **nezināmo**.
- Izpildītie testi ar faktisko izvadi (PASS/FAIL) un testi, kuri **nav** veikti.
- API/RLS/backup/restore ietekme, datu zuduma un drošības riski.
- Nākamais drošais solis un rollback.

## Versijas politika
- `0.x` izstrādes prototipi; `1.0.0` tikai pēc pilnas regresijas un akcepta.
- Datubāzes shēmas maiņām versētas migrācijas, bez neauditēta mutējoša patch SQL pret produkciju.
- Katram pull request/commita ziņojumam ieteiktais nosaukums: `[REQ-012][DEC-006] Add import preview`.
- Nekad nemainīt veco lēmumu vai komentāru tekstu bez jauna `supersedes` ieraksta.
- Kodā pie sarežģītiem biznesa noteikumiem saite `REQ-015 / DEC-009` un algoritma tests.

## Ieteiktā PR veidne
```text
Mērķis:
Avoti (SRC):
Prasības (REQ):
Apstiprinātie lēmumi (DEC):
Ieviestā uzvedība:
Saderības / finansu ietekme:
Izmainītās datubāzes migrācijas:
Testu scenāriji (TC) un faktiskie rezultāti:
Neizpildītie testi / vēl nezināmais:
Drošības un backup/restore pārbaudes:
Rollback instrukcija:
Nākamās darbības:
```

## Datu saglabāšanas un iztīrīšanas politika
- Veci faili un DB objekti ir tehniskais parāds, bet tos **nedrīkst izdzēst** bez atsauču un migrācijas izpētes, pārbaudītas rezerves kopijas, saderības un piekļuves testiem.
- Produkcijas datu `TRUNCATE/DELETE`, lomu pārveide vai pārrēķina algoritma maiņa ir atsevišķi akceptējamas augsta riska darbības.
- Nav atļauta automātiska klasifikācijas 'nepareizs avots' pielīdzināšana bez pārbaudes.

## Pirmā sesija (2026-11-25)
- Veikts: ZIP failu inventarizācija, `dokumentacija.docx`, galveno PHP/SQL fragmentu statiska pārbaude; izvilkti 8+10 Word komentāri; 2026. gada `import`/`precu_katalogs` rindu statisks agregātu audits.
- Nav darīts: aplikācijas izstrāde; datubāzes migrācijas; dzīvu serveru savienojumi; skenēšanas izmēģinājumi; aprēķinu pilna regresija; RLS; backup/restore; UI dizains.

## Dokumentācijas iterācija v0.1.1 (2026-11-25)
- Avots: `SRC-CHAT-TIME-TRAVEL`; pievienotas `REQ-033..039`, `DEC-015..020`, `TC-034..040`, `Q-018..023`, `WL-018..022`.
- Jauns arhitektūras apraksts: `docs/23_TEMPORAL_HISTORY_AND_RECOVERY.md`; atjaunoti pārņemšanas indeksi un pirmavota reģistrs.
- Mainīta tikai **dokumentācijas kopija** v0.1.1; v0.1.0 atstāts neskarts. Nav izveidota lietotne, DB shēma vai rezerves kopija.
- Testi `TC-034..040`: scenāriji **NOT_RUN**. Pārbaudīti dokumentu savstarpējie ID un ZIP integritāte, nevis produkcijas atjaunošana.


## 2026-11-25 v0.1.4 -- documentation-only iteration
Sources captured: `SRC-CHAT-SUPABASE-LIMITS`, `SRC-CHAT-HYBRID-STACK`. Changes: hybrid architectural evaluation and security/backup readme, REQ/DEC/TC/WL/Q additions. No code, schema, production data, or hosted settings modified. No tests TC-052..056 actually run. Future release must link precise business/backup behavior to the user's source, a DEC ID and an executed test record.


## Dokumentācijas iterācija v0.1.6 — 2026-11-25

- Avots `SRC-CHAT-STACK-SELECT` — lietotājs tieši izvēlējās Netlify + Supabase + GitHub. Izveidots `DEC-035` ar `CONFIRMED_BY_USER`, saglabāta veco `DEC-028/033` kandidātu vēsture.
- Pievienoti `REQ-053/054` un `TC-061..065` (ALL NOT_RUN). Netlify Blobs backup joprojām `PROPOSED/UNDER_INVESTIGATION`, netiek uzskatīts par apstiprinātu produkcijas recovery sistēmu.
- Papildināti start/readme/agents/architecture/hosting/status/source/traceability faili, izveidots `docs/29_SELECTED_STACK_IMPLEMENTATION_GATE.md`.
- Nav veikts kods, migrācija, UI, Netlify izvietošana, GitHub repo izveide, Supabase DB/RLS, billing, CI/backup vai restore. Testēts tikai dokumentācijas sasaistes un ZIP integritātes stāvoklis.
