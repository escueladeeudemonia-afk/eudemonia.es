import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {PDFDocument} from 'pdf-lib';
import {generate} from './report-client.js';
const dir=new URL('.',import.meta.url);
const ctx=vm.createContext({crypto:webcrypto,TextEncoder,TextDecoder,atob,btoa});
vm.runInContext(fs.readFileSync(new URL('data.js',dir),'utf8')+fs.readFileSync(new URL('logic.js',dir),'utf8'),ctx);
const D=ctx.PAIR_DATA,L=ctx.PairLogic;
const asset=name=>fs.readFileSync(new URL('assets/'+name,dir)).toString('base64');
const assets={regular:asset('Poppins-Regular.ttf'),bold:asset('Poppins-Bold.ttf'),logo:asset('eudemonia-fundacion.png')};
const specimen=(alias)=>{
 const s=L.newState();s.meta={alias,pairCode:'PRUEBA-PDF',start:'2026-10-19',end:'2026-11-15',sexual:true};
 for(const [j,d] of D.dimensions.entries()){s.importance[d.id]=1+j%5;for(let i=0;i<6;i++)s.answers[d.id+'-'+i]={self:1+(i+j)%5,partner:2+(i+j)%4};}
 s.open.fortalezas='MARCA-PRIVADA-NO-COMPARTIDA';s.open.sexualSatisfaccion='MARCA-SEXUAL-NO-COMPARTIDA';
 for(let i=0;i<3;i++)s.answers['afecto-'+i].partner=null;
 return s;
};
const a=L.shared(specimen('Alex'),{items:true}),b=L.shared(specimen('Sam'),{sexual:true,items:true,text:true});
const bytes=await generate(D,L,a,b,{comunicacion:{actionA:'Escuchar antes de responder.',actionB:'Pedir una pausa.',when:'El martes después de cenar.',review:'2026-11-29'}},['comunicacion'],{assets,fictional:true});
const pdf=await PDFDocument.load(bytes);assert(pdf.getPageCount()>=18);assert(pdf.getPageCount()<35);
const path=process.env.PAIR_REPORT_QA_OUTPUT;if(path)fs.writeFileSync(path,bytes);
// Long free text, omitted perspectives and complete optional data must remain renderable.
const long=L.shared(specimen('Alias con acentos: Álex'),{sexual:true,items:true,text:true});long.open.fortalezas='Reflexión privada con acentos. '.repeat(120);
const extended=await generate(D,L,long,null,{},[],{assets});assert((await PDFDocument.load(extended)).getPageCount()>=18);
console.log('PASS PDF: shared scope, partial perspectives, optional module and long reflections; '+pdf.getPageCount()+' pages.');
