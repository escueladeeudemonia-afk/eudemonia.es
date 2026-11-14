import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('.',import.meta.url));
const root=path.resolve(source,'../..');
const output=path.join(root,'public/cuaderno-relacion');
const read=f=>fs.readFileSync(path.join(source,f),'utf8');
const scripts=['data.js','logic.js','app.js'].map(read).join('\n').replace(/<\/script/gi,'<\\/script');
fs.mkdirSync(path.join(output,'fonts'),{recursive:true});
let fonts='';
for(const weight of [300,400,500,700]){
 const name=`poppins-latin-${weight}-normal.woff2`;
 fs.copyFileSync(path.join(root,'node_modules/@fontsource/poppins/files',name),path.join(output,'fonts',name));
 fonts+=`@font-face{font-family:Poppins;font-style:normal;font-weight:${weight};font-display:swap;src:url('/cuaderno-relacion/fonts/${name}') format('woff2')}\n`;
}
const css=fonts+read('style.css')+'\nbody{font-family:Poppins,Helvetica,Arial,sans-serif}h1,h2,h3,.card .number{font-family:Poppins,Helvetica,Arial,sans-serif}h1{font-weight:700}h2{font-weight:300}h3{font-weight:400}\n';
const html=read('index.template.html').replace('/*STYLE*/',css).replace('/*SCRIPTS*/',scripts).replace('/*LOGO*/','data:image/png;base64,'+fs.readFileSync(path.join(source,'assets/eudemonia-fundacion.png')).toString('base64'));
fs.writeFileSync(path.join(output,'aplicacion.html'),html);
// Copia autocontenida: las fuentes del sistema permiten abrirla sin conexión.
const offline=read('index.template.html').replace('/*STYLE*/',read('style.css')+'\nbody,h1,h2,h3,.card .number{font-family:Helvetica,Arial,sans-serif}\n').replace('/*SCRIPTS*/',scripts).replace('/*LOGO*/','data:image/png;base64,'+fs.readFileSync(path.join(source,'assets/eudemonia-fundacion.png')).toString('base64'));
fs.writeFileSync(path.join(output,'cuaderno-relacion.html'),offline);
console.log('Cuaderno de relación: aplicación, copia sin conexión y fuentes locales generadas.');
