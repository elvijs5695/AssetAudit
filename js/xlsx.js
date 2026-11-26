/** Minimal XLSX-only reader for the exact four-column catalogue intake.
 *  Uses vendored JSZip 3.10.1 (no network/CDN dependency), never evaluates formulas.
 *  Rejects extra columns, invalid values and excess rows; server repeats validation.
 */
function parseXml(xml) {
  if (xml.length > 4_000_000) throw Error('XLSX saturs ir pārāk liels');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw Error('Bojāts XLSX XML');
  return doc;
}
const tags = (node, name) => [...node.getElementsByTagName(name)];
function textValue(cell, strings) {
  if (tags(cell, 'f').length) throw Error('Formulas XLSX failā nav atļautas');
  const kind=cell.getAttribute('t')||'';
  if (kind==='e') throw Error('Excel kļūdas vērtības nav atļautas');
  if (kind==='s') {
    const n=Number(tags(cell,'v')[0]?.textContent||'-1');
    if (!Number.isSafeInteger(n) || n<0 || n>=strings.length) throw Error('Bojāts teksta lauks');
    return strings[n];
  }
  if (kind==='inlineStr') return tags(cell,'t').map(x=>x.textContent).join('');
  return tags(cell,'v')[0]?.textContent??'';
}
function resolveSheetPath(workbook, rels) {
  const s=tags(workbook,'sheet')[0];
  if (!s) throw Error('XLSX nav darblapas');
  const rid=s.getAttribute('r:id')||s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  const r=tags(rels,'Relationship').find(x=>x.getAttribute('Id')===rid);
  if (!r) throw Error('Nav atrasta XLSX darblapa');
  const target=r.getAttribute('Target')||'';
  if (!target || target.includes('..') || target.includes('://') || target.includes('\\')) throw Error('Neatbalstīts XLSX saturs');
  const path=target.startsWith('/xl/')?target.slice(1):target.startsWith('xl/')?target:'xl/'+target.replace(/^\//,'');
  if (!/^xl\/worksheets\/[A-Za-z0-9_.-]+\.xml$/.test(path)) throw Error('Neatbalstīts darblapas formāts');
  return path;
}
export async function parseCatalogueXlsx(file) {
  if (!file || !/\.xlsx$/i.test(file.name)||file.size>3_000_000||file.size<100) throw Error('Izvēlieties XLSX failu līdz 3 MB');
  if (!globalThis.JSZip) throw Error('XLSX lasītājs nav ielādēts. Atsvaidziniet aplikāciju.');
  let zip;
  try {zip=await globalThis.JSZip.loadAsync(await file.arrayBuffer());}
  catch {throw Error('Fails nav derīgs XLSX');}
  const required=['xl/workbook.xml','xl/_rels/workbook.xml.rels'];
  if (!required.every(p=>zip.file(p))) throw Error('Nepilnīgs XLSX fails');
  if (Object.values(zip.files).some(f=>f.name.includes('vbaProject')||f.name.includes('externalLinks/')||f.name.includes('..'))) throw Error('Makro un ārējas saites nav atļautas');
  const wb=parseXml(await zip.file(required[0]).async('text'));
  if (tags(wb,'sheet').length!==1) throw Error('Fails drīkst saturēt tikai vienu darblapu');
  const rel=parseXml(await zip.file(required[1]).async('text'));
  const path=resolveSheetPath(wb,rel);
  if (!zip.file(path)) throw Error('Nav atrasta XLSX datu lapa');
  const stringFile=zip.file('xl/sharedStrings.xml');
  const strings=stringFile?tags(parseXml(await stringFile.async('text')),'si').map(si=>tags(si,'t').map(x=>x.textContent).join('')):[];
  const sheet=parseXml(await zip.file(path).async('text'));
  const out=[];let header=false;let rowIndex=0;
  for (const row of tags(sheet,'row')) {
    const cells={};rowIndex=Number(row.getAttribute('r'))||rowIndex+1;
    if (rowIndex>1001) throw Error('Maksimāli 1000 preču rindas');
    for (const cell of tags(row,'c')) {
      const col=(cell.getAttribute('r')||'').match(/^[A-Z]+/)?.[0];
      if (!col) throw Error('Nederīgas šūnu adreses');
      const value=textValue(cell,strings).trim();
      if (!['A','B','C','D'].includes(col) && value!=='') throw Error(`Nedrīkst būt papildu kolonnas (${col}${rowIndex})`);
      if (['A','B','C','D'].includes(col)) cells[col]=value;
    }
    if (rowIndex===1) {
      if (['KODS','NOSAUKUMS','PZ_CENA','SVITRU_KODS'].some((h,i)=>cells['ABCD'[i]]!==h)) throw Error('Galvenēm jābūt precīzi: KODS; NOSAUKUMS; PZ_CENA; SVITRU_KODS');
      header=true;continue;
    }
    if (rowIndex<2 || !Object.values(cells).some(v=>v)) continue;
    const code=cells.A||'',name=cells.B||'',price=(cells.C||'').replace(',','.'),barcode=cells.D||'';
    if (!name || name.length>200 || code.length>50 || barcode.length>100 || !/^[0-9]+(\.[0-9]{1,2})?$/.test(price) || Number(price)>10_000_000 || (barcode&&!/^[0-9A-Za-z-]+$/.test(barcode))) {
      throw Error(`Nekorekti dati ${rowIndex}. rindā (nosaukums, cena, kods vai svītrkods)`);
    }
    out.push({code,name,invoice_price:price,barcode});
  }
  if (!header) throw Error('Trūkst galvenes');
  if (!out.length) throw Error('XLSX failā nav preču rindu');
  if (out.length>1000) throw Error('Maksimāli 1000 preču rindas');
  return out;
}
