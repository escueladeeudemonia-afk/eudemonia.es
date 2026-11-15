import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
const un64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const COL={ink:rgb(.14,.15,.14),muted:rgb(.39,.43,.40),brand:rgb(.56,.008,.24),peer:rgb(.26,.44,.45),line:rgb(.85,.87,.84),paper:rgb(.97,.97,.95),pale:rgb(.96,.92,.94)};
const val=s=>s?.value==null?'Sin datos':s.value.toFixed(2).replace('.',',');
const isoDate=()=>new Date().toLocaleDateString('sv-SE');
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toLocaleDateString('sv-SE');};
async function generate(D,L,first,second=null,plans={},selected=[],options={}){
 const a=L.migrate(first),b=second?L.migrate(second):null;L.validate(a);if(b)L.pair(a,b);
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 const assets=options.assets||globalThis.PAIR_PDF_ASSETS;
 const regular=await pdf.embedFont(un64(assets.regular),{subset:true}),bold=await pdf.embedFont(un64(assets.bold),{subset:true}),logo=await pdf.embedPng(un64(assets.logo));
 const glyphs=new Set(regular.getCharacterSet());
 const clean=s=>Array.from(String(s??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,' ').replace(/[—–]/g,'-')).map(ch=>ch==='\n'||glyphs.has(ch.codePointAt(0))?ch:'?').join('');
 const short=s=>clean(s).length>23?clean(s).slice(0,21)+'…':clean(s);
 const dims=D.dimensions.filter(d=>a.summaries.some(x=>x.id===d.id)&&(!b||b.summaries.some(x=>x.id===d.id)));
 const get=(p,id,f)=>p?.summaries.find(s=>s.id===id)?.[f]||{value:null,n:0,total:6};
 const values=id=>[get(a,id,'self'),get(b,id,'partner'),get(b,id,'self'),get(a,id,'partner')];
 const importance=(p,id)=>p?.summaries.find(s=>s.id===id)?.importance??null;
 const rows=dims.map(d=>{const received=[get(a,d.id,'partner').value,get(b,d.id,'partner').value].filter(x=>x!==null);const own=[get(a,d.id,'self').value,get(b,d.id,'self').value].filter(x=>x!==null);const x=b?(received.length?received:own):own;return{id:d.id,self:{value:x.length?Math.min(...x):null},partner:{value:null},importance:Math.max(importance(a,d.id)??-1,importance(b,d.id)??-1)};});
 const picks=(selected.length?selected:L.suggestions(rows,'self')).filter(id=>dims.some(d=>d.id===id)).slice(0,2);
 let page,y,number=0;const M=46,W=595.28,H=841.89,CW=W-2*M;
 const widths=(text,font,size,max)=>{
  const result=[];
  for(const paragraph of clean(text).split('\n')){
   let line='';for(const word of paragraph.split(/\s+/)){
    const tentative=line?line+' '+word:word;
    if(font.widthOfTextAtSize(tentative,size)<=max){line=tentative;continue;}
    if(line){result.push(line);line='';}
    let part='';for(const char of word){if(font.widthOfTextAtSize(part+char,size)>max){result.push(part);part='';}part+=char;}line=part;
   }result.push(line);
  }return result;
 };
 const draw=(t,x,yy,size=9.5,font=regular,color=COL.ink)=>page.drawText(clean(t),{x,y:yy,size,font,color});
 const footer=()=>{if(!page)return;page.drawLine({start:{x:M,y:42},end:{x:W-M,y:42},thickness:.5,color:COL.line});draw((options.fictional?'DATOS FICTICIOS · ':'')+(b?'Informe conjunto':'Informe individual privado')+' · Escala 1-5 · '+isoDate(),M,28,7,regular,COL.muted);draw(String(number).padStart(2,'0'),W-M-12,28,7,regular,COL.muted);};
 const newPage=(title,kicker='Evaluación de la relación de pareja')=>{
  footer();page=pdf.addPage([W,H]);number++;page.drawImage(logo,{x:M,y:H-63,width:23,height:30});draw('Escuela de Eudemonía',M+34,H-44,8.4,bold);draw('Relaciones · '+(options.fictional?'Ejemplo ficticio':b?'Informe conjunto':'Informe individual privado'),M+34,H-56,7,regular,COL.muted);
  y=H-100;draw(kicker.toUpperCase(),M,y,8.3,bold,COL.brand);y-=30;
  for(const line of widths(title,bold,23.5,CW)){draw(line,M,y,23.5,bold);y-=30;}y-=8;
 };
 const ensure=h=>{if(y-h<64)newPage('Continuación','Lectura del informe');};
 const text=(s,size=9.6,color=COL.ink,font=regular,gap=9,max=CW,x=M)=>{const lines=widths(s,font,size,max),lead=size*1.48;for(const l of lines){ensure(lead+3);draw(l,x,y-size,size,font,color);y-=lead;}y-=gap;};
 const section=s=>{ensure(35);y-=3;text(s,12.3,COL.ink,bold,7);};
 const bullet=s=>text('• '+s,9.2,COL.ink,regular,7);
 const box=(title,body)=>{const lines=widths(body,regular,9.4,CW-28),h=lines.length*14+49;if(h<500){ensure(h);page.drawRectangle({x:M,y:y-h,width:CW,height:h,color:COL.paper});draw(title,M+14,y-20,10,bold,COL.brand);let yy=y-42;for(const l of lines){draw(l,M+14,yy,9.4);yy-=14;}y-=h+12;}else{section(title);text(body);}};
 const table=(heads,data,cols,size=8.6)=>{
  for(const [r,row] of [heads,...data].entries()){
   const lines=row.map((s,i)=>widths(s,r?regular:bold,size,cols[i]-14));const h=Math.max(...lines.map(x=>x.length))*size*1.4+13;ensure(h+6);
   if(!r)page.drawRectangle({x:M,y:y-h,width:CW,height:h,color:COL.pale});
   let xx=M;lines.forEach((ls,i)=>{ls.forEach((l,j)=>draw(l,xx+7,y-size-7-j*size*1.4,size,r?regular:bold,r?COL.ink:COL.brand));xx+=cols[i];});
   page.drawLine({start:{x:M,y:y-h},end:{x:W-M,y:y-h},thickness:.35,color:COL.line});y-=h;
  }y-=12;
 };
 const chart=d=>{
  ensure(212);const top=y,x0=M+190,cw=CW-249;
  for(let i=1;i<=5;i++){const x=x0+cw*(i-1)/4;page.drawLine({start:{x,y:top-19},end:{x,y:top-152},thickness:.4,color:COL.line});draw(String(i),x-2,top-169,7.5,regular,COL.muted);}
  draw('CONDUCTAS DE '+short(a.alias).toUpperCase(),M,top-9,8,bold,COL.muted);
  draw('CONDUCTAS DE '+short(b?.alias||'MI PAREJA').toUpperCase(),M,top-93,8,bold,COL.muted);
  const labels=[`${short(a.alias)} se describe`,b?`${short(b.alias)} percibe a ${short(a.alias)}`:'Sin segunda persona',b?`${short(b.alias)} se describe`:'Sin autoevaluación de mi pareja',`${short(a.alias)} percibe a ${short(b?.alias||'su pareja')}`];
  values(d.id).forEach((s,i)=>{
   const yy=top-[29,58,113,142][i],color=i===0||i===3?COL.brand:COL.peer;
   const ls=widths(labels[i],regular,8.3,182);ls.slice(0,2).forEach((l,j)=>draw(l,M,yy+3-j*10,8.3));
   page.drawRectangle({x:x0,y:yy-3,width:cw,height:10,color:COL.paper});
   if(s.value!==null){page.drawRectangle({x:x0,y:yy-3,width:Math.max(0,(s.value-1)/4*cw),height:10,color});page.drawCircle({x:x0+(s.value-1)/4*cw,y:yy+2,size:2.8,color});}
   draw(val(s),W-M-51,yy+3,s.value===null?7:9,bold,color);draw(`${s.n}/6 válidas`,W-M-51,yy-10,6.7,regular,COL.muted);
  });y=top-187;text('Color = quien responde: granate, '+a.alias+(b?'; verde azulado, '+b.alias:'')+'. Escala de frecuencia 1-5.',7.4,COL.muted,regular,9);
 };
 const difference=(self,other,who,observer)=>{
  if(self.value===null||other.value===null)return `No hay datos suficientes para contrastar las dos perspectivas sobre ${who}.`;
  const gap=self.value-other.value;
  return `${who} se describe con ${val(self)} y ${observer} percibe estas conductas con ${val(other)}. ${Math.abs(gap)<.005?'Las medias coinciden; los ejemplos pueden seguir siendo distintos.':`La autoevaluación es ${gap>0?'mayor':'menor'} en ${Math.abs(gap).toFixed(2).replace('.',',')} punto(s).`}`;
 };
 pdf.setTitle('Evaluación de la relación de pareja · '+(b?'Informe conjunto':'Informe individual privado'));pdf.setAuthor('Escuela de Eudemonía');pdf.setSubject('Percepciones descriptivas, cuatro perspectivas y plan de mejora. Escala 1-5.');
 newPage('Evaluación de la\nrelación de pareja',b?'Informe conjunto':'Informe individual privado');
 y-=15;text(a.alias+(b?' y '+b.alias:''),29,COL.brand,bold,18);text('Comprender lo que cada uno vive.\nElegir cambios que se puedan reconocer.',15,COL.ink,regular,21);
 if(options.fictional)box('TODO ESTE CASO ES FICTICIO','Los alias, las respuestas y los resultados de este ejemplo son inventados. No describen a ninguna pareja real.');
 box('Periodo de referencia',a.period.start+' a '+a.period.end+'. Versión '+D.version+'. Escala 1-5. '+dims.length+' áreas incluidas.');
 text('Este informe presenta conductas descritas y percepciones. Las diferencias abren preguntas para conversar. El plan se construye con decisiones propias y acuerdos voluntarios.',10.5);
 text(b?'Incluye exclusivamente las versiones que cada participante ha autorizado compartir.':'Contiene tu evaluación privada. No se ha añadido una segunda autoevaluación ni se atribuye a tu pareja lo que no ha respondido.',9.5,COL.muted);
 newPage('Cuatro perspectivas, sin una nota global','Cómo leer el informe');
 table(['Conductas de '+a.alias,'Conductas de '+(b?.alias||'mi pareja')],[[a.alias+' se describe.',b?b.alias+' se describe.':'Falta la autoevaluación de mi pareja.'],[b?b.alias+' dice cómo percibe a '+a.alias+'.':'Falta la percepción de otra persona sobre mí.',a.alias+' dice cómo percibe a '+(b?.alias||'su pareja')+'.']],[CW/2,CW/2]);
 table(['1','2','3','4','5'],[['Nunca','Rara vez','Algunas veces','A menudo','Casi siempre']],[CW/5,CW/5,CW/5,CW/5,CW/5]);
 bullet('Cada media requiere al menos cuatro respuestas válidas de seis. El número n/6 muestra su cobertura.');bullet('No sé, no hubo ocasión y prefiero omitir quedan fuera del cálculo. No se transforman en un 1.');bullet('La importancia de mejorar, también de 1 a 5, es una elección personal distinta de la frecuencia.');bullet('Las diferencias no prueban quién tiene razón ni establecen que la responsabilidad sea equivalente.');
 box('Qué significan los colores','Identifican a quien ha respondido. No expresan riesgo, gravedad o normalidad. No hay percentiles ni una puntuación global de la relación.');
 if(a.convertedFrom||b?.convertedFrom)text('Al menos un archivo procedía de la escala antigua 0-4. Sus valores se han convertido sumando uno y conservando las omisiones. Todos los gráficos de este informe usan 1-5.',9.3);
 newPage('Lo que merece vuestra conversación','Lectura inicial');
 const resources=rows.filter(r=>r.id!=='intimidad'&&r.self.value!==null).sort((x,z)=>z.self.value-x.self.value).slice(0,2);
 box('Conductas descritas con mayor frecuencia',resources.length?resources.map(r=>D.dimensions.find(d=>d.id===r.id).title).join(' y ')+'. Explorad con ejemplos qué conviene conservar. Esta selección sólo compara las áreas de esta medición; no es un baremo de fortalezas.':'No hay suficiente información para proponer áreas a conservar a partir de medias. Podéis empezar por un momento concreto que os haya hecho bien.');
 box('Un comienzo para el plan',picks.length?picks.map(id=>D.dimensions.find(d=>d.id===id).title).join(' y ')+'. Las sugerencias priorizan la importancia declarada y después la menor frecuencia descrita. Podéis cambiarlas.':'Aún no hay datos suficientes para sugerir un comienzo. Las prácticas de la guía pueden consultarse sin puntuación.');
 section('El contexto también cuenta');table(['Durante el periodo',a.alias,b?.alias||'Sin segunda respuesta'],D.context.map(x=>[x.text,a.context?.[x.id]??'Sin respuesta',b?.context?.[x.id]??'Sin respuesta']),[CW-120,60,60],8.4);text('Contexto: 1 nada, 2 poco, 3 algo, 4 bastante, 5 mucho. No se suma a las dimensiones ni prueba la causa de una diferencia.',8.3,COL.muted);
 newPage('Las áreas de un vistazo','Perfil descriptivo');
 table(['Área',short(a.alias)+'\nsobre sí',short(b?.alias||'Otra persona')+'\nsobre '+short(a.alias),short(b?.alias||'Pareja')+'\nsobre sí',short(a.alias)+'\nsobre su pareja'],dims.map(d=>[d.title,...values(d.id).map(s=>val(s)+'\n'+s.n+'/6')]),[CW-236,59,59,59,59],8.2);
 text('Las cuatro columnas describen perspectivas distintas. Un dato ausente se mantiene ausente. La intimidad sexual sólo figura en un informe conjunto si ambas personas han elegido compartirla.',8.6,COL.muted);
 for(const d of dims){
  newPage(d.title,d.optional?'Módulo opcional':'Lectura por dimensión');text(d.subtitle+'.',10,COL.muted);chart(d);
  const v=values(d.id);text(b?difference(v[0],v[1],a.alias,b.alias)+' '+difference(v[2],v[3],b.alias,a.alias):`Tu autoevaluación es ${val(v[0])}. Tu percepción de la conducta de tu pareja es ${val(v[3])}. No hay una segunda respuesta para contrastarlas.`,9.4);
  text('Importancia de mejorar: '+a.alias+' '+(importance(a,d.id)??'sin decidir')+'/5'+(b?' · '+b.alias+' '+(importance(b,d.id)??'sin decidir')+'/5':''),8.7,COL.ink,bold);
  section('Qué explorar');text(d.optional?'Estos resultados describen conversación, respeto y ajuste. No miden deseo, frecuencia sexual ideal ni satisfacción global. Cada persona mantiene la libertad de responder, compartir y detenerse.':'Una diferencia puede reflejar situaciones, significados o ejemplos distintos. Contrastad una conducta concreta antes de atribuir una intención o una causa.',9.2);
  section('Dos preguntas para conversar');bullet('¿Qué episodio de este periodo ayuda a comprender tu respuesta?');bullet('¿Qué cambio propio podrías probar y cómo podría reconocerlo la otra persona?');
  box('Una práctica posible',d.optional?'Conversar voluntariamente sobre deseos y límites no compromete a ninguna actividad sexual. '+d.practice.experiment:d.practice.experiment);
  text('Qué observar: '+(b?d.practice:d.individual).signal,8.8);text('Referencia temática en Beck: '+d.source,7.3,COL.muted);
 }
 newPage('De los resultados a un acuerdo','Una conversación de 45-60 minutos');
 for(const [title,body] of [['Preparar','Confirmad qué deseáis conversar y qué información habéis decidido compartir.'],['Reconocer','Cada uno aporta un gesto o un momento que quiere conservar.'],['Comprender','Elegid una diferencia sobre la misma persona. Uno cuenta un episodio y el otro resume; después intercambiad los papeles.'],['Acordar','Elegid como máximo dos áreas y una acción propia por persona en cada una.'],['Cerrar','Leed el acuerdo, comprobad que ambos lo aceptáis y fijad una revisión.']]){section(title);text(body);}
 text('Si aparece miedo, coerción, presión sexual o violencia, este formato de comparación conjunta no es adecuado. Se prioriza apoyo individual cualificado.',8.8,COL.muted);
 for(const id of picks){const d=D.dimensions.find(x=>x.id===id),p=plans[id]||{},exercise=b?d.practice:d.individual;
  newPage(d.title,'Plan para los próximos catorce días');text(exercise.name,14,COL.brand,bold);text('La práctica es una propuesta. Los compromisos sólo son acuerdos si cada persona los acepta. Los campos sin completar siguen pendientes.',9.2);
  box('Acción de '+a.alias,p.actionA||'Pendiente de concretar por esta persona.');box(b?'Acción de '+b.alias:'Apoyo que quiero pedir',p.actionB||'Pendiente de concretar.');
  section('Cuándo y en qué situación');text(p.when||'Pendiente de acordar.');section('Qué cambio observable comprobar');text(p.evidence||exercise.signal);section('Fecha de revisión');text(p.review||'Propuesta pendiente de acordar: '+addDays(14));
  section('Cómo practicar');exercise.steps.forEach(bullet);text('Ensayo propuesto: '+exercise.experiment,9.1);text('La ausencia de una ocasión no equivale a un fracaso. No se debe provocar un desacuerdo ni exigir una actividad para puntuar mejor.',8.4,COL.muted);
 }
 newPage('Un registro breve, no una vigilancia','Ensayo de catorce días');text('Cada persona registra su propia conducta y su experiencia. Esta hoja se deja vacía; no se inventan resultados del plan.');
 table(['Día','Ocasión o práctica','Mi conducta','Qué viví / ajustar'],Array.from({length:14},(_,i)=>[String(i+1),'','','']),[35,150,145,CW-330],8.4);
 section('En la revisión');bullet('¿Qué hicimos realmente? Elegir un ejemplo que ambos reconozcan.');bullet('¿Cómo lo vivió cada persona? Escuchar también lo que no fue útil.');bullet('¿Qué mantenemos, qué ajustamos y qué dejamos de hacer?');
 newPage('Observar el cambio con contexto','Seguimiento');
 text('Una nueva evaluación es otra medición. Conservad este informe y usad las mismas preguntas y la misma escala. Comparad cada persona consigo misma, separando su autoevaluación de la percepción de su pareja.');
 box('Todavía no hay una segunda medición','No se presenta una mejora simulada. Las fechas, las oportunidades y el contexto deberán acompañar cualquier comparación posterior.');
 bullet('Si el primer periodo era de cuatro semanas y el siguiente sólo de dos, la duración distinta debe quedar visible.');bullet('Una diferencia entre dos medias no demuestra que el plan la haya causado.');bullet('Conservad el número de respuestas válidas. Las omisiones pueden modificar la cobertura.');
 if(a.open||b?.open){section('Reflexiones incluidas por decisión de cada persona');for(const person of [a,b].filter(Boolean))if(person.open)for(const item of D.open.filter(o=>person.open[o.id]&&(!o.id.startsWith('sexual')||dims.some(d=>d.optional)))){section(person.alias+' · '+item.text);text(person.open[item.id]);}}
 if(a.answers||b?.answers){for(let start=0;start<dims.length;start+=3){newPage('Las respuestas detrás de las medias','Anexo de información autorizada');text('A/A: primera persona sobre sí. B/A: segunda sobre la primera. B/B: segunda sobre sí. A/B: primera sobre la segunda. N/O: omitido. -: no compartido o sin respuesta.',8.1);
  for(const d of dims.slice(start,start+3)){section(d.title);const lines=d.items.map((item,i)=>{const key=d.id+'-'+i;return[(i+1)+'. '+item,...[a.answers?.[key]?.self,b?.answers?.[key]?.partner,b?.answers?.[key]?.self,a.answers?.[key]?.partner].map(x=>x===null?'N/O':x===undefined?'-':String(x))];});table(['Conducta','A/A','B/A','B/B','A/B'],lines,[CW-136,34,34,34,34],7.4);}
 }}
 newPage('Cómo se obtiene este informe','Método y alcance');
 text('Cuestionario original de la Escuela de Eudemonía, versión '+D.version+'. Escala de frecuencia 1-5; medias por área y perspectiva con al menos cuatro respuestas válidas. Se excluyen las omisiones y se redondea sólo al mostrar.');
 text('Las sugerencias ordenan la importancia declarada por cualquiera de las dos personas y, a igualdad, la menor frecuencia percibida. Si faltan las percepciones sobre la pareja, se usan las autoevaluaciones disponibles para orientar la elección. No hay nota global, percentiles ni probabilidades de éxito o ruptura.');
 text('Aaron T. Beck, Con el amor no basta (original de 1988; edición consultada en el proyecto: Paidós, presentación de 2011). Se conservan las referencias temáticas por dimensión. Preguntas, agrupación y reglas del piloto son una elaboración propia.');
 text('La muestra de informe RELATE aportada en el proyecto inspiró la presentación de cuatro perspectivas y preguntas de conversación. No se trasladan sus baremos ni sus zonas de color.');
 text('Este informe se genera en tu navegador a partir de los datos seleccionados. En modalidad conjunta se utiliza la versión compartida de cada participante, no su borrador privado. Es una orientación descriptiva pendiente de validación y revisión profesional.');
 footer();return pdf.save();
}
globalThis.PairReport={generate};
export {generate};
