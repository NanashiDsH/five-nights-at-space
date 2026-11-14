import {actions,faultNames,getDiagnostics} from './engine.js';
export const crewDefinitions=[{id:'vega',name:'Vega',role:'INGENIERÍA',color:'#efbb79'},{id:'sol',name:'Sol',role:'CULTIVOS',color:'#92d3c4'},{id:'leo',name:'Leo',role:'CIENCIA',color:'#cda0b4'}];
const roomPoints=[{x:120,y:90},{x:480,y:90},{x:120,y:290},{x:480,y:290}];
const controlPoint={x:300,y:190};
export function crewOrders(s,selected=null,shield=false){
  if(shield||(s.ended&&s.shield))return crewDefinitions.map(person=>({...person,destination:0,job:'Refugio',kind:'shelter'}));
  const orders=crewDefinitions.map(person=>({...person,destination:null,job:s.ended?'Misión terminada':'En control',kind:'idle'}));
  if(s.ended)return orders;
  const assigned=new Set();
  function assign(index,destination,job,kind){orders[index]={...orders[index],destination,job,kind};assigned.add(index)}
  const action=actions[selected];
  if(action?.camera!==null&&action?.camera!==undefined){const index=['grow','crop'].includes(selected)?1:selected==='research'?2:0;assign(index,action.camera,action.name,'task')}
  const jobs=[...(s.faults.air?[{zone:0,index:0,text:'Inspeccionar fuga'}]:[]),...(s.faults.power?[{zone:1,index:0,text:'Revisar paneles'}]:[]),...(s.faults.crop?[{zone:2,index:1,text:'Revisar riego'}]:[]),...(s.food<30?[{zone:2,index:1,text:'Revisar alimentos'}]:[]),...(s.oxygen<25?[{zone:0,index:0,text:'Revisar oxígeno'}]:[])];
  for(const job of jobs){if(orders.some(o=>o.destination===job.zone))continue;const index=!assigned.has(job.index)?job.index:[2,0,1].find(i=>!assigned.has(i));if(index!==undefined)assign(index,job.zone,job.text,'inspect')}
  return orders;
}
export function routeBetween(from,to){
  const points=[{...from},{x:300,y:from.y},{x:300,y:to.y},{...to}];
  return points.filter((point,i)=>!i||point.x!==points[i-1].x||point.y!==points[i-1].y);
}
export function pointOnRoute(points,distance){
  if(!points.length)return {...controlPoint};
  for(let i=1;i<points.length;i++){const from=points[i-1],to=points[i],length=Math.hypot(to.x-from.x,to.y-from.y);if(distance<=length){const t=length?Math.max(0,distance)/length:1;return{x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t}}distance-=length}
  return {...points[points.length-1]};
}
export function createCrewTracker({onFrame,onArrival}){
  let people=[],frame=null,lastTime=0;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function snapshot(){return people.map(p=>({...p,position:{...p.position},path:p.path.map(point=>({...point}))}))}
  function reset(){if(frame!==null)cancelAnimationFrame(frame);frame=null;lastTime=0;people=crewDefinitions.map((p,i)=>({...p,position:{...controlPoint},destination:null,zone:null,job:'En control',kind:'idle',moving:false,path:[],distance:0,length:0,arrivedAt:0}));onFrame(snapshot())}
  function tick(now){const dt=lastTime?Math.min((now-lastTime)/1000,.1):0;lastTime=now;let arrived=false;for(const p of people){if(!p.moving)continue;p.distance=Math.min(p.length,p.distance+dt*175);p.position=pointOnRoute(p.path,p.distance);if(p.distance>=p.length){p.moving=false;p.zone=p.destination;p.arrivedAt=now;arrived=true}}
    onFrame(snapshot());if(arrived)onArrival();if(people.some(p=>p.moving))frame=requestAnimationFrame(tick);else{frame=null;lastTime=0}}
  function setOrders(orders){let changed=false;orders.forEach((order,i)=>{const p=people[i];if(p.job!==order.job||p.kind!==order.kind)changed=true;p.job=order.job;p.kind=order.kind;if(p.destination===order.destination)return;changed=true;p.destination=order.destination;p.zone=null;p.path=routeBetween(p.position,order.destination===null?controlPoint:roomPoints[order.destination]);p.length=p.path.slice(1).reduce((sum,point,j)=>sum+Math.hypot(point.x-p.path[j].x,point.y-p.path[j].y),0);p.distance=0;p.moving=p.length>0&&!reduced;if(!p.moving){p.position={...(order.destination===null?controlPoint:roomPoints[order.destination])};p.zone=order.destination;p.arrivedAt=0}});if(changed)onFrame(snapshot());if(people.some(p=>p.moving)&&frame===null)frame=requestAnimationFrame(tick)}
  reset();return{reset,setOrders,snapshot};
}
export function mountControlMap({onCamera,onControl}){
  const root=document.createElement('section');root.className='controlMap fpMap';root.setAttribute('aria-label','Mapa de la cámara de control y ubicación de ayudantes');
  root.innerHTML='<div class="mapHeading"><span>CAM 00 / MAPA DE CONTROL</span><b id="mapAlertCount">SIN ALERTAS</b></div><div class="mapDiagram"><svg viewBox="0 0 600 380" preserveAspectRatio="none" aria-hidden="true"><path d="M120 90H480M120 290H480M300 90V290" stroke="#10272f" stroke-width="32" fill="none"/><path d="M120 90H480M120 290H480M300 90V290" stroke="#426369" stroke-width="2" stroke-dasharray="5 6" fill="none"/><g id="mapRoutes"></g></svg><div id="mapRooms"></div><button class="mapControlRoom" id="mapControlRoom"><small>CAM 00</small><b>CONTROL</b><span>TÚ ESTÁS AQUÍ</span></button><div id="mapCrewMarkers"></div></div><div class="mapCrewList" id="mapCrewList"></div><p class="mapDispatchStatus" id="mapDispatchStatus" aria-live="polite">Los ayudantes esperan en control.</p><p class="mapLegend"><span>●</span> Alerta <span>┄</span> Ruta del ayudante · Inspeccionar no repara: prepara y ejecuta la tarea.</p>';
  const fpRoom=document.querySelector('.fpRoom'),viewport=document.querySelector('.viewport');fpRoom.append(root);
  const el=id=>document.getElementById(id),names=['HÁBITAT','PANELES','CULTIVOS','LABORATORIO'];
  el('mapRooms').replaceChildren(...roomPoints.map((point,i)=>{const room=document.createElement('button');room.className='mapRoom';room.style.left=(point.x/6)+'%';room.style.top=(point.y/3.8)+'%';room.dataset.mapCam=String(i);room.setAttribute('aria-pressed','false');room.innerHTML=`<small>CAM 0${i+1}</small><b>${names[i]}</b><span class="mapRoomStatus">ESTABLE</span>`;room.onclick=()=>onCamera(i);return room}));
  el('mapControlRoom').onclick=onControl;
  const markers=new Map();crewDefinitions.forEach(person=>{const marker=document.createElement('div');marker.className='mapCrewMarker';marker.style.setProperty('--crew-color',person.color);marker.innerHTML=`<span class="mapHelmet"><i></i></span><b>${person.name}</b>`;marker.setAttribute('aria-label',person.name+' en control');el('mapCrewMarkers').append(marker);markers.set(person.id,marker)});
  let previousAnnouncement='',previousRoutes='',lastCrew=[];
  function updateCrew(people){lastCrew=people;people.forEach((p,i)=>{const marker=markers.get(p.id),spread=p.moving?i*5:(i-1)*22;marker.style.left=((p.position.x+spread)/6)+'%';marker.style.top=((p.position.y+(p.moving?i*4:25))/3.8)+'%';marker.classList.toggle('walking',p.moving);marker.setAttribute('aria-label',`${p.name}: ${p.moving?'en camino a ':''}${p.destination===null?'control':names[p.destination].toLowerCase()}`)});
    const routeSignature=JSON.stringify(people.filter(p=>p.moving).map(p=>[p.id,p.path]));
    if(routeSignature!==previousRoutes){previousRoutes=routeSignature;el('mapRoutes').replaceChildren(...people.filter(p=>p.moving).map(p=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',p.path.map((pt,i)=>(i?'L':'M')+pt.x+' '+pt.y).join(' '));path.setAttribute('stroke',p.color);path.setAttribute('stroke-width','3');path.setAttribute('stroke-dasharray','7 6');path.setAttribute('fill','none');path.setAttribute('opacity','.7');return path}));}
    const announcement=people.map(p=>`${p.name}: ${p.moving?'en camino a ':''}${p.destination===null?'control':names[p.destination].toLowerCase()}${p.kind==='inspect'?' · revisando alerta':''} · ${p.kind}`).join('. ');
    if(announcement!==previousAnnouncement){el('mapCrewList').replaceChildren(...people.map(p=>{const row=document.createElement('div');const dot=document.createElement('i');dot.style.background=p.color;const info=document.createElement('span');info.textContent=`${p.name} · ${p.moving?'En camino':p.kind==='inspect'?'Inspeccionando':p.kind==='task'?'En el equipo':p.kind==='shelter'?'En refugio':'En control'}`;row.append(dot,info);return row}));
    el('mapDispatchStatus').textContent=people.map(p=>`${p.name}: ${p.moving?'en camino a ':''}${p.destination===null?'control':names[p.destination].toLowerCase()}${p.kind==='inspect'?' · revisando alerta':''}`).join('. ');previousAnnouncement=announcement}}
  function render({state:s,camera,active}){
    const warningZones=new Set();if(s.faults.air||s.oxygen<25)warningZones.add(0);if(s.faults.power)warningZones.add(1);if(s.faults.crop||s.food<30)warningZones.add(2);
    el('mapAlertCount').textContent=!active?'EN ESPERA':warningZones.size?`${warningZones.size} ${warningZones.size===1?'ZONA EN WARNING':'ZONAS EN WARNING'}`:'SIN ALERTAS';el('mapAlertCount').classList.toggle('hasAlerts',warningZones.size>0);
    el('mapRooms').querySelectorAll('button').forEach((room,i)=>{const fault=['air','power','crop',null][i];room.classList.toggle('warning',warningZones.has(i));room.classList.toggle('current',camera===i);room.setAttribute('aria-pressed',String(camera===i));room.querySelector('.mapRoomStatus').textContent=warningZones.has(i)?fault&&s.faults[fault]?'⚠ FALLA':'⚠ RESERVA BAJA':'ESTABLE';room.setAttribute('aria-label',`Cámara ${i+1}: ${names[i]}${warningZones.has(i)?', warning':''}`)});
  }
  return{render,updateCrew,setView(fp){root.classList.toggle('fpMap',fp);root.classList.toggle('classicMap',!fp);if(fp)fpRoom.append(root);else viewport.append(root);updateCrew(lastCrew)}};
}
