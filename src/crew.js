import {workerFor,withOperations,isAvailable} from './operations.js';
import {actions} from './engine.js';
import {worldRoute,cameraRooms,canStand,insideBase} from './layout.js';
export const crewDefinitions=[{id:'vega',name:'Vega',role:'INGENIERÍA',color:'#efad65'},{id:'sol',name:'Sol',role:'CULTIVOS',color:'#73dccb'},{id:'leo',name:'Leo',role:'CIENCIA',color:'#b6a0ef'}];
export function crewOrders(s,selected=null,shield=false,session=null){
 const context=session?withOperations(session):{mission:s,selected,operations:{team:Object.fromEntries(crewDefinitions.map(p=>[p.id,{fatigue:0,resting:false}]))}};
 if(shield||(s.ended&&s.shield))return crewDefinitions.map(p=>({...p,destination:0,job:'Refugio',kind:'shelter'}));
 const orders=crewDefinitions.map(p=>({...p,destination:context.operations.team[p.id].resting?0:null,job:context.operations.team[p.id].resting?'Descansando en el hábitat':s.ended?'Misión terminada':'Disponible',kind:context.operations.team[p.id].resting?'rest':'idle'}));
 if(s.ended)return orders;
 const action=actions[selected],actor=workerFor({...context,selected},selected);
 if(action?.camera!==null&&action?.camera!==undefined&&actor&&actor!=='player'&&isAvailable(context,actor)){
  const index=crewDefinitions.findIndex(p=>p.id===actor);
  if(index>=0)orders[index]={...orders[index],destination:action.camera,job:action.name,kind:'task'};
 }
 return orders;
}
export class CrewSystem{
 constructor(world,onArrival,{onTravel=()=>{}}={}){this.world=world;this.onArrival=onArrival;this.onTravel=onTravel;crewDefinitions.forEach(p=>world.makeRobot(p));this.reset()}
 reset(saved=[]){this.people=crewDefinitions.map((p,i)=>{const old=saved.find(o=>o.id===p.id),safe=old?.position&&Number.isFinite(old.position.x)&&Number.isFinite(old.position.z)&&insideBase(old.position.x,old.position.z);return{...p,position:safe?{x:old.position.x,z:old.position.z}:[{x:-4.5,z:-.6},{x:4.8,z:-.6},{x:-4.5,z:-3.5}][i],destination:saved.length?undefined:'control',zone:saved.length?null:'control',kind:'idle',job:'Disponible',moving:false,path:[],index:1,angle:0}})}
 setOrders(orders){orders.forEach((order,i)=>{const p=this.people[i];p.kind=order.kind;p.job=order.job;const destination=order.destination===null?'control':cameraRooms[order.destination];if(p.destination===destination&&Boolean(p.restSpot)===(order.kind==='rest'))return;p.restSpot=order.kind==='rest';p.destination=destination;p.path=worldRoute(p.position,destination);const last=p.path[p.path.length-1];if(order.kind==='rest'){Object.assign(last,[{x:-22,z:4.8},{x:-20,z:4.8},{x:-20.8,z:4.8}][i])}else if(destination==='control'){Object.assign(last,[{x:-4.5,z:-.6},{x:4.8,z:-.6},{x:-4.5,z:-3.5}][i])}else last.x+=(i-1)*.3;p.index=1;p.moving=true;p.zone=null})}
 update(dt){for(const p of this.people){if(!p.moving)continue;let remaining=dt*3.2;while(remaining>0&&p.index<p.path.length){const target=p.path[p.index],dx=target.x-p.position.x,dz=target.z-p.position.z,distance=Math.hypot(dx,dz);if(distance<.04){p.index++;continue}const amount=Math.min(remaining,distance,.065),next={x:p.position.x+dx/distance*amount,z:p.position.z+dz/distance*amount};if(!canStand(next.x,next.z,this.world.obstacles,this.world.doorStates,.18))break;this.onTravel(p.id,Math.hypot(next.x-p.position.x,next.z-p.position.z));p.position=next;p.angle=Math.atan2(dx,dz);remaining-=amount;if(distance<=amount+.01)p.index++}if(p.index>=p.path.length){p.moving=false;p.zone=p.destination;this.onArrival?.(p)}}}
 busy(shield){return this.people.some(p=>p.moving&&(p.kind==='task'||shield))}
 snapshot(){return this.people.map(p=>({...p,position:{...p.position},path:p.path.map(pt=>({...pt}))}))}
}
