const fs=require('node:fs'),assert=require('node:assert/strict');
const {VOCABULARY}=require('./resources/vocabulary.js');
const fixed=JSON.parse(fs.readFileSync('catch.js','utf8').match(/FIXED_CATCH_IDS = Object.freeze\((\[[^\]]+\])/)[1]);
const terms=VOCABULARY.filter(t=>!fixed.includes(t.id));
const questions=terms.map((t,i)=>{const other=terms.filter(x=>x.id!==t.id);const choices=[other[(i*3)%other.length].en,other[(i*3+5)%other.length].en,other[(i*3+11)%other.length].en];choices.splice(i%4,0,t.en);return {text:'「'+t.zh+'」的英文是什麼？',choices,answer:i%4,note:t.definition};});
assert.equal(questions.length,20);
const html=fs.readFileSync('live-client.html','utf8').replace("'use strict';","'use strict';\nconst LIVE_APP_URL = "+'<?!= JSON.stringify(ScriptApp.getService().getUrl()) ?>'+';');
// A template injects only the app URL; question answers never enter initial HTML.
let server=fs.readFileSync('live-server.gs','utf8').replace('const LIVE_QUESTIONS = []; // populated by build-live.cjs','const LIVE_QUESTIONS = '+JSON.stringify(questions)+';');
server=server.replace('HtmlService.createHtmlOutput(LIVE_HTML)','HtmlService.createTemplate(LIVE_HTML).evaluate()');
server+='\nconst LIVE_HTML = '+JSON.stringify(html)+';\n';
fs.writeFileSync('LiveQuiz.gs',server);
new Function(server);
fs.writeFileSync('live-questions.json',JSON.stringify(questions,null,2));
console.log('Built LiveQuiz.gs with 20 Kahoot questions.');
