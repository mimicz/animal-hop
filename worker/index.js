function database(env){if(!env.DB)throw new Error('Leaderboard database unavailable');return env.DB;}
function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
const animalIds=['rabbit','dog','panda','otter','hamster','frog'];
export default {async fetch(request,env){const url=new URL(request.url);try{
if(url.pathname==='/api/scores'){
 const db=database(env);
 if(request.method==='GET'){const difficulty=url.searchParams.get('difficulty')||'hard';if(!['easy','hard'].includes(difficulty))return json({error:'請選擇有效的難度。'},400);const result=await db.prepare('SELECT id, nickname, score, level, animal, difficulty, created_at FROM scores WHERE difficulty = ? ORDER BY score DESC, created_at ASC, id ASC LIMIT 20').bind(difficulty).all();return json({scores:result.results});}
 if(request.method==='POST'){
  if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'無法提交，請重新開啟遊戲。'},403);
  if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'資料格式不正確。'},415);
  const raw=await request.text();if(raw.length>2048)return json({error:'資料過長。'},413);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'資料格式不正確。'},400)}
  const {id,score,level,animal,difficulty}=body??{};if(!['easy','hard'].includes(difficulty))return json({error:'請重新整理遊戲，選擇難度後再挑戰。'},400);const nickname=typeof body?.nickname==='string'?body.nickname.trim():'';
  if(typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||!nickname||Array.from(nickname).length>16||/[\u0000-\u001f\u007f]/.test(nickname)||!Number.isSafeInteger(score)||score<0||!Number.isSafeInteger(level)||level<1||level>100000||score>(level-1)*810+110||!animalIds.includes(animal))return json({error:'請輸入 1–16 字的暱稱，並確認遊戲成績有效。'},400);
  await db.prepare('INSERT INTO scores (id, nickname, score, level, animal, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(id,nickname,score,level,animal,difficulty,Date.now()).run();
  const saved=await db.prepare('SELECT id, nickname, score, level, animal, difficulty, created_at FROM scores WHERE id = ?').bind(id).first();
  const rank=await db.prepare('SELECT COUNT(*) + 1 AS rank FROM scores WHERE difficulty = ? AND (score > ? OR (score = ? AND (created_at < ? OR (created_at = ? AND id < ?))))').bind(saved.difficulty,saved.score,saved.score,saved.created_at,saved.created_at,saved.id).first();return json({entry:saved,rank:rank.rank},201);
 }return json({error:'不支援的操作。'},405);
}
if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
const asset=ASSETS[url.pathname==='/'?'/index.html':url.pathname];if(!asset)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:asset.content,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
}catch(error){console.error('Leaderboard request failed',error);return json({error:'排行榜暫時無法連線，請稍後重試。'},503)}}};
