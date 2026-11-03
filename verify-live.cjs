const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let now=100000;const entries={};const props={getProperty:k=>entries[k]||null,setProperty:(k,v)=>entries[k]=v,deleteProperty:k=>delete entries[k],getProperties:()=>({...entries})};
class Clock extends Date{static now(){return now;}}
const ctx=vm.createContext({Date:Clock,Math,JSON,Error,Number,String,PropertiesService:{getScriptProperties:()=>props},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},Utilities:{getUuid:()=>crypto.randomUUID()}});
vm.runInContext(fs.readFileSync('LiveQuiz.gs','utf8'),ctx);
const host=ctx.liveCreate(),alice=ctx.liveJoin(host.code,'Alice',crypto.randomUUID()),bob=ctx.liveJoin(host.code,'Bob',crypto.randomUUID());
const state=(who=host)=>ctx.liveState(host.code,who.token);
assert.equal(state().count,2);
assert.throws(()=>ctx.liveState(host.code,'bad'));
assert.throws(()=>ctx.liveControl(host.code,alice.token,'next',state().revision));
ctx.liveControl(host.code,host.token,'next',state().revision);
let s=state(alice);assert.equal(s.question.answer,undefined);assert.equal(s.standings.length,0);
assert.throws(()=>ctx.liveAnswer(host.code,alice.token,0,0));
now=s.start;ctx.liveAnswer(host.code,alice.token,0,0);
ctx.liveAnswer(host.code,alice.token,0,1); // first answer remains final
now+=7999;ctx.liveAnswer(host.code,bob.token,0,0);
now+=1;assert.throws(()=>ctx.liveAnswer(host.code,alice.token,1,0));
s=state(alice);assert.equal(s.phase,'reveal');assert.equal(s.me.result.points,1000);
assert.equal(s.standings.find(x=>x.name==='Bob').score,500);
assert.equal(s.question.answer,0);
assert.ok(!JSON.stringify(s).includes(bob.token));assert.ok(!JSON.stringify(s).includes(host.token));
assert.throws(()=>ctx.liveJoin(host.code,'Late',crypto.randomUUID()));
ctx.liveControl(host.code,host.token,'next',state().revision);s=state(bob);now=s.start;ctx.liveAnswer(host.code,bob.token,1,0); // correct answer is 1
ctx.liveControl(host.code,host.token,'reveal',state().revision);assert.equal(state(bob).me.result.points,0);
ctx.liveControl(host.code,host.token,'finish',state().revision);assert.equal(state().phase,'finished');
now+=6*60*60*1000;assert.throws(()=>state());
console.log('PASS: separate players share a room; host authorization, pre-start/late rejection, hidden answers, first-answer-only, 1000/500/0 scoring, reveal, ranking, finish and expiry.');
