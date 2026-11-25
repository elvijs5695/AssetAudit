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
