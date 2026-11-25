# Svītrkodu funkcija — mērķis, darbība, izņēmumi

## Lietotāja prasība
Pakāpeniski veidot uzņēmuma iekšējo svītrkodu vārdnīcu. Pirmajā sastapšanās reizē kods var nebūt zināms: lietotājs ievada / izvēlas preci un sasaista ar kodu. Nākamajā gadā to pašu kodu var uzreiz izmantot meklēšanai. Pavadzīmju imports nākotnē var nodrošināt kodu sasaistes. Piegādātāju līmeņa detalizācija šobrīd nav nepieciešama.

**Jaunākais skaidrais lēmums:** lietotāja telefona kamera nedrīkst uzglabāt produkta foto, ne serverī, ne pastāvīgā lokālā kešā. Skeneris atgriež **koda simbolu virkni un formātu**, ko ievieto datu laukā (`SRC-R2-C7`). Tas aizstāj sākotnējā aprakstā minēto fotografēšanu.

## Reālistiska nolasīšanas plūsma
1. Atver skenēšanu un lūdz kameras atļauju; ja nav, atstāj manuālu koda ievadi.
2. Atpazīst kodu (EAN-13/UPC-A u.c. pamatformāti, pēc vajadzības paplašina), nenoglabājot attēlus.
3. Saglabā precīzu virkni **kā tekstu**: `000123...` nedrīkst zaudēt sākuma nulles.
4. Ja attiecināms, pārbauda garumu/simboloģiju un GTIN kontrolciparu. Nepārvērš patvaļīgus veikala/iekšējos kodus par GTIN.
5. Ja ir tieši viena verificēta atbilstība ar vienu pieļaujamu cenu variantu, piedāvā izvēli/ātru apstiprināšanu; ja vairāki, lietotājs izvēlas.
6. Ja nezināms, ļauj izvēlēties esošu preci vai izveidot jaunu kandidātu ar apstiprināšanu; neveido klusām dubultu jaunu preci.
7. Lietotāja izvēli sasaista ar svītrkodu un aktoru, saglabā auditēti.

## Vai divām precēm var būt viens svītrkods?
Oficiālais GS1 GTIN vienu konkrētu produkta tirdzniecības vienību identificē unikāli, tomēr tā pati etiķete uz daudzām identiskām precēm ir normāla. Praktiski var būt piegādātāju iekšējie kodi, nestandarta etiķetes, pārmarķējumi, bojāts skenējums, nekonsekventi vēsturiskie dati. Vienam produktam var būt vairākas **cenas** — cena nav iekodēta produkta GTIN identitātē. Tādēļ saite `barcode → product` nav obligāti saite `barcode → viena inventarizācijas gada cena`.

## Neveidot
- Nemēģināt no koda izsecināt cenu, ja tā nav atsevišķi apstiprināta kataloga cenā.
- Nedublēt tādu pašu preces identitāti tikai tāpēc, ka mainījās pavadzīmes cena.
- Nepiespiest šķietamu unikālu DB ierobežojumu vienam kodam pret vienu cenas rindu.
- Nesaglabāt fotogrāfijas; nesūtīt kadru uz serveri bez atsevišķa lietotāja lēmuma.

## Atvērtie tehniskie lēmumi
PWA bibliotēka un kameras ātrdarbība jāpārbauda uz reālajām ierīcēm; native Android apsvērt tikai tad, ja pārlūka skenēšana nav pietiekami uzticama/ātra. Nepieciešamie formāti un kļūdaini/īsie/iekšējie kodi vēl jāapkopo testu datu kopā.

## Avoti
- Lietotāja inputa ID: `SRC-CHAT-INIT`, `SRC-R1-C3`, `SRC-R2-C3`, `SRC-R2-C7`.
- GS1: https://support.gs1.org/support/solutions/articles/43000734095-how-do-gs1-gtins-and-barcodes-work-
- GS1 piešķīruma noteikums: https://support.gs1.org/support/solutions/articles/43000734139-can-i-reuse-a-gs1-gtin-on-another-product-
