// Synchronous classroom quiz. Only public RPC functions are callable by clients.
const LIVE_TTL_MS = 6 * 60 * 60 * 1000;
const LIVE_LIMIT = 60;
const LIVE_QUESTIONS = []; // populated by build-live.cjs

function doGet() {
  return HtmlService.createHtmlOutput(LIVE_HTML).setTitle('貿易物流全班搶答')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function liveLock_(fn) {
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{return fn();}finally{lock.releaseLock();}
}
function liveStore_(){return PropertiesService.getScriptProperties();}
function liveRoom_(code){
  code=String(code||'');if(!/^\d{6}$/.test(code))throw Error('請輸入六位數遊戲代碼。');
  const raw=liveStore_().getProperty('room:'+code);
  if(!raw)throw Error('找不到遊戲，請確認代碼。');
  const room=JSON.parse(raw);if(Date.now()>room.expires)throw Error('遊戲已到期，請老師重新建立遊戲。');return room;
}
function liveSave_(room){liveStore_().setProperty('room:'+room.code,JSON.stringify(room));}
function livePlayer_(code,token){
  if(typeof token!=='string'||!/^[a-f0-9-]{36}$/.test(token))throw Error('加入資訊失效，請重新加入。');
  const raw=liveStore_().getProperty('player:'+code+':'+token);
  if(!raw)throw Error('加入資訊失效，請重新加入。');return JSON.parse(raw);
}
function liveCleanup_(){
  const store=liveStore_(),all=store.getProperties(),expired=[];
  Object.keys(all).filter(k=>k.indexOf('room:')===0).forEach(k=>{try{if(JSON.parse(all[k]).expires<Date.now())expired.push(k.slice(5));}catch(e){expired.push(k.slice(5));}});
  Object.keys(all).forEach(k=>{if(expired.some(code=>k==='room:'+code||k.indexOf('player:'+code+':')===0))store.deleteProperty(k);});
}
function liveCreate(){return liveLock_(()=>{
  liveCleanup_();let code;const store=liveStore_();
  const rooms=Object.keys(store.getProperties()).filter(k=>k.indexOf('room:')===0).length;
  if(rooms>=25)throw Error('目前遊戲較多，請稍後再建立。');
  do{code=String(Math.floor(100000+Math.random()*900000));}while(store.getProperty('room:'+code));
  const room={code,host:Utilities.getUuid(),created:Date.now(),expires:Date.now()+LIVE_TTL_MS,phase:'lobby',index:-1,start:0,deadline:0,players:[],revision:1};
  liveSave_(room);return {code,token:room.host,role:'host',serverNow:Date.now()};
});}
function liveJoin(code,name,token){return liveLock_(()=>{
  const room=liveRoom_(code);
  name=String(name||'').trim();if(!name||name.length>24)throw Error('請輸入 1 至 24 字的姓名或暱稱。');
  if(typeof token!=='string'||!/^[a-f0-9-]{36}$/.test(token))throw Error('請重新整理後再加入。');
  if(room.players.includes(token))return {code:room.code,token,role:'player'};
  if(room.phase!=='lobby')throw Error('遊戲已開始，請等老師開下一場。');
  if(room.players.length>=LIVE_LIMIT)throw Error('本場人數已滿，最多 60 位同學。');
  const all=liveStore_().getProperties();
  if(room.players.some(t=>JSON.parse(all['player:'+code+':'+t]).name===name))throw Error('這個姓名或暱稱已有人使用，請加上座號。');
  const player={name,token,score:0,correct:0,totalMs:0,answers:{}};
  liveStore_().setProperty('player:'+code+':'+token,JSON.stringify(player));
  room.players.push(token);room.revision++;liveSave_(room);return {code:room.code,token,role:'player'};
});}
function liveControl(code,token,action,expectedRevision){return liveLock_(()=>{
  const room=liveRoom_(code);if(token!==room.host)throw Error('只有老師可以控制出題。');
  if(expectedRevision!==room.revision)throw Error('畫面已更新，請再試一次。');
  if(action==='next'){
    if(!['lobby','reveal'].includes(room.phase))throw Error('請先結束本題。');
    if(room.players.length===0)throw Error('請等至少一位同學加入。');
    if(room.index>=LIVE_QUESTIONS.length-1)throw Error('已是最後一題，請查看總排名。');
    room.index++;room.phase='question';room.start=Date.now()+4000;room.deadline=room.start+8000;
  }else if(action==='reveal'){
    if(room.phase!=='question')throw Error('目前沒有進行中的題目。');room.phase='reveal';
  }else if(action==='finish'){
    if(room.phase==='finished')return {ok:true};room.phase='finished';
  }else throw Error('無效操作。');
  room.revision++;liveSave_(room);return {ok:true};
});}
function liveAnswer(code,token,index,choice){return liveLock_(()=>{
  const room=liveRoom_(code),player=livePlayer_(code,token),now=Date.now();
  if(!Number.isInteger(index)||index!==room.index)throw Error('題目已切換，請稍候更新。');
  if(player.answers[index])return {ok:true,duplicate:true};
  if(room.phase!=='question'||now<room.start||now>=room.deadline)throw Error('本題尚未開始或已結束。');
  if(!Number.isInteger(choice)||choice<0||choice>3)throw Error('請選擇一個答案。');
  const elapsed=now-room.start,correct=choice===LIVE_QUESTIONS[index].answer;
  const points=correct?Math.max(500,Math.round(1000-500*elapsed/8000)):0;
  player.answers[index]={choice,ms:elapsed,points,correct};player.score+=points;
  if(correct){player.correct++;player.totalMs+=elapsed;}
  liveStore_().setProperty('player:'+code+':'+token,JSON.stringify(player));return {ok:true};
});}
function liveState(code,token){
  let room=liveRoom_(code),isHost=token===room.host;
  if(!isHost)livePlayer_(code,token);
  if(room.phase==='question'&&Date.now()>=room.deadline){
    room=liveLock_(()=>{const fresh=liveRoom_(code);if(fresh.phase==='question'&&Date.now()>=fresh.deadline){fresh.phase='reveal';fresh.revision++;liveSave_(fresh);}return fresh;});
  }
  const all=liveStore_().getProperties(),players=room.players.map(t=>JSON.parse(all['player:'+code+':'+t]));
  const answered=players.filter(p=>p.answers[room.index]).length,show=room.phase==='reveal'||room.phase==='finished';
  const standings=players.map(p=>({name:p.name,score:p.score,correct:p.correct,totalMs:p.totalMs,mine:p.token===token}))
    .sort((a,b)=>b.score-a.score||b.correct-a.correct||a.totalMs-b.totalMs||a.name.localeCompare(b.name));
  let question=null;
  if(room.index>=0){const q=LIVE_QUESTIONS[room.index];question={text:q.text,choices:q.choices};if(show){question.answer=q.answer;question.note=q.note;}}
  const me=isHost?null:players.find(p=>p.token===token);
  const own=me&&me.answers[room.index];
  return {code:room.code,role:isHost?'host':'player',phase:room.phase,index:room.index,total:LIVE_QUESTIONS.length,
    revision:room.revision,start:room.start,deadline:room.deadline,serverNow:Date.now(),answered,count:players.length,
    names:room.phase==='lobby'?players.map(p=>p.name):[],question,standings:show?standings:[],
    me:me?{name:me.name,score:me.score,answered:!!own,choice:own?own.choice:null,result:show&&own?own:null}:null};
}
