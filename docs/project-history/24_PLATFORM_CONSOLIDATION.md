# Vienotas izvietošanas un backup platformas izvērtējums

**Datums:** 2026-11-25. **Statuss:** salīdzinājums, NE galīgais arhitektūras lēmums. **Lietotāja avots:** `SRC-CHAT-HOST-CONSOLIDATION`, papildus `SRC-CHAT-PRICE-YEAR`. Prasības `REQ-023`, `REQ-024`, `REQ-045..047`; testi `TC-046..048`.

## Galvenais apsvērums
Lietotājs nevēlas četrus pastāvīgus pakalpojumus (GitHub + Supabase + Cloudflare + vēl backup). Vēlamais mērķis ir **Git privātam pirmkodam** + **viena online aplikācijas platforma**, kas nodrošina PWA/SPA, servera API, DB, autentifikāciju un rezerves kopiju krātuvi. Citi pakalpojumi var būt tikai retiem offline atjaunošanas eksporta gadījumiem.

**Terminoloģija:** GitHub nav datubāzes hostinga platforma šim projektam. Privāta repozitorija saturs nav automātiski privāts izvietotās vietnes saturs. Tikai autentifikācija un servera lomu pārbaude pasargā privātos datus.

## Kandidāti pēc 2026-11-25 dokumentācijas

| Variants | Regulāri izmantotie pakalpojumu sniedzēji | Plusi | Riska faktori | Statuss |
|---|---|---|---|---|
| GitHub + **Cloudflare**: Workers/Pages + D1 + Access + R2 | 2 | Vienota app, DB, auth-gateway, privāts backup; nav novērota Supabase/Appwrite septiņu dienu neaktivitātes pauze; D1 7 d. operatora PITR Free, R2 10 GB bezmaksas kvota | D1 ir SQLite, ne PostgreSQL: stingra monetārā/fiksēta mēroga aritmētika jāveido apzināti; 500 MB vienai DB Free; 5 M rows read/dienā, 100 000 written/dienā; 10 ms Worker CPU; R2 jāaktivizē abonements un jāuzrauga norēķini; viens konts nav pilnīgi neatkarīgs backup | **Kandidāts** |
| GitHub + **Appwrite Cloud**: Sites + DB + Storage + Auth | 2 | Integrēta PWA hostēšana, konti, DB, fails | Free var apturēt pēc 7 d. neaktivitātes; automātiskie daily backups Pro, ne Free; parastais Free TablesDB nav tā pati PostgreSQL NUMERIC arhitektūra, PostgreSQL piedāvāts kā dedicated paid compute | Kandidāts ar kompromisiem |
| GitHub + **Supabase** + Cloudflare Pages | 3 | PostgreSQL NUMERIC/DECIMAL, RLS un izstrādāti auditēšanas mehānismi | Supabase Free var pauzēt; Free nav automātisko backup; trešais piegādātājs PWA izvietošanai | Alternatīva, ja SQL precizitāte/administrēšana atsver platformu skaitu |
| GitHub + Firebase Hosting + Firestore + Storage | 2 | Vienota ekosistēma un auth | Nav SQL/DECIMAL semantikas, relāciju ledger projektēšana sarežģītāka; Cloud Storage nepieciešams Blaze pay-as-you-go abonements | Zemāka prioritāte |

## Cloudflare kandidāta mērķa topoloģija

```text
Privāts GitHub (pirmkods, doki; bez produkcijas datiem/atslēgām)
    |
    v
Cloudflare
    Workers + static assets / Pages -> PWA (desktop + Android pārlūks)
        | Access / autentifikācija, server-side RBAC un API kontrole
        v
    D1 (append-only ledger, cenas, katalogs, lietotāju references)
        |
        +-- Operatora D1 Time Travel (7 dienas Free: destruktīva pilna DB restore)
        |
        +-- Scheduled D1 SQL export (API/Workflow/Cron) -> privāts R2 bucket
                           | checksum + versiju saglabāšana + bucket lock
                           v
             Neregulāra šifrēta offline ārpus-konta kopija
```

*R2 nav publisks pēc noklusējuma.* Nav jāieslēdz `r2.dev` public access vai publiskais custom domain. Ar R2 minimālas privilēģijas API tokenu veic tikai backup funkciju; tokenus nedrīkst nosūtīt PWA klientam. R2 bucket lock var aizliegt nejaušu dzēšanu/nomainīšanu saglabāšanas periodā, bet konta pārņemšana vai paša pakalpojuma problēma joprojām apdraud gan D1, gan R2.

**Svarīgi:** Cloudflare D1 Time Travel operators atjauno *visu* DB, pārrakstot pašreizējo stāvokli. Tas NAV lietotāja prasītais administratora tikai-lasāmais vēsturiskās bilances ekrāns. Biznesa Time Travel darbojas ar append-only notikumiem un cenu versijām.

## Precizitātes izvēles vārti (Cloudflare D1)
1. D1 pamatā ir SQLite ar atšķirīgu skaitļu tipu sistēmu nekā PostgreSQL NUMERIC; nekad nepaļauties uz `REAL` naudas vērtībām.
2. Izvērtēt **mērogotu INTEGER** (piem., EUR centi, daudzums simtdaļās/tūkstošdaļās) ar drošiem diapazoniem vai decimālo virkņu bibliotēku serverī; `BigInt` neizmantot bez precīzi definētas JSON serializācijas.
3. Fiksēt biznesa noapaļošanas politiku (atsevišķam vienumam, grupai vai gala kopsummai) un salīdzināt ar vēsturiskajiem 2018–2025 datiem.
4. Testēt paralēlu lietotāju ievadi, idempotenci, vienotu inventarizācijas + katalogu notikumu atomiskumu, anti-tamper un autorizācijas robežas.
5. Testēt 5 M lasītu / 100 000 rakstītu DB rindu dienā, 10ms Worker CPU limitu un datu izmēru; intensīvas inventarizācijas laikā limiti var apturēt reālu darbu.
6. Testēt automatisētu privāto backup eksportu aktīvās noslodzes laikā: D1 eksports ar API var īslaicīgi bloķēt datubāzi. Veikt to ārpus intensīvās inventarizācijas laika.

Bez šo vārtu iziešanas nedrīkst dokumentēt Cloudflare kā galīgi izvēlētu produkcijas arhitektūru.

## Backup un maksājumu riski
- R2 10 GB bezmaksas kvota nav tas pats, kas garantēta 0 EUR rēķina maksimālā summa: aktivizē R2 abonementu un lietošanas pārsniegums var būt maksas.
- Cloudflare norēķinu nosacījumos ir īpaši norādīts: neatbilstoša maksājumu metode var pārtraukt R2 piekļuvi, un nepārvarētas problēmas gadījumā dati var tikt dzēsti pēc 30 dienām. Tātad vienkārši "Cloudflare ir bezmaksas" nav pietiekams katastrofu atjaunošanas plāns.
- Ieteikt: dienas / inventarizācijas cikla eksporti privātā R2, šifrēti ar atsevišķi pārvaldītu atslēgu, checksum, nosaukuma versija, atjaunošanas manifests; ikmēneša vai inventarizācijas posmu ārpus-konta kopija uz uzņēmuma šifrētu disku vai citu kontrolētu krātuvi; regulārs pilns atjaunošanas tests.
- Eksporta un rezerves kopiju iekļautās atkarības: ledger, katalogs, importu metadati, lietotāju profili/lomas, auth identitātes un sesiju atjaunošanas process, datubāzes migrācijas, konfigurācija un jebkuri Storage faili. D1 SQL exports nesaglabā Cloudflare Access politikas, Worker secrets un Git kodu.

## Kādus piegādātāju limitus avoti pamato
- Cloudflare D1 Free: max 500 MB vienai DB, 5 GB/account, 7 dienu PITR, 5M reads/100k writes per day. Saites: https://developers.cloudflare.com/d1/platform/limits/ un https://developers.cloudflare.com/d1/platform/pricing/ un https://developers.cloudflare.com/d1/reference/time-travel/
- Cloudflare R2 Free allowance: 10 GB-month, 1M Class A un 10M Class B operāciju mēnesī: https://developers.cloudflare.com/r2/pricing/
- R2 privāts pēc noklusējuma: https://developers.cloudflare.com/r2/buckets/public-buckets/
- D1 SQL eksports un iespējamā pakalpojuma īslaicīga bloķēšana: https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/export/
- D1→R2 automatizācija: https://developers.cloudflare.com/workflows/examples/backup-d1/
- Cloudflare Access Free līdz ~50 lietotājiem: https://www.cloudflare.com/plans/zero-trust-services/
- R2 norēķinu pieejamības risks: https://developers.cloudflare.com/billing/understand/billing-policy/
- R2 bucket lock: https://developers.cloudflare.com/r2/buckets/bucket-locks/
- Appwrite Free/Pro 2026: https://appwrite.io/pricing ; https://appwrite.io/products/sites
- Supabase Free pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase backups: https://supabase.com/docs/guides/platform/backups
- Firebase Storage Blaze: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024

*Šī ir publiskās dokumentācijas pārbaude; kontu aktivizēšana, cenu pārsniegšana, produkcijas slodze un atjaunošana nav testēta.*

## 2026-11-25 kvantitatīvais papildinājums
No SQL dump `preces` ir 6 331 2025 gada rindas, pīķis 740/d un 7/min (skat. `26_ANNUAL_LOAD_AND_CAPACITY.md`). Tas nav augsts ievades intensitātes līmenis; **optimizācijas prioritāte ir DB rows_read**, jo `precu_katalogs` jau satur ~5 980 rindas un atsevišķu burtu meklēšana ar pilnu skenēšanu var iztērēt 5M Free kvotu. Lēmums par Cloudflare nav apstiprināts. Nodrošināt `meta.rows_read`, `meta.rows_written`, indeksu/FTS plānu un periodisko backup `size_after` telemetriju pirms pieņemšanas.


## v0.1.4 NEW CANDIDATE -- 3-provider split (user suggestion)
Instead of the earlier 2-provider Cloudflare D1 proposal, the user asked about **GitHub private source + Cloudflare Workers static assets/API + R2 private encrypted backups + Supabase PostgreSQL/Auth**. This is three providers rather than four; no separate backup SaaS. Benefits: retain PostgreSQL's exact numeric type/transactable ledger/RLS, avoid D1 daily database rows-read accounting, isolate backup storage outside Supabase. Risks: Supabase Free inactivity pausing still applies, Workers Free CPU budgets still apply to API endpoints, R2 activation/billing still applies, GitHub Action scheduled jobs can be late/missed, and the Auth/roles restore scope is not covered by default CLI SQL dump. **Candidate only**; read `docs/27_HYBRID_CLOUDFLARE_SUPABASE.md`, especially TESTS TC-052..056. Earlier D1-focused estimates remain relevant **only** to the D1 alternative.
