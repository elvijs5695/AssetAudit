# Grāmatvediskās uzskaites noteikumi — pārbaudāma specifikācija

## Ko pašreizējais PHP kods dara (LEGACY_OBSERVED)
- Inventarizācijas RAW `preces` satur `daudzums`, `vienibas`, `pz_cena` (pavadzīmes), `pl_cena` (plaukta), `pz_summa`, `pl_summa`, `kase`, `gads` un identifikācijas laukus.
- `index.php`: `pz_summa = round(daudzums × pz_cena, 2)`, `pl_summa = round(daudzums × pl_cena, 2)` pie saglabāšanas/labošanas.
- `output.php` grupē pēc `(kods, nosaukums, pz_cena, pl_cena, kase)` vienā gadā un summē `daudzums`, `pz_summa`, `pl_summa`.
- `index.php` bilance = `SUM(pl_summa) - SUM(pz_summa)` konkrētajam gadam/filtram. Tas nav skaidri dokumentēts kā oficiālais grāmatvedības jēdziens — jāapstiprina.
- `preces.daudzums` ir `FLOAT`, finansiālās summas/cenas `DOUBLE`, bet katalogā cenas `DECIMAL(7,2)`. Datu tipi ir nevienādi.
- Grupējums **neiekļauj** `vienibas`; līdz ar to atšķirīgu vienību ieraksti teorētiski var tikt summēti vienā grupā. Jāpārbauda reālie dati un grāmatvedības metodoloģija.

## Mērķa uzvedības piedāvājums (PROPOSED_NEEDS_CONFIRMATION)
1. Glabāt daudzumus un cenas tikai precīzos `NUMERIC` laukos ar apstiprinātu mērogu.
2. Naudas rindu summas noapaļot uz apstiprinātu mazāko valūtas vienību ar **vienu** definētu noapaļošanas metodi serverī.
3. Saglabāt katru individuālo pievienojumu; pārskats summē tikai katra loģiskā ieraksta **pēdējo spēkā esošo** stāvokli.
4. Atskaites vienmēr precīzi norāda gada ID, datu versiju, filtru, metodi un ievades notikumu robežu.
5. Finanšu eksporta kopijas hash un pavadīšanas metadati ļauj vēlreiz pārbaudīt identisku rezultātu pēc gadiem.

## Skaidrs piemērs
- Ieraksts A: 3 gab. × pavadzīmes cena 1,25 EUR = 3,75 EUR.
- Ieraksts B: 4 gab. × 1,25 EUR = 5,00 EUR.
- Ja identitāte un pārējie grupēšanas lauki sakrīt, grupa rāda 7 gab. un 8,75 EUR.
- Ja A tiek labots uz 2 gab., aktuālā summa ir `2×1,25+4×1,25 = 7,50 EUR`, nevis A sākotnējā un jaunā summa kopā.
- Ja B tiek anulēts, aktuāli ir 2 gab. un 2,50 EUR. Vēsturiskajā pārskatā joprojām redzama visa notikumu secība.

## Testi, kas jāveido pirms migrācijas
- Naudas noapaļošana uz `x.xx5` robežām, `0.005`, `1.005`, daudzums 0.25 un cenas ar 2/4 cipariem.
- Ar identisku preces kodu/nosaukumu, bet dažādām cenām, vienībām vai `kase` vērtībām.
- Vairāki pievienojumi, labojumi, anulēšana, atjaunošana (ja atļauta).
- Gada pārskatu rindu/grupu skaits un PZ/PL summas pret arhīva eksportu.
- Reproducējams rezultāts ar neatkarīgi sagatavotu testa datu kopu; faktiskās atšķirības dokumentē ar cilvēka apstiprinājumu.

## Nav vēl apstiprināts
Noapaļošanas metode (`HALF_UP`, `HALF_EVEN` vai cita), cenas precizitāte (2 vai 4+ decimāldaļas), atļauti negatīvi daudzumi, nulle/NULL cena, PVN uzskaite, vienību konversijas, starpības definīcija un grupēšanas atslēga.

## v0.1.2 — PL cenas NULL semantika
Importa PL 0.00 ir vēsturiska nezināmas cenas marķējums, bet lietotāja tieši ievadīts 0.00 ir atļauta anomāla ievade ar brīdinājumu. Bilancē trūkstošu cenu **nedrīkst automātiski padarīt par 0.00** bez apstiprināta noteikuma; administratoram jāredz trūkstošās cenas izcelsme un novērtēšanas nosacījums. Naudas aritmētikai SQLite variantā nepieciešams mērogots integer vai cita pierādāmi precīza reprezentācija; PostgreSQL NUMERIC izmantojams citā platformas variantā.
