> **NOVECojis v0.2.1 norādījumu arhīvs.** Lietotājs ir mainījis autentifikācijas lēmumu: v0.2.3 izmanto Supabase Auth **e-pastu/paroli**. Šo dokumentu neizmantot jaunu kontu veidošanai. Aktuālā instrukcija: [`EMAIL_AUTH_AND_DEPLOY_V023.md`](EMAIL_AUTH_AND_DEPLOY_V023.md). Paturēts tikai lēmumu vēstures izsekojamībai.

# Supabase + GitHub savienojums un lietotājvārdi — v0.2.1

## Lēmums
Darbinieki pieslēdzas TIKAI ar administratora piešķirtu lietotājvārdu un paroli. Netiek prasīta e-pasta adrese, nav reģistrēšanās vai ielūguma saites. Supabase Auth aizkulisēs glabā tehnisku aliasu formā `lietotajvards@accounts.inventory.invalid`, ko administrators izveido no servera. Šis rezervētais domēns ir jāpārbauda īstā Supabase testa projektā; bez tā nav atļauta produkcijas ieviešana. Paroles glabā Supabase Auth, nevis `user_profiles`.

## Droša Supabase konfigurācija
1. Izveidot **tukšu testa projektu**. Ieslēgt Supabase kontam MFA.
2. Dashboard -> Authentication -> Sign In / Providers -> Email: **Email provider ENABLED**, **Confirm Email DISABLED** (ārēja e-pasta apstiprināšana nav paredzēta).
3. Authentication -> Settings / General: **Allow new users to sign up OFF**, **Allow anonymous sign-ins OFF**; nedefinēt GitHub OAuth kā darbinieku autentifikācijas metodi.
4. `Authentication > Users` izmantošanai pirmajam adminam: izmēģināt tehnisko aliasu `admin@accounts.inventory.invalid` ar nejaušu 12+ rakstzīmju paroli; neveidot reāla darbinieka lietotāju, kamēr nav pierādīta rezervētā domēna pieņemšana Supabase Auth.
5. Nepievienot oriģinālās MySQL paroles. Neizpaust `service_role`/`sb_secret_` klienta kodā, netlify būvē vai GitHub.

## Supabase sasaistīšana ar privāto GitHub repozitoriju
1. Vispirms izveidot privātu personīgo GitHub repozitoriju ar aplikācijas pirmkodu, saglabāt `supabase/migrations/*.sql` (bez reāliem datiem, parolēm un `legacy_import.sql`).
2. Supabase Dashboard -> **Project Settings -> Integrations -> GitHub Integration -> Authorize GitHub**.
3. GitHub atļaujai izvēlēties TIKAI šo repozitoriju, nevis visas krātuves.
4. Atgriezties Supabase, izvēlēties repo, ievadīt **Working directory `.`**, jo repozitorija saknē ir mape `supabase/`.
5. Sākumā **Automatic branching OFF** un **Deploy to production OFF**; nospiest **Enable integration**.
6. Tas sasaista koda versijas. Tas neimportē MySQL datus un nedod GitHub lietotājiem piekļuvi inventarizācijas ierakstiem.
7. Migrācijas jāizpilda **vienu reizi**; neizpildīt vienus un tos pašus SQL caur Dashboard SQL Editor un pēc tam automātiskajām GitHub migrācijām. Ja bāze jau sagatavota manuāli, vispirms jāsaskaņo migrāciju vēsture.
8. Ieslēgt production automātisko migrāciju piemērošanu tikai pēc testiem ar tukšu projektu un neatkarīga atjaunošanas mehānisma pārbaudes. Šis solis izstrādes kandidātā NAV apstiprināts.
9. Supabase GitHub integrācija **nav GitHub OAuth Sign in** darbiniekiem. Lietotāju pierakstīšanās notiek ar username/password.

## Bāzes migrācijas
`supabase/migrations/202611250001_base.sql` un `202611250002_username_accounts.sql` jāpiemēro šādā secībā tukšajam testa projektam. Pirms automatizācijas jāpārbauda transakciju drošība un RLS.

## Pirmais administrators
Kad migrācijas izpildītas un Supabase Auth alias pieņemts: `Authentication -> Users -> Add user -> Create new user` (bez ielūguma), izveidot tehnisko `admin@accounts.inventory.invalid` kontu ar savu paroli. Ar SQL Editor pārbaudīt, ka Auth UID sakrīt ar kontu un vienreiz ievadīt profilu:

```sql
INSERT INTO public.user_profiles(id,username,display_name,role,active)
VALUES ('<REALS-AUTH-UUID>'::uuid,'admin','Administrators','admin',true);
```

Nepublicēt UID, paroli vai atslēgas sarakstē. Pēc tam pārējie lietotāji jāveido administratora saskarnē.

## Produkcijas bloķējošie testi
- Supabase Auth pieņem `.invalid` tehnisko e-pastu, saglabā paroli, neveido ielūgumu, nosūta ZERO e-pastus.
- `admin_register_profile` veido tikai admin, lietotājvārdi ir unikāli neatkarīgi no burtu reģistra.
- Neautorizēts/staff nevar ne izveidot kontu, ne nomainīt citu paroli, ne lasīt bilanci.
- Admin paroles maiņa un lietotāja deaktivēšana tiek pārbaudīta ar DIVIEM reāliem kontiem.
- Finanšu aprēķinu regresija, backup/restore un reversijas pārbaudes.
- Jaunu `sb_publishable_` / `sb_secret_` API atslēgu savietojamība ar Netlify Functions vēl nav apstiprināta; `v0.2.1` vecā JWT atslēgu API ir atsevišķi jāpārbauda.
