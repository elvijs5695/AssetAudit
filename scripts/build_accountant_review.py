#!/usr/bin/env python3
"""Create Latvian accountant approval document from the versioned machine-readable rules."""
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT,WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'/'Gramatvedibas_un_kataloga_noteikumu_audits_v0.2.0.docx'
RULES=[
('KAT-01','Gada identitāte','Konfigurācijā norādīts viens aktīvais inventarizācijas gads. Ja skatītais vai kalendāra gads atšķiras no konfigurētā, rādāms pamanāms brīdinājums; rakstīšanu neatbilstošajā skatā bloķē serveris.','Saskaņot kā jaunās sistēmas obligātu kontroli.','index.php: gada izvēle, warningRed; app_config / inventory_submit','APSTIPRINĀTS LIETOTĀJA'),
('KAT-02','Pārnešana no iepriekšējā gada','Iepriekšējā gada inventarizācijas unikālās kombinācijas (kods, nosaukums, PZ cena, PL cena) veido nākamā gada kataloga sākotnējos kandidātus.','Apstiprināt, vai pārnesamas tieši šīs četras pazīmes; daudzumi netiek pārnesti.','db2temp.php; dokumentacija.docx','NOVĒROTS'),
('KAT-03','Gada kataloga izveide nav vienreizēja','Pēc gada sākuma katalogam var atkārtoti pievienot jaunas pavadzīmes, neaizvietojot jau apstiprinātu vēsturi.','Jaunā sistēma lieto staging, priekšskatījumu un transakcionālu apstiprināšanu.','cat2temp.php; importExcel.php; lietotāja komentāri','APSTIPRINĀTS LIETOTĀJA'),
('KAT-04','Pavadzīmes informācijas robežas','Pavadzīmes ievade sniedz kodu, nosaukumu un PZ cenu; plaukta cena tajā nav zināma. Vecais imports PL laukā ievada 0,00.','Jaunajā katalogā šo nezināmo PL cenu reprezentēt kā NULL, nesajaucot ar lietotāja ievadītu 0,00.','importExcel.php; lietotāja 2026-11-25 precizējums','APSTIPRINĀTS LIETOTĀJA'),
('KAT-05','Nulles pavadzīmes cena importa posmā','Vecais createCatalogue.php izdzēš importa rindas, kur PZ cena ir 0,00, pirms kataloga izveides.','Lēmums: vai jaunajā importā šādas rindas noraidīt, karantinēt vai atļaut ar brīdinājumu?','createCatalogue.php','JĀLEMJ'),
('KAT-06','Dublikātu identificēšana gada katalogā','Vecā noslēdzošā atlase grupē pēc (kods, nosaukums, PZ cena), nevis PL cenas; tā var apvienot dažādu PL cenu variantus.','Pirms jaunā algoritma apstiprināt precīzu vēlamo identitātes atslēgu un PL cenas izvēles prioritāti.','createCatalogue.php; 37 konfliktu grupas SQL eksportā','JĀLEMJ'),
('KAT-07','Nenoteiktā PL prioritāte','Vecajā GROUP BY atlases rezultātā negrupētā PL cena nav deterministiski izvēlēta. MAX(id) negarantē pārējo lauku atbilstību šim ID.','Nevienu automātisku “pēdējā cena uzvar” algoritmu neaktivizēt, pirms grāmatvedis to apstiprinājis.','createCatalogue.php; docs/07_LEGACY_CATALOGUE_AUDIT.md','JĀLEMJ'),
('KAT-08','Kataloga izveides priekšskatījums','Vecais process iztukšo visu precu_katalogs un veido no jauna.','Jaunajā versijā pirms apstiprināšanas rādīt jaunas, saglabātas, aizstājamas un konflikta rindas; neizpildīt destruktīvu TRUNCATE.','createCatalogue.php; lietotāja komentāri','APSTIPRINĀTS LIETOTĀJA'),
('KAT-09','Kataloga versiju saglabāšana','Kataloga papildināšana, labošana un slēpšana tiek uzskaitīta ar jaunām versijām. Neizdzēst iepriekšējās zināmās vērtības.','Apstiprināt append-only modeli.','Jaunās sistēmas prasība; catalogue_events','APSTIPRINĀTS LIETOTĀJA'),
('KAT-10','Preces kods nav obligāts','Vecajā datubāzē 11 208 inventarizācijas rindas un 1 081 kataloga rinda ir bez preces koda.','Tukšu preces kodu pieļaut; neveikt automātisku dažādu preču apvienošanu tikai tādēļ, ka kods ir tukšs.','SQL eksports; lietotāja precizējums','APSTIPRINĀTS LIETOTĀJA'),
('KAT-11','Precīza kataloga varianta identitāte','Ievadot vai labojot preci, vecā aplikācija meklē precīzu (kods, nosaukums, PZ cena, PL cena) variantu.','Ja precīzs variants jau pastāv, neveidot otru. Jālemj, vai atsevišķs svītrkods maina identitāti.','index.php, pievienošana un labošana','NOVĒROTS'),
('KAT-12','Jauna varianta pievienošana no inventarizācijas','Vecais kods jaunam inventarizācijas ierakstam katalogu papildina tikai, ja updateDatabase=1; labojumam pārbaudi veic vienmēr.','Jaunajā versijā pēc katras ievades vienā servera transakcijā pārbaudīt katalogu un vajadzības gadījumā pievienot variantu. Tā ir APZINĀTA uzvedības atšķirība.','index.php, values.php; inventory_submit','JĀLEMJ'),
('KAT-13','Nezināmās plaukta cenas aizstāšana','Ja vecajā katalogā ir (kods, nosaukums, PZ, PL=0) un tiek ievadīts jauns variants ar zināmu nenulles PL, vecais kods pievieno jaunu un dzēš nulles variantu.','Jaunajā katalogā PL=NULL placeholder loģiski paslēpt ar notikumu, bet atstāt vēsturē.','index.php: INSERT + DELETE no precu_katalogs','NOVĒROTS'),
('KAT-14','Vecās zināmās cenas saglabāšana','Ja identiskam kodam/nosaukumam/PZ jau ir PL=12,00, ievadot PL=15,00, vecais kods saglabā abus variantus.','Neieviest piespiedu vienas pēdējās PL cenas pārrakstīšanu bez saskaņojuma.','index.php, novērotā darbība','NOVĒROTS'),
('KAT-15','Svarīgs placeholder robežgadījums','Ja precīzs variants jau ir katalogā, vecais kods neiztīra atsevišķo PL=0 placeholder, jo tīrīšana notiek tikai jauna varianta pievienošanas atzarā.','Vai jaunajā sistēmā vienmēr iztīrīt atbilstošu NULL placeholder, pat ja precīzais variants jau pastāv?','index.php; docs/25_LEGACY_PRICE_AND_YEAR_RULES.md','JĀLEMJ'),
('KAT-16','Lietotāja manuāla 0,00 cena','Precei parasti nav 0,00 EUR cenas; lietotājs tomēr drīkst ievadīt 0,00.','Jābrīdina pirms saglabāšanas; nedrīkst aizliegt un nedrīkst pārinterpretēt kā “nav zināma”.','Lietotāja 2026-11-25 precizējums','APSTIPRINĀTS LIETOTĀJA'),
('KAT-17','Svītrkoda izcelsme','Skenējot pazīstamu kodu, sistēma atrod atbilstošo kataloga variantu; nezināmu var piesaistīt jaunai ievadītai precei.','Svītrkods nepasaka cenu; vairākām katalogā esošām cenu pozīcijām var būt viens svītrkods.','Lietotāja sākotnējās prasības; catalogue_events','APSTIPRINĀTS LIETOTĀJA'),
('KAT-18','Datu korekcijas katalogā','Esošas inventarizācijas rindas labošana vecajā kodā var pievienot jaunu katalogam precīzu cenu variantu; labojums neatjaunina iepriekšējo varianta ID.','Atšķirt kataloga varianta papildināšanu no inventarizācijas RAW korekcijas; saglabāt abas notikumu vēstures.','index.php; inventory_submit / catalogue_events','NOVĒROTS'),
('KAT-19','Kataloga paslēpšana vai dzēšana','Pašreizējā sistēma dažkārt izdzēš kataloga variantus, bet jaunos datos dzēst nedrīkst.','Administratora “Noņemt no kataloga” izpilda versiju ar statusu hide, nevis fizisku DELETE.','index.php; katalogs; append-only princips','JAUNS PRIEKŠLIKUMS'),
('KAT-20','Kataloga manuāla rediģēšana','Administrators drīkst labot preces nosaukumu, kodu, cenas un svītrkodu.','Labojums veido jaunu kataloga versiju; vēsturiskās inventarizācijas cenas netiek pārrakstītas.','Lietotāja prasības; catalogue_change','APSTIPRINĀTS LIETOTĀJA'),
('INV-01','Inventarizācijas atsevišķās ievades','Viena prece var būt ievadīta vairākas reizes. Vecajā atskaitē tās grupē pēc koda, nosaukuma, abām cenām un kases.','Saglabāt katru individuālo ievadi un attēlot grupas kopsummu; detaļās atvērt katru ievadi.','output.php; lietotāja komentāri','APSTIPRINĀTS LIETOTĀJA'),
('INV-02','Mērvienība nav vecā grupējuma atslēgā','Vecā sistēma kopā grupē vienādu kodu/nosaukumu/cenas/kases rindas pat, ja atšķiras mērvienība. Atrastas 6 šādas grupas.','Grāmatvedim izlemt, vai jaunajā grupējumā iekļaut mērvienību; līdz lēmumam veco rezultātu saglabāt salīdzināšanai.','output.php; neatkarīgais 2026-11-25 audits','JĀLEMJ'),
('INV-03','Finanšu rindas aprēķins','Vecajā sistēmā PZ/PL summas tiek iegūtas kā round(daudzums × cena, 2) pie ievades un labošanas.','Jaunajiem ierakstiem serverī lietot precīzu NUMERIC un skaidri apstiprinātu 2 decimāļu noapaļošanu.','index.php; SQL numerical types','JĀLEMJ'),
('INV-04','Vēsturisko summu saglabāšana','Migrācija saglabā tieši SQL eksportā esošo summu, nevis automātiski pārrēķina katru rindu.','Vienlaikus aprēķina neatbilstību ziņojumu; neaizstāt vecās summas bez atsevišķa grāmatveža akta.','reconciliation_verified.json; migration SQL','APSTIPRINĀTS KĀ IMPORTA DROŠĪBA'),
('INV-05','Divi aritmētikas izņēmumi','ID 514 (2018) PZ summa 0,68 pret reizinājuma 0,75; ID 20375 (2019) 2,07 pret reizinājuma 2,06.','Grāmatvedim pārbaudīt vēsturisko dokumentu un noteikt, vai veidot atsevišķu kompensējošu korekciju.','tests/verify_historical.py','JĀLEMJ'),
('INV-06','Labojumu vēsture','Vecajā aplikācijā UPDATE pārrakstīja rindu, un pilnu agrāko versiju vēsturi atgūt nevar.','Jaunā labošana pievieno jaunu revīziju; aktīvajā summā skaita tikai pēdējo revīziju.','index.php; inventory_events','APSTIPRINĀTS LIETOTĀJA'),
('INV-07','Dzēšana un anulēšana','Vecajā aplikācijā DELETE fiziski izdzēsa inventarizācijas ierakstu.','Jaunajā sistēmā anulēšana ir īpašs notikums (void); vēsturiskā rinda un tās autorība saglabājas, bet aktīvajā bilancē vairs nepiedalās.','index.php; inventory_submit','APSTIPRINĀTS LIETOTĀJA'),
('INV-08','Ievades anulēšanas ietekme uz katalogu','Vecajā kodā dzēšot inventarizācijas rindu, katalogs automātiski netika labots.','Jaunā sistēmā void neizdzēš kataloga pozīciju. Jāapstiprina, vai nepieciešams papildu brīdinājums.','index.php delete atzars','NOVĒROTS'),
('INV-09','Datu validācija','Kods var būt tukšs, bet nosaukums, daudzums un cenas jāpārbauda serverī; datu veidi un precizitāte nekad nav jāuztic tikai pārlūkam.','Saskaņot mērvienības, negatīvu daudzumu, 0 daudzuma un cenu robežgadījumus.','Lietotāja prasības; inventory_submit','JĀLEMJ'),
('INV-10','Bilances definīcija','Vecajā sistēmā starpība = SUM(PL summas) − SUM(PZ summas), katrā gadā summējot glabātās rindu summas.','Grāmatvedim apstiprināt nosaukumu “bilance” un vai šī formula atbilst oficiālajam uzskaites rādītājam.','index.php / output.php; docs/11_FINANCIAL_RULES.md','JĀLEMJ'),
('INV-11','Lietotāju piekļuves','Lietotāji redz preču cenas un var ievadīt/labot preces, bet kopsavilkuma bilance un vēsturisko izmaiņu audits ir tikai administratoram.','Nodrošināt tiesības serverī; neatspoguļot bilanci staff RPC.','Lietotāja prasības; admin_stats','APSTIPRINĀTS LIETOTĀJA'),
('INV-12','Vēsturiskās bilances brīdis','Administratoram jāvar apskatīt, ko sistēma zināja konkrētā laikā. Pirms migrācijas pilna notikumu vēsture nav pieejama.','Atšķirt vēsturisko apskati no fiziskas rezerves kopijas vai stāvokļa atgriešanas.','Lietotāja prasības; admin_stats(p_asof)','APSTIPRINĀTS LIETOTĀJA'),
('INV-13','Rēķinu/krājumu cenu izcelsme','PZ cena rodas pavadzīmē; PL cena kļūst zināma inventarizācijas laikā.','Katalogam saglabāt importēto cenu avotu, laiku un katru atsevišķu variantu; nezināma PL nav 0.00.','Lietotāja 2026-11-25 skaidrojums','APSTIPRINĀTS LIETOTĀJA'),
('INV-14','Vēsturiskie laiki un darbību autori','Vecais eksports satur ierobežotu izveides/labošanas laiku un lietotāju laukus; iepriekš pārrakstītas vērtības nav rekonstruējamas.','Migrācijas notikumu laiku nošķirt no sākotnējā ieraksta laika. Jauno darbību laiks tikai no servera.','legacy_import.sql; inventory_events','APSTIPRINĀTS KĀ IMPORTA DROŠĪBA'),
('INV-15','Importa salīdzināšanas kontroles','Importējamajiem 2018–2025 datiem jāsakrīt rindām, grupām, daudzumiem un glabātajām PZ/PL summām par katru gadu.','Ja kāda kontrole neiziet, importu atcelt vienā transakcijā; neatļaut automātiski izlīdzināt starpības.','tests/verify_historical.py; legacy_import.sql','APSTIPRINĀTS KĀ IMPORTA DROŠĪBA'),
]
sections=[('A. Gada kataloga sagatavošana',RULES[:9]),('B. Preču identitāte un kataloga uzturēšana',RULES[9:20]),('C. Inventarizācijas ievade, labošana, dzēšana un bilance',RULES[20:])]
( ROOT/'docs'/'catalogue_accounting_rules.json').write_text(json.dumps([{'id':a,'title':b,'observed_or_requirement':c,'proposed_review':d,'evidence':e,'state':f,'decision':None,'correction':None} for a,b,c,d,e,f in RULES],ensure_ascii=False,indent=2),encoding='utf-8')
md=['# Kataloga un inventarizācijas noteikumi — audits v0.2.0','', '> Šis ir grāmatvedes apstiprināšanai paredzēts projekts, nevis apstiprināta metodoloģija.','']
for section,items in sections:
 md.append('## '+section);md.append('')
 for id,title,obs,proposed,source,status in items:
  md.extend([f'### {id} — {title}',f'**Statuss:** {status}',f'**Esošā uzvedība / prasība:** {obs}',f'**Audita jautājums / jaunā uzvedība:** {proposed}',f'**Pamatojums:** {source}','**Lēmums:** ☐ Apstiprināt  ☐ Koriģēt  ☐ Atlikt','**Korekcija:** ________________________',''])
(ROOT/'docs'/'catalogue_accounting_rules.md').write_text('\n'.join(md),encoding='utf-8')
doc=Document();sec=doc.sections[0];sec.top_margin=Inches(.75);sec.bottom_margin=Inches(.7);sec.left_margin=Inches(.78);sec.right_margin=Inches(.78)
styles=doc.styles;styles['Normal'].font.name='Aptos';styles['Normal'].font.size=Pt(9.5);styles['Normal'].font.color.rgb=RGBColor(29,47,40)
styles['Normal'].paragraph_format.space_after=Pt(5)
for style,size,bold,color,spbefore,spafter in [('Title',21,True,(21,66,52),0,9),('Heading 1',13,True,(24,91,66),12,7),('Heading 2',10.5,True,(26,76,57),8,4)]:
 st=styles[style];st.font.name='Aptos Display' if style=='Title' else 'Aptos';st.font.size=Pt(size);st.font.bold=bold;st.font.color.rgb=RGBColor(*color);st.paragraph_format.space_before=Pt(spbefore);st.paragraph_format.space_after=Pt(spafter)
header=sec.header.paragraphs[0];header.text='INVENTARIZĀCIJAS SISTĒMA  /  NOTEIKUMU AUDITS';header.style='Caption';header.runs[0].font.color.rgb=RGBColor(83,120,102)
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT;footer.add_run('v0.2.0 · 25.11.2026 · Izskatīšanai ar grāmatvedi')
def shade(cell,fill):
 tcPr=cell._tc.get_or_add_tcPr();sh=OxmlElement('w:shd');sh.set(qn('w:fill'),fill);tcPr.append(sh)
def pad(cell):
 tc=cell._tc;pr=tc.get_or_add_tcPr();m=OxmlElement('w:tcMar');
 for side in ('top','start','bottom','end'):
  item=OxmlElement('w:'+side);item.set(qn('w:w'),'110');item.set(qn('w:type'),'dxa');m.append(item)
 pr.append(m)
def write_cell(cell,label,content):
 cell.text='';p=cell.paragraphs[0];r=p.add_run(label);r.bold=True;r.font.size=Pt(8);r.font.color.rgb=RGBColor(36,91,67)
 p2=cell.add_paragraph(content);p2.paragraph_format.space_after=Pt(0)
 for r in p2.runs:r.font.size=Pt(9)
 pad(cell);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
doc.add_heading('Kataloga un inventarizācijas noteikumu audits',0)
p=doc.add_paragraph('Pārskatāms apstiprināšanas un koriģēšanas dokuments grāmatvedībai');p.style='Subtitle'
p=doc.add_paragraph();p.add_run('Versija: ').bold=True;p.add_run('0.2.0   ');p.add_run('Datums: ').bold=True;p.add_run('25.11.2026   ');p.add_run('Noteikumi: ').bold=True;p.add_run(str(len(RULES)))
doc.add_heading('Lietošanas kārtība',1)
for line in ['Katram noteikumam izvēlieties “Apstiprināt”, “Koriģēt” vai “Atlikt” un nepieciešamības gadījumā ierakstiet precizējumu.','Formulējumi atšķir novēroto vecās PHP/MySQL sistēmas uzvedību no ieteiktajiem jaunās sistēmas principiem. Atzīme “NOVĒROTS” nenozīmē, ka grāmatvedība šo uzvedību ir apstiprinājusi.','Noteikumi ar statusu “JĀLEMJ” nedrīkst kļūt par neapstiprinātām automātiskām darbībām. Vēsturiskie dati netiek pārrakstīti, lai iegūtu mākslīgu sakritību.']:
 doc.add_paragraph(line,style='List Bullet')
doc.add_heading('Īpaši pārbaudāmie izņēmumi',1)
for line in ['2018. gada rinda ID 514: saglabātā PZ summa 0,68 €, bet precīzais daudzuma × cenas rezultāts (2 zīmes) ir 0,75 €.','2019. gada rinda ID 20375: saglabātā PZ summa 2,07 €, bet ar matemātisku noapaļošanu uz 2 zīmēm iegūst 2,06 €.','Sešās vēsturiskajās pozīciju grupās apvienotas atšķirīgas mērvienības; grupēšanas atslēga vecajā sistēmā mērvienību neietver.','37 vecā gada kataloga importa konfliktu grupās pie vienāda koda, nosaukuma un PZ cenas atšķiras PL cena; atlases prioritāte nav pietiekami noteikta.']:
 doc.add_paragraph(line,style='List Bullet')
for section_title,group in sections:
 doc.add_heading(section_title,1)
 for key,title,observed,proposed,evidence,state in group:
  h=doc.add_heading(f'{key}  {title}',2);h.paragraph_format.keep_with_next=True
  table=doc.add_table(rows=3,cols=2);table.alignment=WD_TABLE_ALIGNMENT.CENTER;table.autofit=False;table.columns[0].width=Inches(1.34);table.columns[1].width=Inches(5.47)
  for row in table.rows:
   row.cells[0].width=Inches(1.34);row.cells[1].width=Inches(5.47)
  write_cell(table.cell(0,0),'Uzvedība / fakts','');write_cell(table.cell(0,1),'',observed)
  write_cell(table.cell(1,0),'Audita lēmums','');write_cell(table.cell(1,1),'',proposed)
  write_cell(table.cell(2,0),'Pamatojums','');write_cell(table.cell(2,1),'',evidence)
  for j in range(3):shade(table.cell(j,0),'EFF6F1')
  p=doc.add_paragraph();p.paragraph_format.space_before=Pt(3);p.paragraph_format.space_after=Pt(2)
  run=p.add_run('☐ Apstiprināt     ☐ Koriģēt     ☐ Atlikt     ');run.bold=True;run.font.color.rgb=RGBColor(26,83,61)
  r=p.add_run('Statuss: '+state);r.font.size=Pt(8);r.font.color.rgb=RGBColor(98,113,103)
  p=doc.add_paragraph('Korekcija / pamatojums: ___________________________________________________________________________');p.paragraph_format.space_after=Pt(2)
  p=doc.add_paragraph('_____________________________________________________________________________________________');p.paragraph_format.space_after=Pt(9)
doc.add_page_break()
doc.add_heading('Apstiprināšanas kopsavilkums',1)
doc.add_paragraph('Aizpildiet pēc visu KAT/INV noteikumu izvērtēšanas. Atliktos jautājumus neuzskatiet par apstiprinātu sistēmas funkcionalitāti.')
doc.add_paragraph('Apstiprināti: ______  Koriģēti: ______  Atlikti: ______   Nākamās redakcijas datums: _________________')
doc.add_heading('Prioritārie lēmumi pirms produkcijas',2)
for k,decision in [
 ('KAT-06 / KAT-07','Kataloga grupēšanas un plaukta cenas prioritāte'),
 ('KAT-12 / KAT-15','Automātiska papildināšana un nulles cenas placeholder aizstāšana'),
 ('INV-02','Grupēšana, ja vienā grupā sastopamas atšķirīgas mērvienības'),
 ('INV-03 / INV-05','Precīzs noapaļošanas princips un divi vēsturiskie izņēmumi'),
 ('INV-10','Bilances aprēķina apstiprināšana')]:
 p=doc.add_paragraph();p.add_run(k+'  ').bold=True;p.add_run(decision)
 p=doc.add_paragraph('Lēmums: __________________________________________________________________________________');p.paragraph_format.space_after=Pt(8)
doc.add_heading('Korekciju apstiprināšana',2)
doc.add_paragraph('Grāmatvedis / amats: __________________________________    Paraksts: ______________________________')
doc.add_paragraph('Aplikācijas pārstāvis: _________________________________    Datums: ______________________________')
doc.add_paragraph('Jebkurš grāmatvedes precizējums jāiekļauj prasību izsekojamības žurnālā un jāsasaista ar konkrēto KAT-/INV- identifikatoru, migrāciju un regresijas testu.')
doc.add_paragraph('Šī dokumenta saskaņošana pati par sevi nav datubāzes izmaiņu vai produkcijas migrācijas apstiprinājums; tās veic atsevišķi pēc testu rezultātu pārbaudes.')
doc.save(OUT)
print('Created',OUT,OUT.stat().st_size,'rules',len(RULES))
