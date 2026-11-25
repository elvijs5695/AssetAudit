**AKTUĀLAIS LĒMUMS v0.1.6 (2026-11-25):** lietotājs izvēlējās **Netlify + Supabase + GitHub** (`SRC-CHAT-STACK-SELECT`, `DEC-035`, `REQ-053`). Izlasi `docs/29_SELECTED_STACK_IMPLEMENTATION_GATE.md`. Vecie Cloudflare un Netlify candidate ieraksti ir vēsture; **Netlify Blobs** kā vienīgā backup vieta NAV apstiprināta. Nekādas produkcijas vides/testi vēl nav izveidoti. Šis ieraksts ir jaunāks un pārāks par vēsturiskajām rindām zemāk.

# AGENTS.md — Inventarizācijas sistēmas modernizācija

**Statuss:** dokumentācijas sākotnējā versija v0.1.1 (2026-11-25). Šajā pakotnē NAV jaunās aplikācijas implementācijas.

## Aģenta obligātā darba secība
1. Izlasi `docs/00_START_HERE.md`, `docs/18_PROJECT_STATUS.md`, `docs/02_REQUIREMENTS.md`, `docs/04_DECISIONS.md`.
2. Pārbaudi `docs/sources/USER_INPUT_REGISTER.json` un saistītos prasību `REQ-xxx` numurus. Oriģinālie lietotāja komentāri ir autoritatīvāki par asistenta interpretāciju.
3. Apskati `docs/16_OPEN_QUESTIONS.md` un `docs/15_WISHLIST.md`; nenoslēgtus lēmumus nepārvērt par apstiprinātām prasībām.
4. Pirms koda izmaiņām izveido darba uzdevuma plānu ar `REQ-xxx`, `DEC-xxx` un `TC-xxx` saitēm.
5. Mainot funkciju, papildini lietotāja motivāciju, lēmuma ierakstu, testu, lietošanas instrukciju, atvērto jautājumu statusu un `docs/17_CHANGE_AND_RELEASE_PROTOCOL.md` žurnālu.
6. Pēc izmaiņām atzīmē **patiešām izpildītos** testus; nepieraksti veiksmīgus testus vai izvietošanu, kas nav veikti.

## Patiesības hierarhija
- Jauns nepārprotams lietotāja lēmums > senāks lietotāja lēmums > šī dokumentācija kā interpretācija > vecās PHP sistēmas novērotā uzvedība > asistenta pieņēmums.
- Ja prasības konfliktē, saglabā abas ar `supersedes` saiti un prasi precizējumu pirms bīstamas ieviešanas.
- Cena, noapaļošana, gadu slēgšana un dublikātu noteikšana: nekādas klusās biznesa noteikumu maiņas.

## Nekad bez īpašas atļaujas
- Nedarbināt vecos PHP failus, SQL skriptus, destruktīvus `TRUNCATE`/`DELETE` vai migrācijas pret aktīvu datubāzi.
- Nekopēt uz GitHub uzņēmuma inventarizācijas SQL, lietotāju paroles, reālus preču datus, `.env`, piekļuves atslēgas, rezerves kopijas vai vecās sistēmas `includes/config.php`.
- Nepieņemt, ka 2026. gada arhīvs ir aktīvās datubāzes pēdējā kopija.
- Neizdzēst vai nepārrakstīt RAW notikumus, arī pēc labošanas/dzēšanas.
- Neizmantot `FLOAT`/`DOUBLE` naudas grāmatvedībai; neiestatīt produkcijā RLS bez negatīviem lietotāju piekļuves testiem.
- Neuzskatīt PWA UI slēptu elementu par autorizācijas kontroli.
- Neizmantot skenētu svītrkodu kā vienīgo preces cenas noteicēju; nesaglabāt fotogrāfijas.

## Neminēt, bet atzīmēt
Lieto statusus `CONFIRMED_BY_USER`, `PREFERENCE_NOT_FINAL`, `PROPOSED_NEEDS_CONFIRMATION`, `UNDER_INVESTIGATION`, `DEFERRED`, `LEGACY_OBSERVED`. Arhitektūras shēmas ir piedāvājumi, nevis ieviesta infrastruktūra.

## Prioritātes
1) Datu precizitāte / nemainīgums; 2) servera drošība un rezerves kopijas; 3) uzticama inventarizācija un kataloga gada plūsma; 4) skenēšana un ergonomika; 5) analītika / offline nākotnē.

## Nodošana citam aģentam
Katras sesijas beigās atjauno `docs/18_PROJECT_STATUS.md`: paveikts, nav paveikts, testēts, nav testēts, risks, nākamās darbības, izmantotās avotu versijas. NEAPGALVO, ka fails ir pastāvīgi saglabāts ārpus šīs pakotnes, ja nav faktiski augšupielādēts repozitorijā.

## v0.1.1 īpaši kritiski
- Lasīt `docs/23_TEMPORAL_HISTORY_AND_RECOVERY.md` pirms rakstīt vēsturisko datu vaicājumus, backup/restore un "atgriezt" interfeisu.
- Nošķirt: **vēsturiska apskate**, **kompensējošs biznesa notikums**, **katastrofas DB restore**. Tās nav vienas pogas alternatīvas.
- `SRC-CHAT-TIME-TRAVEL` ir autoritatīva izcelsmes saite; lietotāja jautājums par iekšēju backup shēmu nav rīkojums tādu ieviest.
- Saglabāt sistēmu platformneatkarīgi projektējamu; Supabase/GitHub šobrīd ir vēlamie kandidāti, ne obligātas arhitektūras robežas.

## v0.1.2 papildus obligātie norādījumi aģentiem
**Pirms jebkādas cenu, kataloga vai gada brīdinājuma refaktorizācijas** pārbaudi `docs/25_LEGACY_PRICE_AND_YEAR_RULES.md`. Lietotājs skaidri pieprasīja neizgudrot no jauna gadu laikā atstrādāto algoritmu. Nezināms PL pavadzīmju importā ≠ manuāli ievadīta 0.00; tukšs kods ir atļauts; 0 cenas tikai brīdina. Platformu izvēlē dod priekšroku `docs/24_PLATFORM_CONSOLIDATION.md` aprakstītajai vienas app platformas iecerei, bet nekad neupurē datu precizitāti un privātumu kvotu vai ērtuma dēļ. Parakstīti/testēti backup un faktiski atjaunošanas testi nepieciešami pirms produkcijas. Saglabā precīzu lietotāja ziņu un izmaiņu izcelsmi.

## v0.1.3 — mērījumi pret platformas pieņēmumiem
Pirms izvēlēties Cloudflare D1 Free vai projektēt kataloga auto-search, izlasi `docs/26_ANNUAL_LOAD_AND_CAPACITY.md`. 2025 gadā ir tikai 6331 saglabātas inventarizācijas rindas, bet pilna kataloga skenēšana vairākas reizes uz vienu ievadi potenciāli pārsniedz **5 miljonus rows_read/dienā**. Neaizstāj hipotētiskos query-scan aprēķinus ar apgalvojumu par patieso produkcijas slodzi; nav veikti D1, konkurences vai tīkla testi. Atkārto auditu ar `tools/annual_workload_audit.py` tikai privātajā vidē.


## v0.1.4 -- architecture candidate and backup discipline
Read `docs/27_HYBRID_CLOUDFLARE_SUPABASE.md` before creating any hosting or backup service. The user suggested (not definitively selected) `Cloudflare PWA/API + R2 private encrypted backup + Supabase PostgreSQL/Auth + private GitHub`. Do not use Cloudflare D1 by default. Cloudflare Workers are not conventional `pg_dump` runners; for full logical backup, evaluate a scheduled GitHub Actions job using official Supabase restore flow, with auth/role coverage and secrets guarded against untrusted PRs. Never assume Supabase Free will stay awake outside inventory season, or that a job succeeded because a timer fired. Test full database and Auth restoration from R2 with synthetic data before handling production data. All linked tests TC-052..056 are NOT_RUN.


**Latest provider preference (2026-11-25, v0.1.5):** User objects to Cloudflare R2 billing subscription, not Supabase. Do not activate billing or ask for a payment card without the user's explicit separate choice. Netlify Free + Netlify Blobs (Beta) is a research candidate, NOT an accepted stack; see `docs/28_NO_BILLING_PLATFORM_OPTION.md`, REQ-051/052, DEC-032..034, TC-057..060. Keep data privacy, loss recovery and repository provenance paramount.
