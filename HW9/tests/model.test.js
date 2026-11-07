import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateTask,readTasks,selectTasks,localDate} from '../public/model.js';
const make=(id,overrides={})=>({id,title:'完成作業',subject:'軟體工程',notes:'',priority:'medium',due:'2026-11-08',completed:false,createdAt:Number(id),...overrides});
test('rejects blank, oversized and invalid date input; trims text',()=>{
  for(const title of ['   ','x'.repeat(101)])assert.throws(()=>validateTask(make('1',{title})));
  assert.throws(()=>validateTask(make('1',{due:'2026-02-30'})));
  assert.throws(()=>validateTask(make('1',{priority:'other'})));
  assert.equal(validateTask(make('1',{title:' 作業 '})).title,'作業');
});
test('storage roundtrip preserves task state; rejects corruption and duplicates',()=>{
  const tasks=[make('1'),make('2',{completed:true})];assert.deepEqual(readTasks(JSON.stringify(tasks)),tasks);
  for(const raw of ['{}','invalid',JSON.stringify([make('1'),make('1')]),JSON.stringify([make('1',{completed:'yes'})])])assert.throws(()=>readTasks(raw));
});
test('combines views, status and subject search without mutating source',()=>{
  const tasks=[make('1'),make('2',{completed:true}),make('3',{due:'2026-11-09',subject:'英文'})];
  assert.deepEqual(selectTasks(tasks,{view:'today',filter:'active',query:'軟體',today:'2026-11-08'}).map(t=>t.id),['1']);
  assert.deepEqual(selectTasks(tasks,{view:'completed'}).map(t=>t.id),['2']);
  assert.equal(selectTasks(tasks,{query:'不存在'}).length,0);assert.equal(tasks[0].id,'1');
});
test('sorts priority and keeps undated tasks last when sorting due dates',()=>{
  const tasks=[make('1',{due:'',priority:'high'}),make('2',{priority:'low'}),make('3',{due:'2026-11-07'})];
  assert.deepEqual(selectTasks(tasks,{sort:'due'}).map(t=>t.id),['3','2','1']);
  assert.deepEqual(selectTasks(tasks,{sort:'priority'}).map(t=>t.id),['1','3','2']);
});
test('uses local calendar date',()=>assert.equal(localDate(new Date(2026,10,8,0,1)),'2026-11-08'));
