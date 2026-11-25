# AGENTS — inventarizācijas aplikācija

## Vissvarīgākais

Šī ir uzņēmuma grāmatvediski jutīga inventarizācijas sistēma. **Datubāzes ierakstu saglabāšana, vecās loģikas nemainīšana bez pierādījumiem un lietotāja prasību izsekojamība ir svarīgāki par jaunu UI vai funkciju pievienošanu.** Nekad neveikt destruktīvu oriģinālo SQL/MySQL datu migrāciju.

## Apstiprinātie lēmumi

- SARMANORDE uzņēmuma inventarizācijas programma; interfeisa valoda **latviešu**.
- Privāts personīgā konta GitHub repozitorijs, **Netlify PWA**, **Supabase PostgreSQL/Auth**.
- Visām lomām: **Datu ievade, Katalogs**. Tikai adminam: **Statistika, Administrācija**.
- Desktop lietošanas ieradumi jāsaglabā; mobilajā jābūt responsive.
- Sākotnējais imports ir RAW pierādījums; jaunajām izmaiņām **append-only** notikumi.
- Tukšs preces kods ir atļauts. Manuāla 0,00 cena ir atļauta **ar brīdinājumu**. Pavadzīmes plaukta cena ir **nezināma**, nevis 0,00.
- Gada neatbilstībai vajadzīgs izteikts brīdinājums; rakstīšana atļauta tikai aktīvajā gadā.
- Online-only; automātiskā offline sinhronizācija nav apstiprināta.
- Neievietot maksājumu karti / nepieņemt automātiskas izmaksas bez lietotāja saskaņojuma.

## Jauns aģents: darba secība

1. Izlasi `README.md` un `docs/IMPLEMENTATION_STATUS.md`. Neaizstāj iepriekšējo aģentu novērojumus ar nepārbaudītiem pieņēmumiem.
2. Izlasi `docs/catalogue_accounting_rules.md` un `docs/Gramatvedibas_un_kataloga_noteikumu_audits_v0.2.0.docx`. **JĀLEMJ** nav apstiprināta specifikācija.
3. Iepazīsties ar `docs/project-history/02_REQUIREMENTS.md`, `/04_DECISIONS.md`, `/sources/USER_CHAT_MESSAGES.md` un ar jaunāko `docs/REQUIREMENT_TRACE_2026-11-25.md`.
4. Pirms koda labojumiem izveido testa plānu; saglabā sākotnējo aprēķinu salīdzinājumu; aizliegta slepena matemātikas maiņa.
5. Izpildi vietējos testus. Produkcijas tests neeksistē, kamēr nav veikta reāla Supabase migrācija, divu kontu RLS testēšana, atjaunošana no backup un grāmatveža apstiprinājums.
6. Ja maini prasību: papildini prasību ID, datumu, precīzo lietotāja formulējumu, motivāciju, pirms/pēc uzvedību, izpildītos/neizpildītos testus. Neizdzēs vecās piezīmes, tikai norādi, kurš lēmums tās aizstāj.

## Stingrie datu noteikumi

- `private-data/` nekad neiekļaut repozitorijā vai Netlify `dist/`; **nekad neizrakstīt konfidenciālos ierakstus kļūdu žurnālos**.
- Veco PHP kodu un konfigurācijas ar iespējamām parolēm nekomitēt.
- Naudas aritmētika tikai PostgreSQL NUMERIC, vai klientā fiksētā mēroga BigInt. **Neizmantot JS Number finanšu summēšanai**.
- `legacy_import.sql` drīkst importēt tikai JAUNĀ, TUKŠĀ TESTA Supabase projektā. Migrācija un imports vienmēr transakcionāli un ar kontrolsummām.
- Supabase anon key var būt pārlūkā; service_role paliek tikai Netlify Functions slepenajā vidē.
- RLS / RPC privilēģiju un 2 lietotāju testi ir obligāts izvietošanas priekšnosacījums; tikai statiska pārbaude nav pietiekama.
- Notikumu ievade ir idempotenta (`request_id`) un optimistiskās konkurences kontrolēta (`expected_event`); nekad neapiet šīs aizsardzības.

## Infrastruktūra un pašreizējā situācija

Izveidota front-end PWA, tests ar reālajiem datiem lokālā read-only priekšskatījumā un sākotnējā PostgreSQL migrācija. Nav pieslēgts īsts Supabase projekts; nav veikti ārējie divu lietotāju testi, nav backup restore. Skatīt `docs/IMPLEMENTATION_STATUS.md`.

## Aizliegtā saīsināšana

Nenovietot īstos datus `site/`, `dist/`, GitHub failu vēsturē vai testu fixtures. Nerādīt admin statistiku staff caur UI/API. Nepievienot automātisku kataloga gada pārveidi, kamēr `KAT-06, 07, 12, 15` nav grāmatvediski apstiprināti.

## 2026-11-25: lietotājvārdu autentifikācija

Pēdējais lietotāja lēmums: **nekādu darbinieku e-pastu**. Administrators piešķir unikālu lietotājvārdu un paroli; Supabase Auth alias ir tikai iekšēja implementācijas detaļa. Lietotāji nevar reģistrēties paši. Galvenā instrukcija `docs/GITHUB_SUPABASE_USERNAME_SETUP.md`; Supabase GitHub **Integration** ir tikai migrāciju versiju kontrole, nevis GitHub OAuth. Pre-production jātestē `.invalid` alias pieņemšana, reāls staff/admin RLS, paroles maiņas, atslēgšana, Supabase atslēgu saderība. Līdz tam nav apstiprināta produkcija.


## BUG-SEC-001 (2026-11-25)
Tests `tests/security_checks.sql` Supabase vidē ziņoja par neatļautu tiešo tabulas privilēģiju. Koda auditā atrasta anon SELECT neatsaukšana profilu/konfigurācijas tabulām; v0.2.2 pievieno **tikai papildinošu** migrāciju `202611250003_privilege_hardening.sql`. NEPĀRRAKSTĪT jau izpildītās migrācijas vēsturi un NEKAD neizpildīt pirmās divas migrācijas atkārtoti. Palaiž read-only `tests/diagnose_table_privileges.sql`, tad trešo migrāciju, tad `tests/security_checks.sql`. Reāls PASS vēl NAV ziņots; produktīva izvietošana NO-GO.


## OBLIGĀTS atjauninājums v0.2.3 (2026-11-25): aizstāj veco sadaļu skaitu un username auth

**Šis ir jaunākais lēmums, tas ir prioritārs pār iepriekšējiem AGENTS punktiem.**

- Lietotājs noteica **5 sadaļas**: Datu ievade, Preču saraksts, Katalogs; adminam papildus Statistika, Administrācija. Darbiniekiem 3 sadaļas.
- **Datu ievades** meklētājs ir katalogam, nevis inventarizācijas ierakstiem. Preču saraksts atsevišķi tikai jau ievadītajām precēm. Klikšķis uz kataloga varianta aizpilda ievades preces laukus. Liela skenera poga, precīzs barcode meklējums, nezināma koda gadījumā aizpildīts tikai svītrkods. Daudzums +/−/manuāli.
- **Dizains** minimāls, bez mārketinga paskaidrojumiem, latviešu valodā.
- **Autentifikācijas iepriekšējais lēmums (`username@...invalid`) IR ATCELTS.** Lietotājs izvēlējās Supabase Auth **e-pastu + paroli**; kontus veido administrators, reģistrēšanās pašiem aizliegta. `docs/GITHUB_SUPABASE_USERNAME_SETUP.md` ir tikai arhīvs.
- Migrācijas 001–003 jau ir piemērotas lietotāja Supabase TEST vidē; `security_checks.sql` atgrieza `Success. No rows returned`. **NEKAD neatkārtot tās.** v0.2.3 datubāzes izmaiņas tikai `202611250004_email_auth.sql`. Tā vēl NAV īsti izpildīta.
- Lietotāja Netlify izvietojums ir **Live**, bet tajā nav pārbaudīta Auth/DB datu rakstīšana. Neuzskatīt par produkcijas apstiprinājumu.
- Dzīvais 2 lietotāju RLS, secret/publishable atslēgu saderība, Android kamera, backup+restore un grāmatvedības noteikumu apstiprinājums **NAV** pārbaudīti. **PRODUKCIJAI NO-GO**.
- Aktuālie dokumenti `docs/EMAIL_AUTH_AND_DEPLOY_V023.md`, `docs/UI_FLOW_V023.md`, `docs/V023_TEST_MATRIX.md`, `docs/REQUIREMENT_TRACE_2026-11-25.md`. Ar katru jaunu lietotāja lēmumu saglabāt oriģinālo tekstu un prasību/testu ID; vecos lēmumus neaiztikt.
