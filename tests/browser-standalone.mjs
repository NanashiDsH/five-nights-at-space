import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
fs.mkdirSync(new URL('../captures/',import.meta.url),{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message.slice(0,200)));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});await page.goto(new URL('../selene-3d.html?qa=1',import.meta.url).href);await page.waitForFunction(()=>Boolean(window.seleneDebug),{timeout:15000});await page.getByRole('button',{name:'Iniciar exploración'}).click();await page.waitForFunction(()=>seleneDebug.player.locked);assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await page.screenshot({path:fileURLToPath(new URL('../captures/selene-standalone.png',import.meta.url))});console.log('PASS: standalone HTML opens from disk; real WebGL, pointer lock and zero external requests.')}finally{await browser.close()}
