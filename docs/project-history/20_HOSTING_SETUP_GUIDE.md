**IEVĒRĪBAI (v0.1.6):** šis ceļvedis ir **vēsturisks** un vēl apraksta Cloudflare izvietošanu. Izvēlētais hostings ir **Netlify**; izmantot `docs/29_SELECTED_STACK_IMPLEMENTATION_GATE.md` kā aktuālo pārņemšanas un uzstādīšanas kontroles sarakstu. Neveikt vēsturisko 3. nodaļu par Cloudflare Pages.

# Supabase + privāts GitHub + Cloudflare Pages — cilvēkam soli pa solim

**Šī ir sagatavošanas instrukcija, nevis apliecinājums, ka kāda darbība izdarīta.** Atsevišķos soļus izpilda tikai pēc lietotāja apstiprinājuma. Pakalpojumu UI var mainīties.

## 0. Pirms darba
- Rezervē atsevišķu projektu/organizāciju; iepriekš pārliecinies, kurš uzņēmumā būs galvenais īpašnieks.
- **Nekad** neielīmē AI čatā vai GitHub pilnu SQL dump ar lietotājiem un parolēm, DB URI, `.env`, service-role key.
- Vispirms izmanto tikai anonimizētus testa datus.

## 1. GitHub
1. GitHub → **New repository** → izvēlies jaunu, skaidru nosaukumu.
2. `Visibility = Private`, izveido repo.
3. Iekopē šīs pakotnes `AGENTS.md`, `docs`, `tools` un `README_DOCUMENTATION.md` (ja jau ir AGENTS, sapludini).
4. Uzstādi 2FA kontam, pārbaudi komandas dalībniekus un tiesības.
5. Iespējo PR review / branch protection, kad ir paredzēts reāls darbs ar kodu.
6. Neko no `inventarizacija.zip`, `backup/*.sql`, `includes/config.php` nekommito.

## 2. Supabase (testa vide)
1. Izveido atsevišķu Supabase projektu **development** un pieraksti projekta ID tikai privātās konfigurācijas vietā.
2. Izvēlies reģionu, datubāzes versiju, organizācijas billing un konta MFA.
3. Pēc kodā aprakstītu un pārbaudītu migrāciju izveido shēmu, nevis manuāli publiski veido tabulas ar neierobežotām tiesībām.
4. Ieslēdz RLS, definē roles `admin`, `staff`; precīzās politikas vispirms pārbaudi ar diviem testa kontiem.
5. Frontendā tikai anon/public atslēga ar atbilstošu RLS; `service_role` ir privāts, ārpus klienta.
6. Definē migrāciju/backup glabāšanas politiku, pirms tur ievieto reālus datus.
7. Nepublicē vai neimportē vecās sistēmas reālus kontus un paroles (jāveido jauna Auth identitāte).

## 3. Cloudflare Pages (ja izvēlas šo hostingu)
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git.
2. Savieno GitHub un piešķir pieeju **tikai izvēlētajam privātajam repozitorijam**, nevis visiem konta repo, ja UI to atļauj.
3. Iestati production branch, build command un output directory pēc faktiski izvēlētā frontend framework.
4. Pievieno tikai publiskos Supabase URL/anon konfigurācijas mainīgos; privātās datubāzes paroles klienta buildā nav pieļaujamas.
5. Pārbaudi, ka publiski pieejamajā PWA URL bez autentifikācijas nav iespējams nolasīt preces vai bilanci.
6. Veic izmaiņu pārbaudi preview vidē, pirms publicē `main` versiju.

## 4. Rezerves kopijas — obligāts solis pirms produkcijas
1. Izvēlies atsevišķu privātu failu krātuvi un ilgtermiņa retences politiku.
2. Izvēlies drošu uzdevuma izpildītāju, kas periodiski izveido šifrētu `pg_dump` (ne pārlūks).
3. Glabā piekļuves datus secrets vault/CI secrets, ne failos un ne aplikācijas klientā.
4. Izveido neveiksmju brīdinājumus un periodisku testētu **atjaunošanu**.
5. Dokumentē soli pa solim, kā atjaunot sistēmu, ja Supabase projekts ir apturēts vai piekļuve zaudēta.

## 5. Kad būsim gatavi pieņemt produkcijas lēmumu
Saskaņojam Supabase plānu (Free tikai izmēģinājumiem vs Pro sezonālai produkcijai), hosting provider, atļautās IP/piekļuves opcijas, domēnu, rezerves kopiju RPO/RTO, juridisko atbildību par datu glabāšanu un piekļuvi.

## Oficiālā dokumentācija (pārskatīt pirms reālās uzstādīšanas)
- https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/database/postgres/row-level-security
