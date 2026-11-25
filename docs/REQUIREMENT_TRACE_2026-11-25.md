# Lietotāja ievades izcelsme / prasību izsekojamība, turpinājums 2026-11-25

Iepriekšējie sākotnējie komentāri un izmaiņu lēmumi atrodas `project-history/sources/USER_CHAT_MESSAGES.md` un `project-history/02_REQUIREMENTS.md`. Šis fails papildina, nevis aizstāj iepriekšējo izcelsmes žurnālu. Formulējums zemāk ir lietotāja citāts (nav aģenta pieņēmums).

| ID | Lietotāja norāde | Lēmums / ieviešana | Statuss |
|---|---|---|---|
| REQ-055 | “Par interfeisu... Lietotāji jau gadiem pieraduši pie manējā desktop interfeisa.” | Saglabāt darba plūsmu un tabulas principu darbvirsmā; izveidot responsive adaptāciju. | Pirmā UX realizācija |
| REQ-056 | “Kā minimums varētu būt 2 nodaļas: datu ievade un katalogs.” | Darbiniekiem divas galvenās sadaļas. | Ieviesuši UI |
| REQ-057 | “Tad adminam būtu arī trešā sadaļa - statistika un ceturtā - administrācija.” | Administratoram četras sadaļas, RLS servera kontrolē. | UI un SQL realizācija; dzīvā lomu pārbaude NAV veikta |
| REQ-058 | “Aplikācijas valoda - latviešu.” | Latvian UI. | Ieviesuši UI |
| REQ-059 | “Papildus izdod atsevišķu dokumentu ar visiem kataloga izveidošanas un preču pievienošanas, rediģēšanas un dzēšanas nosacījumiem.” | `Gramatvedibas_un_kataloga_noteikumu_audits_v0.2.0.docx`, 35 pārskatāmi lēmumi. | Izveidots; grāmatveža akcepts NAV saņemts |
| REQ-060 | “Github būs privātajā repozitorijā” | Personīgā konta privāts repozitorijs; privātie dati atsevišķā ZIP. | Paredzēts; kontā NAV augšupielādēts |
| REQ-061 | “Aiziet! Radi aplikāciju.” | V0.2.0 pirmās versijas PWA / Supabase SQL / Netlify Functions. | Pirmkods izveidots; izvietošana NAV veikta |
| REQ-062 | “Izmanto esošo datubāzi ar tās datiem. VĒlēšos salīdzināt tos.” | Ielasīt tieši sākotnējos 67 819 + 5 980 ierakstus, saglabāt sākotnējās vērtības, kontrolēt katra gada summas. | Lokāli pārbaudīts; Supabase imports NAV veikts |
| REQ-063 | “Svarīgi! Jau pirmajā versijā radi datu drošu arhitektūru.” | Append-only, RLS, audita RPC, idempotence, servera tiesības; privātu datu neievietošana publiskā būvē. | Pirmkodā; pilna drošības atestācija NAV veikta |
| REQ-064 | “Un datu korektumu no grāmatvedības viedokļa.” | NUMERIC un BigInt, saglabāta vēsturiskā matemātika, 2 aritmētikas izņēmumi un 6 grupas ar mērvienību kolīzijām; grāmatveža noteikumu audits. | Lokāla pārbaude sekmīga, grāmatveža lēmums NAV saņemts |

## Dokumentācijas disciplīna

Ja kāda prasība mainās: nekad neizdzēsiet veco ID; pievienojiet jaunu lēmumu ar vecā ID un jaunās prasības sasaisti, testa numuru, pārbaudes pierādījumu un laiku. Jebkurš neizpildīts tests paliek atsevišķi norādīts līdz faktiska rezultāta iegūšanai. Versija 0.2.0 nav produkcijas versija.
