# Datu nemainīgums, labošanas modelis un uzskaites invarianti

## Trīs atšķirīgi slāņi
1. **RAW notikumu avots:** faktiskais lietotāja sākotnējais pieprasījums, labojuma pieprasījums vai pavadzīmes rinda ar servera saņemšanas laiku; nekad nav pārrakstāms vai dzēšams aplikācijas darbinieka/admina rutīnas darbībās.
2. **Aktuālais stāvoklis:** atvasināts no jaunākā spēkā esošā notikuma katram loģiskajam ierakstam; loģiski anulētie nav iekļauti summās.
3. **Aprēķini/eksporti:** nolasāmi no aktuālā stāvokļa ar perioda versiju, fiksētiem noapaļošanas likumiem un auditējamu eksporta hash.

## Ilustrācija (biznesa scenārijs)
| Notikums | Ieraksts | Daudzums | Kas redzams parastajā skatā? | Kas redzams administratora vēsturē? |
|---|---|---:|---|---|
| `E1 create` | A | 12 | A = 12 | sākotnēji 12 |
| `E2 replace` → E1 | A | 10 | A = 10 | 12 (labots), 10 (aktuāls) |
| `E3 create` | B | 4 | A = 10; B = 4; grupa = 14 | A un B kā atsevišķi ieraksti |
| `E4 void` → E3 | B | — | A = 10; grupa = 10 | B vēsturē ir anulēts |

**Nekad** nesummē visus `create/replace` notikumus. Pirmais un otrais A notikums nav kopā 22 preces.

## Servera invarianti
- Katram notikumam ir stabils UUID, nemaināms servera laiks, autentificēts aktors, avota request UUID un precīzs notikuma tips.
- Pievienošana notiek transakcijā; tikai viena atbilde par vienu `request_id`.
- Labojums atsaucas uz iepriekšējo aktuālo versiju; vienlaicīgas konkurējošas korekcijas nedrīkst klusi pārrakstīt viena otru.
- Parasts lietotājs labo aktuālās vērtības, bet nevar ar SQL/REST mainīt vai dzēst RAW vēsturi.
- Darbinieka UI neizdod nepatiesu saglabāšanas apstiprinājumu tīkla kļūmes gadījumā.
- Slēgta gada summas nevar mainīties bez skaidras, auditētas gada atkārtotas atvēršanas / atkārtota noslēguma versijas (precīza politika vēl jāapstiprina).
- Naudas uzskaite izmanto precīzu decimālu tipu, nevis JavaScript `number` kā aprēķinu patiesības avotu; valūtas noapaļošana tiek noteikta centralizēti serverī.
- Neviena rezerves kopija nav pierādījums līdz tās veiksmīgai atjaunošanai kontrolētā vidē.

## Datu tiesību pieeja
- Novērš tiešu `UPDATE`/`DELETE` uz RAW tabulām piešķirtajās aplikācijas lomās.
- Izveido servera validētu transakcijas funkciju, kas veic tikai atļautās `INSERT` komandas un pārbauda identitāti, lauku robežas, gada statusu un idempotenci.
- RAW datubāzes administratora konta tehniskas darbības nevar pilnībā fiziski aizliegt — tādēļ vajadzīgas aizsargātas rezerves kopijas, kontu sadalījums un audita uzraudzība.
- Atvasinātu skatu/kešu drīkst pārrēķināt jebkurā laikā, saglabājot RAW; jāspēj pierādīt identisku rezultātu.

## Līdz ieviešanai jāvienojas
Daudzuma zīmju atļaušana, precizitāte, preces neatkarīgā identitāte, vienību konversijas, `kase` nozīme, vēsturiska datuma semantika, valūtas noapaļošanas metode un konkurējošu labojumu UI.

## Vēsturisko griezumu un kompensācijas invarianti (v0.1.1)
- Aktuālā stāvokļa skatam un laika `T` skatam jāizmanto viens un tas pats notikumu piemērošanas algoritms, tikai ar citu konsekventu notikumu griezumu.
- Ar inventarizācijas RAW vien nepietiek vēsturiskai **bilancei**; nepieciešami kataloga/cenu/pavadzīmju laika dati vai stabilas atsauces uz cenu versijām.
- Atšķir `recorded_at` (kad sistēma pieņēma notikumu) no `effective_at` (uz kādu biznesa brīdi tas attiecas); retroaktivitāte jāsaskaņo.
- Fiziska DB atjaunošana nav lietotnes "Undo"; loģiskai atcelšanai jārada jauns, auditējams kompensējošs notikums ar akceptu.
- Datu kopijas tajā pašā DB shēmā nav neatkarīga katastrofu atjaunošana. Snapshots/keši drīkst tikt pārbūvēti no RAW.
- Jāfiksē notikumu un cenu versiju identifikatori, lai aizvērtu gada bilanci var reproducēt arī pēc nākamā gada importiem.

Sk. `23_TEMPORAL_HISTORY_AND_RECOVERY.md`, `REQ-033..039`, `TC-034..040`.

## v0.1.2 — nezināmas un ievadītas nulles cenas
- Vēsturiskajā importā `cena_p=0.00` var nozīmēt "plaukta cena pavadzīmē nav dota", nevis patiesu cenu. Jaunā datu modelī ievadītās nulles un nezināmo cenu **obligāti jāspēj atšķirt** (piemēram, `NULL`/`known=false` + izcelsme).
- Aktīvas ievades `0.00` nevar bloķēt; UI parāda brīdinājumu un saglabā parakstītu/auditētu lietotāja izvēli.
- `kods=''` ir normāls un nevar būt vienīgais produkta identifikators; `barcode` ir atsevišķa identitātes lauku saime.
- Vecās sistēmas `INSERT catalogue; DELETE placeholder; UPDATE preces` nav pieņemama kā jaunā append-only izpilde; jaunajā modelī kataloga kandidāti un placeholder atcelšana jāveido auditētos notikumos atomiski.
