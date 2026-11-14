export const missions = [
  {name:'Primer contacto', subtitle:'Aprende a mantener viva la base', turns:6, goal:2, storms:[3], faults:{2:'air'}, description:'Recibe a la tripulación, repara una fuga y reúne 2 hallazgos. Una tormenta llegará en el turno 3.'},
  {name:'Noche en Selene', subtitle:'La energía es parte de cada decisión', turns:8, goal:4, storms:[3,6], faults:{2:'power',5:'air'}, description:'Los paneles necesitan mantenimiento. Completa 8 turnos y reúne 4 hallazgos, con dos tormentas en camino.'},
  {name:'Horizonte rojo', subtitle:'Una prueba para todo tu equipo', turns:10, goal:6, storms:[3,6,9], faults:{2:'air',4:'power',7:'crop'}, description:'Administra 10 turnos, tres averías y tres tormentas. Tu objetivo: volver con 6 hallazgos y la tripulación a salvo.'}
];
export const actions = {
  oxygen:{name:'Producir oxígeno',camera:0,cost:16,oxygen:28,food:0,science:0,icon:'O₂',description:'Enciende el generador de oxígeno. Consume electricidad para reponer el aire de la base.',effect:'+28 oxígeno · −16 energía'},
  air:{name:'Sellar la fuga',camera:0,cost:12,repair:'air',icon:'⛭',description:'Ajusta las tres válvulas en el orden indicado. Reparar ocupa el trabajo de este turno.',effect:'Elimina la pérdida extra de 8 oxígeno por turno'},
  power:{name:'Reparar los paneles',camera:1,cost:14,repair:'power',icon:'ϟ',description:'Reconecta el circuito siguiendo el orden de los conectores. Reparar ocupa el trabajo de este turno.',effect:'Recupera 12 de generación solar por turno'},
  grow:{name:'Cosechar alimentos',camera:2,cost:14,oxygen:4,food:24,science:0,icon:'♧',description:'Dedica energía al riego y la iluminación. El crecimiento de los cultivos está acelerado para jugar.',effect:'+24 alimentos · +4 oxígeno · −14 energía'},
  crop:{name:'Restaurar el riego',camera:2,cost:10,repair:'crop',icon:'◈',description:'Abre las líneas de riego en el orden indicado para recuperar el invernadero.',effect:'Recupera la cosecha completa y evita pérdidas extra'},
  research:{name:'Analizar muestras',camera:3,cost:12,oxygen:0,food:0,science:2,icon:'⌬',description:'Usa el laboratorio para analizar rocas lunares. El trabajo científico comparte la energía con el soporte vital.',effect:'+2 hallazgos · −12 energía'},
  rest:{name:'Guardar reservas',camera:null,cost:0,oxygen:0,food:0,science:0,icon:'☾',description:'No enciendas equipos de trabajo. La base sigue consumiendo aire, alimentos y electricidad.',effect:'Sin tarea extra · se mantiene el consumo de la base'}
};
export const faultNames={air:'Fuga de oxígeno',power:'Paneles desconectados',crop:'Riego bloqueado'};
export function getDiagnostics(s){
  const foodUse=7+(s.faults.crop?3:0),lowFood=s.food<30;
  const affected=[['air',0],['power',1],['crop',2]].filter(([key])=>s.faults[key]);
  return [
    {key:'food',name:'ALIMENTOS',severity:s.food<=foodUse?'critical':lowFood?'warning':'ok',text:s.food<=foodUse?`Comida insuficiente para el próximo turno (${s.food}/100).`:lowFood?`Queda poca comida (${s.food}/100). Prepara una cosecha.`:`Reservas estables: ${s.food}/100.`,camera:2,action:lowFood?'grow':null,button:lowFood?'Preparar cosecha':'Ver cultivos'},
    {key:'vent',name:'VENTILACIÓN',severity:s.faults.air?'critical':s.oxygen<25?'warning':'ok',text:s.faults.air?'Fuga en el circuito de aire: pierdes 8 O₂ extra por turno.':s.oxygen<25?'Circuito funcionando, pero el oxígeno está bajo.':'Circuito de aire funcionando. Sin fugas.',camera:0,action:s.faults.air?'air':s.oxygen<25?'oxygen':null,button:s.faults.air?'Preparar reparación':s.oxygen<25?'Producir oxígeno':'Ver hábitat'},
    {key:'cameras',name:'CÁMARAS',severity:affected.length?'warning':'ok',text:affected.length?`Revisa ${affected.map(([,i])=>'CAM 0'+(i+1)).join(', ')}: se detectan averías en esas zonas.`:'4 cámaras con señal. Ninguna zona reporta averías.',camera:affected.length?affected[0][1]:null,action:null,button:affected.length?'Ver zona con alerta':null}
  ];
}
const limit=n=>Math.max(0,Math.min(100,n));
export function createMission(level=0,random=Math.random){
  if(!Number.isInteger(level)||!missions[level]) throw new Error('Misión desconocida');
  const m=missions[level];
  return {level,turn:1,energy:80,oxygen:75,food:70,health:100,exposure:0,science:0,shield:false,messageAt:null,ended:false,won:false,reason:'',faults:{air:false,power:false,crop:false},repairs:0,sheltered:0,events:Array.from({length:m.turns},(_,i)=>({storm:m.storms.includes(i+1),sun:24+Math.floor(random()*7),fault:m.faults[i+1]??null}))};
}
export function planCost(action,shield=false,radio=false){return actions[action]?6+actions[action].cost+(shield?8:0)+(radio?4:0):Infinity}
export function validatePlan(s,action,shield=false,radio=false){
  if(s.ended)return 'La misión terminó. Inicia otra para seguir jugando.';
  const a=actions[action];
  if(!a)return 'Selecciona una tarea en las cámaras.';
  if(a.repair&&!s.faults[a.repair])return 'Este equipo funciona. Elige otra tarea.';
  if(s.energy<planCost(action,shield,radio))return 'Falta energía para ese plan. Cambia la tarea o los extras.';
  if(radio&&s.messageAt!==null)return 'La Tierra todavía está preparando una respuesta.';
  return '';
}
export function advance(s,action,shield=false,radio=false){
  const error=validatePlan(s,action,shield,radio);if(error)return {state:s,error};
  const a=actions[action], event=s.events[s.turn-1], m=missions[s.level];
  const faults={...s.faults};if(a.repair)faults[a.repair]=false;
  const solar=Math.max(0,event.sun-(faults.power?12:0));
  const oxygenUse=10+(faults.air?8:0), foodUse=7+(faults.crop?3:0);
  const foodGain=action==='grow'?(faults.crop?10:24):0;
  const dose=event.storm?(shield?3:30):(shield?1:3);
  const n={...s,faults,energy:limit(s.energy-planCost(action,shield,radio)+solar),oxygen:limit(s.oxygen-oxygenUse+(a.oxygen??0)),food:limit(s.food-foodUse+foodGain),science:s.science+(a.science??0),exposure:limit(s.exposure+dose),shield,repairs:s.repairs+(a.repair?1:0),sheltered:s.sheltered+(event.storm&&shield?1:0)};
  const notes=[`${a.name}: ${a.repair?'avería reparada.':a.effect+'.'}`,`Paneles +${solar} energía. Consumo de la base: −${oxygenUse} oxígeno, −${foodUse} alimentos, −6 energía.`];
  const healthLoss=(n.oxygen<25?6:0)+(event.storm&&!shield?8:0);
  n.health=limit(s.health-healthLoss);
  if(healthLoss)notes.push(`Salud −${healthLoss}: ${[n.oxygen<25?'reserva de oxígeno muy baja':'',event.storm&&!shield?'tormenta sin refugio':''].filter(Boolean).join(' y ')}. Es un indicador simplificado del juego.`);
  if(event.storm)notes.push(shield?'Toda la tripulación estuvo en el refugio: exposición +3.':'La tripulación quedó expuesta a la tormenta: exposición +30.');
  if(s.messageAt===s.turn){n.messageAt=null;notes.push('TIERRA: el refugio reduce la exposición; las reparaciones detienen pérdidas en turnos futuros. No esperes a quedarte sin reservas.');}
  if(radio){n.messageAt=s.turn+1;notes.push('Consejo solicitado. Llegará al terminar el siguiente turno.');}
  n.reason=n.oxygen<=0?'oxygen':n.food<=0?'food':n.health<=0?'health':n.exposure>=100?'exposure':s.turn===m.turns&&n.science<m.goal?'science':'';
  n.ended=Boolean(n.reason)||s.turn===m.turns;n.won=n.ended&&!n.reason;
  n.turn=s.turn+1;
  if(!n.ended){const next=n.events[n.turn-1];if(next.fault){n.faults[next.fault]=true;notes.push(`NUEVA ALERTA: ${faultNames[next.fault]}. Revisa la cámara correspondiente.`);}}
  return {state:n,notes,delta:{energy:n.energy-s.energy,oxygen:n.oxygen-s.oxygen,food:n.food-s.food,health:n.health-s.health,exposure:n.exposure-s.exposure}};
}
