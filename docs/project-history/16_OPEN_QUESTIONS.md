# Atvērtie jautājumi — nedrīkst minēt atbildes

| ID | Kas jānoskaidro | Kāpēc svarīgi | Aģenta nākamā darbība |
|---|---|---|---|
| Q-001 | Kuras cenas uzvar, ja vienāds kods/nosaukums/PZ cena un atšķiras PL cena? | 37 vecā importa konfliktu grupas; SQL neko negarantē | Parādīt konflikta scenārijus un piedāvāt precīzus noteikumus apstiprināšanai |
| Q-002 | Kā identificēt unikālu preci bez koda vai ar atšķirīgu nosaukumu? | Ietekmē katalogu, svītrkodu un eksportu | Pārbaudīt reālo datu sadalījumu un saskaņot identitātes kritērijus |
| Q-003 | Vai PL `0.00` nozīmē īstu nulli vai nav zināma? | Jauns imports PL nullē; nedrīkst pazaudēt zināmo cenu | Pieņemt atšķirīgu NULL/0 politiku |
| Q-004 | Kādam jābūt naudai/daudzumiem, noapaļošanai un starpības formulai? | Absolūta precizitāte, vēsturiskās atskaites | Izveidot ar grāmatvedību saskaņotus skaitliskus piemērus |
| Q-005 | Vai `kase` ir telpa, nodalījums vai kases sistēmas zona; kas ir grupēšanas atslēga? | Nepareiza grupēšana maina daudzumus | Intervēt lietotāju un parādīt vecā SQL atšķirības |
| Q-006 | Vai vienas preces dažādas mērvienības drīkst summēt? | Vecais GROUP BY ignorē vienību | Datu audits un biznesa noteikums |
| Q-007 | Kā tieši notiek gada galīgā saskaņošana, slēgšana, atkārtota atvēršana un eksports? | Finanšu reproducējamība | Atsevišķs dizaina posms pēc V1 bāzes |
| Q-008 | Vai lietotāji drīkst anulēt, atjaunot, rediģēt citu personu ierakstus? | Lomu modelis un audits | Saskaņot konkrētu darbību matricu |
| Q-009 | Vai admin vēsturei ir jābūt tikai UI iespējai vai lietotājiem jāredz paša pēdējā labojuma fakts? | Atbilstība darba plūsmai | Apstiprināt wireframe |
| Q-010 | Kurus svītrkodu formātus atbalstīt un kā rīkoties ar iekšējiem kodiem? | Nepareizi skenējumi un kolīzijas | Testēt reprezentatīvus faktiskos kodus |
| Q-011 | Kāds ir backup glabāšanas periods un ārējā pakalpojuma izvēle? | Gadu datu saglabāšana un maksa | Izvēlēties RPO/RTO un pārbaudīt restore |
| Q-012 | Kāds ir apstiprinātais hostinga plāns (Supabase Pro vs Free, Cloudflare Pages)? | Produkcija reizēm neaktīva gandrīz gadu | Soli pa solim pārrunāt izmaksas un operāciju atbildību |
| Q-013 | Kuri dati pavadzīmju veidnē obligāti, ja lietotājam nav piegādātāju šķirojuma? | Precīzs imports | Apstiprināt CSV veidni un cenu tipu |
| Q-014 | Kurš drīkst veikt full DB dump lejupielādi no admin paneļa, kā auditēt? | Īpaši sensitīvs pilns eksports | Apstiprināt, vai funkcija vispār nepieciešama |
| Q-015 | Kad katalogam piemēro jaunas pievienotās preces no pašas inventarizācijas formas? | Pašreizējais `index.php` to dara kā blakusefektu | Definēt skaidru apstiprināšanas plūsmu |
| Q-016 | Kas ir minimālais ātruma un lietojamības mērķis uz reālajiem telefoniem? | PWA vs native izvēle | Izmēģināt skenēšanu uz ierīcēm un pierakstīt laikus |
| Q-017 | Vai no iepriekšējā gada jāpārnes arī slēgšanas laikā koriģētās cenas? | Kataloga vēsture un precizitāte | Noskaidrot kāda eksporta datiem grāmatvedība uzticas |
| Q-018 | Vai vēsturiskā bilance nozīmē "kā bija zināms tobrīd" vai "kā tobrīd bija pēc visiem vēlākajiem precizējumiem" — vai abi skati? | Vēlāki cenu/kataloga labojumi maina interpretāciju | Parādīt 2 scenārijus ar retroaktīvu pavadzīmi un izvēlēties semantiku |
| Q-019 | Ko tieši nozīmē "atgriezt stāvokli": tikai apskate vai arī selektīva/masveida izmaiņu kompensācija? | Masveida atcelšana var izdzēst derīgu aktuālo uzskaiti | Atļaujas, priekšskatījums, apstiprināšana, redzami izņēmumi |
| Q-020 | Vai drošs backup aptver arī Auth identitātes, profilu/lomu vēsturi, migrācijas, Storage objektus, pavadzīmes un konfigurāciju? | Pliks DB dumps var neatjaunot darbojošos aplikāciju | Uzskaitīt atkarības un izpildīt pilnu atjaunošanas testu |
| Q-021 | Kā nodrošināt deterministisku notikumu secību šķērsām inventarizācijas/kataloga/importa plūsmām, īpaši konkurentās transakcijās? | Servera timestamp vai auto-increment viens pats ne vienmēr atbilst commit secībai | Projektēt konsekventu ledger high-water mark un testēt simultānu ievadi |
| Q-022 | Vai inventarizācijas ieraksts fiksē cenu versiju uz skaitīšanas brīdi, uz perioda noslēgumu, vai lieto dinamisku atskaites cenu? | Vēsturiska bilance un grāmatvediskais eksports var atšķirties | Saskaņot precīzus piemērus ar Q-001, Q-003, Q-004, Q-007 |
| Q-023 | Cik lielu datu zudumu (RPO) un atjaunošanas pārtraukumu (RTO) drīkst pieļaut aktīvā inventarizācijā un sezonu starplaikā? | Nosaka ārējo backup biežumu un pakāpenisku kopēšanu | Definēt mērķus bez piesaistes konkrētam pakalpojumam |


Lēmumi pēc šiem jautājumiem papildina `04_DECISIONS.md`, nevis izdzēš jautājumus: aizvērtais jautājums tiek atzīmēts ar `resolved_by DEC-xxx`.

## v0.1.2 — progresu neaizvietot ar minējumiem
- **Q-001:** vecais katalogs papildina variantus, bet `createCatalogue.php GROUP BY` izvēlas neagregētu PL nenoteikti; nepieciešams apstiprināts jaunās sistēmas prioritātes noteikums arī gadījumam, kad vienas preces nenulles PL cenas atšķiras.
- **Q-003:** lietotājs ir precizējis, ka pavadzīmes PL=0 ir nezināma cena; jaunajā modelī `unknown` vs manuāla 0 jānošķir. Šī biznesa semantika ir atrisināta ar DEC-021, bet fiziskā DB reprezentācija vēl jāizvēlas.
- **Q-012:** platformu skaita samazināšanas prasība apstiprināta. Cloudflare D1+R2+Workers+Access un Appwrite+Sites ir kandidāti; platformu izvēli ierobežo precizitātes un backup testi.
- **Q-024:** izvēlēties integrētu platformu tikai pēc D1/alternatīvas finansu aritmētikas, piekļuves un 7 dienu atjaunošanas robežu pārbaudēm.
- **Q-025:** noteikt, kā glabāt periodisko ārpus konta *auksto* kopiju bez regulāra ceturtā pakalpojuma un kā pārvaldīt šifrēšanas atslēgas, darbinieku pieejas un norēķinu metodi.


## v0.1.4 -- unresolved hybrid architecture decisions
- **Q-026:** Should the PWA call Supabase Data API directly with publishable key + RLS, or force all operations through a Cloudflare Worker gateway? Each must preserve server-side authorization and atomic ledger/catalogue changes.
- **Q-027:** What RPO/RTO during active inventory and when idle? Proposed: daily full encrypted dump while active; frequency is not approved. Need retention periods and actual restore exercise.
- **Q-028:** How to guarantee observability for missed GitHub Actions scheduled jobs or Supabase Free suspension, especially when the app is unused for months?
- **Q-029:** Which R2 subscription/payment-account controls, separate offline backup, recovery-key custodians and authorization for admin-download meet company privacy and cost requirements?

These have not been resolved by the user's suggestion.


## v0.1.5 — atvērtie platformas jautājumi
- **Q-030:** Vai projektam tiks izmantots personisks vai organizācijai piederošs **privāts GitHub** repozitorijs? Netlify Free automātiskas Git integrācijas nosacījumi atšķiras; neprasīt šo jautājumu atkārtoti, ja izlemts citā sarunā.
- **Q-031:** Vai lietotājs piekrīt Netlify Free 300 kredītu mēneša limitam ar servisa apturēšanu, nevis maksājumu iekasēšanu, kad kvota ir izsmelta?
- **Q-032:** Vai Netlify Blobs **Beta** ir pieļaujama *viena no* backup kopijām, ar papildu offline šifrētu kopiju un atjaunošanas testu, vai nepieciešama nobriedušāka glabātuve?
- **Q-033:** Kurš atbildēs par periodisko atjaunošanas testu un atslēgas glabāšanu neatkarīgi no Supabase, Netlify un GitHub kontiem?


## v0.1.6 — jautājumi pēc platformas izvēles

- **Q-030 (joprojām atvērts):** repo būs personiskajā vai uzņēmuma GitHub organizācijā? Netlify Free automātiska Git integrācija atkarīga no tā.
- **Q-031 (operacionāls):** lietotājs izvēlējās Netlify, bet jāizmēra Free 300 kredītu mēneša patēriņš, nevis jāpieņem neierobežota pieejamība.
- **Q-032/Q-033 (atvērti):** Netlify Blobs Beta, ilgtermiņa retence un ārpus-konta šifrēta kopija ar atjaunojamu atslēgu.
- **Q-034 (jauns):** vai privātam organizācijas repozitorijam bezmaksas privāts CI/API deploy ir atļauts un praktiski pierādīts, nepalielinot piekļuves riskus?
- **Q-035 (jauns):** kāda ir pieņemamā Supabase Free sezonālā apturēšanas procedūra un brīdinājumi; nepieņemt, ka Netlify vietnes pieejamība nozīmē datubāzes pieejamību.

**Izvēlēta platforma nav atvērts jautājums:** `DEC-035` ir CONFIRMED; atvērtas paliek tās ieviešanas, pieejamības un backup detaļas.
