# Vecās aplikācijas failu un datu karte (tikai avota audits)

| Artefakts | Novērotā nozīme | Migrācijas norāde |
|---|---|---|
| `index.php` | Inventarizācijas ievade, labošana, dzēšana, sagrupētais saraksts, bilances atspoguļojums, manuāls `mysqldump` | Nenoteikt mainīgas DB tiesības no UI; atdalīt plūsmas |
| `output.php` | Apkopotais gada eksports ar summām pēc preces + abām cenām + `kase` | Saglabāt vecās grupēšanas etalonu testam |
| `search.php` | Meklēšana un apkopojums | Pārbaudīt gadu/filtru un autorizāciju |
| `subItems.php` | Izvērš individuālās preces rindas un labot/dzēst saites | Prasības REQ-003..007 |
| `values.php` | Kataloga kandidāta izvēle un jaunas preces forma | Jāatšķir prece, cena, svītrkods, preces pievienojums |
| `db2temp.php` | Iepriekšējā gada unikālās kombinācijas uz `import` | Pārbaudīt, ko biznesā nozīmē unikāla prece |
| `cat2temp.php` | Esošo kataloga ierakstu pārnešana `import` | Aizstāt ar auditējamu priekšskatījumu |
| `importExcel.php` | Pārveido `table6` CSV ierakstus SQL fragmentos; gads ir cieti ievadīts | Nedarbināt ģenerētu SQL no importa satura |
| `query.php` | Milzīgs konkrētā gada imports kā SQL | Konfidenciāli preču dati — nav repo jāiekļauj |
| `createCatalogue.php` | `import` filtrēšana, `TRUNCATE`, atlasīto grupu ievietošana katalogā | 37 cenu konflikts, nedeterministisks `GROUP BY` |
| `createCatalogue2.php` | Alternatīvs/iespējams nepabeigts variants | Bez pierādījuma nenoteikt par aktīvo biznesa algoritmu |
| `inadmin/*.php` | Lietotāju pievienošana, labošana, dzēšana, paroles attēlošana | Pāriet uz Supabase Auth, akcionāra auditēšana |
| `includes/parameters.php` | Aktīvā gada nolasīšana, manuālas lokālā backup paths | Nenest vecās lokālās konfigurācijas uz mākoņu klientu |
| `backup/26-11-21_13-06-34.sql` | 2026. gada MariaDB dump ar datiem, ieskaitot kontus | Privāts, var saturēt sensitīvu informāciju |
| `dokumentacija.docx` | Sākotnējais kataloga gada process | Pamata avots `07_LEGACY_CATALOGUE_AUDIT.md` |

## Tabulas
| Nosaukums | Loma | Specifiska piezīme |
|---|---|---|
| `preces` | Individuālās inventarizācijas rindas | `FLOAT` daudzums; `DOUBLE` finanšu lauki; labošanas vēsture pārrakstīta |
| `precu_katalogs` | Aktīvais katalogs | `DECIMAL(7,2)` cenas; nav kompozīta unikālā ierobežojuma |
| `import` | Pagaidu kandidātu katalogs | Pārnes pagājušā gada ierakstus un jaunus pavadzīmju ierakstus |
| `table6` | CSV šūnu pagaidu imports | `COL1`, `COL2`, `COL3`; trausla manuāla sagatavošana |
| `users` | Konti | Parole atklātā tekstā |
| `maintenance` | Aktīvais gads/backup laiks | Globāls gads; neskaidra vēsturiska sasaiste |

**Piezīme:** dažos failos iespējamas smagas ievades, SQL injekciju vai nepieejamu tabulu problēmas. Šis ir statisks kartējums, nevis izsmeļošs drošības audits. Neizpildīt datu mutācijas pret veco serveri.
