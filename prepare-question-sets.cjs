const fs = require('node:fs');
const assert = require('node:assert/strict');
const {VOCABULARY, CATEGORIES} = require('./resources/vocabulary.js');
const source = fs.readFileSync('catch.js','utf8');
const ids = JSON.parse(source.match(/FIXED_CATCH_IDS = Object.freeze\((\[[^\]]+\])/)[1]);
const catchTerms = ids.map(id => VOCABULARY.find(t => t.id === id));
const kahootTerms = VOCABULARY.filter(t => !ids.includes(t.id));
assert.equal(ids.length,20); assert.equal(new Set(ids).size,20);
for(let category=0; category<5; category++) assert.equal(catchTerms.filter(t=>t.category===category).length,4);
assert.equal(kahootTerms.length,20);
assert.ok(source.includes('duration=QUESTION_DURATION_MS;'));
assert.ok(source.includes('const QUESTION_DURATION_MS = 8000;'));
assert.ok(!source.includes('round-count')); assert.ok(!source.includes('catch-speed'));
const rows = terms => terms.map((t,i)=>`| ${i+1} | ${t.en}${t.abbr?' ('+t.abbr+')':''} | ${t.zh} | ${CATEGORIES[t.category]} |`).join('\n');
const header = '| 題號 | 英文詞彙 | 中文 | 正確分類 |\n|---|---|---|---|';
const questions = kahootTerms.map((t,i)=>{
  const others = kahootTerms.filter(x=>x.id!==t.id);
  const distractors = [others[(i*3)%others.length], others[(i*3+5)%others.length], others[(i*3+11)%others.length]];
  const choices = distractors.map(x=>x.en); const position=i%4; choices.splice(position,0,t.en);
  assert.equal(new Set(choices).size,4);
  return {question:`「${t.zh}」的英文是什麼？`, choices, correct:position+1, term:t};
});
const lines = ['# 貿易物流接接樂與 Kahoot 題目分配','',
'接接樂：固定 20 題，每類 4 題；題目與順序相同，每題 8 秒，滿分 200 分。錯題重練只重做本回合錯題；重新開始仍是同一組 20 題。',
'','## 接接樂：依實際出題順序','',header,rows(catchTerms),'',
'## Kahoot：其餘 20 個詞彙','',header,rows(kahootTerms),'',
'## Kahoot 四選一題目與答案','',
'以下是題目稿，尚未建立或發布 Kahoot。每題一個正確答案；所有選項均取自保留給 Kahoot 的詞彙。',''];
questions.forEach((q,i)=>lines.push(`### ${i+1}. ${q.question}`,'',...q.choices.map((x,j)=>`${'ABCD'[j]}. ${x}`),'',`答案：${'ABCD'[q.correct-1]} — ${q.term.en}。${q.term.definition}` ,''));
fs.writeFileSync('resources/catch-and-kahoot-questions.md',lines.join('\n'));
const csv = value => '"'+String(value).replaceAll('"','""')+'"';
const records = [['題號','題目','選項A','選項B','選項C','選項D','正確答案編號','正確答案','中文','分類'],...questions.map((q,i)=>[i+1,q.question,...q.choices,q.correct,q.term.en,q.term.zh,CATEGORIES[q.term.category]])];
fs.writeFileSync('resources/kahoot-20-questions.csv','\ufeff'+records.map(r=>r.map(csv).join(',')).join('\r\n'));
fs.writeFileSync('resources/catch-20-questions.csv','\ufeff'+[['題號','英文','縮寫','中文','正確分類'],...catchTerms.map((t,i)=>[i+1,t.en,t.abbr,t.zh,CATEGORIES[t.category]])].map(r=>r.map(csv).join(',')).join('\r\n'));
console.log('PASS: fixed 20 unique questions, 4 per category, 8 seconds, no settings; 20 disjoint Kahoot questions, 4 distinct options each.');
console.log(JSON.stringify({catch:catchTerms.map(t=>t.en),kahoot:kahootTerms.map(t=>t.en)}));
