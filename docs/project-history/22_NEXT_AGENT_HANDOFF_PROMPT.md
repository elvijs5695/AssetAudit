# Gatavs teksts nākamā čata/aģenta sākumam

Šo tekstu var iekopēt jaunajā čatā **kopā ar dokumentācijas ZIP** vai repozitorija izvilkumu:

> Turpini inventarizācijas sistēmas modernizācijas projektu. Pirms jebkāda koda rakstīšanas izlasi `AGENTS.md`, `docs/00_START_HERE.md`, `docs/18_PROJECT_STATUS.md`, `docs/04_DECISIONS.md` un `docs/sources/USER_INPUT_REGISTER.json`. Projekta absolūtā prioritāte ir auditējami nemainīgi RAW uzskaites notikumi un precīza grāmatvediska salīdzināmība. V1 darbojas tikai online; svītrkodu kamera neglabā foto; UI apkopo atsevišķus pievienojumus; vēsture tiek rādīta administratora izvēles režīmā. Vecā cenu prioritāte NAV apstiprināta: vispirms skaties `docs/07_LEGACY_CATALOGUE_AUDIT.md` un `Q-001..Q-006`. Neveic destruktīvus SQL, datu migrācijas, izvietošanu vai produkcijas datu izmaiņas bez atsevišķas manas atļaujas. Visām izmaiņām pievieno `REQ`/`DEC`/`TC` un lietotāja `SRC` sasaisti; beigās atjauno stāvokļa un testu žurnālu. Dokumenti ir sākotnējā specifikācija, ne gatava aplikācija.

## Ja nākamajam aģentam nav sākotnējā ZIP
Viņš joprojām var projektēt no šīs dokumentācijas, taču **nevar pārbaudīt oriģinālā koda vai datubāzes saturu** un nedrīkst apgalvot, ka viņš personīgi to pārskatījis. Kad nepieciešama precīza re-auditēšana, nodod privāto avota kopiju drošā veidā un pārbaudi SHA-256 pret `docs/19_SOURCES_AND_EVIDENCE.md`.

## Ja aģents nolemj mainīt funkcijas nozīmi
Viņš nedrīkst pārfrāzēt vai izdzēst oriģinālo lietotāja iemeslu. Jāizveido jauns lēmums, jānorāda iepriekšējais lēmums, jāieraksta tests un jāsaņem lietotāja apstiprinājums, ja tiek skarts katalogs, daudzums, cena, gada slēgšana vai autorizācija.

## v0.1.1 ievērībai
Pirms lemšanas par arhitektūru atver `docs/23_TEMPORAL_HISTORY_AND_RECOVERY.md` un `SRC-CHAT-TIME-TRAVEL`. Lietotājs vēlas as-of bilanci, bet detalizēta cenas/rollback semantika nav apstiprināta. Supabase nedrīkst pieņemt par obligātu backup/glabāšanas arhitektūras limitu.

## v0.1.2 jauns pārtveršanas noteikums
Vispirms izlasi `24_PLATFORM_CONSOLIDATION.md` un `25_LEGACY_PRICE_AND_YEAR_RULES.md`. Lietotājs negrib atsevišķas četras pastāvīgas platformas. Cloudflare ir kandidāts, bet vēl nav apstiprināts; neatkāpies no grāmatvediskās precizitātes pretī ērtākai hostēšanai. Vecais `index.php` pievienoja precīzu cenu variantu un dzēsa 0 PL marķieri tikai noteiktos apstākļos — NEPIEDĒVĒ tam vispārēju last-write-wins. Lietotājs pieprasa divus gada brīdinājumus, tukšu koda atļauju, brīdinājumu (ne aizliegumu) 0 cenu ievadei, un pilnu izcelsmes izsekošanu. Skat. `REQ-040..047`, `DEC-021..027`, `TC-041..048`.


## v0.1.4 handoff warning
Read `docs/27_HYBRID_CLOUDFLARE_SUPABASE.md` and original user suggestion `SRC-CHAT-HYBRID-STACK`. Do NOT assume Cloudflare D1 was chosen, or that the cloud hybrid has been approved: user asked whether Cloudflare app/R2 + Supabase PostgreSQL is a better compromise. The answer is an evaluated candidate. Full DB restore requires Auth/users/roles and configuration, not just an inventory CSV. No cloud tests run. Evaluate seasonally paused Supabase Free and scheduled CI reliability before any deployment.


## v0.1.5 NOTE FOR NEXT AGENT
The user accepts Supabase but objects to Cloudflare billing activation. The former hybrid R2 backup candidate must NOT be treated as accepted. Evaluate Netlify Free + private Blobs Beta as a three-provider candidate with GitHub and Supabase and no automatic financial exposure. Start with `docs/28_NO_BILLING_PLATFORM_OPTION.md`, `REQ-051/052`, `DEC-032..034` and `TC-057..060`. Confirm Netlify Free deployment integration for personally vs organization-owned private GitHub repositories; never present untested Beta backup storage as guaranteed disaster recovery. Do not ask to add payment details or activate a cloud subscription without explicit user approval.


## v0.1.6 — tūlītējais papildinājums pārņemšanas promptam

Ievieto nākamā aģenta sākotnējā uzdevumā šādu teikumu: **„Lietotājs jau ir galīgi izvēlējies Netlify + Supabase + GitHub (SRC-CHAT-STACK-SELECT, DEC-035, REQ-053). Neatgriezies pie Cloudflare/D1 kandidātu izvēles bez jauna lietotāja pieprasījuma. Netlify Blobs ir tikai pārbaudāms backup kandidāts, ne apstiprināta vienīgā recovery kopija. Vispirms skati docs/29_SELECTED_STACK_IMPLEMENTATION_GATE.md; pārbaudi privātā GitHub repozitorija īpašnieka tipu un Free izvietošanu. Nepieņem, ka kāds serviss jau ir uzstādīts.”**
