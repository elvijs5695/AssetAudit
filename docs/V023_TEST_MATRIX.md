# v0.2.3 — pārbaudes matrica (2026-11-25)

| ID | Prasība | Pārbaude | Rezultāts | Pierādījums / ierobežojums |
|---|---|---|---|---|
| TC-066 | Viena UI ar 5 sadaļām | Desktop 1440px / mobile 390px ar reālo JSON read-only | PASS | `tests/e2e_smoke.py`; pārlūks Chromium |
| TC-067 | Staff tikai 3 sadaļas | simulēts staff klienta konts | PASS MOCK | Nav īsta Supabase JWT/RLS testa |
| TC-068 | Meklēt katalogā, ne inventarizācijā | meklēšana un klikšķis uz kataloga varianta | PASS | Browser smoke, divu cenu aizpildīšana |
| TC-069 | Skeneris (precīza atbilstība) | manuāli ievadīts skenētais kods, atpazīts/neatpazīts | PASS MOCK | Fiziska kamera/BarcodeDetector Android NAV testēts |
| TC-070 | Daudzuma +/− un manuālā ievade | web forma | PASS | Desktop/mobile, 2,50 formāta saglabāšana |
| TC-071 | Servera append-only submit payload | stubbed RPC, viens notikuma pieprasījums | PASS MOCK | Reāls Supabase transactional/idempotence tests NAV veikts |
| TC-072 | Supabase e-pasts / paroles servera funkcija | Node mocked auth/admin, tiesības | PASS MOCK | Vēl jāpārbauda live secret API key un Supabase Auth |
| TC-073 | RLS, RAW nemainīgums, lomu izolācija | statiskā SQL skriptu analīze | PASS STATIC | Reāli divu lietotāju testi NAV veikti |
| TC-074 | Finanšu decimāldaļas un Rīgas laiks | BigInt/time tests | PASS | `npm run test:math` |
| TC-075 | Vēsturisko datu atbilstība | vecā/jaunā kontrolsummu/daudzumu tests | PASS LOCAL | 67 819 + 5 980, 8 gadi; 2 aritmētikas izņēmumi + 6 mērvienību kolīzijas paliek |
| TC-076 | Migrācija 004 | reāls Supabase PostgreSQL SQL Editor | NOT RUN | Atjauninājums tikai sagatavots |
| TC-077 | 2 kontu RLS pozitīvie/negatīvie testi | Live Supabase ar JWT | NOT RUN | Produkcijas bloķētājs |
| TC-078 | Netlify Functions + Supabase Auth | live API key saderība | NOT RUN | Produkcijas bloķētājs |
| TC-079 | Backup un pilns restore | neatkarīgs atjaunošanas tests | NOT RUN | Produkcijas bloķētājs |
| TC-080 | Grāmatvedības noteikumu audits | 35 noteikumu DOCX apstiprinājums | NOT RUN | Lietotājs apzināti atlika |
| TC-081 | Kamera mobilajā ierīcē | īstā ierīce, EAN/Code128 | NOT RUN | Nav pārlūka native / fallback garantijas |

**NO-GO:** 004 migrācija, dzīvie autentifikācijas un RLS testi, neatkarīga backup/restore pārbaude un finanšu metodikas apstiprinājums nav pabeigti. Neizmantot kā uzņēmuma vienīgo uzskaites vidi.
