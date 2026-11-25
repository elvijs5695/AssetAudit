# Izvietošanas secība: GitHub (personīgais privātais), Supabase, Netlify

## 0. Pirms darba

Neveiciet darbības produkcijas inventarizācijas vietā. Izmantojiet testa Supabase projektu, kurā nav citu datu. Turiet konfidenciālo datu ZIP lokāli, aizsargātu. Pēc instalēšanas **nedrīkst atzīmēt produkcijas statusu kā izpildītu**, kamēr nav veikts `SECURITY_AND_PRODUCTION_GATE.md`.

## 1. GitHub

1. Izveidojiet `Private` repozitoriju savā **personīgajā** GitHub kontā.
2. Augšupielādējiet **tikai** lietotnes koda ZIP saturu, nevis atsevišķo datu ZIP vai oriģinālo `inventarizacija.zip`.
3. Pārliecinieties, ka nav `private-data`, `dist`, `.env`, `legacy_snapshot.json`, `legacy_import.sql`, `service_role` atslēgas, lietotāju paroles vai uzņēmuma datu ekrānattēlu.
4. Ieslēdziet 2FA, minimālas repozitorija piekļuves, aizsargājiet galveno zaru.

## 2. Supabase (testa projekts)

1. Reģistrējiet Supabase kontu, ieslēdziet 2FA, izveidojiet jaunu projektu ar datu reģionu, kas atbilst uzņēmuma prasībām (izvērtēt EEZ pieejamību un apstrādes noteikumus).
2. **Pirms pirmās pieslēgšanās** Auth iestatījumos izslēdziet publisku e-pasta reģistrāciju; lietotājus aicinās tikai administrators.
3. Izpildiet `supabase/migrations/202611250001_base.sql` jaunajā projektā pēc strukturālas pārbaudes. Pašlaik šo migrāciju vēl NAV iespējams apstiprināt kā izpildītu reālā Supabase vidē.
4. Pārbaudiet `tests/security_checks.sql` kā DB administrators un autorizācijas matricas testus ar diviem kontiem.
5. Atsevišķā drošā datorā ar PostgreSQL **`psql`** ielasiet `legacy_import.sql` tikai pēc veiksmīga shēmas testa; 29 MB fails **nav paredzēts** ielīmēšanai pārlūka SQL redaktorā. Nekad neielieciet to Netlify izvietošanas direktorijā.
6. Salīdziniet `docs/ACCOUNTING_COMPARISON.md` summas, rindu skaitu un grupas. Neatbilstību gadījumā importu uzskatīt par neveiksmīgu.
7. Supabase Authentication izveidojiet pirmo ADMIN lietotāju (testa e-pasts). Pēc Auth UID iegūšanas **tikai projekta uzticamais SQL administrators** var sākotnēji ievietot profilu, piemēram:

   ```sql
   -- Pārbaudīt UID; nekad nekopēt reālus noslēpumus dokumentos!
   INSERT INTO public.user_profiles(id,display_name,role,active)
   VALUES ('<AUTH_UUID>'::uuid,'Pirmais administrators','admin',true);
   ```

   Nākamos lietotājus uzaicināt no aplikācijas administrācijas, kad pārbaudīta Netlify funkcija.
8. **Neieslēdziet automātisku katalogu importu**, kamēr nav saskaņots grāmatvediskais audits.

## 3. Netlify

1. Veidojiet Free projektu, importējot **privāto personīgo** GitHub repozitoriju. Netlify pakalpojumu nosacījumus un bezmaksas kvotas pārbaudiet iestatīšanas brīdī.
2. Build command: `node scripts/build_site.mjs`, Publish directory: `dist`, Functions directory: `netlify/functions`.
3. Set environment variables (`Project configuration > Environment variables`):
   - `SUPABASE_URL`: publiskais projekta `https://...supabase.co` URL;
   - `SUPABASE_ANON_KEY`: **anon/publishable** atslēga (publiska);
   - `SUPABASE_SERVICE_ROLE_KEY`: **slepenā servera** atslēga, tikai Netlify Functions servera darbībām. Neatļaut to klienta būvē, pārlūka kodā vai GitHub.
4. Izvietojiet testa domēnā. Pārbaudiet HTTPS, HTTP drošības galvenes, `content-security-policy`, nav publiskas reģistrēšanās, admin/staff piekļuves atšķirību.
5. Izveidojiet vienu staff lietotāju caur admin uzaicinājumu un pārbaudiet piekļuvi abām lomām.

**Netlify Blobs backup vēl nav ieviests.** Neuzskatīt to par atjaunojamu kopiju, kamēr nav uzrakstīts un sekmīgi palaists eksports un restore. Šī ir produkcijas BLOĶĒJOŠA prasība.

## 4. Ko nedrīkst darīt

- Nedrīkst publicēt datu ZIP / `.sql` / `.json` uzņēmuma inventarizācijas ierakstus Netlify vietnē vai GitHub (arī privātajā GitHub nesaglabāt bez īpašas uzņēmuma datu politikas).
- Nedrīkst ievadīt vecās PHP/MySQL datubāzes paroles Supabase/Auth.
- Nedrīkst izmantot projekta sākotnējo SQL pret esošo darba datubāzi; migrācija paredzēta JAUNAM projektam.
- Nedrīkst pieņemt, ka RLS darbojas, kamēr nav veikti reāli 2-kontu negatīvie testi.
