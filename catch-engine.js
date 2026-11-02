/* Shared pure logic, kept independent from animation and browser controls. */
const CatchEngine = (()=>{
 function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function makeWave(target,vocabulary,random=Math.random){let options=vocabulary.filter(v=>v.id!==target.id&&v.category===target.category);if(options.length<2)options=vocabulary.filter(v=>v.id!==target.id);if(options.length<2)throw new Error('Three distinct terms required');return shuffle([target,...shuffle(options,random).slice(0,2)],random);}
 function judge(wave,targetId,lane){if(!Number.isInteger(lane)||lane<0||lane>=wave.length)throw new Error('Invalid lane');return {correct:wave[lane].id===targetId,selected:wave[lane].id,points:wave[lane].id===targetId?10:0};}
 return {shuffle,makeWave,judge};
})();
if(typeof module!=='undefined')module.exports=CatchEngine;
