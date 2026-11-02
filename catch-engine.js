const CatchEngine=(()=>{
 function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function makeQueue(vocabulary,count,random=Math.random){return shuffle(vocabulary,random).slice(0,count==='all'?vocabulary.length:Number(count));}
 function judge(term,lane){if(!Number.isInteger(lane)||lane<0||lane>4)throw new Error('Invalid category lane');return {correct:term.category===lane,points:term.category===lane?10:0};}
 return {shuffle,makeQueue,judge};
})();
if(typeof module!=='undefined')module.exports=CatchEngine;
