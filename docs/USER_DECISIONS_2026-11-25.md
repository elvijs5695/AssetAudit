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
