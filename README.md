# Inventarizācija — v0.2.1 (izstrādes kandidāts)

**Latviska, responsive PWA** uzņēmuma ikgadējai inventarizācijai. Izvēlētā arhitektūra: **privāts personīgais GitHub repozitorijs + Netlify + Supabase PostgreSQL/Auth**.

Šī ir **darbojoša lokāla vēsturisko datu apskates versija** un **tiešsaistes rakstīšanas arhitektūras sākotnējā realizācija**. Tā NAV sertificēta vai atļauta produkcijas uzskaites versija: Supabase migrācija, RLS ar diviem reāliem lietotājiem, datu atjaunošana un grāmatvedības noteikumi vēl jāpārbauda testvidē. **Neizmantojiet izstrādes kandidātu kā vienīgo grāmatvedības uzskaites sistēmu.**

## Faili, kurus lejupielādēt

1. `inventarizacija_app_v0.2.1.zip` — **tikai kods un dokumentācija**, drīkst likt **privātajā GitHub** (pēc pārbaudes).
2. `inventarizacija_privatie_dati_v0.2.1.zip` — **konfidenciālie īstie vēsturiskie dati**. **Nekad** neievietot GitHub, Netlify publicējamajā mapē vai publiskā URL. Saglabāt šifrētā uzņēmuma krātuvē.
3. `Gramatvedibas_un_kataloga_noteikumu_audits_v0.2.1.docx` — atsevišķi rediģējams grāmatvedības noteikumu apstiprināšanas dokuments.

## Tūlītēja vēsturiskās datubāzes apskate uz datora

Priekšnosacījumi: instalēts **Node.js 22+** vai **Python 3**. Nav nepieciešams Supabase konts.

1. Atarhivēt lietotnes pirmkodu datora mapē.
2. Atarhivēt konfidenciālo datu arhīvu **citā, drošā mapē**.
3. Terminalī lietotnes mapē izpildīt `npm run build`, tad `cd dist` un `python -m http.server 8765` (Windows ar `py -m http.server 8765`). Alternatīvi: servēt mapi `site`, jo neiestatīts publiskais `config.js` darbojas tikai lasīšanai.
4. Pārlūkā atvērt `http://localhost:8765`.
5. Spiest **Atvērt vēsturiskā eksporta JSON**, izvēlēties **`legacy_snapshot.json`** no privātās mapes.
6. Izmantot **Datu ievade**, **Katalogs**, **Statistika**, **Administrācija**. Šajā lokālajā režīmā visas darbības ir **tikai lasāmas**; neviena datubāze netiek rakstīta vai atjaunota.

**Piezīme:** faila izvēle neievieto privātos datus Netlify būvē vai GitHub; pārlūks tos apstrādā lokāli. Neatveriet failu svešā, nepārbaudītā vietnē un neveidojiet publiski pieejamu ZIP no konfidenciālajiem datiem.

## Galvenās sadaļas

- **Datu ievade**: vecajam ieradumam tuva darbvirsmas tabula, meklēšana, grupēšana, individuālās rindas; ierīcēm pielāgota mobilā saskarne.
- **Katalogs**: preču un cenu variantu meklēšana; admin papildus labo, pievieno un loģiski paslēpj variantu.
- **Statistika** (admin): PZ, PL, atšķirība, datuma/laika skats (pilna vēsturiskā izsekojamība tikai jaunajām darbībām pēc importa).
- **Administrācija** (admin): gads, izveidot/atslēgt lietotāju; pavadzīmju automātiska importa funkcija **vēl nav ieslēgta**, līdz grāmatvedis apstiprinās algoritmu.

## Salīdzināšana ar sākotnējo MySQL eksportu

Arhīvs satur **67 819** inventarizācijas ierakstus (2018–2025) un **5 980** kataloga rindas. Exact Decimal kontroles: `python3 tests/verify_historical.py`. Visu gadu summas, skaits un grupas sakrīt. Divas aritmētiskās neatbilstības un sešas jauktas mērvienību grupas **netiek klusi labotas**. Skatīt `docs/ACCOUNTING_COMPARISON.md`.

## Izvietošana tiešsaistē

Skatīt `docs/INSTALL_AND_DEPLOY.md` un `docs/SECURITY_AND_PRODUCTION_GATE.md`. Netlify `Build command`: `node scripts/build_site.mjs`; `Publish directory`: `dist`. Pārlūka konfigurācijā drīkst būt **tikai Supabase public/anon atslēga**, nevis `service_role`. Sākotnējā MySQL arhīva paroles netiek pārnestas.

## Kur turpināt darbu nākamam aģentam

Pirmais fails: [`AGENTS.md`](AGENTS.md). Tad `docs/IMPLEMENTATION_STATUS.md`, `docs/REQUIREMENT_TRACE_2026-11-25.md`, `docs/catalogue_accounting_rules.md` un `docs/project-history/`.

Versijas kods `v0.2.1` nozīmē pirmo kandidātu, nevis produkcijas izlaidumu.

## Lietotājvārdi bez e-pastiem

V0.2.1 darbiniekiem izmanto tikai lietotājvārdu un paroli. Admin lietotājus veido tieši, bez ielūgumu e-pastiem. Supabase Auth iekšēji joprojām izmanto tehnisku aliasu — to nedrīkst uzskatīt par īstu darbinieka e-pasta adresi. Skatīt `docs/GITHUB_SUPABASE_USERNAME_SETUP.md`. Produkcijas testi vēl NAV veikti.
