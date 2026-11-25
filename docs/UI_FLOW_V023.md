# v0.2.3 — darbplūsma un interfeiss (LV)

## Dizains

Minimāls, funkcionāls. Neizmantot mārketinga saukļus, lielas dekoratīvas kartītes vai garus skaidrojumus. Prioritātes: ātrums, skaidra ievades stāvokļa pārbaude, precīzi skaitļi, darbvirsmas paradumu saglabāšana, ergonomiska mobilā darbplūsma. Visi teksti latviski.

## Navigācija

| ID | Nosaukums | staff | admin | Pamata saturs |
|---|---|---|---|---|
| `entry` | Datu ievade | jā | jā | Kataloga meklēšana + jauns inventarizācijas ieraksts |
| `inventory` | Preču saraksts | jā | jā | Esošo inventarizācijas datu saraksts un detaļas |
| `catalogue` | Katalogs | jā | jā | Kataloga varianti; admin papildus var veidot / labot / paslēpt |
| `stats` | Statistika | nē | jā | Bilance, datu vēsture, laika skats |
| `admin` | Administrācija | nē | jā | Gads, lietotāji, sistēmas statuss |

Sadaļu nepieejamība UI **nav** drošības robeža: serveris/RLS/SQL pārbauda tiesības.

## Datu ievades secība

1. Meklēt preču **katalogā** pēc nosaukuma, koda vai svītrkoda. NERĀDĪT šeit jau saskaitītos inventarizācijas ierakstus; tiem paredzēta `Preču saraksts`.
2. Izvēlēties **konkrētu kataloga variantu**. Aizpildīt preces kodu (drīkst būt tukšs), nosaukumu, pavadzīmes cenu, plaukta cenu, svītrkodu. **Nemainīt automātiski** kases izvēli, daudzumu, mērvienību vai komentāru.
3. Alternatīva: liela poga **Skenēt svītrkodu**. Nolasīts kods nekavējoties dod **precīzu** datubāzes meklējumu pēc `barcode`, nevis aptuvenu teksta sakritību. Viena atbilstība aizpilda produkta laukus. Vairākas atbilstības ļauj izvēlēties variantu. Nulles atbilstība aizpilda **tikai svītrkodu** un notīra nepareizu iepriekš izvēlētu preci; lietotājs var turpināt manuāli.
4. Izvēlēties kasi: `1.stāvs`, `2.stāvs`, `Tirgus`. Ievadīt daudzumu ar `+`/`−` vai tiešā rediģējamā lauka ievadi; daudzumam saglabāt divas decimāldaļas. Mērvienības: `gabali`, `komplekti`, `metri`, `kg`. Pievienot komentāru, ja vajadzīgs.
5. Saglabāt jaunu `inventory_submit` notikumu tikai servera apstiprināta pieprasījuma rezultātā. Pirms apstiprinājuma interfeiss nedrīkst paziņot par sekmīgu saglabāšanu. Dublikātu aizsardzība ar `request_id`.
6. `0,00` ievadīta cena ir **atļauta ar brīdinājumu**, nevis bloķējoša kļūda. No pavadzīmes pārņemtā **nezināmā** plaukta cena katalogā ir `NULL`, nevis 0. Ja manuālā inventarizācijas ievadē plaukta cena nav zināma, pieprasīt tās precizēšanu; nepiešķirt 0 automātiski.
7. Atšķirīgs konfigurācijas un pašreizējais kalendāra gads rada pamanāmu brīdinājumu, bet **neblokē ievadi**. Rakstīt drīkst tikai konfigurētajā aktīvajā inventarizācijas gadā.

## Preču saraksts

Tikai jau ievadītās inventarizācijas grupas: kods, nosaukums, abas cenas, kase. Atverot grupu — atsevišķi ieraksti, labošana un anulēšana ar jauniem notikumiem. Saglabāt vēsturiskās rindas, nekādu klusējošu korekciju vai datu apvienošanu ar atšķirīgām cenām.

## Autentifikācija

E-pasts + parole, ko veido administrators. Supabase Auth. Public signup izslēgts; nav darbinieku pašu reģistrācijas. Vecā `.invalid` lietotājvārdu pieeja ir **aizstāta**.

## Šajā versijā nav

- Neizpildīt grāmatvediski neapstiprinātu gada kataloga ģenerēšanu un pavadzīmju importa automatizāciju.
- Offline rindu rindas un nemanāma sync nav ieviesta (uzticama servera saglabāšana ir primāra).
- Kamera atpazīst kodu tikai pārlūkos ar atbilstošu `BarcodeDetector`; citur ir manuāls rezerves ievades režīms. Papildu skenēšanas bibliotēka jāapsver kā nākamais solis; Android fiziskās kameras tests vēl nav veikts.
