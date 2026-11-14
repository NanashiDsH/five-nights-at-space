import {missions,actions,faultNames,createMission,planCost,validatePlan,advance} from './engine.js';
import {zones,sceneSvg} from './scenes.js';
import {mountFirstPerson} from './firstperson.js';
import {crewOrders,createCrewTracker,mountControlMap} from './crew.js';
const $=id=>document.getElementById(id);
let state=createMission(),active=false,camera=0,selected=null,chosenLevel=0,repairReady=false,history=[],expanded=false,lastDelta=null,soundOn=false,audio=null,repairOrder=[],repairStep=0;
let unlocked=0;
try{unlocked=Math.max(0,Math.min(2,Number(localStorage.getItem('selene-unlocked-v2'))||0));}catch{}
const firstPerson=mountFirstPerson({
  onCamera:next=>switchCamera(next),onTask:key=>selectTask(key),
  onExecute:()=>$('advance').click(),onRepair:()=>openRepair(),
  onShield:()=>{$('shield').checked=!$('shield').checked;$('shield').onchange()},
  onRadio:()=>{$('radio').checked=!$('radio').checked;$('radio').onchange()},
  onViewChange:fp=>controlMap.setView(fp)
});
const controlMap=mountControlMap({onCamera:next=>switchCamera(next),onControl:()=>firstPerson.setView(true)});
const crewTracker=createCrewTracker({onFrame:people=>controlMap.updateCrew(people),onArrival:()=>{cameraView();renderPlan()}});
function crewBusy(){return crewTracker.snapshot().some(p=>p.moving&&(p.kind==='task'||$('shield').checked))}
function syncCrew(){crewTracker.setOrders(crewOrders(state,selected,$('shield').checked));controlMap.render({state,camera,active})}
function renderFirstPerson(){controlMap.render({state,camera,active});firstPerson.render({state,active,camera,selected,repairReady,crew:crewTracker.snapshot(),crewBusy:crewBusy(),shield:$('shield').checked,radio:$('radio').checked,feedback:$('feedback').textContent,error:$('error').textContent})}
function beep(type='click'){
  if(!soundOn)return;
  try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.type='sine';osc.frequency.value=type==='alarm'?220:type==='success'?740:440;gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.start();osc.stop(audio.currentTime+.17);}catch{}
}
function openDialog(id){if(!$(id).open)$(id).showModal()}
function missionMenu(){
  $('missionList').replaceChildren(...missions.map((m,i)=>{const b=document.createElement('button');b.className='missionOption';b.disabled=i>unlocked;b.setAttribute('aria-pressed',String(i===chosenLevel));b.innerHTML=`<strong>0${i+1}</strong><span><b>${m.name}</b><small>${m.turns} turnos · ${m.goal} hallazgos</small></span><span>${i>unlocked?'BLOQUEADA':i<unlocked?'✓':'→'}</span>`;b.onclick=()=>{chosenLevel=i;missionMenu();beep()};return b}));
  $('resume').hidden=!active;
  $('start').textContent=active?'Iniciar nueva misión →':'Tomar el mando →';
}
function setFeedback(text){$('feedback').textContent=text;document.getElementById('fpFeedback').textContent=text}
function cameraView(){
  syncCrew();
  const z=zones[camera],shield=$('shield').checked||(state.ended&&state.shield);
  $('art').innerHTML=sceneSvg(camera,state,shield,crewTracker.snapshot());
  $('scene').classList.toggle('isFault',Boolean(z.fault&&state.faults[z.fault]));
  $('cameraId').textContent='/ CAM 0'+(camera+1);$('zoneTitle').textContent=z.name;$('zoneSubtitle').textContent=z.subtitle;$('sector').textContent=z.sector;
  $('viewCondition').textContent=z.fault&&state.faults[z.fault]?'⚠ '+faultNames[z.fault].toUpperCase():z.condition;
  $('camTime').textContent='T'+String(Math.min(state.turn,missions[state.level].turns)).padStart(2,'0');
  $('hotspots').replaceChildren(...z.hotspots.map(h=>{const b=document.createElement('button'),a=actions[h.action],broken=h.repair&&state.faults[h.action];b.className='hotspot'+(broken?' isFault':'')+(selected===h.action?' isSelected':'');b.style.left=h.x+'%';b.style.top=h.y+'%';b.disabled=!active||state.ended;b.setAttribute('aria-label',h.repair&&!broken?h.label+': funcionando':a.name);b.setAttribute('aria-pressed',String(selected===h.action));b.innerHTML=`<span class="target">${broken?'!':a.icon}</span><span class="hotLabel">${h.label}${broken?' · REPARAR':''}</span>`;b.onclick=()=>{if(h.repair&&!broken){setFeedback(h.label+': funcionando correctamente. Puedes revisar otra cámara o guardar reservas.');beep();return}selectTask(h.action)};return b}));
  document.querySelectorAll('[data-cam]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cam)===camera)));
  $('shelterVisual').hidden=!shield;
  $('crewLocation').textContent=shield?'Protegidos en el hábitat':selected?'Preparando: '+actions[selected].name:'En sus puestos';
  const current=state.events[Math.min(state.turn-1,state.events.length-1)];$('stormVisual').hidden=!active||!current.storm||state.ended;
  const people=[['Vega','INGENIERÍA','#efbb79'],['Sol','CULTIVOS','#92d3c4'],['Leo','CIENCIA','#cda0b4']];
  $('crewStrip').innerHTML=people.map(([name,role,color])=>`<div class="crewMember"><span class="crewFace" style="border-color:${color}"></span><span><b>${name} ${shield?'· Refugio':''}</b><small>${role}</small></span></div>`).join('');
  renderFirstPerson();
}
function renderPlan(){
  syncCrew();
  const a=actions[selected];
  $('taskCard').innerHTML=a?`<span class="taskIcon">${a.icon}</span><h2>${a.name}</h2><p>${a.description}</p><span class="effect">${a.effect}${selected==='grow'&&state.faults.crop?' · riego averiado: solo +10 alimentos':''}</span>`:'<span class="taskIcon">◎</span><h2>Tu base te necesita</h2><p>Explora las cámaras y selecciona un equipo para asignar una tarea a la tripulación.</p>';
  const repairing=Boolean(a?.repair);
  $('repairPrompt').hidden=!repairing||state.ended;
  $('openRepair').textContent=repairReady?'✓ Ajuste listo · revisar':'Abrir equipo ⛭';
  document.querySelector('.repairNote').textContent=repairReady?'Reparación preparada. Ejecútala para aplicar el cambio.':'Completa el ajuste para preparar esta reparación.';
  const cost=planCost(selected,$('shield').checked,$('radio').checked);
  $('cost').textContent=Number.isFinite(cost)?cost+' energía':'—';
  const e=state.events[Math.min(state.turn-1,state.events.length-1)];
  const solar=Math.max(0,e.sun-(state.faults.power&&selected!=='power'?12:0));
  $('weather').textContent=state.ended?'Misión finalizada':e.storm?'☀ Tormenta solar este turno':'◌ Actividad solar tranquila';
  $('forecastText').textContent=state.ended?'Revisa el informe y la bitácora para planear tu siguiente misión.':`${e.storm?'Refugio: exposición +3. Sin refugio: +30.':'Exposición normal: +3. Refugio: +1.'} Paneles: +${solar} energía al cerrar el turno.`;
  const oxy=10+(state.faults.air&&selected!=='air'?8:0),food=7+(state.faults.crop&&selected!=='crop'?3:0);
  $('projection').textContent=`Consumo: −${oxy} O₂, −${food} comida y −6 energía de la base (incluida).`;
  $('advance').disabled=!active||state.ended||!selected||(repairing&&!repairReady)||crewBusy();
  $('advance').innerHTML=crewBusy()?'Ayudante en camino…':'Ejecutar turno <span>→</span>';
  $('shield').disabled=!active||state.ended;
  $('radio').disabled=!active||state.ended||state.messageAt!==null;
  $('radio').closest('label').querySelector('small').textContent=state.messageAt!==null?'Respuesta en camino · espera 1 turno':'Consejo en 1 turno · −4 energía';
  $('rest').disabled=!active||state.ended;
  renderFirstPerson();
}
function render(){
  const m=missions[state.level];
  $('missionName').textContent=`MISIÓN 0${state.level+1} · ${m.name.toUpperCase()}`;
  $('objective').textContent=`Objetivo: ${m.goal} hallazgos + tripulación a salvo`;
  $('turnLabel').textContent=state.ended?'MISIÓN TERMINADA':'TURNO DE MISIÓN';
  $('turn').innerHTML=String(Math.min(state.turn,m.turns)).padStart(2,'0')+` <span>/ ${String(m.turns).padStart(2,'0')}</span>`;
  $('turnDots').innerHTML=Array.from({length:m.turns},(_,i)=>`<i class="${i+1<state.turn?'done':i+1===state.turn?'current':''}"></i>`).join('');
  $('meters').innerHTML=[['energy','Energía','ϟ'],['oxygen','Oxígeno','O₂'],['food','Alimentos','♧'],['exposure','Exposición','◈']].map(([key,name,icon])=>{const n=state[key],bad=key==='exposure'?n>=75:n<20,warn=key==='exposure'?n>=40:n<40,d=lastDelta?.[key],isBad=key==='exposure'?d>0:d<0;return `<div class="meter ${bad?'danger':warn?'warning':''}"><div class="meterTop"><span>${name}</span><b>${icon}</b></div><strong>${n}</strong><span class="unit">/100</span>${d?`<span class="delta ${isBad?'bad':''}">${d>0?'+':''}${d}</span>`:''}<progress value="${n}" max="100" aria-label="${name}${key==='exposure'?', menos es mejor':''}"></progress></div>`}).join('');
  $('science').textContent=`${state.science} / ${m.goal} ⌬`;
  ['air','power','crop'].forEach((key,i)=>$('camFault'+i).classList.toggle('faultDot',state.faults[key]));
  const event=state.events[Math.min(state.turn-1,m.turns-1)],faults=Object.entries(state.faults).filter(([,v])=>v).map(([k])=>faultNames[k]);
  $('eventBanner').classList.toggle('warning',faults.length>0||event.storm&&!state.ended);
  $('eventBanner').innerHTML=state.ended?'<span>◈</span><div>Misión cerrada<small>Tu equipo está esperando el siguiente plan.</small></div>':event.storm?`<span>☀</span><div>Tormenta solar en curso<small>${faults.length?faults.join(' · '):'Activa el refugio antes de ejecutar el turno.'}</small></div>`:faults.length?`<span>⚠</span><div>${faults.join(' · ')}<small>Localiza el punto naranja en las cámaras.</small></div>`:'<span>◎</span><div>Base bajo control<small>Haz ciencia y repón reservas mientras los sistemas funcionan.</small></div>';
  const entries=expanded?history:history.slice(0,1);
  $('message').replaceChildren(...entries.map(entry=>{const article=document.createElement('article'),title=document.createElement('b'),p=document.createElement('span');title.textContent=entry.title;p.textContent=entry.text;article.append(title,p);return article}));
  $('logToggle').textContent=expanded?'Ocultar historial ↑':'Ver historial ↓';$('logToggle').setAttribute('aria-expanded',String(expanded));
  cameraView();renderPlan();
}
function selectTask(key){
  if(!active||state.ended)return;
  if(selected!==key)repairReady=false;
  selected=key;$('error').textContent='';render();beep();
  setFeedback(actions[key].repair?'Preparando mantenimiento. Abre el equipo en el panel del plan para ajustar sus conexiones.':`${actions[key].name} preparado. Revisa el refugio y el costo antes de ejecutar el turno.`);
  if(actions[key].repair&&!repairReady)openRepair();
}
function switchCamera(next){
  camera=next;$('scene').classList.remove('switching');void $('scene').offsetWidth;$('scene').classList.add('switching');cameraView();beep();
}
function startGame(level=chosenLevel){
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  state=createMission(level);chosenLevel=level;active=true;camera=0;selected=null;repairReady=false;lastDelta=null;expanded=false;
  crewTracker.reset();
  history=[{title:'CONTROL CENTRAL / INICIO',text:missions[level].description}];$('shield').checked=false;$('radio').checked=false;$('error').textContent='';
  firstPerson.setView(true);render();setFeedback('Vega: «¡Ya estamos en Selene! A tu izquierda tienes el oxígeno y tu salud. A la derecha, las cámaras: elige un equipo para preparar el primer turno».');beep('success');
}
function openRepair(){
  if(!selected||!actions[selected].repair||state.ended)return;
  const key=selected;repairStep=0;repairReady=false;repairOrder=['A','B','C'];
  for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[repairOrder[i],repairOrder[j]]=[repairOrder[j],repairOrder[i]];}
  $('repairTitle').textContent=actions[key].name;
  $('repairInstruction').textContent=key==='air'?'Ajusta las válvulas siguiendo esta secuencia.':key==='power'?'Conecta los terminales siguiendo esta secuencia.':'Abre las líneas de agua siguiendo esta secuencia.';
  $('repairStatus').textContent='Sigue el orden de izquierda a derecha. Puedes intentarlo sin prisa.';
  $('repairSequence').innerHTML=repairOrder.map(c=>`<span>${c}</span>`).join('');
  $('repairBoard').replaceChildren(...['C','A','B'].map(c=>{const b=document.createElement('button');b.textContent=c;b.setAttribute('aria-label','Conector '+c);b.onclick=()=>{if(repairReady)return;if(c!==repairOrder[repairStep]){repairStep=0;document.querySelectorAll('#repairSequence span,#repairBoard button').forEach(n=>n.classList.remove('done'));$('repairStatus').textContent='Ese no era el siguiente. Vuelve al primer conector de la secuencia.';beep('alarm');return}b.classList.add('done');$('repairSequence').children[repairStep].classList.add('done');repairStep++;beep();if(repairStep===3){repairReady=true;$('repairStatus').textContent='✓ Equipo ajustado. Cierra esta ventana y ejecuta el turno para reparar.';renderPlan();$('repairBoard').querySelectorAll('button').forEach(btn=>btn.disabled=true);const done=document.createElement('button');done.className='primary';done.textContent='Aplicar al plan →';done.style.gridColumn='1 / -1';done.onclick=()=>{$('repairDialog').close();setFeedback('Ajuste completo. La reparación se aplicará cuando ejecutes el turno.');firstPerson.focusExecute()};$('repairBoard').append(done);beep('success');}};return b}));
  renderPlan();openDialog('repairDialog');
}
function showReport(){
  const m=missions[state.level],reasons={health:'Tu salud llegó a cero. Evita las reservas de oxígeno inferiores a 25 y usa el refugio durante las tormentas.',oxygen:'El oxígeno se agotó. Producir aire a tiempo y sellar fugas conserva las reservas.',food:'Se agotaron los alimentos. Cosechar requiere energía, pero evita que las reservas lleguen a cero.',exposure:'La exposición llegó al límite del juego. El refugio reduce el riesgo durante las tormentas.',science:`La tripulación sobrevivió, pero faltaron hallazgos: necesitabas ${m.goal}. Reserva turnos para el laboratorio.`};
  if(state.won){unlocked=Math.max(unlocked,Math.min(2,state.level+1));try{localStorage.setItem('selene-unlocked-v2',String(unlocked))}catch{}}
  $('reportIcon').textContent=state.won?'✦':'◈';$('resultTitle').textContent=state.won?'Misión cumplida, comandante.':'Una nueva estrategia te espera.';
  $('resultText').textContent=state.won?`${m.name} completada. Los tres tripulantes están a salvo y reuniste ${state.science} hallazgos.${state.level<2?' La siguiente misión está desbloqueada.':' ¡Completaste las tres misiones de Selene!'}`:reasons[state.reason];
  $('reportStats').innerHTML=`<div><strong>${state.science}/${m.goal}</strong><small>HALLAZGOS</small></div><div><strong>${state.repairs}</strong><small>REPARACIONES</small></div><div><strong>${state.sheltered}</strong><small>TORMENTAS A CUBIERTO</small></div>`;
  $('lesson').textContent=state.won?'Lo que aprendiste: la misma energía alimenta el soporte vital, la ciencia y el refugio. Reparar hoy puede ahorrar recursos en los siguientes turnos.':'Prueba otra ruta: observa qué recurso baja más rápido y revisa el pronóstico antes de comprometer la energía. Equivocarte también ayuda a planear.';
  $('nextMission').hidden=!state.won||state.level===2;
  $('again').textContent=state.won?'Repetir esta misión':'Volver a intentarlo';openDialog('report');beep(state.won?'success':'alarm');
}
$('advance').onclick=()=>{
  if(!active||state.ended)return;
  if(crewBusy()){$('error').textContent='Espera a que el ayudante llegue al equipo.';renderFirstPerson();return;}
  if(actions[selected]?.repair&&!repairReady){$('error').textContent='Primero completa el ajuste manual del equipo.';renderFirstPerson();return;}
  const error=validatePlan(state,selected,$('shield').checked,$('radio').checked);if(error){$('error').textContent=error;renderFirstPerson();beep('alarm');return;}
  const turn=state.turn,task=actions[selected].name,result=advance(state,selected,$('shield').checked,$('radio').checked);
  state=result.state;lastDelta=result.delta;history.unshift({title:`TURNO ${String(turn).padStart(2,'0')} / ${task.toUpperCase()}`,text:result.notes.join(' ')});
  selected=null;repairReady=false;$('shield').checked=false;$('radio').checked=false;$('error').textContent='';
  render();setFeedback(`Turno ${turn} completado. ${result.notes[0]} ${state.ended?'Consulta el informe de misión.':'Revisa los recursos y el nuevo pronóstico antes de actuar.'}`);beep();if(state.ended)showReport();
};
$('cameras').onclick=e=>{const b=e.target.closest('[data-cam]');if(b)switchCamera(Number(b.dataset.cam))};
$('rest').onclick=()=>selectTask('rest');$('openRepair').onclick=openRepair;
$('shield').onchange=()=>{renderPlan();cameraView();beep();setFeedback($('shield').checked?'Tripulación preparada para entrar al refugio. Cuesta 8 energía adicionales en este turno.':'Refugio desactivado para este turno. Revisa la actividad solar antes de continuar.');};
$('radio').onchange=()=>{renderPlan();beep()};
$('menuButton').onclick=()=>{chosenLevel=active?state.level:chosenLevel;missionMenu();openDialog('welcome')};
$('start').onclick=()=>startGame();$('resume').onclick=()=>$('welcome').close();
$('again').onclick=()=>startGame(state.level);$('nextMission').onclick=()=>startGame(state.level+1);$('review').onclick=()=>{$('report').close();expanded=true;render()};
$('help').onclick=()=>openDialog('helpDialog');$('sourcesButton').onclick=()=>openDialog('sourcesDialog');
$('logToggle').onclick=()=>{expanded=!expanded;render()};
$('sound').onclick=()=>{soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').querySelector('span').textContent='Sonido: '+(soundOn?'sí':'no');beep()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('welcome').addEventListener('cancel',e=>{if(!active)e.preventDefault()});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(['1','2','3','4'].includes(e.key)&&!['INPUT','TEXTAREA'].includes(e.target.tagName)){switchCamera(Number(e.key)-1);e.preventDefault()}});
history=[{title:'SELENE / EN ESPERA',text:'Tu tripulación espera instrucciones. Inicia una misión para tomar el mando.'}];render();missionMenu();openDialog('welcome');
