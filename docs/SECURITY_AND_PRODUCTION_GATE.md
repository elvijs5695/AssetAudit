# Drošības arhitektūra un obligātā produkcijas pieņemšana

## Realizēts pirmkodā

- Supabase Auth tehnikas aliasa/paroles pieslēgšanās, lietotājs ievada tikai username/paroli; lietotāju profili (`staff`, `admin`, `active`). Publiskā pieteikšanās jāizslēdz Supabase dashboard.
- PostgreSQL: RLS visām jutīgām tabulām; tiešās `anon`/`authenticated` tiesības uz neapstrādātiem notikumiem atņemtas; darbības caur `SECURITY DEFINER` RPC ar `auth.uid()` un aktīva lietotāja pārbaudi.
- `legacy_*_raw`, `inventory_events`, `catalogue_events`, `administration_events` ir UPDATE/DELETE bloķējoši trigeri.
- Inventarizācijas `inventory_submit`: `request_id` vienreizēja identitāte, lietotāja/payload sakritība, ieraksta versijas konkurences aizsardzība un gada transakcijas bloķēšana; servera NUMERIC aprēķins; katalogs vienas transakcijas ietvaros.
- Administratora `admin_stats` un audita RPC pārbauda admin lomu serverī. Parasta lietotāja tabulas/saraksta datiem var būt redzamas cenas (zināms biznesa kompromiss).
- Netlify serverless user management ar Supabase Auth JWT pārbaudi un atsevišķu admin statusa nolasīšanu; `service_role` tikai servera vidē.
- Netlify CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options. Nav trešo pušu CDN koda.
- Privātais imports nav iekļauts Netlify `dist`; fails pieejams tikai drošā lokālajā failu izvēlē un ir read-only.

## Kritiskas piezīmes

- **Nekas no iepriekšējā punkta nav reālas Supabase drošības atestācija.** Šajā darbā nebija pieslēgtas Supabase projekta atslēgas, tādēļ shēma un RLS vēl nav izpildīti reālā vidē.
- Arī triggeru aizsardzība nedarbojas pret DB īpašnieka/superlietotāja apzinātu manipulāciju. Nepieciešamas neatkarīgas kopijas, tiesību atdalīšana un darbības žurnāli.
- Nesaņemtas/atkārtotas HTTP atbildes jātestē ar reālu 2 lietotāju paralēlu ievadi; lokālie unit testi pārbauda tikai definēto servera funkcijas autentifikācijas loģiku.
- `legacy_snapshot.json` ir personas/uzņēmuma konfidenciāli dati. Neizvēlēties to nedrošā publiskā domēnā.
- **Nav ieviesta automātiska rezerves kopija vai pilns restore**; bez tā produkcijas darbība nav pieļaujama.
- 2026 gada katalogs satur NULL placeholder preces, bet 0,00 manuāli ievadītajai cenai nav jāatšķiras no 0 pēc cenas vērtības vien; atšķirība glabājas datu modeļa laukā. Pārbaudīt pie grāmatveža.

## Obligātie testi pirms ekspluatācijas

| Tests | Šobrīd | Pieņemšanas kritērijs |
|---|---|---|
| Migrācijas SQL palaišana tukšā Supabase testa projektā | NAV IZPILDĪTS | 0 SQL kļūdu; shēma korekta |
| Pilns `legacy_import.sql` imports | NAV IZPILDĪTS | transaction COMMIT tikai ar visām summām un rindām |
| `tests/security_checks.sql` | NAV IZPILDĪTS | visas role/tabula/funkcija pārbaudes PASS |
| Staff lasa savas funkcijas, bet ne admin stats/auditu | NAV IZPILDĪTS | servera 403/42501, arī tiešam HTTP |
| Anon bez JWT | NAV IZPILDĪTS | neviena jutīga rinda nav nolasāma vai rakstāma |
| Staff mēģina mainīt profilu, gadu, katalogu | NAV IZPILDĪTS | atteikts serverī |
| Deaktivēts/atsaukts lietotājs | NAV IZPILDĪTS | visi RPC atsakās, arī ar derīgu JWT |
| Divi vienlaicīgi labojumi vienai rindai | NAV IZPILDĪTS | viens COMMIT, otrs konflikts; bez pazaudētām izmaiņām |
| Divreiz iesūtīts `request_id` | NAV IZPILDĪTS | tieši viena biznesa ievade; neatbilstošs payload atteikts |
| Admin/lietotājs maina aktīvo gadu ievades laikā | NAV IZPILDĪTS | nekādu ierakstu nepareizā gadā |
| Cenas 0, tukšs kods, mērvienību konflikti | DAĻĒJI | serveris nepieļauj klusu datu zudumu; paziņo lietotājam |
| Pilna rezerves kopijas eksportēšana un atjaunošana | NAV IZPILDĪTS | atgriežas DB, Auth, vēsture, konfigurācija, pareizas summas |
| Grāmatveža 35 noteikumu izskatīšana | NAV IZPILDĪTS | dokumentētas izvēles un aktīvs testu scenārijs |

**Secinājums:** jaunā arhitektūra prioritizē datu drošību, bet produkcijai šī ir **NO-GO** versija līdz visu obligāto kritēriju izpildei.

## Papildinājumi v0.2.1

- GitHub integrācija: `Working directory .`, production automātiskās migrācijas ir **izslēgtas** līdz 2 kontu RLS/restore testiem.
- Kontu izveide caur `auth.admin.createUser` semantiku (Auth Admin API) ar tehnisko `.invalid` aliasu, `email_confirm: true`, nevis ielūgumu.
- Produkcijas bloks: reālā Supabase `.invalid` e-pasta identifikatora pieņemšana, legālo API atslēgu saderība, Auth/DB daļēju kļūdu atjaunošana un paroļu maiņas audits.
- Jāpārbauda, ka Supabase `Authentication > Allow new users to sign up` ir OFF un `Confirm email` OFF, vienlaikus Email provider ir ON.
