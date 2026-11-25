# Lietotāja autentifikācijas un platformu lēmumu avoti — 2026-11-25

Šie ir lietotāja vārdi, nevis aģenta interpretācija. Izmaiņas drīkst papildināt, bet nedrīkst pārrakstīt bez izsekojama lēmuma.

**REQ-065 — darbinieku pierakstīšanās**

> Es nevēlos e-pasta reģistrēšanās principu. Administrators piešķir unikālu lietotājvārdu un paroli, tas arī viss. Aplikāciju lietos mazs, ciešs kolektīvs, e-pastu apstiprināšana šo nevajadzīgi sarežģīs.

**REQ-066 — Supabase sagatavošanas instrukcija**

> Un kā tas mainīs Supabase sagatavošanas instrkciju?

**REQ-067 — Supabase/GitHub versiju integrācija**

> Kā arī vēlos saslēgt supabase kopā ar github

**Izpildes saturs:** username/password saskarne; admins veido kontus bez uzaicinājuma; unikāls username datubāzē; GitHub integrācija migrāciju versijām. **Nav piešķirtas ārējo pakalpojumu piekļuves tiesības, nav veikta īsta pieslēgšana**, nav izpildīta Supabase migrācija, nav atļauta ražošana.

**Aģenta tehniska izvēle, vēl jāpārbauda:** iekšēja Supabase Auth e-pasta alias `username@accounts.inventory.invalid`; nav darbinieka e-pasts. Ja Supabase to neatbalsta, izmanto serverī uzturētu alias kartējumu ar uzņēmuma pārvaldītu domēnu; nedrīkst izmantot patvaļīgu reālas personas e-pastu.

**Lēmums par GitHub:** Integrācija ar privātu personīgo repo; neieslēgt automātiskas ražošanas migrācijas bez testiem. Neaktivizēt GitHub OAuth kā darbinieku pieslēgšanos.


## v0.2.3 — nākamie precīzie lietotāja lēmumi (nemainīt tekstu)

**SRC-CHAT-EMAIL-AUTH-V023**

> Labi, pierunāji. Pārejam uz e-pastu sistēmu.

**SRC-CHAT-RLS-APPROVAL-V023**

> Labi, pierunāji.

**SRC-CHAT-UI-V023**

> OK, komentāri:
>
> Izvairies no mārketinga saukļiem un noformējuma. Aplikācija ir funkcionāla. Pieturies pie minimāla dizaina, minimāla teksta, izvairies no nevajadzīgiem paskaidrojumiem. Fokuss uz datiem.
>
> Pie sadaļām - Datu ievade; Preču saraksts (ievadītie invetarizācijas dati); Katalogs; Statistika; Administrācija
>
> Pie datu ievadēm, meklētājs atgriež kataloga ierakstus, nevis inventarizācijas ierakstu datus. Pašlaik izskatās, ka atgriež pašus inventarizācijas ierakstus. Un tad, uzspiežot uz kataloga ieraksta, tas aizpilda datu ievades laukus. Līdz ar ko, tas nozīmē, ka kaut kur pašiem datu laukiem jābūt (paskati oriģinālo aplikāciju, kādi datu lauki pie ievades nepieciešami).
>
> Un tad pie datu meklēšnas jābūt lielai pogai, kas aizved uz kameru un koda skenēšanu. Kolīdz kamera atpazīst kodu, uzreiz tiek pārmeklēta datubāze uz konkrēto svītru kodu, ja atpazīst kataloga ierakstu pēc svītru koda, tad aizpilda visus datu laukus. Ja ne, tad aizpilda tikai svītru koda lauku. Tad, ir kases izvēle un preču daudzums. Daudzums ērti maināms ar + un - vai ievadāms manuāli, ja uzspiež uz paša cipara. Tad vēl ir mērvienības. Tiešām - paskati orīgnālo aplikāciju.

Sasaistes: REQ-068..075; TC-066..081; `docs/UI_FLOW_V023.md`, `docs/V023_TEST_MATRIX.md`, `site/js/app.js`, `site/js/api.js`, `supabase/migrations/202611250004_email_auth.sql`.
