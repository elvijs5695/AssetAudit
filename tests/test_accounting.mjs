import test from 'node:test';
import assert from 'node:assert/strict';
import {dec2,fromDec2,formatMoney,rigaWallToIso} from '../site/js/util.js';

test('exact cents without floats; Latvian comma input',()=>{
 assert.equal(dec2('12,30'),1230n);
 assert.equal(fromDec2(1230n),'12.30');
 assert.equal(dec2('-0.01'),-1n);
 assert.throws(()=>dec2('0.001'));
 assert.equal(formatMoney('5000.05').replace(/\s/g,' ').includes('5'),true);
});
test('Riga winter and summer instants are unambiguous',()=>{
 assert.equal(rigaWallToIso('2026-01-15T10:30'),'2026-01-15T08:30:00.000Z');
 assert.equal(rigaWallToIso('2026-07-15T10:30'),'2026-07-15T07:30:00.000Z');
});
test('DST missing and repeated wall times are rejected',()=>{
 assert.throws(()=>rigaWallToIso('2026-03-29T03:30'));
 assert.throws(()=>rigaWallToIso('2026-10-25T03:30'));
});
