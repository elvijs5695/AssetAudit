# Vecā kataloga algoritma izpēte un cenu konfliktu analīze

**Avots:** `inventarizacija.zip` (skat. `19_SOURCES_AND_EVIDENCE.md`), `dokumentacija.docx`, `db2temp.php`, `cat2temp.php`, `importExcel.php`, `createCatalogue.php`, `index.php`, `backup/26-11-21_13-06-34.sql`. Tikai statiska analīze; PHP/SQL kods nav izpildīts produkcijā.

## Faktiskais gada sagatavošanas algoritms
1. `maintenance.year` konfigurē aktīvo gadu, tiek tīrīts katalogs un Excel importa tabula.
2. `db2temp.php`: paņem iepriekšējā gada (`confYear - 1`) `preces` ar `DISTINCT (kods, nosaukums, pz_cena, pl_cena)` un ieliek `import`. **Dažādas plaukta cenas paliek kā atsevišķas RAW kandidātu rindas.**
3. Visu pavadzīmju Excel dati CSV formātā nonāk `table6` (`COL1` kods, `COL2` nosaukums, `COL3` cena), manuāli pārveidojot teksta laukus.
4. `importExcel.php` no `table6` ģenerē SQL ievades fragmentus; 2026. gada versijā cieti ierakstīts gads `2026`, pavadzīmes cena noapaļota līdz 2 decimāldaļām, plaukta cena iestatīta `0.00`.
5. `createCatalogue.php` izmet `import` rindas ar pavadzīmes cenu 0, ar `TRUNCATE` iztukšo **visu** `precu_katalogs`, un atkal to uzbūvē, grupējot `import` pēc `(kods, nosaukums, cena)`.
6. Pēc gada kataloga sākuma to var papildināt: `cat2temp.php` pārnes esošo katalogu atpakaļ uz `import`; imports un jauna kataloga ģenerācija atkārtojas.
7. Ikdienas `index.php` lietotāja ievade/labojums arī var papildināt katalogu, ja precīzs `(kods, nosaukums, pz_cena, pl_cena)` pāris nav atrasts; pēc zināmas plaukta cenas ievades var tikt dzēsts tāds pats ieraksts ar `cena_p=0.00`.

## Īpaši būtiska SQL īpatnība
```sql
SELECT MAX(id) AS id, kods, nosaukums, cena, cena_p, gads, user, euser
FROM import
GROUP BY kods, nosaukums, cena;
```
`MAX(id)` **negarantē**, ka `cena_p`, `gads` un citi neagregētie lauki nāk no pēdējās rindas. Ar `ONLY_FULL_GROUP_BY` šis vaicājums var tikt noraidīts; bez tā neatkarīgi lauki var būt izvēlēti nepārskatāmā veidā. Šis nav verificēts algoritms "pēdējais uzvar" vai "aktuālais gads uzvar".

## Statiskā SQL datu audita rezultāti (2026. gada datubāzes eksporta momentuzņēmums)
| Pārbaude | Rezultāts |
|---|---:|
| `import` rindas | 6 084 |
| Gala `precu_katalogs` rindas | 5 980 |
| Unikālās `(kods, nosaukums, pavadzīmes cena)` grupas `import` | 5 980 |
| Grupas ar atšķirīgām `cena_p` vērtībām | **37** |
| RAW rindas šajās 37 grupās | 86 |
| No 37 grupām 2025. un 2026. gada avoti kopā | **29** |
| No 37 grupām gala izvēlētā `gads` vērtība | **2025 visās 37** |
| No 37 grupām atlasītā plaukta cena atbilst `import` rindai ar lielāko ID | **0 no 37** |
| No 37 grupām izvēlētās gala plaukta cenas ir 0 | **0 no 37** |

Šie secinājumi attiecas tikai uz arhīvā iekļauto eksportu, nevis reālajā serverī pašlaik esošo datubāzi. **Nav zināms, vai izvēle ir apzināta vai nejauša.** Iespējams, ka 2025. gada jau noteiktā plaukta cena tika saglabāta, jo 2026. gada pavadzīmes importā `cena_p=0`; šo biznesa interpretāciju lietotājam vēl jāapstiprina.

## Pārbaudāmie jautājumi, pirms mainīt cenu loģiku
- Vai pavadzīmes cena 2026. gadā aizstāj iepriekšējā gada pavadzīmes cenu tikai tad, ja faktiski atšķiras, vai veido citu kataloga variantu?
- Vai jaunā pavadzīme bez plaukta cenas (`0.00`) drīkst pārrakstīt zināmu 2025. gada plaukta cenu? Visticamāk ne, bet **nav apstiprināts**.
- Ja viens kods/nosaukums parādās ar dažādām plaukta cenām un vienādu pavadzīmes cenu, vai pareizā ir pēdējā lietotāja labotā vai jebkurš atbilstošs variants?
- Vai `kods` tukšs (bieži sastopams) un `nosaukums` kopīgs var kļūdaini sapludināt dažādas preces?
- Vai 0 pavadzīmes cena ir aizliegtas/nekorektas rindas pazīme, vai dažkārt leģitīms produkts?
- Vai nākamajā gadā jāsaglabā iepriekšējā gada **slēgtās** inventarizācijas cenas, pat ja darbības laikā vēlāk labotas?

## Ieteiktais jaunas sistēmas algoritms — vēl NAV apstiprināts
1. Izveidot atsevišķus **neizdzēšamus importa avotu ierakstus** ar precīzām sākotnējām vērtībām un `batch_id`.
2. Veidot atvasinātu salīdzinājuma tabulu pēc noteiktas identitātes politikas.
3. Atšķirt `cena_p` **nav zināma** no patiesas `0.00` cenas. Eksportā un datubāzes API to nesapludināt.
4. Vienas pavadzīmes atkārtotu iesniegšanu atpazīt pēc faila satura hash/partijas identifikatora; neatkarīgu atkārtojumu nekad nepievienot divreiz bez lēmuma.
5. Adminam piedāvāt individuālu/pārskata priekšskatījumu, kandidātu salīdzinājumu un konfliktu apstiprināšanu.
6. Apstiprinājums transakcijā izveido jaunus kataloga notikumus; nav `TRUNCATE` no aktīvā kataloga. Var reproducēt konkrēta gada katalogu.

## Reproducējamība
Palaist pret **lokālu, tikai lasāmu** sākotnējā arhīva kopiju:
`python tools/audit_legacy_dump.py --zip /path/to/inventarizacija.zip`
Skripts tikai nolasa SQL importa un kataloga rindas un izdrukā agregātus bez preču datiem. Oriģinālos datus **neglabāt publiskā repozitorijā**.
