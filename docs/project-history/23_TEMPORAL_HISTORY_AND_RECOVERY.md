# Vēsturiskais stāvoklis, loģiska atgriešana un katastrofu atjaunošana

**Versija:** v0.1.1 / 2026-11-25. **Statuss:** arhitektūras priekšlikums + lietotāja vēlmes; **nav implementēts**. Avots: `SRC-CHAT-TIME-TRAVEL`; prasības: `REQ-033..039`, esošā `REQ-024`.

## 1. Lietotāja mērķis, bez tehnoloģiju priekšnosacījumiem
Administrators izvēlas datumu un pulksteni, apskata, kas zināms inventarizācijā un cik liela ir bilance izvēlētajā brīdī. Katalogs turpina augt gan no inventarizācijas ievadē konstatētām jaunām precēm, gan no apstiprinātām pavadzīmēm. Vienlaikus jāspēj atgūt datus pēc kļūmes, nezaudējot arī kontu un tiesību informāciju. Nedrīkst iepriekš piesiet šo prasību Supabase specifiskam produktam.

## 2. Trīs savstarpēji neatkarīgas spējas

| Spēja | Patiesības avots | UI | Ko tā NErisina |
|---|---|---|---|
| Auditējams append-only ledger | Atsevišķi, nemaināmi biznesa notikumi | Ieraksta vēsture, izcelsme | Neizglābj no visas primārās DB zuduma |
| Time Travel / as-of projekcija | Notikumi un šim brīdim spēkā esošās cenu/kataloga versijas | Admin tikai-lasāms datums + laiks | Nav fiziska DB restore/backup |
| Īsts backup/restore | Atsevišķā kļūmju domēnā reproducējams arhīvs, sistēmas atkarības | Operacionāla atjaunošana, ne parasts "atsaukt" | Pats par sevi nedod biznesa notikumu auditu |

Papildu **state snapshot** ir *atvasināts* starprezultāts, kuru var pārrēķināt no ledger: tas paātrina retrospektīvas atskaites, bet nav atsevišķa rezerves kopija.

## 3. Kāpēc nepaļauties uz rezerves shēmu tajā pašā DB?
PostgreSQL ietvaros var izveidot atsevišķu `archive` vai `snapshots` shēmu un kopēt tur tabulas vai aprēķinātus starpstāvokļus. Tas ir izmantojams diagnostikai vai ātrdarbībai. Tomēr tai ir tā pati primārās DB fiziskā kļūmju vide, administratīvās piekļuves un migrāciju kļūdu risks. Ja projekts/datubāze pazūd vai priviliģēts process sabojā abas shēmas, kopija nepalīdz.

Papildu pasākums ir atsevišķs, piekļuves ziņā izolēts, atjaunojams eksports/backup ārpus primārās DB. Nozīme ir neatkarīgam kļūmju domēnam un pārbaudītai atjaunošanai, **ne obligāti konkrētai platformai**.

## 4. Minimālie nemaināmie biznesa notikumi (kandidāti)
- `inventory.entry_created`, `inventory.entry_replaced`, `inventory.entry_voided` (katrs pievienojums atsevišķs; labojums mērķē loģiskā ieraksta versiju).
- `catalogue.product_created`, `catalogue.variant_created`, `catalogue.price_recorded`, `catalogue.barcode_linked`, `catalogue.variant_retired` — iepriekšējā kataloga versija saglabājas.
- `invoice.batch_uploaded`, `invoice.batch_validated`, `invoice.batch_approved`, `invoice.catalogue_changes_applied` — avots un idempotence.
- `user.profile_changed`, `user.role_changed`, `user.deactivated` un identitātes nemainīgs aktora ID; paša autentifikācijas pakalpojuma mehānika jārisina atsevišķi.
- `inventory.year_opened`, `inventory.year_closed`, `inventory.year_reopened` un fiksēta noslēguma eksporta identitāte.

Ne katram notikumam jābūt vienā fiziskā tabulā. Obligāts ir konsekvents atjaunošanas noteikums, izcelsmes saites un pārbaudāma secība. Produkta/cenas korekcijām nedrīkst klusām pārrakstīt iepriekšējo finanšu rezultātu.

## 5. Divi atšķirīgi laiki; lietotājam svarīga semantika
- **Reģistrēšanas laiks (`recorded_at`)**: kad notikums tika apstiprināts sistēmā; servera laiks, ne telefona pulkstenis.
- **Biznesa spēkā esamības laiks (`effective_at`)**: uz kuru brīdi korekcija, piegāde vai cena *attiecas*, arī ja to ievada vēlāk.

Tāpēc iespējami **divi dažādi** vēsturiskās bilances jautājumi:
1. **"Ko 10:30 tajā brīdī zinājām?"** Ignorēt notikumus, kas reģistrēti pēc 10:30.
2. **"Kā tagad vērtējam situāciju uz 10:30, ņemot vērā 12:00 ievadītu precizējumu?"** Vēlākais precizējums var ietekmēt rezultātu, ja tas attiecas uz agrāku laiku.

Tas ir bitemporālas datu modelēšanas jautājums (`Q-018`). Pirmajam ekrānam iesakāms **"kā toreiz bija zināms"**, bet precīzu atskaites cenu izvēli un retroaktivitātes noteikumus apstiprina atsevišķi. Jānoskaidro arī, vai inventarizācijas ieraksts glabā fiksētu cenu versiju (`Q-022`).

### Demonstrācijas scenārijs (izdomāti dati, NAV vecās sistēmas fakti)
| Sistēmā apstiprināts | Notikums | Skats uz 10:30 | Skats uz 11:30 |
|---|---|---|---|
| 10:00 | Ievadīts 12 gab. preces A | 12 | — |
| 11:00 | Ieraksts A labots uz 10 gab. | Iepriekšējā vērtība 12 | 10 |
| 11:15 | Pavadzīmes imports reģistrē jaunu preci B | B vēl neeksistē | B eksistē |

Ja B pieejamā cena mainās pēc 11:30, tas **nedrīkst** automātiski pārrakstīt skata "kā zinājām 11:30" bilanci. Vai tas drīkst mainīt retrospektīvu pārrēķinu, ir atsevišķi apstiprināms lēmums.

## 6. Deterministiska laika atlase
- Katram notikumam: nemainīgs notikuma ID, tips, aktora ID, servera laiks, stabila loģiskās vienības versija, idempotences `request_id`, avota ID, iepriekšējās versijas saite.
- Konsistentai bilancei nepieciešams **viens saskaņots darījuma griezums** starp inventarizācijas, katalogu, pavadzīmju un izmaksu notikumiem; atšķirīgu tabulu nolasījumi atsevišķos brīžos var radīt neiespējamu starpstāvokli.
- Timestamp un iepriekš piešķirts auto-increment ID **nav automātiski commit secība** konkurējošās transakcijās. Jāizprojektē uzticams izpildes/saistības secības mehānisms vai konsekvents datubāzes snapshots (`Q-021`).
- Vēsturiskā skatā nav atļautas mutējošas darbības; uzskatāmi norāda datumu, laika zonu, inventarizācijas gadu, aprēķina režīmu un izmantotā notikumu griezuma identifikatoru.
- Admina vēsturiskajā ekrānā eksporta identifikators/versija var ļaut atkārtoti iegūt vienādu grāmatvedisku rezultātu.

## 7. "Atgriezt" ≠ dzēst jaunākos notikumus
- *Pārlūkot vēsturi* var droši uzreiz, tas neveic nekādu `UPDATE`/`DELETE`.
- *Atgriezt aktīvo stāvokli* ir atsevišķa augsta riska biznesa komanda. Priekšlikums: salīdzinājums **pirms/pēc**, atlasīti mērķa ieraksti, iemesls, tiesību pārbaude, apstiprinājums un **jauni kompensējoši notikumi**. Vēlākās likumīgās izmaiņas nedrīkst automātiski pazust.
- *Disaster restore/PITR* ir infrastruktūras avārijas darbība; tā var izmest visus primārās DB vēlākos ierakstus, nevar būt parasta kalendāra pogas funkcija. Ja atjaunošanā nepieciešams salīdzinājums, atjaunot **atsevišķā instancē** un salīdzināt ar produkciju.

Atliek izlemt, vai masveida "atgriešana" vispār ir nepieciešama (`Q-019`).

## 8. Taupīga datu saglabāšana
No nemaināmiem notikumiem stāvokli var pārrēķināt. Lai nolasīšana būtu ātra, drīkst uzturēt `state_snapshots`/projekcijas reizi N notikumos, perioda slēgšanā vai noteiktā laikā, ar atskaites high-water mark un hash. Snapshots nav jauns biznesa patiesības avots un ir dzēšami/pārbūvējami, nezaudējot ledger.

**Rezerves kopijām** var izvēlēties: pilns bāzes backups + inkrementālas izmaiņu kopijas / WAL / citu uzticamu mehānismu; periodisks pilns kontrolpunkts. Inkrementālā ķēde ir derīga tikai, ja **visas tās daļas** saglabātas un pārbaudīta atjaunošana. Nedrīkst pieņemt, ka lietotnes biznesa event log automātiski ietver DDL, lomas, politikas, autentifikācijas stāvokli, slepenos iestatījumus vai failu krātuvi.

## 9. Kas ietilpst katastrofu atjaunošanas tvērumā?
- RAW inventarizācijas un kataloga notikumi, pavadzīmju importa izejas dati un atvasinājumu atjaunošanas algoritms.
- DB shēma, migrācijas, nepieciešamās funkcijas, autorizācijas politikas/RLS/grants.
- Kontu identitātes, lietotāju profili, deaktivizācijas/lomu vēsture; atbilstoša autentifikācijas pakalpojuma atjaunošanas procedūra.
- Pavadzīmju faktiskie augšupielādētie faili, ja tos glabā objektu krātuvē, ne tikai metadati.
- Lietotnes servera izvietošanas konfigurācija un drošā veidā glabātas atslēgas/sekrēti (atsevišķā aizsargātā mehānismā, ne dump).
- Backupa laiks, integritātes hash, versija, atjaunošanas atskaites punkts, piekļuves/retences politika un regulāri atjaunošanas testi.

**Supabase specifisks fakts, kas nav vispārīgs arhitektūras ierobežojums:** oficiālie DB backup neietver pašus Storage objektus; tikai to metadatus. Pieejamība/retence/PITR ir plāna un konfigurācijas jautājums. Avots: https://supabase.com/docs/guides/platform/backups .

## 10. Piekrišanas robežas un pieņemšanas pārbaudes
- **Lietotāja apstiprināta vēlme:** vēsturisks datuma/laika skats ar bilanci; katalogs papildināms no inventarizācijas un pavadzīmēm; platforma nav uzspiežama par agru.
- **Jautājums, ne apstiprinājums:** rezerves shēma Supabase iekšienē; backup tvēruma minimālā forma.
- **Ierosināts, vēl nav apstiprināts:** bitemporālas projekcijas, kompensējoši atgriešanas notikumi, transakciju high-water mark, inkrementāla ārējā backup retence, lietotāju auth atjaunošanas metode.
- Testi: `TC-034..040`; atvērtie jautājumi: `Q-018..023`. Testi šobrīd NAV izpildīti.

## 11. Avoti
- Lietotāja formulējums: `docs/sources/USER_CHAT_MESSAGES.md`, `SRC-CHAT-TIME-TRAVEL`.
- Vispārīgs Event Sourcing: https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing
- Supabase backup / PITR un Storage tvērums: https://supabase.com/docs/guides/platform/backups
