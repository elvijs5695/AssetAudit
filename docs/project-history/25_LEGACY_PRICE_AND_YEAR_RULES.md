# Vecās aplikācijas katalogs, cenas `0.00`, tukšs kods un gadu brīdinājumi

**Datums:** 2026-11-25; **Statuss:** pirmkoda statiska revīzija + SQL agregātu audits. **Nav izpildīta PHP produkcijā.** Lietotāja avots `SRC-CHAT-PRICE-YEAR` un `SRC-LEGACY-ZIP`. Svarīgi jaunajam aģentam: nelabot "nekonsekvences" pēc intuīcijas pirms testiem.

## Novērotie biznesa dati (SQL eksportā no `backup/26-11-21_13-06-34.sql`)
| Kopums | Visi | Ar tukšu `kods` | Ar PL = `0.00` | Ar PZ = `0.00` |
|---|---:|---:|---:|---:|
| `preces` (vēsturiskās inventarizācijas ievades) | 67 819 | 11 208 | 0 | 0 |
| `precu_katalogs` | 5 980 | 1 081 | 1 160 | 0 |
| `import` (starpstāvoklis) | 6 084 | 1 102 | 1 256 | 0 |

2026. gada importā visu PL=`0.00` 1 256 importa rindu avota `gads` ir 2026. Katalogā visas 1 160 PL=`0.00` rindas ir ar `gads=2026`. Tas **sader** ar lietotāja precizējumu: pavadzīmē plaukta cena nav zināma, bet importēšanas konveijers iestata nulli kā nezināmās vērtības marķieri. Tas NENOZĪMĒ, ka prece ir bezmaksas.

## `index.php` kataloga papildināšanas patiesā uzvedība

### Jauna inventarizācijas ieraksta ievadē — `index.php` rindas 78–113
- Inventarizācijas `preces` rindu ieliek vienmēr (atbilstoši ievades maršrutam).
- Kataloga pārbaudi veic **tikai, ja** slēptais lauks `updateDatabase == 1`.
- `values.php` ar JavaScript `onkeyup` iestata `updateDatabase=1`, kad lietotājs maina `kods`, `nosaukums`, `price_1` vai `price_2`.
- Pārbauda precīzu `(kods, nosaukums, cena, cena_p)` kombināciju katalogā.
- **Ja identisks variants nav atrasts**, pievieno jaunu rindu katalogā. Tad **ja ievadītā plaukta cena nav 0**, dzēš veco kataloga rindu ar identisku kodu, nosaukumu un PZ cenu, bet PL cenu `0.00`.
- **Ja identisks variants jau ir**, neievieto jaunu un neizpilda iepriekšminēto nulles placeholder tīrīšanu. Tas ir īpašs robežgadījums.

### Esoša inventarizācijas ieraksta labošana — `index.php` rindas 117–152
- Kataloga precīzo tuple pārbaudi veic neatkarīgi no `updateDatabase`.
- Ja nav precīza varianta, ieliek katalogā jaunu variantu un, ja PL nav 0, izdzēš tam atbilstošā PZ nulles placeholder rindu.
- Pašu `preces` rindu labo ar `UPDATE` un **neglabā pilnu vēsturi**; tā NAV jaunās append-only arhitektūras piemērs.
- Viena un tā paša koda/nosaukuma/PZ cenas **vecās zināmās nenulles plaukta cenas netiek izdzēstas**. Tādējādi vecā sistēma nesaglabā vienu automātisku "pēdējās cenas" vērtību.
- `$catId` vērtība tiek nolasīta, bet šajā PHP fragmentā **netiek izmantota, lai UPDATE katalogu pēc ID**.

### Gada sākuma kataloga imports — `db2temp.php`, `cat2temp.php`, `importExcel.php`, `createCatalogue.php`
- `db2temp.php` kopē iepriekšējā gada unikālās `(kods, nosaukums, pz_cena, pl_cena)` kombinācijas pagaidu importā.
- `importExcel.php` jauno pavadzīmju rindām skaidri piešķir `cena_p = 0.00` un cieti kodē `gads = 2026`.
- `cat2temp.php` pārnes tagadējo katalogu uz importa kandidātiem, tādēļ katalogu var papildināt gada gaitā.
- `createCatalogue.php` attīra importa rindas ar PZ cenu `0`, iztukšo `precu_katalogs` un grupē `(kods,nosaukums,cena)`, atlasot nekonsekventi definētus `cena_p/gads` laukus bez agregēšanas. `MAX(id)` negarantē pēdējās cenas izvēli.

### 37 konfliktu grupas nav pierādījums pareizam "vecā cena uzvar" noteikumam
- 37 grupām ir vienāds `(kods,nosaukums,PZ cena)` un dažādas PL cenas.
- Gala tabula visās 37 grupās saglabāja 2025. gada PL variantu; 29 konfliktos bija arī 2026. gada avots.
- Gala PL izvēle nevienā no 37 nesakrita ar grupas `import` rindas ar lielāko `id` PL vērtību.
- Tas var skaidrot ilgstošu zināmu PL cenu saglabāšanos, bet SQL `GROUP BY` forma nav deterministiska; **nedrīkst piedēvēt droši apstiprinātu prioritātes algoritmu**.

## Preces identifikators var būt tukšs
`kods=''` nav kļūda: 11 208 `preces` rindas un 1 081 gala kataloga rinda ir ar tukšu kodu. Identitātes algoritms bez koda vai svītrkoda nedrīkst vienkārši apvienot līdzīgi nosauktas dažādas preces. `NULL` un tukšas virknes apstrāde jaunajā datu modelī atsevišķi specifikējama.

## `0.00` cenu validācija jaunajā lietotnē
**Lietotāja apstiprinātais noteikums:** precei parasti cena nav 0.00, tomēr šādu datu ievadi nevar aizliegt — jābrīdina.
- `NULL` (vai ekvivalents `unknown` stāvoklis) pavadzīmju importa PL cenai — NEZINĀMA vērtība; nav lietotāja kļūda un nav jātraucē ar 0 cenas brīdinājumu.
- Aktīvi ievadīta `0.00` PZ vai PL cena — nepārprotams, aizverams brīdinājums; ja lietotājs apstiprina, ieraksts saglabājas ar 0.00, skaidru izcelsmi, un šo vērtību nevar klusām iztulkot par "nav zināms".
- Līdz brīdim, kad grāmatvedības politika definē PZ/PL cenu ietekmi uz bilanci, neapgalvot, ka 0 cenas uzvedība aprēķinos ir pilnībā validēta.

## Gada brīdinājums — atmiņa pret atrasto pirmkodu
`includes/parameters.php` nolasa `maintenance.year` uz `$confYear`.
`index.php` r. 484–486 esošais sarkanais brīdinājums:
```php
if ($year != $confYear) {
  echo '<p class="warningRed">Tiek skatīts iepriekšējo gadu preču katalogs. Nepievienot jaunus ierakstus!<p>';
}
```
**Pārbaudītais fakts:** tas salīdzina lietotāja skatīto gadu `$year` ar konfigurēto `$confYear`, **nevis** `$confYear` ar `date('Y')`. `index.php` citur `date('Y')` lieto tikai gada atlasītāja diapazona noteikšanai. Meklējot visā arhīva PHP/JS/CSS, netika atrasta cita faktiskā konfigurācijas pret kalendāra gadu brīdinājuma pārbaude. Lietotājs atceras šādu funkciju; iespējams, produkcijas versija atšķiras no iesūtītā arhīva. **Atzīmēt kā plaisu, neapstrīdēt atmiņu kā nepatiesu.**

Jaunajā aplikācijā ir **divi** neatkarīgi brīdinājumi:
1. `configuredInventoryYear != currentCalendarYear` — izcelt gadu neatbilstību un tās risku, prioritāri pirms jaunas ievades. Salīdzināšanai izmantot noteikto vietējo laika zonu `Europe/Riga`, ne nekontrolētu klienta ierīces datumu.
2. `viewedYear != configuredInventoryYear` — lietotājs skatās neaktīvu gadu; tajā nedrīkst klusām ierakstīt aktīvās inventarizācijas preces. Nedrīkst izmantot vienu brīdinājumu kā otru.

## Regresijas gadījumi pirms pārstrādes
1. Katalogā eksistē `(A,B,10.00,0.00)`; ievadot `(A,B,10.00,12.00)` ar `updateDatabase=1`, vecais kods ieliek jaunu un dzēš 0 variantu.
2. Katalogā eksistē `(A,B,10.00,12.00)`; ievadot `(A,B,10.00,15.00)`, vecais kods pievieno 15 variantu, bet saglabā 12 variantu.
3. Katalogā eksistē gan 0 variants, gan identisks 12 variants; ievadot vēlreiz 12, vecais kods 0 variantu **nedzēš**, jo pārbaude nonāk `mysqli_num_rows()>0` ceļā.
4. Ja ievades formā `updateDatabase=0`, katalogs nav skarts, pat ja tāds variants neeksistē; tas ir tehnisks robežgadījums, ne obligāti vēlamā uzvedība jaunajā sistēmā.
5. Tukšs `kods`, dažādi nosaukumi/cenas: ieraksti saglabājas atsevišķi.
6. Cenas `0.00` manuālā ievadē: jauna UI brīdina, bet pēc apstiprinājuma saglabā.
7. Konfigurācijas gads 2025, pašreizējais 2026 un skats 2025: vecais konkrētais brīdinājums netiek iedarbināts; jaunais konfigurācijas-kalendāra brīdinājums iedarbojas.

**Neizdarīt pāragru secinājumu:** novērotais vecais nulles placeholder dzēšanas algoritms ir darbības fakts. Jaunajam append-only katalogam tas jāmodelē ar notikumiem, nevis fizisku `DELETE`. Biznesa lēmums par to, kuri cenu varianti jāattēlo atlasē, joprojām ir atvērts.
