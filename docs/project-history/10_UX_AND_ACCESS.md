# Interfeisa, režīmu un piekļuves specifikācija

## Lietotāja vienkāršotais režīms — primāri mobilajā ierīcē
- Ātra meklēšana vai svītrkoda skenēšana → atbilstošo preču/variantu izvēle → daudzums, vienība, PZ/PL cenas, `kase`, komentārs → `Saglabāt`.
- Vienmēr redz tikai **aktuālās vērtības**, nekad nevar nejauši labot vēsturisku versiju.
- Grupas rindā ir atbilstošo individuālo pievienojumu summa; izvēršot redzamos individuālos ierakstus, lietotājs var labot aktuālo ierakstu.
- Saglabāšanas statuss: `Tiek sūtīts…` / `Saglabāts` (pēc servera atbildes) / `Neizdevās, mēģināt vēlreiz`; atkārtojumam jābūt idempotentam.
- Neuzskatīt skenēšanas sākumu par inventarizācijas ierakstu; izveidošana notiek tikai pēc pārbaudītas apstiprināšanas.

## Administratora pilnais režīms — primāri desktop
- Noklusētais pārskats tāds pats aktuālo vērtību skats kā darbiniekam.
- Slēdzis **`Rādīt vēsturi`** atver iepriekšējās versijas pie katra individuālā ieraksta: autors, datums/laiks, labojuma būtība un anulēšanas statuss.
- Iepriekš labots: dzeltena/gaišāka vizuāla norāde; anulēts: sarkana norāde. Papildus jābūt skaidriem tekstiem/ikonām (`Labots`, `Anulēts`) pieejamības dēļ.
- Administrācijas paneļi: lietotāji, gada izvēle, importa rindu priekšskatījums, konfliktu apstiprināšana, eksports, bilance, rezerves kopijas statuss.
- Administratoram jābūt iespējai telefonā ieslēgt vieglo režīmu. **Šī pārslēgšana nemaina piekļuves tiesības serverī.**

## Tiesības
| Darbība | Darbinieks | Administrators |
|---|:---:|:---:|
| Meklē preces; skatās cenas, ievada daudzumu | Jā | Jā |
| Labo aktuālo inventarizācijas ierakstu | Jā | Jā |
| Redz labojumu/dzēsumu vēstures paneli | Nē (paredzēts) | Jā |
| Pievieno/labo/deaktivizē lietotājus | Nē | Jā |
| Apstiprina kataloga pavadzīmju importus | Nē | Jā |
| Redz un pieprasa bilances kopsavilkumu | Nē | Jā |
| Pieprasa eksporta vai DB dump datnes | Nē | Jā, ar auditu |

**Konfidencialitātes ierobežojums:** lietotājs, kurš redz visas cenas un daudzumus, teorētiski pats var aprēķināt bilanci. Aizliedzam gatavā pārskata piekļuvi, bet neapsolām tehniski neiespējamu ekonomisku secinājumu veikšanu.

## Kontroles
Visām atļaujām jābūt servera/RLS pārbaudēm. Jāizmēģina pieprasījumi ar darbinieka tokenu tieši pret API, ne tikai jāslēpj UI pogas.

## Vēl jāprojektē
Ekrānu wireframe, desktop tabulu izmēri, mobilās ievades fokusēšanās, režīmu nosaukumi, vienlaicīgi labojumi, drukas/eksporta noformējums. Apspriest ar lietotāju pirms UI dizaina fiksēšanas.
