# Realizācijas stāvoklis — v0.2.0, 2026-11-25

## Faktiski izpildīts

- Reālo MySQL SQL datu parsēšana tikai lasīšanai, precīzs vēstures imports atsevišķā privātā SQL/JSON komplektā.
- `67 819` inventarizācijas rindas, `5 980` kataloga rindas, 2018–2025 vēsturisko summu un grupu neatkarīga pārbaude.
- Desktop 1440 px un mobile 390 px testēta darbvirsmas/mobilā UI ar reālo vēsturisko JSON datu lokālo nolasīšanu. Datu skatīšana neizraisa rakstīšanu. Testā paziņojuma vai JavaScript kļūdu nebija.
- Divas atšķirīgas lietotāju navigācijas lomas (pārlūka UI + SQL/servera RBAC stratēģija).
- Indeksēta datubāzes struktūra, Supabase RPC ar NUMERIC/append-only/RLS plānu, idempotence un konkurences kontrole pirmkodā.
- Netlify admin uzaicinājumu/pārvaldības funkcija ar JWT un servera admin pārbaudi — palaisti 5 mock testi.
- Neatkarīgi naudas formatēšanas un Europe/Riga vēsturiskā laika pārrēķina testi.
- Grāmatvedības 35 noteikumu audita DOCX, attēlots 14 lapās un pārbaudīts vizuāli.
- Visu veco versiju prasību dokumentācija saglabāta `docs/project-history`; šīs iterācijas user input `docs/REQUIREMENT_TRACE_2026-11-25.md`.

## Kas nav izpildīts / nevar tikt apgalvots

- Nav veikta **reāla** Supabase PostgreSQL migrācija vai pilns 29MB SQL imports attālinātā projektā; nav testēta shēmas sintakse uz Supabase PostgreSQL servera.
- Nav veikti divu reālu, dažādu lomu lietotāju servera RLS un konkurences testi.
- Nav Netlify produkcijas izvietojuma vai lietotāja Github repozitorija izveides (piekļuves šiem kontiem netika piešķirtas).
- Pavadzīmju daudzreizēja importa un gada kataloga sagatavošanas UI/back-end vēl nav, jo cenu konflikta algoritms ir grāmatveža audita jautājums.
- Rezerves kopiju automātiska izveide, glabāšana un pilns restore vēl nav ieviests/testēts.
- Android kameras skenēšana visos modeļos nav pārbaudīta; kameras skenēšana šobrīd izmanto pārlūka BarcodeDetector, ja atbalstīts, citādi manuālu ievadi. ZXing/ML Kit fallback vēl nav iegults.
- Neviens lietotājs nav ielūgts, neviens uzņēmuma dati nav augšupielādēti ārējos mākoņos.

## Apzināti ierobežojumi

- Lokālais reālo datu pārskats: **tikai lasāms**. Tam var apskatīt Statistiku bez autorizācijas, jo pats administrators lokāli izvēlas failu; failu nedrīkst publicēt.
- Vēsturiskie SQL dati glabā vecās pašu tabulu summas (nevis pārrēķinātās). Vecie labojumi/izdzēstās versijas neatgūstamas; jauna auditēšana sākas ar migrācijas brīdi.
- Preces identitātes, cenu konfliktu un mērvienību prioritātes pirms grāmatvedības apstiprināšanas nav galīgi fiksētas; “vecā uzvedība” atdalīta no “jaunāka prasība”.
- Katalogs auto papildinās inventarizācijas servera darbībās. **Šis ir no vecās noklusējuma uzvedības atšķirīgs lēmums (`KAT-12`)**, jāsaskaņo pirms reālas rakstīšanas ieslēgšanas uzņēmumā.

## Nākamā drošā secība

1. Lietotājs lokāli apskata reālos datus un UX, saglabā piezīmes/komentārus ar versiju.
2. Kopā ar grāmatvedi izskatīt katru `KAT/INV` noteikumu un šīs versijas izņēmumu sarakstu.
3. Jaunā tukšā TESTA Supabase vidē pārbaudīt SQL, pilno importu, RLS un atjaunošanu no backup, ar testa datu kopiju, nevis darba datubāzi.
4. Pēc lietotāja kontu pieslēgšanas iziet divu lomu negatīvos testus; neatļaut produkcijas darbu, kamēr nav PASS.
5. Saskaņot pavadzīmju importa algoritmu un tikai tad pievienot gada cikla UI.


## v0.2.1 — username/password

Pievienota lietotājvārda/paroles saskarne, admin konta izveide (nevis e-pasta ielūgums), paroles maiņa un lietotājvārdu unikālā atslēga SQL. Nav vēl īsta Supabase integrācijas testa, `.invalid` domēna pārbaudes, abu kontu drošības testa, Netlify izvietošanas vai backup restore. Produkcijai NO-GO.
