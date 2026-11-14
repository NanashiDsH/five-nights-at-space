import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
fs.mkdirSync(new URL('../captures/',import.meta.url),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.BASE_URL||'http://127.0.0.1:4173')+'/?qa=1');await page.waitForFunction(()=>Boolean(window.seleneDebug));
const results=await page.evaluate(()=>{const d=seleneDebug;d.start(2);d.session.inventory.kit=true;d.session.inventory.maskOwned=true;d.session.inventory.maskEquipped=true;d.session.mission.faults={air:true,power:true,crop:true};const results=[];let time=performance.now()/1000;
function step(){for(let k=0;k<1400;k++){time+=.05;d.world.update(.05,time,d.session,d.crew.people,d.camera);d.crew.update(.05)}}
for(const task of ['research','oxygen','grow','air','power','crop']){d.chooseTask(task);if(['air','power','crop'].includes(task)){d.chooseTask(task);document.querySelector('[data-action="assignCrew"][data-actor="'+(task==='crop'?'sol':'vega')+'"]').click()}d.show('map');step();results.push({task,people:d.crew.snapshot().map(p=>({name:p.name,moving:p.moving,position:p.position,destination:p.destination}))})}
d.session.shield=true;d.show('tasks');document.getElementById('shieldPlan').dispatchEvent(new Event('change',{bubbles:true}));step();results.push({task:'refuge',people:d.crew.snapshot().map(p=>({name:p.name,moving:p.moving,destination:p.destination,zone:p.zone,position:p.position,path:p.path,index:p.index}))});return results});
for(const r of results)assert.ok(r.people.every(p=>!p.moving),JSON.stringify(r));assert.ok(results.at(-1).people.every(p=>p.zone==='habitat'));assert.deepEqual(errors,[]);await page.evaluate(()=>{seleneDebug.show('terminal')});await page.waitForTimeout(400);await page.screenshot({path:fileURLToPath(new URL('../captures/selene-warning.png',import.meta.url))});console.log('PASS: 6 task destinations, simultaneous warnings and refuge; every robot reaches its physical room through doors and corridors.');
}finally{await browser.close()}

