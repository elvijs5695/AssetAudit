# Vēsturiskās MySQL datubāzes neatkarīgā salīdzināšana

Datu avots: lietotāja oriģinālais `inventarizacija.zip`, iekšējais SQL dump SHA-256 `fed311dcef73c91bdea760628af8ea6634a9210c75ab1b4f9b286b92e6529551`. Skaitļi ir no source tabulas `preces` (nevis no modelētiem testa datiem). **Visas vēsturiskās glabātās PZ/PL summas saglabātas tieši tā, kā atrastas**.

| Gads | Ieraksti | Grupas* | Daudzums | Pavadzīmju summa (€) | Plauktu summa (€) | Starpība (€) |
|---|---:|---:|---:|---:|---:|---:|
| 2018 | 7 477 | 7 477 | 105 284,30 | 57 286,08 | 143 021,83 | 85 735,75 |
| 2019 | 10 693 | 7 608 | 98 750,92 | 61 026,32 | 153 202,68 | 92 176,36 |
| 2020 | 9 487 | 7 023 | 97 245,07 | 59 596,74 | 146 879,99 | 87 283,25 |
| 2021 | 9 627 | 7 053 | 102 538,50 | 61 438,49 | 157 937,30 | 96 498,81 |
| 2022 | 8 594 | 6 643 | 104 191,20 | 63 109,42 | 167 298,10 | 104 188,68 |
| 2023 | 8 370 | 6 341 | 96 170,42 | 59 859,61 | 159 549,89 | 99 690,28 |
| 2024 | 7 240 | 5 632 | 90 797,62 | 53 838,37 | 137 698,70 | 83 860,33 |
| 2025 | 6 331 | 5 163 | 70 074,52 | 45 928,08 | 117 308,03 | 71 379,95 |

\* **Vecās sistēmas grupējuma atslēga:** `(preces kods, nosaukums, pavadzīmes cena, plaukta cena, kase)`. **Mērvienība šajā atslēgā nav iekļauta**; 6 grupās sastopamas vairākas mērvienības. Šīs summas **nevar uzskatīt par uzņēmuma oficiāli apstiprinātu bilanci**, pirms grāmatvedis nav pārbaudījis metodiku.

## Neatbilstības, ko nedrīkst klusi pārrakstīt

- `legacy_id=514` (2018): saglabātā PZ summa **0,68 €**, precīzs pēc pašreizējā noapaļošanas noteikuma reizinājums **0,75 €**.
- `legacy_id=20375` (2019): saglabātā PZ summa **2,07 €**, reizinājums **2,06 €**.
- 6 grupās apvienotas atšķirīgas mērvienības; tās precīzi noteikt ar `tests/verify_historical.py` un oriģinālo SQL, neizdomājot jaunus vēsturiskus faktus.
- Kataloga 37 preču grupās ar to pašu kodu, nosaukumu un PZ cenu ir atšķirīga PL cena. **Pieprasīt grāmatveža lēmumu** par dublikātu un prioritāšu loģiku.

## Protokols

1. Uz faila kopijas palaist `python3 tests/verify_historical.py`, kontrolēt, ka rāda `PASS`.
2. Jaunā tukšā testa datubāzē ielādēt migrāciju un privāto importu; SQL transakcija veic `COUNT`, `SUM` un grupas kontroles katram gadam. Neatbilstošu importu automātiski pārtraukt.
3. Papildu manuāli salīdzināt divas nejauši izvēlētas gada grupas, kā arī visas 2 aritmētikas un 6 mērvienību anomālijas.
4. Pēc grāmatveža saskaņojuma norādīt, vai vēsturiskās rindu summas atstāt kā oficiālu uzskaites sākumstāvokli, vai veikt skaidri izsekojamas kompensējošas korekcijas jaunajā sistēmā.
