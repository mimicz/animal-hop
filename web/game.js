'use strict';
const animals=[['rabbit','🐰','小兔子','帶著勇氣，蹦蹦跳跳出發。'],['dog','🐶','小狗','搖搖尾巴，一起探索世界。'],['panda','🐼','熊貓','慢慢走，也能走得很遠。'],['otter','🦦','水獺','這次過河也要記得搭木頭喔。'],['hamster','🐹','倉鼠','小小身體，裝著大大的勇氣。'],['frog','🐸','青蛙','經典主角，今天繼續冒險。']];
const $=s=>document.getElementById(s),canvas=$('canvas'),ctx=canvas.getContext('2d'),W=594,H=648,C=54;
let startLevel=1,startingScore=0;
let difficulty='easy',rankingDifficulty='easy',rankingRequest=0;
let selected=0,level=1,score=0,lives=3,mode='ready',p={x:297,row:11},lanes=[],time=0,invincible=0,bestRow=11,lastMove=0,last=0,hop=0,elapsed=0,clockLast=0,runId='',savedScoreId='',savingScore=false,scorePending=false;
function choose(i){selected=i;document.querySelectorAll('.character').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));$('note-emoji').textContent=animals[i][1];$('note-name').textContent=animals[i][2];$('note-text').textContent=animals[i][3];$('face').textContent=animals[i][1];if(mode==='ready')$('message').textContent=animals[i][2]+'，準備出發！';}
animals.forEach((a,i)=>{const b=document.createElement('button');b.className='character';b.setAttribute('aria-pressed',String(i===0));b.setAttribute('aria-label','選擇'+a[2]);b.innerHTML='<span class="emoji">'+a[1]+'</span><span class="name">'+a[2]+'</span>';b.onclick=()=>choose(i);$('characters').appendChild(b)});
function build(){elapsed=0;lanes=[];for(const row of [1,2,3,5,6,7,9,10]){const water=row<4,dir=row%2?1:-1,speed=(water?32:54)+(level-1)*9+row*2;const length=water?173:82;const gap=water?255:(difficulty==='easy'?350+(row%3)*40:260+(row%3)*32);const items=[];for(let j=-1;j<4;j++)items.push({x:j*gap+((row*83)%gap),length});lanes.push({row,water,dir,speed,items,gap,span:gap*5});}p={x:297,row:11};bestRow=11;invincible=.8;}
function speedBonus(){return Math.max(0,Math.ceil(600-elapsed*10));}
function syncClock(){const now=performance.now();if(mode==='playing')elapsed+=Math.max(0,now-clockLast)/1000;clockLast=now;}
function timerHud(){$('elapsed').textContent=elapsed.toFixed(1)+' 秒';$('bonus').textContent='+'+speedBonus();}
function hud(){updateDifficulty();timerHud();$('level').textContent=String(level).padStart(2,'0');$('score').textContent=String(score).padStart(3,'0');$('lives').textContent='♥ '.repeat(lives)+'♡ '.repeat(3-lives);}
function show(title,description,label){updateDifficulty();$('overlay').classList.toggle('game-over',mode==='over');$('overlay').classList.toggle('hurt-scene',mode==='hurt');$('death-hearts').hidden=mode!=='hurt';$('overlay').hidden=false;$('face').textContent=animals[selected][1];$('message').textContent=title;$('hint').textContent=description;$('start').innerHTML=label+' <span>↗</span>';$('overline').textContent=mode==='hurt'?'TAKE A BREATH':mode==='won'?'NICE HOP!':mode==='over'?'ONE MORE HOP?':mode==='paused'?'TAKE A LITTLE BREAK':'READY TO HOP?';}
function start(){if(scorePending||savingScore)return;$('help-details').open=false;$('ranking-details').open=false;syncPanels();if(mode==='hurt'){if(lives===0){mode='over';show('這趟冒險，辛苦了！','本次獲得 '+score+' 分，抵達第 '+level+' 關。','再玩一次');$('status').textContent='冒險結束 · 留下你的成績吧！';promptScore();return}p={x:297,row:11};invincible=1.1;hop=0;lastMove=0;}if(mode==='won'){level++;build()}else if(mode==='ready'||mode==='over'){level=startLevel;score=startingScore;lives=3;runId=crypto.randomUUID();build()}mode='playing';lastMove=-Infinity;clockLast=performance.now();$('overlay').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','暫停遊戲');$('status').textContent='躲車、搭木頭，向花園前進！';hud();canvas.focus({preventScroll:true});}
function pause(){if(mode==='playing'){syncClock();timerHud();mode='paused';show('休息一下，再出發','準備好了，就繼續這趟冒險。','繼續冒險');$('pause').textContent='▶';$('pause').setAttribute('aria-label','繼續遊戲')}else if(mode==='paused')start()}
function reset(){if(savingScore)return;scorePending=false;$('score-form').hidden=true;$('continue-run').hidden=true;$('start').hidden=false;$('restart').disabled=false;mode='ready';startLevel=1;startingScore=0;level=1;score=0;lives=3;build();hud();$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','暫停遊戲');show(animals[selected][2]+'，準備出發！','躲開車子，踩著木頭渡河，抵達對面的花園就過關。','開始冒險');$('status').textContent='選好夥伴，就出發吧！'}
function die(reason){if(mode!=='playing'||invincible>0)return;syncClock();lives--;mode='hurt';hop=0;hud();$('death-hearts').textContent='♥ '.repeat(lives)+'♡ '.repeat(3-lives);$('death-hearts').setAttribute('aria-label','剩餘 '+lives+' 顆愛心');show(lives>0?'沒關係，再試一次！':'愛心用完了，休息一下',reason+(lives>0?' 還有 '+lives+' 顆愛心，準備好再出發。':' 來看看這次的冒險成績吧。'),lives>0?'準備好了，繼續':'查看成績');$('status').textContent=reason;$('start').hidden=false;$('start').focus({preventScroll:true});}

function move(dir){if(mode!=='playing')return;syncClock();const now=performance.now();if(now-lastMove<105)return;lastMove=now;const before={...p};if(dir==='up')p.row--;if(dir==='down')p.row=Math.min(11,p.row+1);if(dir==='left')p.x=Math.max(22,p.x-C);if(dir==='right')p.x=Math.min(W-22,p.x+C);hop=.12;if(before.row!==p.row)invincible=0;if(p.row<bestRow){score+=10;bestRow=p.row;hud()}if(p.row===0){const bonus=speedBonus();score+=100+bonus;mode='won';hud();show('平安到家，太棒了！','第 '+level+' 關用時 '+elapsed.toFixed(1)+' 秒：過關 +100 分，速度獎勵 +'+bonus+' 分！','前往下一關');$('status').textContent='過關 +100 · 速度 +'+bonus;}else check(0)}
// Use the visible 41px body: half or more over water means falling.
function supportingLog(lane,x=p.x){if(!lane?.water)return null;return lane.items.find(o=>Math.min(x+20.5,o.x+o.length)-Math.max(x-20.5,o.x)>20.5+1e-6)||null;}
function check(){const lane=lanes.find(l=>l.row===p.row);if(!lane)return;if(lane.water){if(p.x<15||p.x>W-15){die('漂到岸外了！');return}if(!supportingLog(lane))die('要踩在木頭上才能渡河喔！')}else if(lane.items.some(o=>p.x+15>o.x+5&&p.x-15<o.x+o.length-5))die('哎呀，碰到車子了！')}

function round(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function emoji(s,x,y,size){ctx.save();ctx.globalAlpha=1;ctx.fillStyle='#24382e';ctx.font=size+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y);ctx.restore()}
function draw(){ctx.clearRect(0,0,W,H);for(let row=0;row<12;row++){const y=row*C,lane=lanes.find(l=>l.row===row);ctx.fillStyle=lane?(lane.water?'#70b8bd':'#596675'):(row===0?'#87b965':row===11?'#97c674':'#a1cb80');ctx.fillRect(0,y,W,C);if(lane?.water){ctx.strokeStyle='#a5d6d4';ctx.lineWidth=2;for(let x=0;x<W;x+=82){const xx=(x+time*lane.dir*9+W)%W;ctx.beginPath();ctx.moveTo(xx,y+20);ctx.lineTo(xx+23,y+20);ctx.stroke()}}else if(lane){ctx.strokeStyle='#b8bdba80';ctx.setLineDash([17,23]);ctx.beginPath();ctx.moveTo(0,y+C-2);ctx.lineTo(W,y+C-2);ctx.stroke();ctx.setLineDash([])}else{for(let x=20;x<W;x+=70){ctx.fillStyle='#78a96266';ctx.fillRect(x,y+17,3,7);ctx.fillRect(x+5,y+13,3,8)}if(row===0)for(let x=28;x<W;x+=76)emoji(x%3?'🌼':'🌷',x,y+29,27);if(row===4||row===8){emoji('🌳',25,y+26,34);emoji('🌳',W-25,y+26,34)}}}
for(const lane of lanes){for(const o of lane.items){const y=lane.row*C;if(lane.water){round(o.x,y+10,o.length,35,11,'#775b42');round(o.x,y+8,o.length,31,10,'#bc9362');ctx.strokeStyle='#957248';ctx.lineWidth=2;for(let z=0;z<3;z++){ctx.beginPath();ctx.moveTo(o.x+15,y+16+z*8);ctx.lineTo(o.x+o.length-15,y+16+z*8);ctx.stroke()}}else{const colors=['#f4ba63','#b1a6e6','#e47c69','#80c4be'];round(o.x+2,y+13,o.length,34,9,'#25354250');round(o.x+10,y+5,16,8,3,'#273643');round(o.x+10,y+41,16,8,3,'#273643');round(o.x+o.length-25,y+5,16,8,3,'#273643');round(o.x+o.length-25,y+41,16,8,3,'#273643');round(o.x,y+11,o.length,32,8,colors[lane.row%4]);round(o.x+(lane.dir>0?o.length-26:10),y+15,16,24,4,'#d7edef');round(o.x+32,y+15,20,24,4,colors[(lane.row+1)%4]);}}}
ctx.save();ctx.globalAlpha=1;const py=p.row*C+26-(hop>0?5:0);ctx.fillStyle='#30463255';ctx.beginPath();ctx.ellipse(p.x,p.row*C+44,22,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.strokeStyle=invincible>0?'#f5b83c':'#304e37';ctx.lineWidth=invincible>0?4:2;ctx.beginPath();ctx.arc(p.x,py,23,0,Math.PI*2);ctx.fill();ctx.stroke();emoji(animals[selected][1],p.x,py,41);ctx.restore()}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.035);last=ts;if(mode==='playing'){syncClock();timerHud();time+=dt;invincible=Math.max(0,invincible-dt);hop=Math.max(0,hop-dt);const ridingLane=lanes.find(l=>l.row===p.row);const ridingLog=supportingLog(ridingLane);for(const lane of lanes)for(const o of lane.items){o.x+=lane.dir*lane.speed*dt;if(o.x>lane.span-lane.gap)o.x-=lane.span;if(o.x+o.length< -lane.gap)o.x+=lane.span}if(ridingLog)p.x+=ridingLane.speed*ridingLane.dir*dt;check()}draw();requestAnimationFrame(frame)}
$('start').onclick=start;$('pause').onclick=pause;$('restart').onclick=reset;document.querySelectorAll('[data-dir]').forEach(button=>{button.addEventListener('pointerdown',event=>{if(event.button!==0||event.isPrimary===false)return;event.preventDefault();move(button.dataset.dir)});button.addEventListener('click',event=>{if(event.detail===0)move(button.dataset.dir)});});const keys={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};document.addEventListener('keydown',e=>{if(e.defaultPrevented||document.querySelector('.extras details[open]')||e.target.closest?.('[role=tablist]')||e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable)return;const d=keys[e.key]||keys[e.key.toLowerCase()];if(d){e.preventDefault();move(d)}else if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();pause()}});let touch=null;canvas.addEventListener('pointerdown',e=>{if(e.button!==0||e.isPrimary===false||mode!=='playing')return;e.preventDefault();touch={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointerup',e=>{if(!touch||touch.id!==e.pointerId)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>15)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))});canvas.addEventListener('pointercancel',()=>touch=null);canvas.addEventListener('lostpointercapture',()=>touch=null);document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause()});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'select_animal',description:'Choose the animal used in the crossing game.',inputSchema:{type:'object',properties:{animal:{type:'string',enum:animals.map(a=>a[0])}},required:['animal'],additionalProperties:false},annotations:{readOnlyHint:false},execute:({animal})=>{const i=animals.findIndex(a=>a[0]===animal);if(i<0)throw Error('Unknown animal');choose(i);return {animal:animals[i][0],name:animals[i][2]}}})).catch(()=>{})}catch{}}
build();hud();requestAnimationFrame(frame);

function promptScore(){scorePending=true;updateDifficulty();$('score-form').hidden=false;$('continue-run').hidden=false;$('start').hidden=true;$('restart').disabled=true;$('save-error').textContent='';$('save-score').disabled=false;$('skip-score').disabled=false;setTimeout(()=>$('nickname').focus({preventScroll:true}),100)}
function finishScore(message){scorePending=false;$('score-form').hidden=true;$('continue-run').hidden=true;$('start').hidden=false;$('restart').disabled=false;$('hint').textContent=message;$('status').textContent=message;updateDifficulty();$('start-'+difficulty).focus({preventScroll:true})}
// Continue the current run: refill hearts, keep level and score, fresh run id for the leaderboard.
function continueRun(){if(mode!=='over'||!scorePending||savingScore)return;scorePending=false;$('score-form').hidden=true;$('continue-run').hidden=true;$('start').hidden=false;$('restart').disabled=false;$('save-error').textContent='';lives=3;runId=crypto.randomUUID();build();p={x:297,row:11};bestRow=11;invincible=1.1;hop=0;lastMove=-Infinity;mode='playing';clockLast=performance.now();$('overlay').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','暫停遊戲');$('status').textContent='再接再厲，繼續這趟冒險！';updateDifficulty();hud();canvas.focus({preventScroll:true});}
$('continue-run').onclick=continueRun;
async function api(path,options){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);try{const response=await fetch(path,{...options,signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||'排行榜暫時無法連線。');return data}finally{clearTimeout(timeout)}}

async function loadRanking(){updateRankingTabs();const request=++rankingRequest;const requestedDifficulty=rankingDifficulty;$('ranking-table').hidden=true;$('refresh-ranking').disabled=true;$('ranking-status').textContent='正在載入成績…';try{const data=await api('/api/scores?difficulty='+requestedDifficulty);if(request!==rankingRequest)return;$('ranking-rows').replaceChildren();for(const [i,entry] of data.scores.entries()){const row=document.createElement('tr');if(entry.id===savedScoreId)row.className='latest-score';const animal=animals.find(a=>a[0]===entry.animal);for(const value of [i+1,(animal?animal[1]+' ':'')+entry.nickname,entry.score,entry.level]){const td=document.createElement('td');td.textContent=String(value);row.appendChild(td)}$('ranking-rows').appendChild(row)}$('ranking-table').hidden=data.scores.length===0;$('ranking-status').textContent=data.scores.length?'':'還沒有成績，來留下第一筆紀錄吧！'}catch{if(request!==rankingRequest)return;$('ranking-status').textContent='暫時無法載入最新成績，請按「重新整理」重試。'}finally{if(request===rankingRequest)$('refresh-ranking').disabled=false}}
$('score-form').addEventListener('submit',async event=>{event.preventDefault();if(!scorePending||savingScore)return;const nickname=$('nickname').value.trim();if(!nickname||Array.from(nickname).length>16||/[\u0000-\u001f\u007f]/.test(nickname)){$('save-error').textContent='請輸入 1–16 字的暱稱。';return}savingScore=true;$('save-score').disabled=true;$('skip-score').disabled=true;$('save-score').textContent='記錄中…';$('save-error').textContent='';try{const result=await api('/api/scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:runId,nickname,score,level,startLevel,initialScore:startingScore,difficulty,animal:animals[selected][0]})});savedScoreId=result.entry.id;finishScore('已記錄 '+result.entry.score+' 分，'+(result.entry.difficulty==='easy'?'簡單榜':'困難榜')+'第 '+result.rank+' 名！');rankingDifficulty=result.entry.difficulty;loadRanking()}catch(error){$('save-error').textContent=error.name==='AbortError'?'連線逾時，請重試；相同成績不會重複記錄。':error.message}finally{savingScore=false;$('save-score').disabled=false;$('skip-score').disabled=false;$('save-score').textContent='記錄到排行榜'}});
$('skip-score').onclick=()=>{if(!savingScore)finishScore('已跳過，本次 '+score+' 分不記錄。')};$('refresh-ranking').onclick=loadRanking;loadRanking();

function updateDifficulty(){const picking=mode==='ready'||(mode==='over'&&!scorePending);$('choose-level').disabled=!picking||savingScore;$('difficulty-start').hidden=!picking;$('start').hidden=picking||scorePending;$('difficulty-help').textContent=mode==='ready'?'選擇難度，開始冒險':(difficulty==='easy'?'簡單模式':'困難模式');}
function startDifficulty(choice){if(!['easy','hard'].includes(choice)||!['ready','over'].includes(mode)||scorePending||savingScore)return;difficulty=choice;rankingDifficulty=choice;start();loadRanking();}
document.querySelectorAll('[data-start-difficulty]').forEach(button=>button.addEventListener('click',()=>startDifficulty(button.dataset.startDifficulty)));
function updateRankingTabs(){document.querySelectorAll('[data-ranking]').forEach(tab=>{const active=tab.dataset.ranking===rankingDifficulty;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});$('ranking-panel').setAttribute('aria-labelledby','ranking-tab-'+rankingDifficulty);}
document.querySelectorAll('[data-ranking]').forEach(tab=>{tab.addEventListener('click',()=>{rankingDifficulty=tab.dataset.ranking;loadRanking();});tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();event.stopPropagation();const next=event.key==='Home'?'easy':event.key==='End'?'hard':tab.dataset.ranking==='easy'?'hard':'easy';rankingDifficulty=next;loadRanking();$('ranking-tab-'+next).focus();});});

// Remember instructions per browser, without requiring an account preference.
let seenHelp=false;
try {
  seenHelp=document.cookie.split(';').some(part=>part.trim()==='animal_hop_help_seen=1');
  document.cookie='animal_hop_help_seen=1; Max-Age=31536000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
} catch { /* If cookies are blocked, leave the instructions available. */ }
const panels=[$('help-details'),$('ranking-details')];
const panelBackdrop=$('panel-backdrop');
let activePanel=null;
function syncPanels(){
  const next=panels.find(panel=>panel.open)||null;
  panelBackdrop.hidden=!next;
  for(const element of document.querySelectorAll('.game-top, .time-strip, .board-slot, .game-bottom, .play-controls'))element.inert=!!next;
  for(const panel of panels)panel.inert=!!next&&panel!==next;
  if(next!==activePanel){
    const previous=activePanel;
    activePanel=next;
    if(next){
      if(mode==='playing')pause();
      next.querySelector('summary').focus({preventScroll:true});
    }else if(previous)previous.querySelector('summary').focus({preventScroll:true});
  }
}
function closePanels(){for(const panel of panels)panel.open=false;syncPanels();}
$('close-help').onclick=closePanels;
panelBackdrop.addEventListener('click',closePanels);
for(const panel of panels)panel.addEventListener('toggle',()=>{
  if(panel.open)for(const other of panels)if(other!==panel)other.open=false;
  syncPanels();
});
document.addEventListener('keydown',event=>{
  if(!activePanel)return;
  if(event.key==='Escape'){event.preventDefault();closePanels();return;}
  if(event.key!=='Tab')return;
  const focusable=Array.from(activePanel.querySelectorAll('summary, button, input, [tabindex="0"]')).filter(element=>!element.disabled&&!element.hidden&&element.getAttribute('tabindex')!=='-1'&&!element.closest('[hidden]'));
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
$('ranking-details').open=false;
$('help-details').open=!seenHelp;
syncPanels();

// Choose a starting stage before a new run; skipped stages award no points.
const levelDialog=$('level-dialog');
$('choose-level').onclick=()=>{
  if(!['ready','over'].includes(mode)||scorePending||savingScore)return;
  $('start-level').value=String(startLevel);
  $('level-error').textContent='';
  levelDialog.showModal();
  $('start-level').focus({preventScroll:true});
  $('start-level').select();
};
$('cancel-level').onclick=()=>levelDialog.close();
$('level-form').addEventListener('submit',event=>{
  event.preventDefault();
  const value=$('start-level').value.trim();
  const requested=Number(value);
  if(!value||!Number.isSafeInteger(requested)||requested<1||requested>99999){
    $('level-error').textContent='請輸入 1–99999 的整數關卡。';
    return;
  }
  if(!['ready','over'].includes(mode)||scorePending||savingScore)return;
  startLevel=requested;startingScore=10000;level=requested;score=startingScore;lives=3;mode='ready';
  build();hud();
  show(animals[selected][2]+'，準備出發！','從第 '+startLevel+' 關出發，選擇難度開始冒險。','開始冒險');
  $('status').textContent='從第 '+startLevel+' 關出發 · 三顆愛心';
  levelDialog.close();
});
