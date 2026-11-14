import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
fs.mkdirSync(new URL('../captures/',import.meta.url),{recursive:true});
const routes=[['research','air','oxygen','grow','rest','research'],['research','power','oxygen','grow','air','research','rest','grow'],['research','air','oxygen','power','grow','research','crop','oxygen','research','rest']];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.BASE_URL||'http://127.0.0.1:4173')+'/?qa=1');await page.waitForFunction(()=>Boolean(window.seleneDebug));
for(let level=0;level<3;level++){
 await page.evaluate(level=>{const d=seleneDebug;d.start(level);d.session.inventory.kit=true;d.session.inventory.maskOwned=true;d.session.inventory.maskEquipped=true},level);
 for(const task of routes[level]){
  const before=await page.evaluate(()=>({turn:seleneDebug.session.mission.turn,repairs:seleneDebug.session.mission.repairs}));
  await page.evaluate(task=>seleneDebug.chooseTask(task),task);
  if(['air','power','crop'].includes(task)){await page.evaluate(task=>seleneDebug.chooseTask(task),task);await page.getByRole('button',{name:'Enviar a '+(task==='crop'?'Sol':'Vega'),exact:true}).click();const sequence=await page.locator('#repairSequence span').allTextContents();for(const letter of sequence)await page.locator('#repairBoard').getByRole('button',{name:letter,exact:true}).click();assert.equal(await page.evaluate(()=>seleneDebug.session.repairReady),true);assert.equal(await page.evaluate(()=>seleneDebug.session.mission.repairs),before.repairs,'Adjusting must not apply repair for free');await page.locator('#repairDone').click()}
  const storm=await page.evaluate(()=>seleneDebug.session.mission.events[seleneDebug.session.mission.turn-1].storm);if(storm)await page.locator('#shieldPlan').check();
  const ready=await page.evaluate(()=>{const d=seleneDebug;let t=performance.now()/1000;for(let n=0;n<900&&d.crew.busy(d.session.shield);n++){t+=.1;d.world.update(.1,t,d.session,d.crew.people,d.camera);d.crew.update(.1)}return!d.crew.busy(d.session.shield)});assert.equal(ready,true,`Crew blocked level ${level} ${task}`);
  await page.waitForFunction(()=>!document.getElementById('executeTurn').disabled);await page.locator('#executeTurn').click();assert.equal(await page.evaluate(()=>seleneDebug.session.mission.turn),before.turn+1);
 }
 const end=await page.evaluate(()=>({won:seleneDebug.session.mission.won,turn:seleneDebug.session.mission.turn,reason:seleneDebug.session.mission.reason}));assert.equal(end.won,true,JSON.stringify({level,...end}));assert.equal(await page.evaluate(()=>seleneDebug.panel),'report');console.log('PASS browser mission '+(level+1)+' / physical crew, repair adjustments, turn costs and victory.');
}
assert.deepEqual(errors,[]);
}finally{await browser.close()}
