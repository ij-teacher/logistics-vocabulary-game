const assert=require('node:assert/strict');const fs=require('node:fs');const {CATEGORIES,VOCABULARY,SCENARIOS}=require('./resources/vocabulary.js');
assert.equal(CATEGORIES.length,5);assert.equal(VOCABULARY.length,40);assert.equal(SCENARIOS.length,24);
for(const [i,v] of VOCABULARY.entries()){assert.equal(v.id,i);assert.ok(v.category>=0&&v.category<5);assert.ok(v.en&&v.zh&&v.definition);}
for(const s of SCENARIOS){assert.equal(s.choices.length,4);assert.equal(new Set(s.choices).size,4);assert.ok(s.choices.includes(s.answer));for(const id of s.choices)assert.ok(VOCABULARY[id]);assert.ok(s.note);}
const html=fs.readFileSync('index.html','utf8');const js=fs.readFileSync('app.js','utf8');for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes('id="'+match[1]+'"'),'Missing element '+match[1]);
for(const path of ['resources/vocabulary.csv','resources/teacher-guide.md','resources/sources.md','assets/game-qr.svg'])assert.ok(fs.existsSync(path),path);
new Function(js);assert.ok(fs.readFileSync('assets/game-qr.svg','utf8').includes('<svg'));console.log('PASS: 40 terms, 24 scenarios, valid answer references, required resources and JavaScript syntax.');
