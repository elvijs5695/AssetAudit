# Gada dzīves cikls — cilvēkam saprotama specifikācija

## A. Gada noslēgšana (process apstiprināts, detaļas atliktas)
- Inventarizācijas laikā ievadīti neatkarīgi preču daudzuma ieraksti; grupa rāda summu.
- Pēc inventarizācijas administrators pārbauda un ar izsekojamām korekcijām saskaņo inventarizācijas gala rezultātu ar grāmatvedības atskaitēm.
- Gadu noslēdz; veido eksportu ar gadiem un kopsummām saistītu eksporta versijas ID un SHA-256.
- Noslēgtā gada datiem jābūt reproducējamiem. Labojumi pēc slēgšanas tikai ar īpašu atvēršanas/pārapstiprināšanas procedūru — detaļas vēl jāizstrādā.

## B. Nākamā gada sākums
1. Administrators izvēlas jaunu inventarizācijas gadu.
2. Sistēma piedāvā sākuma katalogu no **iepriekšējā noslēgtā gada** unikālajām precēm ar cenām un izcelsmes gadu.
3. Visi kandidāti tiek pārbaudīti, tostarp dublikāti un nezināmas/atšķirīgas cenas.
4. Administrators apstiprina sākuma katalogu; apstiprinājuma rezultāts ir auditējams notikums.

## C. Jauno pavadzīmju imports — atkārtojams
1. Administrators ielādē noteikta formāta CSV (Excel importu var attīstīt vēlāk, precīza veidne jāapstiprina).
2. RAW imports tiek reģistrēts kā jauna partija ar satura hash, faila nosaukumu, laiku, aktoru un oriģinālajām šūnu teksta vērtībām.
3. Sistēma veic validāciju: datu tips, naudas precizitāte, sākuma nulles kodā, tukši nosaukumi, dublikāti partijā, dublikāti katalogā, atšķirīgas cenas.
4. Priekšskatījumā redzami **jaunie, esošie, konfliktējošie, nederīgie** ieraksti; mazā importa gadījumā rindas, lielā — statistika un anomālijas.
5. Ja nepieciešams, administrators risina konfliktus; katrs lēmums paliek saistīts ar avotu.
6. Apstiprinājums pievieno kataloga notikumus. Neapstiprināts imports nedrīkst ietekmēt aktīvo katalogu.
7. Jaunas pavadzīmes tajā pašā gadā var ielādēt atkal un atkal, tostarp inventarizācijas laikā.

## D. Preces pievienošana inventarizācijas laikā
- Lietotājs skenē kodu vai meklē preci; ja rezultātu ir vairāk, izvēlas no piedāvātajām cenām/variantiem.
- Var ievadīt pilnīgi jaunu produktu vai labot pašreizējā inventarizācijas ieraksta laukus.
- Pievienojums ir individuāls ieraksts. Atkārtoti pievienojumi rodas atsevišķi, lai gan UI grupē tos.
- Tikai servera apstiprināts ieraksts kļūst par aktuālo datu sastāvdaļu.

## E. Kontroles punkti
- Iepriekšējais gads noslēgts? (ja ne, neimportēt bez administratora lēmuma)
- Sākuma katalogs salīdzināts ar iepriekšējā gada eksportu?
- Atkārtots importa fails nejauši nav apstiprināts divreiz?
- Cenu konfliktu rezultāti apstiprināti dokumentētā politikā?
- Gada eksporta grupu skaits, daudzumi, PZ/PL summas un bilance izskaidroti?

## Atvērtās tēmas
Precīzs "unikālas preces" algoritms; cenu prioritātes; izņēmumi negatīviem daudzumiem; nepilna gada jaunām precēm; gadu pārslēgšanās piekļuves tiesības; grāmatvedības atskaišu salīdzināšanas algoritms. Sk. `16_OPEN_QUESTIONS.md`.
