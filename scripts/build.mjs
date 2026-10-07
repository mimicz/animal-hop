import fs from 'node:fs';
const assets={};for(const [name,type] of [['index.html','text/html; charset=utf-8'],['style.css','text/css; charset=utf-8'],['game.js','text/javascript; charset=utf-8']])assets['/'+name]={content:fs.readFileSync('web/'+name,'utf8'),type};
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+fs.readFileSync('worker/index.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built Worker, game assets, and leaderboard migrations.');
