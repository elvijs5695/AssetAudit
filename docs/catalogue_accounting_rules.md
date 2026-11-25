# Kataloga un inventarizācijas noteikumi — audits v0.2.0

> Šis ir grāmatvedes apstiprināšanai paredzēts projekts, nevis apstiprināta metodoloģija.

## A. Gada kataloga sagatavošana

### KAT-01 — Gada identitāte
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Konfigurācijā norādīts viens aktīvais inventarizācijas gads. Ja skatītais vai kalendāra gads atšķiras no konfigurētā, rādāms pamanāms brīdinājums; rakstīšanu neatbilstošajā skatā bloķē serveris.
**Audita jautājums / jaunā uzvedība:** Saskaņot kā jaunās sistēmas obligātu kontroli.
**Pamatojums:** index.php: gada izvēle, warningRed; app_config / inventory_submit
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-02 — Pārnešana no iepriekšējā gada
**Statuss:** NOVĒROTS
**Esošā uzvedība / prasība:** Iepriekšējā gada inventarizācijas unikālās kombinācijas (kods, nosaukums, PZ cena, PL cena) veido nākamā gada kataloga sākotnējos kandidātus.
**Audita jautājums / jaunā uzvedība:** Apstiprināt, vai pārnesamas tieši šīs četras pazīmes; daudzumi netiek pārnesti.
**Pamatojums:** db2temp.php; dokumentacija.docx
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-03 — Gada kataloga izveide nav vienreizēja
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Pēc gada sākuma katalogam var atkārtoti pievienot jaunas pavadzīmes, neaizvietojot jau apstiprinātu vēsturi.
**Audita jautājums / jaunā uzvedība:** Jaunā sistēma lieto staging, priekšskatījumu un transakcionālu apstiprināšanu.
**Pamatojums:** cat2temp.php; importExcel.php; lietotāja komentāri
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-04 — Pavadzīmes informācijas robežas
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Pavadzīmes ievade sniedz kodu, nosaukumu un PZ cenu; plaukta cena tajā nav zināma. Vecais imports PL laukā ievada 0,00.
**Audita jautājums / jaunā uzvedība:** Jaunajā katalogā šo nezināmo PL cenu reprezentēt kā NULL, nesajaucot ar lietotāja ievadītu 0,00.
**Pamatojums:** importExcel.php; lietotāja 2026-11-25 precizējums
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-05 — Nulles pavadzīmes cena importa posmā
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecais createCatalogue.php izdzēš importa rindas, kur PZ cena ir 0,00, pirms kataloga izveides.
**Audita jautājums / jaunā uzvedība:** Lēmums: vai jaunajā importā šādas rindas noraidīt, karantinēt vai atļaut ar brīdinājumu?
**Pamatojums:** createCatalogue.php
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-06 — Dublikātu identificēšana gada katalogā
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecā noslēdzošā atlase grupē pēc (kods, nosaukums, PZ cena), nevis PL cenas; tā var apvienot dažādu PL cenu variantus.
**Audita jautājums / jaunā uzvedība:** Pirms jaunā algoritma apstiprināt precīzu vēlamo identitātes atslēgu un PL cenas izvēles prioritāti.
**Pamatojums:** createCatalogue.php; 37 konfliktu grupas SQL eksportā
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-07 — Nenoteiktā PL prioritāte
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecajā GROUP BY atlases rezultātā negrupētā PL cena nav deterministiski izvēlēta. MAX(id) negarantē pārējo lauku atbilstību šim ID.
**Audita jautājums / jaunā uzvedība:** Nevienu automātisku “pēdējā cena uzvar” algoritmu neaktivizēt, pirms grāmatvedis to apstiprinājis.
**Pamatojums:** createCatalogue.php; docs/07_LEGACY_CATALOGUE_AUDIT.md
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-08 — Kataloga izveides priekšskatījums
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Vecais process iztukšo visu precu_katalogs un veido no jauna.
**Audita jautājums / jaunā uzvedība:** Jaunajā versijā pirms apstiprināšanas rādīt jaunas, saglabātas, aizstājamas un konflikta rindas; neizpildīt destruktīvu TRUNCATE.
**Pamatojums:** createCatalogue.php; lietotāja komentāri
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-09 — Kataloga versiju saglabāšana
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Kataloga papildināšana, labošana un slēpšana tiek uzskaitīta ar jaunām versijām. Neizdzēst iepriekšējās zināmās vērtības.
**Audita jautājums / jaunā uzvedība:** Apstiprināt append-only modeli.
**Pamatojums:** Jaunās sistēmas prasība; catalogue_events
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

## B. Preču identitāte un kataloga uzturēšana

### KAT-10 — Preces kods nav obligāts
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Vecajā datubāzē 11 208 inventarizācijas rindas un 1 081 kataloga rinda ir bez preces koda.
**Audita jautājums / jaunā uzvedība:** Tukšu preces kodu pieļaut; neveikt automātisku dažādu preču apvienošanu tikai tādēļ, ka kods ir tukšs.
**Pamatojums:** SQL eksports; lietotāja precizējums
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-11 — Precīza kataloga varianta identitāte
**Statuss:** NOVĒROTS
**Esošā uzvedība / prasība:** Ievadot vai labojot preci, vecā aplikācija meklē precīzu (kods, nosaukums, PZ cena, PL cena) variantu.
**Audita jautājums / jaunā uzvedība:** Ja precīzs variants jau pastāv, neveidot otru. Jālemj, vai atsevišķs svītrkods maina identitāti.
**Pamatojums:** index.php, pievienošana un labošana
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-12 — Jauna varianta pievienošana no inventarizācijas
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecais kods jaunam inventarizācijas ierakstam katalogu papildina tikai, ja updateDatabase=1; labojumam pārbaudi veic vienmēr.
**Audita jautājums / jaunā uzvedība:** Jaunajā versijā pēc katras ievades vienā servera transakcijā pārbaudīt katalogu un vajadzības gadījumā pievienot variantu. Tā ir APZINĀTA uzvedības atšķirība.
**Pamatojums:** index.php, values.php; inventory_submit
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-13 — Nezināmās plaukta cenas aizstāšana
**Statuss:** NOVĒROTS
**Esošā uzvedība / prasība:** Ja vecajā katalogā ir (kods, nosaukums, PZ, PL=0) un tiek ievadīts jauns variants ar zināmu nenulles PL, vecais kods pievieno jaunu un dzēš nulles variantu.
**Audita jautājums / jaunā uzvedība:** Jaunajā katalogā PL=NULL placeholder loģiski paslēpt ar notikumu, bet atstāt vēsturē.
**Pamatojums:** index.php: INSERT + DELETE no precu_katalogs
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-14 — Vecās zināmās cenas saglabāšana
**Statuss:** NOVĒROTS
**Esošā uzvedība / prasība:** Ja identiskam kodam/nosaukumam/PZ jau ir PL=12,00, ievadot PL=15,00, vecais kods saglabā abus variantus.
**Audita jautājums / jaunā uzvedība:** Neieviest piespiedu vienas pēdējās PL cenas pārrakstīšanu bez saskaņojuma.
**Pamatojums:** index.php, novērotā darbība
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-15 — Svarīgs placeholder robežgadījums
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Ja precīzs variants jau ir katalogā, vecais kods neiztīra atsevišķo PL=0 placeholder, jo tīrīšana notiek tikai jauna varianta pievienošanas atzarā.
**Audita jautājums / jaunā uzvedība:** Vai jaunajā sistēmā vienmēr iztīrīt atbilstošu NULL placeholder, pat ja precīzais variants jau pastāv?
**Pamatojums:** index.php; docs/25_LEGACY_PRICE_AND_YEAR_RULES.md
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-16 — Lietotāja manuāla 0,00 cena
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Precei parasti nav 0,00 EUR cenas; lietotājs tomēr drīkst ievadīt 0,00.
**Audita jautājums / jaunā uzvedība:** Jābrīdina pirms saglabāšanas; nedrīkst aizliegt un nedrīkst pārinterpretēt kā “nav zināma”.
**Pamatojums:** Lietotāja 2026-11-25 precizējums
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-17 — Svītrkoda izcelsme
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Skenējot pazīstamu kodu, sistēma atrod atbilstošo kataloga variantu; nezināmu var piesaistīt jaunai ievadītai precei.
**Audita jautājums / jaunā uzvedība:** Svītrkods nepasaka cenu; vairākām katalogā esošām cenu pozīcijām var būt viens svītrkods.
**Pamatojums:** Lietotāja sākotnējās prasības; catalogue_events
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-18 — Datu korekcijas katalogā
**Statuss:** NOVĒROTS
**Esošā uzvedība / prasība:** Esošas inventarizācijas rindas labošana vecajā kodā var pievienot jaunu katalogam precīzu cenu variantu; labojums neatjaunina iepriekšējo varianta ID.
**Audita jautājums / jaunā uzvedība:** Atšķirt kataloga varianta papildināšanu no inventarizācijas RAW korekcijas; saglabāt abas notikumu vēstures.
**Pamatojums:** index.php; inventory_submit / catalogue_events
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-19 — Kataloga paslēpšana vai dzēšana
**Statuss:** JAUNS PRIEKŠLIKUMS
**Esošā uzvedība / prasība:** Pašreizējā sistēma dažkārt izdzēš kataloga variantus, bet jaunos datos dzēst nedrīkst.
**Audita jautājums / jaunā uzvedība:** Administratora “Noņemt no kataloga” izpilda versiju ar statusu hide, nevis fizisku DELETE.
**Pamatojums:** index.php; katalogs; append-only princips
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### KAT-20 — Kataloga manuāla rediģēšana
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Administrators drīkst labot preces nosaukumu, kodu, cenas un svītrkodu.
**Audita jautājums / jaunā uzvedība:** Labojums veido jaunu kataloga versiju; vēsturiskās inventarizācijas cenas netiek pārrakstītas.
**Pamatojums:** Lietotāja prasības; catalogue_change
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

## C. Inventarizācijas ievade, labošana, dzēšana un bilance

### INV-01 — Inventarizācijas atsevišķās ievades
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Viena prece var būt ievadīta vairākas reizes. Vecajā atskaitē tās grupē pēc koda, nosaukuma, abām cenām un kases.
**Audita jautājums / jaunā uzvedība:** Saglabāt katru individuālo ievadi un attēlot grupas kopsummu; detaļās atvērt katru ievadi.
**Pamatojums:** output.php; lietotāja komentāri
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-02 — Mērvienība nav vecā grupējuma atslēgā
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecā sistēma kopā grupē vienādu kodu/nosaukumu/cenas/kases rindas pat, ja atšķiras mērvienība. Atrastas 6 šādas grupas.
**Audita jautājums / jaunā uzvedība:** Grāmatvedim izlemt, vai jaunajā grupējumā iekļaut mērvienību; līdz lēmumam veco rezultātu saglabāt salīdzināšanai.
**Pamatojums:** output.php; neatkarīgais 2026-11-25 audits
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-03 — Finanšu rindas aprēķins
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecajā sistēmā PZ/PL summas tiek iegūtas kā round(daudzums × cena, 2) pie ievades un labošanas.
**Audita jautājums / jaunā uzvedība:** Jaunajiem ierakstiem serverī lietot precīzu NUMERIC un skaidri apstiprinātu 2 decimāļu noapaļošanu.
**Pamatojums:** index.php; SQL numerical types
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-04 — Vēsturisko summu saglabāšana
**Statuss:** APSTIPRINĀTS KĀ IMPORTA DROŠĪBA
**Esošā uzvedība / prasība:** Migrācija saglabā tieši SQL eksportā esošo summu, nevis automātiski pārrēķina katru rindu.
**Audita jautājums / jaunā uzvedība:** Vienlaikus aprēķina neatbilstību ziņojumu; neaizstāt vecās summas bez atsevišķa grāmatveža akta.
**Pamatojums:** reconciliation_verified.json; migration SQL
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-05 — Divi aritmētikas izņēmumi
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** ID 514 (2018) PZ summa 0,68 pret reizinājuma 0,75; ID 20375 (2019) 2,07 pret reizinājuma 2,06.
**Audita jautājums / jaunā uzvedība:** Grāmatvedim pārbaudīt vēsturisko dokumentu un noteikt, vai veidot atsevišķu kompensējošu korekciju.
**Pamatojums:** tests/verify_historical.py
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-06 — Labojumu vēsture
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Vecajā aplikācijā UPDATE pārrakstīja rindu, un pilnu agrāko versiju vēsturi atgūt nevar.
**Audita jautājums / jaunā uzvedība:** Jaunā labošana pievieno jaunu revīziju; aktīvajā summā skaita tikai pēdējo revīziju.
**Pamatojums:** index.php; inventory_events
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-07 — Dzēšana un anulēšana
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Vecajā aplikācijā DELETE fiziski izdzēsa inventarizācijas ierakstu.
**Audita jautājums / jaunā uzvedība:** Jaunajā sistēmā anulēšana ir īpašs notikums (void); vēsturiskā rinda un tās autorība saglabājas, bet aktīvajā bilancē vairs nepiedalās.
**Pamatojums:** index.php; inventory_submit
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-08 — Ievades anulēšanas ietekme uz katalogu
**Statuss:** NOVĒROTS
**Esošā uzvedība / prasība:** Vecajā kodā dzēšot inventarizācijas rindu, katalogs automātiski netika labots.
**Audita jautājums / jaunā uzvedība:** Jaunā sistēmā void neizdzēš kataloga pozīciju. Jāapstiprina, vai nepieciešams papildu brīdinājums.
**Pamatojums:** index.php delete atzars
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-09 — Datu validācija
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Kods var būt tukšs, bet nosaukums, daudzums un cenas jāpārbauda serverī; datu veidi un precizitāte nekad nav jāuztic tikai pārlūkam.
**Audita jautājums / jaunā uzvedība:** Saskaņot mērvienības, negatīvu daudzumu, 0 daudzuma un cenu robežgadījumus.
**Pamatojums:** Lietotāja prasības; inventory_submit
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-10 — Bilances definīcija
**Statuss:** JĀLEMJ
**Esošā uzvedība / prasība:** Vecajā sistēmā starpība = SUM(PL summas) − SUM(PZ summas), katrā gadā summējot glabātās rindu summas.
**Audita jautājums / jaunā uzvedība:** Grāmatvedim apstiprināt nosaukumu “bilance” un vai šī formula atbilst oficiālajam uzskaites rādītājam.
**Pamatojums:** index.php / output.php; docs/11_FINANCIAL_RULES.md
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-11 — Lietotāju piekļuves
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Lietotāji redz preču cenas un var ievadīt/labot preces, bet kopsavilkuma bilance un vēsturisko izmaiņu audits ir tikai administratoram.
**Audita jautājums / jaunā uzvedība:** Nodrošināt tiesības serverī; neatspoguļot bilanci staff RPC.
**Pamatojums:** Lietotāja prasības; admin_stats
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-12 — Vēsturiskās bilances brīdis
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** Administratoram jāvar apskatīt, ko sistēma zināja konkrētā laikā. Pirms migrācijas pilna notikumu vēsture nav pieejama.
**Audita jautājums / jaunā uzvedība:** Atšķirt vēsturisko apskati no fiziskas rezerves kopijas vai stāvokļa atgriešanas.
**Pamatojums:** Lietotāja prasības; admin_stats(p_asof)
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-13 — Rēķinu/krājumu cenu izcelsme
**Statuss:** APSTIPRINĀTS LIETOTĀJA
**Esošā uzvedība / prasība:** PZ cena rodas pavadzīmē; PL cena kļūst zināma inventarizācijas laikā.
**Audita jautājums / jaunā uzvedība:** Katalogam saglabāt importēto cenu avotu, laiku un katru atsevišķu variantu; nezināma PL nav 0.00.
**Pamatojums:** Lietotāja 2026-11-25 skaidrojums
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-14 — Vēsturiskie laiki un darbību autori
**Statuss:** APSTIPRINĀTS KĀ IMPORTA DROŠĪBA
**Esošā uzvedība / prasība:** Vecais eksports satur ierobežotu izveides/labošanas laiku un lietotāju laukus; iepriekš pārrakstītas vērtības nav rekonstruējamas.
**Audita jautājums / jaunā uzvedība:** Migrācijas notikumu laiku nošķirt no sākotnējā ieraksta laika. Jauno darbību laiks tikai no servera.
**Pamatojums:** legacy_import.sql; inventory_events
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________

### INV-15 — Importa salīdzināšanas kontroles
**Statuss:** APSTIPRINĀTS KĀ IMPORTA DROŠĪBA
**Esošā uzvedība / prasība:** Importējamajiem 2018–2025 datiem jāsakrīt rindām, grupām, daudzumiem un glabātajām PZ/PL summām par katru gadu.
**Audita jautājums / jaunā uzvedība:** Ja kāda kontrole neiziet, importu atcelt vienā transakcijā; neatļaut automātiski izlīdzināt starpības.
**Pamatojums:** tests/verify_historical.py; legacy_import.sql
**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt
**Korekcija:** ________________________
