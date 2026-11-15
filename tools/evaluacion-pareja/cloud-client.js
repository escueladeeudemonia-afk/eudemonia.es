import {createClient} from '@supabase/supabase-js';
const cfg=globalThis.PAIR_CLOUD_CONFIG;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let client,app,user,active=null,revision=0,workspace=null,comparisonActive=false,expanded=false,timer,queue=Promise.resolve(),changes=0,saved=0,planChanges=0,planSaved=0;
let invitation='';
const date=offset=>{const d=new Date();d.setDate(d.getDate()+offset);return d.toLocaleDateString('sv-SE');};
const panel=()=>document.querySelector('#cloud-panel');
const api=async(action,input={})=>{const{data,error}=await client.rpc('relationship_api',{action,input});if(error){if(error.code==='40001')throw Object.assign(Error(error.message),{code:error.code});throw Error(error.message||'No se ha podido completar la operación.');}return data;};
const status=(text,error=false)=>{const e=document.querySelector('#cloud-status');if(e){e.textContent=text;e.className=error?'error':'small';}};
const showError=e=>{const out=document.querySelector('#cloud-error');if(out)out.textContent=e.message;status(e.message,true);};
function compact(){
 panel().innerHTML=`<div class="cloud-strip"><div><b>Espacio privado${user?' · sesión iniciada':''}</b><div id="cloud-status" class="small">${active?'Guardado privado en Supabase. Compartir requiere tu autorización.':'Puedes guardar y continuar en otro dispositivo.'}</div></div><div class="actions"><button class="btn" data-cloud="dashboard">${user?'Mis evaluaciones':'Entrar y guardar'}</button>${user?'<button class="btn" data-cloud="logout">Cerrar sesión</button>':''}${active?'<button class="btn" data-cloud="share">Elegir qué compartir</button><button class="btn" data-cloud="refresh">Ver estado de la pareja</button>':''}</div></div><p id="cloud-error" role="alert" class="error"></p>`;
}
async function dashboard(){
 expanded=true;document.querySelector('main').hidden=true;
 if(!user){panel().innerHTML=`<div class="guide cloud-card"><div class="eyebrow">Piloto privado · Eudemonía</div><h1>Tu espacio privado.</h1><p>Acceso reservado a las dos cuentas autorizadas para probar la evaluación. No necesitas una cuenta de ChatGPT.</p><p>Al elegir guardar, las respuestas se conservarán en el proyecto privado de Supabase de Eudemonía, en Frankfurt. Tu pareja recibe sólo la versión que autorices compartir. Los administradores técnicos autorizados pueden acceder al almacenamiento.</p><label class="field" for="cloud-email"><span>Tu correo de Eudemonía</span><input id="cloud-email" type="email" autocomplete="email" maxlength="254"></label><div class="actions"><button class="btn primary" data-cloud="send">Recibir acceso por correo</button><button class="btn" data-cloud="back">Seguir sin guardar en la nube</button></div><p class="hint">Puedes entrar con el enlace del correo o con su código si se muestra. Usa tu propia cuenta, también cuando compartáis dispositivo.</p><label class="field" for="cloud-otp"><span>Código del correo</span><input id="cloud-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="10"></label><button class="btn" data-cloud="verify">Verificar código</button><p id="cloud-error" class="error" role="alert"></p><div id="cloud-status" role="status"></div></div>`;return;}
 const list=await api('list');
 panel().innerHTML=`<div class="guide cloud-card"><div class="eyebrow">Tu espacio privado</div><h1>Mis evaluaciones.</h1><p>Sesión de ${esc(user.email)}. El borrador de cada participante es privado. Compartir y retirar son decisiones separadas del guardado.</p>${invitation?'<div class="note">Tienes una invitación pendiente. Al aceptarla te unirás a la misma evaluación; no accederás al borrador privado de la otra persona.</div><button class="btn primary" data-cloud="join">Aceptar invitación de mi pareja</button>':''}<section class="section-top"><h2>Continuar una evaluación</h2>${list.length?list.map(v=>`<article class="filebox"><b>${esc(v.alias)}</b><p>${esc(v.start)} a ${esc(v.end)} · ${v.members} participante(s) · ${v.shared} versión(es) compartida(s)</p><div class="actions"><button class="btn primary" data-cloud-open="${v.id}">Abrir mi evaluación</button><button class="btn" data-cloud-state="${v.id}">Comparar y preparar el plan</button>${v.myShared?`<button class="btn" data-cloud-withdraw="${v.id}">Retirar mi versión compartida</button>`:''}<button class="btn danger" data-cloud-delete="${v.id}">Eliminar mis respuestas de esta evaluación</button></div></article>`).join(''):'<p>Aún no tienes ninguna evaluación guardada.</p>'}</section><section class="section-top"><h2>Crear una evaluación</h2><p>El periodo será común para los dos. Una segunda persona se incorpora por invitación; también puedes trabajar por tu cuenta.</p><label class="field" for="cloud-mode"><span>Modalidad</span><select id="cloud-mode"><option value="couple">Los dos, por separado</option><option value="solo">Por mi cuenta</option></select></label><label class="field" for="cloud-alias"><span>Tu alias</span><input id="cloud-alias" maxlength="60" autocomplete="off"></label><div class="two"><label class="field" for="cloud-start"><span>Inicio del periodo</span><input id="cloud-start" type="date" value="${date(-27)}"></label><label class="field" for="cloud-end"><span>Fin del periodo</span><input id="cloud-end" type="date" value="${date(0)}"></label></div><label class="check"><input id="cloud-consent" type="checkbox"><span>Elijo guardar mis respuestas de esta evaluación en Supabase y he leído cómo funciona el espacio privado. Nadie de mi pareja las recibe automáticamente.</span></label><button class="btn primary" data-cloud="create">Crear mi evaluación privada</button></section><div class="actions section-top"><button class="btn" data-cloud="logout">Cerrar sesión</button><button class="btn" data-cloud="back">Volver al cuestionario local</button></div><p id="cloud-error" role="alert" class="error"></p><div id="cloud-status" role="status"></div></div>`;
}
async function open(id,{compare=false}={}){
 try{await flush();}catch(e){if(e.code!=='40001'||!confirm('Hay cambios en otro dispositivo. Conserva antes una copia privada si la necesitas. ¿Descartar los cambios de esta pestaña y abrir lo guardado?'))throw e;}workspace=await api('workspace',{assessmentId:id});active=id;revision=workspace.draft?.revision||0;comparisonActive=false;changes=saved=planChanges=planSaved=0;
 const state=workspace.draft?.state||globalThis.PairLogic.newState();
 state.participantId=user.id;state.meta={...state.meta,alias:state.meta.alias||'',pairCode:'NUBE-'+id.replaceAll('-','').slice(0,24).toUpperCase(),start:workspace.start,end:workspace.end,mode:state.meta.mode||'couple',adult:false,voluntary:false};
 expanded=false;document.querySelector('main').hidden=false;compact();app.restore(state);
 if(compare)await showComparison();
}
async function showComparison(){
 workspace=await api('workspace',{assessmentId:active});
 if(workspace.shares.length!==2){comparisonActive=false;app.clearComparison();
  expanded=true;document.querySelector('main').hidden=true;
  panel().innerHTML=`<div class="guide cloud-card"><h1>Compartir es una decisión.</h1><p>${workspace.members===1?'Aún no se ha incorporado la otra persona.':'Ambos participáis en esta evaluación.'} Hay ${workspace.shares.length} de 2 versiones compartidas.</p><p>Para comparar, cada persona completa su evaluación y elige qué compartir. El borrador privado de la otra persona no se muestra.</p><div class="actions"><button class="btn primary" data-cloud-open="${active}">Abrir mi evaluación</button>${workspace.members===1?'<button class="btn" data-cloud="invite">Crear invitación para mi pareja</button>':''}<button class="btn" data-cloud="refresh">Actualizar estado</button><button class="btn" data-cloud="dashboard">Mis evaluaciones</button></div><div id="cloud-invitation"></div><p id="cloud-error" role="alert" class="error"></p><div id="cloud-status" role="status"></div></div>`;return;
 }
 workspace.shares.forEach(p=>globalThis.PairLogic.validate(p));globalThis.PairLogic.pair(...workspace.shares);
 comparisonActive=true;expanded=false;document.querySelector('main').hidden=false;compact();app.compare(workspace.shares,workspace.plan);
}
async function saveNow(){
 if(!active||!user||!app)return;
 const snapshot=app.snapshot();if(snapshot.demo)return;
 if(!comparisonActive&&changes>saved&&snapshot.started&&snapshot.state.meta.adult&&snapshot.state.meta.voluntary){
  const version=changes;status('Guardando mi borrador privado…');
  const out=await api('save',{assessmentId:active,state:snapshot.state,revision});revision=out.revision;saved=version;
  status('Mi borrador privado está guardado.');
 }
 if(comparisonActive&&planChanges>planSaved&&snapshot.view==='compare'){
  const version=planChanges,selected=snapshot.compareSelected;
  const content=Object.fromEntries(selected.filter(k=>snapshot.comparePlan[k]).map(k=>[k,snapshot.comparePlan[k]]));
  status('Guardando el plan compartido…');
  const out=await api('save_plan',{assessmentId:active,revision:workspace.plan.revision,selected,content});workspace.plan={selected,content,revision:out.revision};planSaved=version;status('Plan compartido guardado.');
 }
 if(changes===saved&&planChanges===planSaved)app.saved();
}
function flush(){clearTimeout(timer);queue=queue.catch(()=>{}).then(saveNow);return queue;}
function changed(plan=false){if(!active)return;if(plan)planChanges++;else changes++;clearTimeout(timer);timer=setTimeout(()=>flush().catch(showError),1000);}
async function share(){
 if(!active)throw Error('Abre primero una evaluación guardada.');
 const snap=app.snapshot();if(!snap.started||!snap.state.meta.adult||!snap.state.meta.voluntary||!app.complete())throw Error('Completa la evaluación y confirma tu participación antes de compartir.');
 await flush();
 const modal=document.querySelector('#cloud-modal');
 modal.innerHTML=`<button class="close" data-cloud="close" aria-label="Cerrar">×</button><h2>Elegir qué compartir con mi pareja</h2><p>Compartes alias, periodo, contexto y medias de las áreas generales. Los resultados sexuales, las respuestas detalladas y los textos requieren una elección adicional.</p><label class="check"><input type="checkbox" id="cloud-share-sexual" ${!snap.state.meta.sexual?'disabled':''}><span>Incluir mis resultados de intimidad sexual.</span></label><label class="check"><input type="checkbox" id="cloud-share-items"><span>Incluir respuestas detalladas de las áreas que comparto.</span></label><label class="check"><input type="checkbox" id="cloud-share-text"><span>Incluir mis reflexiones escritas; la sexual sólo si incluyo también ese módulo.</span></label><details><summary>Revisar exactamente lo que compartiré</summary><pre id="cloud-preview" class="cloud-preview"></pre></details><label class="check"><input type="checkbox" id="cloud-share-consent"><span>Elijo compartir esta versión voluntariamente con la persona que participa conmigo.</span></label><p class="hint">Puedes retirar la versión compartida para impedir nuevas consultas. Los informes que ya se hayan descargado no se retiran de otros dispositivos.</p><div class="actions"><button class="btn primary" data-cloud="publish">Compartir esta versión</button><button class="btn" data-cloud="withdraw">Retirar mi versión compartida</button></div><p id="cloud-modal-error" class="error" role="alert"></p>`;
 preview();modal.showModal();
}
const scope=()=>({sexual:!!document.querySelector('#cloud-share-sexual')?.checked,items:!!document.querySelector('#cloud-share-items')?.checked,text:!!document.querySelector('#cloud-share-text')?.checked});
function preview(){const el=document.querySelector('#cloud-preview');if(el)el.textContent=JSON.stringify(globalThis.PairLogic.shared(app.snapshot().state,scope()),null,2);}
async function action(el){
 const a=el.dataset.cloud;
 if(el.dataset.cloudDelete){
  if(!confirm('¿Eliminar definitivamente tus respuestas y tu versión compartida de esta evaluación? Las respuestas de la otra persona y los PDF descargados se conservan.'))return;
  await api('delete_mine',{assessmentId:el.dataset.cloudDelete});if(active===el.dataset.cloudDelete){active=null;comparisonActive=false;clearTimeout(timer);app.reset();}return dashboard();
 }
 if(el.dataset.cloudWithdraw){await api('withdraw',{assessmentId:el.dataset.cloudWithdraw});return dashboard();}
 if(el.dataset.cloudOpen)return open(el.dataset.cloudOpen);
 if(el.dataset.cloudState)return open(el.dataset.cloudState,{compare:true});
 if(a==='dashboard')return dashboard();
 if(a==='back'){await flush();active=null;comparisonActive=false;expanded=false;document.querySelector('main').hidden=false;compact();return;}
 if(a==='send'){
  const email=document.querySelector('#cloud-email').value.trim();if(!email)throw Error('Escribe tu correo de Eudemonía.');
  const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/evaluacion-pareja/aplicacion.html'}});if(error)throw Error('No se ha podido enviar el acceso. Comprueba el correo y prueba de nuevo más tarde.');status('Revisa el correo de tu cuenta autorizada. Abre su enlace o introduce el código.');return;
 }
 if(a==='verify'){
  const {data,error}=await client.auth.verifyOtp({email:document.querySelector('#cloud-email').value.trim(),token:document.querySelector('#cloud-otp').value.trim(),type:'email'});if(error)throw Error('Código no válido o caducado.');user=data.user;return dashboard();
 }
 if(a==='logout'){await flush();await client.auth.signOut();user=null;active=null;workspace=null;comparisonActive=false;app.reset();return dashboard();}
 if(a==='create'){
  if(!document.querySelector('#cloud-consent').checked)throw Error('Confirma que eliges guardar esta evaluación.');
  const alias=document.querySelector('#cloud-alias').value.trim(),mode=document.querySelector('#cloud-mode').value;
  if(!alias)throw Error('Elige un alias.');const start=document.querySelector('#cloud-start').value,end=document.querySelector('#cloud-end').value;
  if(!globalThis.PairLogic.dateOK(start)||!globalThis.PairLogic.dateOK(end)||start>end)throw Error('Revisa las fechas.');
  await flush();active=null;const v=await api('create',{start,end});await open(v.id);const s=app.snapshot().state;s.meta.alias=alias;s.meta.mode=mode;app.restore(s);return;
 }
 if(a==='join'){
  const v=await api('join',{token:invitation});invitation='';sessionStorage.removeItem('ede-pair-invitation');return open(v.id);
 }
 if(a==='invite'){
  const v=await api('invite',{assessmentId:active});
  const link=location.origin+'/evaluacion-pareja/#invitation='+v.token;
  const target=document.querySelector('#cloud-invitation');if(target)target.innerHTML=`<div class="note"><label class="field"><span>Invitación de un solo uso, válida siete días</span><input id="cloud-invite-link" readonly value="${esc(link)}"></label><p>Compártela tú con tu pareja. No contiene respuestas ni permite acceder a su borrador; exige que se identifique con su cuenta autorizada.</p><button class="btn" data-cloud="copy-invite">Copiar invitación</button></div>`;else{
   expanded=true;document.querySelector('main').hidden=true;panel().innerHTML=`<div class="guide cloud-card"><h1>Invitar a mi pareja</h1><label class="field"><span>Invitación de un solo uso, válida siete días</span><input id="cloud-invite-link" readonly value="${esc(link)}"></label><p>Compártela tú con tu pareja. No contiene respuestas ni permite acceder al borrador privado. La otra persona necesita su propia cuenta autorizada.</p><div class="actions"><button class="btn primary" data-cloud="copy-invite">Copiar invitación</button><button class="btn" data-cloud-open="${active}">Volver a mi evaluación</button></div><p id="cloud-error" class="error" role="alert"></p><div id="cloud-status" role="status"></div></div>`;
  }return;
 }
 if(a==='copy-invite'){await navigator.clipboard.writeText(document.querySelector('#cloud-invite-link').value);status('Invitación copiada. Compártela tú con tu pareja.');return;}
 if(a==='refresh'){await flush();if(!active)return dashboard();return showComparison();}
 if(a==='share')return share();
 if(a==='close'){document.querySelector('#cloud-modal').close();return;}
 if(a==='publish'){
  if(!document.querySelector('#cloud-share-consent').checked)throw Error('Confirma que eliges compartir esta versión.');
  await flush();await api('publish',{assessmentId:active,revision,scope:scope(),consent:true});document.querySelector('#cloud-modal').close();return showComparison();
 }
 if(a==='withdraw'){await api('withdraw',{assessmentId:active});document.querySelector('#cloud-modal').close();comparisonActive=false;app.clearComparison();return showComparison();}
}
globalThis.PairCloud={
 enabled:!!cfg?.url,active:()=>!!active,comparisonActive:()=>comparisonActive,
 async disconnectDraft(){await flush();active=null;comparisonActive=false;compact();},
 disconnectComparison(){comparisonActive=false;},
 changed,flush,share,async freshComparison(){await flush();if(comparisonActive){await showComparison();return workspace.shares.length===2;}return false;},
 async mount(bridge){
  app=bridge;if(!cfg?.url)return;
  const modal=document.createElement('dialog');modal.id='cloud-modal';modal.setAttribute('aria-label','Compartir mi evaluación');document.body.append(modal);
  client=createClient(cfg.url,cfg.publishableKey,{auth:{storage:sessionStorage,storageKey:'ede-pair-session',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  const parentHash=(()=>{try{return parent.location.hash;}catch{return location.hash;}})();
  const token=new URLSearchParams(parentHash.replace(/^#/,'' )).get('invitation');
  if(token&&/^[a-f0-9]{64}$/.test(token)){invitation=token;sessionStorage.setItem('ede-pair-invitation',token);try{parent.history.replaceState(null,'',parent.location.pathname);}catch{history.replaceState(null,'',location.pathname);}}
  else invitation=sessionStorage.getItem('ede-pair-invitation')||'';
  const {data}=await client.auth.getUser();user=data.user;
  compact();if(invitation||user)await dashboard().catch(showError);
  document.addEventListener('click',async e=>{
   const el=e.target.closest('[data-cloud],[data-cloud-open],[data-cloud-state],[data-cloud-delete],[data-cloud-withdraw]');if(!el)return;e.preventDefault();if(el.disabled)return;el.disabled=true;
   try{await action(el);}catch(err){const target=modal.open?document.querySelector('#cloud-modal-error'):null;if(target)target.textContent=err.message;else showError(err);}finally{el.disabled=false;}
  });
  for(const event of ['input','change'])document.addEventListener(event,e=>{
   if(e.target.id.startsWith('cloud-share-'))preview();
   if(e.target.dataset.answer||e.target.dataset.meta||e.target.dataset.open||e.target.dataset.importance||e.target.dataset.context)changed();
   if(e.target.dataset.plan)changed(e.target.dataset.mode==='couple');
  });
  document.addEventListener('click',e=>{if(e.target.closest('[data-pick]'))changed(e.target.closest('[data-pick]').dataset.mode==='couple');});
 }
};
