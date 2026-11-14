import {withOperations} from './operations.js';
import {validateSession} from './survival.js';
export const SAVE_KEY='selene-3d-save-v1',SETTINGS_KEY='selene-3d-settings-v1';
export const defaults={sensitivity:1,fov:74,volume:.45,quality:'medium',shadows:true,effects:true,smoothing:false,bob:true,reducedMotion:false,oxygenIntensity:.8,subtitles:true};
export function cleanSettings(value={}){const s={...defaults};for(const key of ['shadows','effects','smoothing','bob','reducedMotion','subtitles'])if(typeof value[key]==='boolean')s[key]=value[key];for(const [key,min,max] of [['sensitivity',.2,2.5],['fov',55,100],['volume',0,1],['oxygenIntensity',0,1]])if(Number.isFinite(value[key]))s[key]=Math.max(min,Math.min(max,value[key]));if(['low','medium','high'].includes(value.quality))s.quality=value.quality;return s}
export function readSettings(){try{return cleanSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'))}catch{return{...defaults}}}
export function writeSettings(settings){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));return true}catch{return false}}
export function serialise(session){if(!validateSession(session))throw Error('La partida no tiene un formato válido.');return JSON.stringify(session)}
export function parseSave(text){if(typeof text!=='string'||text.length>2000000)throw Error('Archivo de partida no válido.');const session=JSON.parse(text);if(!validateSession(session))throw Error('Partida dañada o de otra versión.');return withOperations(session)}
export function saveLocal(session){try{localStorage.setItem(SAVE_KEY,serialise(session));return true}catch{return false}}
export function loadLocal(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?parseSave(raw):null}catch{return null}}
