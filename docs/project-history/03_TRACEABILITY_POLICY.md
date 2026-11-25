# Lietotāja inputa un funkciju motivācijas izsekojamība

## Mērķis
Pēc 20 vai 200 iterācijām jāspēj atbildēt: **kurš prasīja**, **ko precīzi prasīja**, **kāpēc vajadzēja**, **kā iztulkoja**, **kurš lēmums to apstiprināja**, **kur kods to realizē**, **kurš tests to pārbauda** un **kā tā uzvedība mainījās**.

## Avoti — nemaināmi
`docs/sources/USER_INPUT_REGISTER.json` satur **visu 18 Word komentāru tekstus bez labojumiem**, ar kārtu, Word comment ID, datumu un piesaistītā paragrāfa fragmentu. Sākotnējās sarunas atslēgas frāzes ir īpaši atzīmēti fragmenti, nevis pilns transkripts. Jaunās sarunās ieteicams saglabāt precīzu lietotāja ziņu jaunā `SRC-CHAT-...` ierakstā.

Avotus nedrīkst rediģēt retrospektīvi. Ja lietotājs maina domas, izveido jaunu avotu, atjauno prasības statusu un lēmuma `supersedes` lauku. Vecais paliek vēsturē.

## Saikņu ķēde
`SRC-R2-C7` (foto nav jāglabā) → `REQ-016` → `DEC-006` → `TC-021` → nākotnes `src/features/scanner/...` kods → `CHANGE-...` ieraksts → testēšanas pierādījums.

## Katra jauna uzdevuma minimums
- Prasībai: `REQ-ID`, nozīme, lietotāja formulējums (saite), statuss, pieņemšanas kritērijs, drošības ietekme, alternatīvas.
- Lēmumam: `DEC-ID`, datums, statuss, priekšvēsture, argumentācija, alternatīvas, sekas, `supersedes`.
- Koda izmaiņai: commit/PR, skartie `REQ`, `DEC`, `TC`, DB migrācijas, atpakaļatcelšanas plāns.
- Testam: ievade, sagaidāmais rezultāts, faktiskā pārbaude, izpildes vide un pierādījums.

## Statusi
- `CONFIRMED_BY_USER`: lietotājs nepārprotami definējis vajadzību.
- `PREFERENCE_NOT_FINAL`: lietotājs izteicis izvēles priekšroku, bet nav pieņēmis galīgo tehnisko lēmumu.
- `PROPOSED_NEEDS_CONFIRMATION`: asistenta piedāvājums ar saderību pret lietotāja prasību; nav finalizēts.
- `UNDER_INVESTIGATION`: nepieciešama algoritma vai datu izpēte.
- `DEFERRED`: vēlākā iterācijā.
- `LEGACY_OBSERVED`: secināts no vecās sistēmas koda; nav automātiski prasība jaunajai sistēmai.

## Kontroles noteikums
Reģistrētā prasība ar statusu `CONFIRMED_BY_USER` **nav tas pats**, kas apstiprināts konkrēts SQL dizains, komponentu bibliotēka vai algoritms. Implementācijas izvēlei bieži vajadzīgs atsevišķs `DEC`.

## v0.1.1 jauns avots
`SRC-CHAT-TIME-TRAVEL` satur pilnu lietotāja ziņu par vēsturisku datuma/laika bilanci, kataloga papildinājumiem, kontu atjaunošanu un platformneatkarīgām backup idejām. To izmanto `REQ-033..039`, `DEC-015..020`, `TC-034..040`, `Q-018..023`. Neatvasināt "jautā par backup shēmu" par "jāimplementē backup shēma".

## v0.1.2 — precīzā piezīmju pārņemšana
Pievienoti avoti `SRC-CHAT-PRICE-YEAR` un `SRC-CHAT-HOST-CONSOLIDATION` (visas lietotāja ziņas **verbatim**), sasaistīti ar `REQ-015/023/024/040..047`, `DEC-021..027`, `TC-041..048`. `DEC-024` dokumentē koda novērojumu, `DEC-026/027` ir piedāvājumi. Pamatprincips: nedrīkst pārveidot veco cenu algoritmu uz "pēdējais uzvar", ja nav testu un lietotāja biznesa apstiprinājuma.
