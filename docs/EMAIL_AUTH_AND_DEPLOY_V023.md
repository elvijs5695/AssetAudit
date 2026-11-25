# v0.2.3 — Supabase e-pasta autentifikācija / Netlify izvietošana

**Secība ir testa videi.** Nemainiet darba MySQL; esošo 001–003 migrāciju atkārtota izpilde ir aizliegta.

## 1. Kas mainījās

- **Lietotāji** pieslēdzas ar **e-pastu un paroli**, ko piešķir administrators. Nav publiskas reģistrēšanās un nav e-pasta apstiprināšanas plūsmas darbiniekiem. Tas aizstāj v0.2.1–0.2.2 lietotājvārdu / `.invalid` tehnisko aliasu; vecais alias netiek izmantots.
- `public.user_profiles` lietotāja loma ir `staff` vai `admin`. Supabase Auth pārvalda paroles un sesijas. Reālie datu pieprasījumi izmanto lietotāja JWT + RLS un tiesības pārbaudošas SQL funkcijas.
- GitHub savienojums ar Supabase ir tikai **SQL migrāciju versiju kontrole**, ne darbinieku GitHub OAuth.

## 2. Supabase autentifikācijas iestatījumi

Supabase testprojekts → **Authentication**. Pārbaudīt: e-pasta paroles providers ieslēgts; publiska reģistrēšanās (**Allow new users to sign up**) izslēgta; anonīmie lietotāji izslēgti. E-pasta apstiprināšana, ja administrators izveido lietotājus, tiek veikta Auth Admin API ar `email_confirm: true`. Neradīt publisku e-pasta konta izveidošanas endpoint. Iespējams, platforma nākotnē mainīs konfigurācijas nosaukumus — nepārrakstiet drošības prasību pēc UI terminoloģijas.

## 3. Jauna SQL migrācija

Supabase → **SQL Editor** tajā pašā **testa** projektā, kur jau piemērotas 001–003 migrācijas. Izpildīt vienreiz:

`supabase/migrations/202611250004_email_auth.sql`

Tā: (1) pievieno `email_address` un unikālu e-pasta indeksu, (2) pievieno administratora izsaucamu auditējamu `admin_register_email_profile`, (3) liedz autentificētām lomām izsaukt veco `admin_register_profile`, (4) izveido **precīzas** svītrkoda atbilstības RPC `catalogue_by_barcode` un indeksu. Nav `DROP TABLE`, `DELETE` vai vēsturisko rindu labojumu.

Pēc sekmīgas migrācijas var izpildīt tikai lasāmo `tests/v023_postmigration_checks.sql` (strukturāla pārbaude, nevis 2 lietotāju RLS tests).

Ja migrācija neizpildās, **nepalaist atkārtoti**. Saglabāt kļūdas tekstu un diagnosticēt, pirms veikt jebkādas datubāzes darbības. SQL Editor izpildīšana automātiski nereģistrē migrāciju Supabase CLI migrāciju vēsturē; pirms GitHub automātiskām DB migrācijām vēsture jāsaskaņo. Automātiskā produkcijas migrācija paliek izslēgta.

## 4. Sākotnējais administrators (tikai pēc 004 migrācijas PASS)

1. Supabase → **Authentication → Users → Add user**. Izveidot pirmo administratoru ar īstu, kontrolētu e-pasta adresi un unikālu stipru paroli; atzīmēt e-pastu kā apstiprinātu (bez ielūguma plūsmas). Nekad neiekopēt paroli šajā čatā vai GitHub.
2. **SQL Editor**, testa vidē, piešķirt admin profilu jau esošajam Auth lietotājam; to dara tikai projekta uzticams operators. Vispirms droši noteikt šī Auth lietotāja UUID. Pārbaudīt, ka profils saistās ar pareizo `auth.users.id`, nevis e-pasta tekstu. Lietotāja `display_name` ir cilvēka vārds, loma `admin`, `active=true`.
3. **Pirmā admina profils ir izņēmuma bootstrap operācija**: tā nav publiski pieejama API funkcija. Profilu veidot transakcijā un nekad nepiešķirt admin tiesības no klienta.
4. Pārbaudīt ar testa `staff` kontu, ka nav piekļuves `admin_stats`, `admin_set_year`, `admin_register_email_profile`, `admin_save_profile`, ka RAW tabulas nav pārrakstāmas un nav publicēti `service_role`/`sb_secret`.

**Piezīme:** precīzs bootstrap SQL apzināti nav automātiski palaists, jo UUID un autentifikācijas testa vide nav zināma. Administratora piešķiršana nenotiek ar pārlūka pašreģistrāciju.

## 5. Netlify vides mainīgie

`SUPABASE_URL` — Supabase projekta URL, HTTPS. Pieejams **Builds un Functions**, jo gan klienta būve, gan servera administrēšana to izmanto.

`SUPABASE_PUBLISHABLE_KEY` — ieteicamā jaunā publiskā `sb_publishable_...` atslēga; v0.2.3 būves skripts atbalsta arī `SUPABASE_ANON_KEY` (vecais JWT tipa publiskais tokens). Publiskā atslēga nepieciešama **Builds un Functions** kontekstā; to **drīkst** iekļaut `dist/config.js`. Nedrīkst iekļaut slepeno atslēgu.

`SUPABASE_SECRET_KEY` — `sb_secret_...` (tikai Netlify Functions, **NE Build**, ne `dist`, ne publiskā frontend kodā); arī vecais `SUPABASE_SERVICE_ROLE_KEY` ir tikai serverim. Netlify konfigurācijā noslēpuma pieejamības jomai norādīt tikai **Functions**. Nekad neiekopēt slepeno atslēgu čatā, GitHub vai URL.

`SUPABASE_SECRET_KEY` ir platformas atslēga, ne lietotāja sesijas JWT. Dzīvais Supabase Auth Admin API saderības tests ir obligāts; nepietiek ar mocked request testu.

## 6. Īpaši svarīgas drošības pārbaudes

- **2 reāli konti**: `staff`/`admin` pozitīvie un negatīvie RPC/RLS testi, ar to atšķirīgajiem JWT.
- Neautorizēts pieprasījums uz Netlify `/.netlify/functions/users` tiek noraidīts. Pieteikts `staff` nevar veidot lietotājus un nolasīt admin datus. `admin` nevar tieši pārrakstīt RAW tabulas.
- `inventory_submit` idempotence ar vienu `request_id`, arī pēc tīkla kļūdas; konkurējošs `expected_event` neveido nekontrolētus ierakstus.
- Netlify/Publish bundlē nav `service_role`, `sb_secret`, SQL/JSON inventarizācijas kopiju, vēsturisko ekrānattēlu vai datu testu failu.
- Izvēle pārlūkā no lokāla JSON nav tas pats, kas droši importēta Supabase datubāze.
- Testēt reālu backup un pilnu atjaunošanu. Grāmatvedības metodiku apstiprina pirms **produkcijas** uzskaites.

## 7. Brīdinājumi

- Lietotāju e-pasti un paroles nav glabājami kā parasta `public` paroles tabula.
- Vecās migrācijas 001–003 **neatkārtot**, jo lietotājs jau apstiprināja to izpildi un `security_checks.sql` sekmes Supabase testa projektā.
- Darba datorā izpildīt datu importu tikai pēc RLS un finansu atbilstības pārbaudēm. Neapstiprināto kataloga cenu konfliktu automātisko algoritmu neieslēgt.
- Netlify `Live` apliecina statiskās aplikācijas izvietošanu, ne autentifikācijas vai DB drošības iziešanu.
