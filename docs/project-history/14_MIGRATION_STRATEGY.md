# Droša migrācija no vecās PHP + MariaDB sistēmas

**Statuss:** plāns; nav veikta migrācija. Esošie dati nedrīkst tikt mainīti.

## 1. Saglabāt juridiski/finansiāli nozīmīgo avotu
- Izveidot jaunu, datētu un pārbaudāmu vecās sistēmas DB snapshot; oriģinālo arhīvu turēt atsevišķi.
- Aprēķināt avotu SHA-256; pārbaudīt ZIP/SQL integritāti un ka nav nejauši publicētu paroļu/backup.
- Konfidenciālus datus glabāt tikai šifrētā vietā, ne repo; izstrādei izmantot anonimizētas fikstūras.
- Pierakstīt vecā koda versiju un datubāzes dump datumu; nekad neuzskatīt tos par vienu un to pašu, ja starpība nav pārbaudīta.

## 2. Precīzi nofiksēt veco pārskatu semantiku
- Izrēķināt atsevišķi katram gadam RAW rindu skaitu, grupu skaitu, daudzumu kopsummas pa vienībām, PZ/PL summas un bilanci.
- Izanalizēt `FLOAT`/`DOUBLE` un šā brīža saglabāto summu atšķirības no precīzas `NUMERIC` aritmētikas.
- Identificēt `GROUP BY` nošķīrumus, īpaši `kase`, cenu varianti un `vienibas`.
- Vecās sistēmas kļūdas dokumentēt kā izņēmumus; **nepārnest** kļūdas kā nepārbaudītu jauno normu.

## 3. Veidot jauno shēmu tikai testu vidē
- Atdalīt datu izcelsmi, produktu identitātes, katalogu un inventarizācijas notikumus.
- Vecās rindas importēt kā migrētus sākotnējā stāvokļa notikumus ar `source_system`, `legacy_record_id`, `source_dump_hash` un `migration_batch_id`.
- Ja vecajā sistēmā labojumu vēsture jau pārrakstīta, **neizdomāt** trūkstošos notikumus. Atzīmēt `history_unavailable_before_migration`.
- Nodrošināt idempotentu, atkārtojamu migrācijas procesu ar rezultātu hash; nevajag ruļļot produkciju uz testa datiem.

## 4. Salīdzināšana
- Automātiski aprēķināt `legacy vs modern` pa gadiem: RAW rindas, grupējumi, summas, noapaļošana, atlikumi, izņēmumi.
- Katru atšķirību klasificēt: kļūda vecajā kodā, jauns apstiprināts noteikums, migrācijas kļūda, neatrisināts.
- Līdz administratora pieņemšanai neuzskatīt jauno sistēmu par autoritatīvu.

## 5. Pārslēgšana
- Tikai pēc RLS testiem, backup/restore izmēģinājuma, parallel-run rezultātiem, admina akcepta un atgriešanās plāna.
- Noteikt precīzu pēdējo vecās sistēmas rakstīšanas brīdi un migrācijas atkārtošanas nepieciešamību.
- Pēc cutover vecā sistēma tikai lasīšanai; datu integritātes incidents aptur pārslēgšanu.

## Nekādu klusējošu datora migrācijas izpildi
Šis fails nav atļauja palaist datubāzes migrāciju, dzēšanu vai reset; to var veikt tikai pēc saskaņota plāna, rezerves kopijām un atsevišķas lietotāja autorizācijas.
