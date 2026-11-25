import {dec2,fromDec2} from './util.js';

/** Explicitly private, in-memory, READ-ONLY adapter for the historical export. */
export class LegacyPreview {
  constructor(data){
    if(data?.format!=='inventory-legacy-preview-v1'||!data.readonly||!Array.isArray(data.inventory_rows)||!Array.isArray(data.catalogue_rows)){
      throw new Error('Nederīgs vēsturisko datu priekšskatījuma fails');
    }
    this.data=data;
    this.years=[...new Set(data.inventory_rows.map(r=>Number(r[11])))].sort((a,b)=>b-a);
    if(!this.years.includes(Number(data.configured_year)))this.years.unshift(Number(data.configured_year));
    this.index=new Map();
  }
  _groups(year){
    if(this.index.has(year))return this.index.get(year);
    const groups=new Map();
    for(const r of this.data.inventory_rows){
      if(Number(r[11])!==Number(year))continue;
      // Match the old PHP GROUP BY EXACTLY; unit intentionally excluded.
      const key=JSON.stringify([r[1],r[2],r[5],r[6],r[9]]);
      let g=groups.get(key);
      if(!g){g={code:r[1],name:r[2],invoice_price:r[5],shelf_price:r[6],cash:r[9],unit:r[4],quantity_cents:0n,invoice_cents:0n,shelf_cents:0n,entry_count:0,latest_legacy_id:0};groups.set(key,g);}
      g.quantity_cents+=dec2(r[3]);g.invoice_cents+=dec2(r[7]);g.shelf_cents+=dec2(r[8]);
      g.entry_count++;g.latest_legacy_id=Math.max(g.latest_legacy_id,Number(r[0]));
    }
    const array=[...groups.values()].map(g=>({...g,quantity:fromDec2(g.quantity_cents),invoice_total:fromDec2(g.invoice_cents),shelf_total:fromDec2(g.shelf_cents)}));
    array.sort((a,b)=>a.name.localeCompare(b.name,'lv')||a.invoice_price.localeCompare(b.invoice_price));
    this.index.set(year,array);return array;
  }
  async inventoryList({year,search='',cash='',offset=0,limit=60}){
    const s=search.trim().toLocaleLowerCase('lv');
    return this._groups(Number(year)).filter(g=>(!cash||g.cash===cash)&&(!s||g.code.toLocaleLowerCase('lv').includes(s)||g.name.toLocaleLowerCase('lv').includes(s)||String(g.latest_legacy_id)===s)).slice(offset,offset+limit);
  }
  async inventoryDetails(group,year){
    return this.data.inventory_rows.filter(r=>Number(r[11])===Number(year)&&r[1]===group.code&&r[2]===group.name&&r[5]===String(group.invoice_price)&&r[6]===String(group.shelf_price)&&r[9]===group.cash)
      .sort((a,b)=>Number(b[0])-Number(a[0])).slice(0,250).map(r=>({entry_id:'legacy-'+r[0],event_id:null,revision:1,legacy_id:Number(r[0]),quantity:r[3],unit:r[4],invoice_total:r[7],shelf_total:r[8],note:r[10],legacy_user:Number(r[12]),recorded_at:Number(r[13])>0?new Date(Number(r[13])*1000).toISOString():null}));
  }
  async catalogueSearch(search='',offset=0,limit=80){
    const s=search.trim().toLocaleLowerCase('lv');let items=this.data.catalogue_rows.filter(r=>!s||r[1].toLocaleLowerCase('lv').includes(s)||r[2].toLocaleLowerCase('lv').includes(s));
    return items.slice(offset,offset+limit).map(r=>({item_id:'legacy-'+r[0],revision:1,code:r[1],name:r[2],invoice_price:r[3],shelf_price:Number(r[5])===Number(this.data.configured_year)&&dec2(r[4])===0n?null:r[4],barcode:null,source_year:Number(r[5]),source:'legacy_catalogue',legacy_id:Number(r[0])}));
  }
  async adminStats(year){
    const groups=this._groups(Number(year));let qty=0n,pz=0n,pl=0n,entry_count=0;
    for(const g of groups){qty+=g.quantity_cents;pz+=g.invoice_cents;pl+=g.shelf_cents;entry_count+=g.entry_count;}
    return {entry_count,group_count:groups.length,quantity:fromDec2(qty),invoice_total:fromDec2(pz),shelf_total:fromDec2(pl),difference:fromDec2(pl-pz)};
  }
  async inventorySubmit(){throw new Error('Vēsturisko datu priekšskatījums ir tikai lasāms');}
  async catalogueChange(){throw new Error('Vēsturisko datu priekšskatījums ir tikai lasāms');}
}
