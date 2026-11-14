var PairLogic = (()=>{
 const D=PAIR_DATA;
 const valid=v=>Number.isInteger(v)&&v>=0&&v<=4;
 const average=values=>{const a=values.filter(valid);return {value:a.length>=4?a.reduce((s,v)=>s+v,0)/a.length:null,n:a.length,total:6};};
 function score(answers,id,field){return average(Array.from({length:6},(_,i)=>answers[`${id}-${i}`]?.[field]));}
 function summaries(state){return D.dimensions.filter(d=>!d.optional||state.meta.sexual).map(d=>({id:d.id,self:score(state.answers,d.id,'self'),partner:score(state.answers,d.id,'partner'),importance:valid(state.importance[d.id])?state.importance[d.id]:null}));}
 function newState(){return {participantId:crypto.randomUUID(),measurementId:crypto.randomUUID(),meta:{alias:'',pairCode:'',start:'',end:'',sexual:false,mode:'solo',adult:false,voluntary:false},answers:{},importance:{},context:{},open:{},plan:{},step:0};}
 function shared(state,options){
  const ids=D.dimensions.filter(d=>!d.optional||state.meta.sexual&&options.sexual).map(d=>d.id);
  const out={schema:D.schema,version:D.version,kind:'shared',participantId:state.participantId,measurementId:state.measurementId,alias:state.meta.alias,pairCode:state.meta.pairCode.trim().toUpperCase(),period:{start:state.meta.start,end:state.meta.end},consent:true,scope:{sexual:!!options.sexual,items:!!options.items,text:!!options.text},summaries:summaries(state).filter(s=>ids.includes(s.id)),context:{...state.context}};
  if(options.items)out.answers=Object.fromEntries(Object.entries(state.answers).filter(([k])=>ids.some(id=>k.startsWith(id+'-'))));
  if(options.text)out.open=Object.fromEntries(Object.entries(state.open).filter(([k])=>k!=='sexualSatisfaccion'||options.sexual));
  return out;
 }
 const dateOK=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00').valueOf())&&new Date(s+'T12:00:00').toISOString().slice(0,10)===s;
 function validate(p,kind='shared'){
  if(!p||typeof p!=='object'||p.schema!==D.schema||p.version!==D.version||p.kind!==kind)throw Error('El archivo no corresponde a esta versión del cuestionario.');
  if(kind==='draft'){
   if(!p.state||typeof p.state.answers!=='object'||typeof p.state.meta!=='object'||!p.state.participantId||!p.state.measurementId)throw Error('Borrador incompleto.');
   validateState(p.state);return p;
  }
  if(!p.participantId||typeof p.participantId!=='string'||!p.measurementId||typeof p.alias!=='string'||p.alias.length>60||!/^[-A-Z0-9]{6,32}$/.test(p.pairCode)||!p.consent||!dateOK(p.period?.start)||!dateOK(p.period?.end)||p.period.start>p.period.end||!Array.isArray(p.summaries)||!p.scope)throw Error('El informe tiene datos incompletos o no válidos.');
  const seen=new Set();
  for(const s of p.summaries){
   if(!D.dimensions.some(d=>d.id===s.id)||seen.has(s.id)||s.id==='intimidad'&&!p.scope.sexual)throw Error('Áreas del informe no válidas.');seen.add(s.id);
   for(const k of ['self','partner']){const x=s[k];if(!x||!Number.isInteger(x.n)||x.n<0||x.n>6||x.total!==6||!(x.value===null?x.n<4:typeof x.value==='number'&&x.value>=0&&x.value<=4&&x.n>=4))throw Error('Resultado descriptivo no válido.');}
   if(s.importance!==null&&!valid(s.importance))throw Error('Prioridad no válida.');
  }
  if(!p.scope.sexual&&(p.answers&&Object.keys(p.answers).some(k=>k.startsWith('intimidad-'))||p.open?.sexualSatisfaccion))throw Error('El archivo contiene un módulo que no se autorizó compartir.');
  if(p.answers&&!p.scope.items||p.open&&!p.scope.text)throw Error('El contenido no coincide con los permisos elegidos.');
  if(p.answers)for(const [k,a]of Object.entries(p.answers)){if(!/^([a-z]+)-[0-5]$/.test(k)||!seen.has(k.split('-')[0])||typeof a!=='object'||['self','partner'].some(f=>a[f]!==undefined&&a[f]!==null&&!valid(a[f])))throw Error('Respuestas no válidas.');}
  if(p.context&&Object.entries(p.context).some(([k,v])=>!D.context.some(c=>c.id===k)||v!==null&&!valid(v)))throw Error('Contexto no válido.');
  if(p.open&&Object.entries(p.open).some(([k,v])=>!D.open.some(o=>o.id===k)||typeof v!=='string'||v.length>4000))throw Error('Texto no válido.');
  return p;
 }
 function validateState(s){
  if(typeof s.meta.alias!=='string'||s.meta.alias.length>60||typeof s.meta.pairCode!=='string'||typeof s.meta.sexual!=='boolean'||!s.importance||!s.context||!s.open||!s.plan)throw Error('Borrador no válido.');
  for(const [k,a]of Object.entries(s.answers))if(!D.dimensions.some(d=>Array.from({length:6},(_,i)=>d.id+'-'+i).includes(k))||typeof a!=='object'||['self','partner'].some(f=>a[f]!==undefined&&a[f]!==null&&!valid(a[f])))throw Error('Borrador con respuestas no válidas.');
  for(const [k,v]of Object.entries(s.open))if(!D.open.some(o=>o.id===k)||typeof v!=='string'||v.length>4000)throw Error('Borrador con texto no válido.');
  for(const [k,v]of Object.entries(s.importance))if(!D.dimensions.some(d=>d.id===k)||v!==null&&!valid(v))throw Error('Borrador con prioridades no válidas.');
  for(const [k,v]of Object.entries(s.context))if(!D.context.some(c=>c.id===k)||v!==null&&!valid(v))throw Error('Borrador con contexto no válido.');
  if(Object.entries(s.plan).some(([k,v])=>!D.dimensions.some(d=>d.id===k)||!v||typeof v!=='object'||Object.values(v).some(t=>typeof t!=='string'||t.length>4000)))throw Error('Plan no válido.');
  if(!Number.isInteger(s.step)||s.step<0||s.step>10)throw Error('Paso no válido.');
 }
 function pair(a,b,mode='couple'){
  validate(a);validate(b);
  if(a.pairCode!==b.pairCode)throw Error('Los códigos de pareja no coinciden.');
  if(mode==='couple'){
   if(a.participantId===b.participantId)throw Error('Has cargado dos informes de la misma persona. Usa Seguimiento para comparar dos mediciones personales.');
   if(a.period.start!==b.period.start||a.period.end!==b.period.end)throw Error('Los informes deben referirse al mismo periodo. Revisad las fechas antes de compararlos.');
  }else{
   if(a.participantId!==b.participantId)throw Error('El seguimiento requiere dos mediciones de la misma persona. Inícialo desde su resultado individual.');
   if(a.measurementId===b.measurementId||a.period.end===b.period.end)throw Error('Selecciona mediciones diferentes para el seguimiento.');
  }
  return true;
 }
 function suggestions(rows,perspective='partner'){const frequency=r=>r[perspective]?.value??(perspective==='self'?null:r.self.value);return [...rows].filter(r=>frequency(r)!==null).sort((a,b)=>(b.importance??-1)-(a.importance??-1)||(frequency(a)-frequency(b))).slice(0,2).map(x=>x.id);}
 async function key(password,salt){const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
 const b64=bytes=>{let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s);};
 const un64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function encrypt(payload,password){if(password.length<12)throw Error('Usa una frase de contraseña de al menos 12 caracteres.');if(!crypto.subtle)throw Error('Abre la aplicación mediante HTTPS para proteger el archivo.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(password,salt),new TextEncoder().encode(JSON.stringify(payload)));return JSON.stringify({format:'eudemonia-encrypted-1',salt:b64(salt),iv:b64(iv),data:b64(bytes)});}
 async function decrypt(text,password){if(text.length>2000000)throw Error('El archivo es demasiado grande.');let e;try{e=JSON.parse(text);}catch{throw Error('Archivo no reconocido.');}if(e.format!=='eudemonia-encrypted-1'||typeof e.salt!=='string'||typeof e.iv!=='string'||typeof e.data!=='string')throw Error('Selecciona un archivo protegido de esta aplicación.');try{const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(e.iv)},await key(password,un64(e.salt)),un64(e.data));return JSON.parse(new TextDecoder().decode(bytes));}catch{throw Error('No se pudo abrir: comprueba la contraseña y que el archivo no haya sido modificado.');}}
 return {valid,average,score,summaries,newState,shared,validate,validateState,pair,suggestions,encrypt,decrypt,dateOK};
})();
