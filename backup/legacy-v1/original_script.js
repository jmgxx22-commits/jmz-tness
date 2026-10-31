
var PLAN={
UA:{n:"Upper A",s:"Pecho y tríceps",ex:[["Press inclinado con mancuernas","2 × 6–8"],["Pec fly","2 × 7–10"],["Jalón al pecho","2 × 6–8"],["Elevaciones laterales","2 × 8–12"],["Extensión unilateral de tríceps","3 × 6–10"],["Curl martillo en polea","2 × 6–10"],["Antebrazo","2 series"]]},
LA:{n:"Lower A",s:"Cuádriceps",ex:[["Sentadilla goblet","2 × 6–8"],["Sentadilla búlgara","2 × 6–8"],["Extensión de cuádriceps","2 × 8–10"],["Curl femoral acostado","2 × 8–10"],["Pantorrilla unilateral","3 × 8–12"],["Tibial anterior","2 × 15–20"]]},
UB:{n:"Upper B",s:"Brazos y pecho",ex:[["Press inclinado con mancuernas","2 × 6–8"],["Jalón al pecho / dominadas asistidas","2 × 6–8"],["Remo en máquina o polea","2 × 8–10"],["Curl de bíceps","3 × 6–10"],["Extensión de tríceps en polea","3 × 6–10"],["Elevaciones laterales","2 × 8–12"],["Deltoides posterior","2 × 10–12"],["Antebrazo","2 series"]]},
LB:{n:"Lower B",s:"Femoral y glúteo",ex:[["Prensa","2 × 6–8"],["Curl femoral","3 × 6–10"],["Hip thrust","2 × 6–8"],["Extensión de cuádriceps","2 × 8–10"],["Abductores","2 × 10–15"],["Pantorrilla","3 × 8–12"]]}
};
var DG={kcal:2500,p:125,f:70,c:340,w0:60,wn:62,wm:66,w2:68};
var P=[["Huevo (1)",78,6,1,5],["Tortilla de maíz (1)",52,1,11,1],["Arroz cocido (1 taza)",205,4,45,0],["Frijoles (½ taza)",114,8,20,1],["Pechuga de pollo (150 g)",250,46,0,6],["Carne de res (120 g)",250,25,0,16],["Atún en lata (1)",120,26,0,1],["Leche entera (240 ml)",150,8,12,8],["Avena (40 g seca)",150,5,27,3],["Plátano (1)",105,1,27,0],["Pan de caja (2 reb.)",160,6,30,2],["Queso fresco (50 g)",130,9,2,10],["Aguacate (½)",120,2,6,11],["Cacahuates (30 g)",170,7,5,14],["Proteína whey (1 scoop)",120,24,3,2]];
var KEY="gymjournal_v1";
function load(){var v={};try{v=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}return norm(v)}
function norm(v){var fo=v.food||{};fo.g=Object.assign({},DG,fo.g||{});fo.log=fo.log||{};return{peso:v.peso||[],ses:v.ses||[],sess:v.sess||[],food:fo,draft:v.draft||{},chat:v.chat||[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
var st=load(),tab="ent",cur="UA";
var $=function(s){return document.querySelector(s)};
function today(){return new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function fd(d){return new Date(d+"T00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short"})}
function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("on");setTimeout(function(){t.classList.remove("on")},1800)}
function num(v){return parseFloat(String(v).replace(",","."))}

function render(){
  var tabs=[["ent","Entrenar"],["coach","Coach"],["ia","Pregunta"],["peso","Peso"],["food","Comida"],["evo","Evolución"],["resp","Respaldo"]];
  $("#nav").innerHTML=tabs.map(function(t){return '<button class="'+(tab==t[0]?"on":"")+'" onclick="go(\''+t[0]+'\')">'+t[1]+"</button>"}).join("");
  $("#v").innerHTML=tab=="ent"?vEnt():tab=="coach"?vCoach():tab=="ia"?vIA():tab=="peso"?vPeso():tab=="food"?vFood():tab=="evo"?vEvo():vResp();var a_=document.querySelector(".nav .on");if(a_&&a_.scrollIntoView)a_.scrollIntoView({inline:"center",block:"nearest"});if(tab=="ent")rd_();if(tab=="ia")ia_();
}
function go(t){tab=t;render()}
function pick(k){cur=k;render()}

function vEnt(){
  var p=PLAN[cur],last=st.ses.filter(function(x){return x.t==cur}).pop();
  var h='<div class="seg">'+Object.keys(PLAN).map(function(k){return '<button class="'+(k==cur?"on":"")+'" onclick="pick(\''+k+'\')">'+PLAN[k].n+"<small>"+PLAN[k].s+"</small></button>"}).join("")+"</div>";
  h+='<div class="card"><div class="row"><label class="f">Fecha<input type="date" id="sd" value="'+today()+'"></label><label class="f">Energía (1–5)<select id="se"><option>3</option><option>1</option><option>2</option><option>4</option><option>5</option></select></label></div>';
  h+='<p class="mut" style="margin:10px 0 0">'+(last?"Última vez: "+fd(last.d)+". Los números grises son tu marca anterior. Pesos en libras (lb). Lo que escribes se guarda solo hasta que toques Guardar sesión.":"Aún no tienes registros de esta sesión.")+"</p></div>";
  p.ex.forEach(function(e,i){
    h+='<div class="card ex"><h3>'+e[0]+'</h3><div class="t">'+e[1]+'</div>'+coachLine(cur,i)+'<div class="sets">';
    for(var j=0;j<3;j++){
      var lw=last&&last.ex[i]?last.ex[i][j*2]:"",lr=last&&last.ex[i]?last.ex[i][j*2+1]:"";
      h+='<div class="set"><b>Serie '+(j+1)+'</b><input inputmode="decimal" data-i="'+i+'" data-j="'+(j*2)+'" placeholder="'+(lw||"lb")+'" aria-label="Peso"><input inputmode="numeric" data-i="'+i+'" data-j="'+(j*2+1)+'" placeholder="'+(lr||"reps")+'" aria-label="Repeticiones"></div>';
    }
    h+='</div><label class="ck"><input type="checkbox" data-t="'+i+'" checked> Técnica sólida</label></div>';
  });
  h+=xCards();h+='<div class="card"><label class="f">Notas de la sesión (sueño, molestias, qué mejorar)<textarea id="sn" rows="3"></textarea></label></div>';
  h+='<button class="btn" onclick="saveSes()">Guardar sesión</button>';
  h+='<p class="mut" style="text-align:center">Sesiones guardadas: '+st.ses.length+"</p>";
  return h;
}
function saveSes(){
  var p=PLAN[cur],ex=p.ex.map(function(){return["","","","","",""]}),any=false;
  document.querySelectorAll(".set input").forEach(function(el){
    var v=el.value.trim();if(v){any=true;ex[+el.dataset.i][+el.dataset.j]=v}
  });
  var xs=(dgt().xs||[]).map(function(x){return{n:(x.n||"").trim(),r:x.v}}).filter(function(x){return x.n&&sets_({ex:[x.r]},0).length});
  if(xs.length)any=true;
  if(!any){toast("Anota al menos una serie");return}
  document.querySelectorAll("[data-t]").forEach(function(el){if(!el.checked)ex[+el.dataset.t][6]="x"});
  st.ses.push({t:cur,d:$("#sd").value||today(),e:$("#se").value,n:$("#sn").value,ex:ex,x:xs});
  if(st.draft)delete st.draft[cur];save();toast("Sesión guardada 💪");render();
}

function vPeso(){
  var pts=st.peso.slice().sort(function(a,b){return a.d<b.d?-1:1});
  var h='<div class="card"><div class="row"><label class="f">Fecha<input type="date" id="pd" value="'+today()+'"></label><label class="f">Peso (kg)<input id="pk" inputmode="decimal" placeholder="0.0"></label></div><button class="btn" style="margin-top:12px" onclick="addPeso()">Agregar peso</button></div>';
  if(pts.length){
    var a=pts[0].k,b=pts[pts.length-1].k,df=b-a;
    h+='<div class="stats"><div class="stat"><b>'+a+'</b><span>Inicial</span></div><div class="stat"><b>'+b+'</b><span>Actual</span></div><div class="stat"><b class="'+(df>0?"up":"")+'">'+(df>0?"+":"")+df.toFixed(1)+'</b><span>Cambio kg</span></div></div>';
  }
  h+='<div class="card">'+chart(pts)+"</div>";
  h+='<div class="card">'+(pts.length?pts.slice().reverse().slice(0,10).map(function(x){var i=st.peso.indexOf(x);return '<div class="li"><span>'+fd(x.d)+'</span><span><b>'+x.k+' kg</b> <button onclick="delPeso('+i+')" aria-label="Borrar">×</button></span></div>'}).join(""):'<p class="mut" style="margin:0">Pésate por la mañana, después de ir al baño y antes de comer, y fíjate en el promedio semanal.</p>')+"</div>";
  return h;
}
function addPeso(){var k=num($("#pk").value);if(!k){toast("Escribe tu peso");return}st.peso.push({d:$("#pd").value||today(),k:Math.round(k*10)/10});save();toast("Peso guardado");render()}
function delPeso(i){st.peso.splice(i,1);save();render()}
function chart(p){
  if(p.length<2)return '<p class="mut" style="margin:0;text-align:center">Agrega al menos 2 registros para ver tu tendencia.</p>';
  var W=600,H=200,pd=34,mn=Math.min.apply(null,p.map(function(x){return x.k})),mx=Math.max.apply(null,p.map(function(x){return x.k}));
  if(mx==mn){mx+=1;mn-=1}
  var X=function(i){return pd+i*(W-pd*2)/(p.length-1)},Y=function(k){return H-pd-(k-mn)/(mx-mn)*(H-pd*2)};
  var pts=p.map(function(x,i){return X(i)+","+Y(x.k)}).join(" ");
  var s='<svg viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Gráfica de peso corporal">';
  s+='<polygon points="'+pd+","+(H-pd)+" "+pts+" "+X(p.length-1)+","+(H-pd)+'" fill="var(--soft)"/>';
  s+='<polyline points="'+pts+'" fill="none" stroke="var(--ac)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
  p.forEach(function(x,i){s+='<circle cx="'+X(i)+'" cy="'+Y(x.k)+'" r="4.5" fill="var(--card)" stroke="var(--ac)" stroke-width="2.5"/>'});
  s+='<text x="'+pd+'" y="'+(H-10)+'" font-size="13" fill="var(--mut)">'+fd(p[0].d)+'</text><text x="'+(W-pd)+'" y="'+(H-10)+'" font-size="13" fill="var(--mut)" text-anchor="end">'+fd(p[p.length-1].d)+"</text>";
  s+='<text x="'+pd+'" y="18" font-size="13" fill="var(--mut)">'+mx.toFixed(1)+' kg</text><text x="'+(W-pd)+'" y="18" font-size="13" fill="var(--mut)" text-anchor="end">'+mn.toFixed(1)+" kg mín.</text></svg>";
  return s;
}

var fday="",co=false;
function day(){return fday||today()}
function setDay(v){fday=v;render()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function logOf(d){return st.food.log[d]||[]}
function tot(d){var t={k:0,p:0,c:0,f:0};logOf(d).forEach(function(x){t.k+=x.k;t.p+=x.p;t.c+=x.c;t.f+=x.f});return t}
function n0(n){return Math.round(n).toLocaleString("es-MX")}
function bar(l,v,g,col){var p=g?v/g*100:0;return '<div class="bar"><div class="l"><span>'+l+'</span><span><b>'+n0(v)+'</b> / '+n0(g)+' g · '+Math.round(p)+' %</span></div><i><u style="width:'+Math.min(p,100)+'%;background:'+col+'"></u></i></div>'}
function lastW(){var a=st.peso.slice().sort(function(x,y){return x.d<y.d?-1:1});return a.length?a[a.length-1].k:st.food.g.wn}
function vFood(){
  var g=st.food.g,d=day(),t=tot(d),pc=g.kcal?t.k/g.kcal:0,rest=g.kcal-t.k,R=54,C=2*Math.PI*R;
  var h='<div class="row" style="margin-bottom:12px"><label class="f">Día<input type="date" value="'+d+'" onchange="setDay(this.value)"></label></div>';
  h+='<div class="card"><div class="top"><div class="ring"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="'+R+'" fill="none" stroke="var(--line)" stroke-width="12"/><circle cx="70" cy="70" r="'+R+'" fill="none" stroke="'+(pc>1.1?"#e03131":"var(--ac)")+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+C*(1-Math.min(pc,1))+'" transform="rotate(-90 70 70)"/></svg><div><b>'+Math.round(pc*100)+' %</b><span>de tu meta</span></div></div>';
  h+='<div class="kv"><p><span>Consumidas</span><b>'+n0(t.k)+' kcal</b></p><p><span>Meta diaria</span><b>'+n0(g.kcal)+' kcal</b></p><p><span>'+(rest>=0?"Restantes":"Sobre la meta")+'</span><b>'+n0(Math.abs(rest))+' kcal</b></p></div></div>';
  h+=bar("Proteínas",t.p,g.p,"var(--ac)")+bar("Carbohidratos",t.c,g.c,"#4c8bf5")+bar("Grasas",t.f,g.f,"#f0b429");
  var ok=pc>=.9&&g.p&&t.p/g.p>=.9;
  h+='<p style="margin:12px 0 0" class="'+(ok?"ok":"mut")+'">'+(ok?"✅ Día cumplido: calorías y proteínas por encima del 90 %.":"Te faltan "+n0(Math.max(rest,0))+" kcal y "+n0(Math.max(g.p-t.p,0))+" g de proteína. Con llegar a ~90 % ya vas bien.")+"</p></div>";
  h+=photoCard();h+='<h2 class="s">Agregar rápido</h2><div class="chips">'+P.map(function(x,i){return '<button class="chip" onclick="addP('+i+')">'+x[0]+'<small>'+x[1]+' kcal · '+x[2]+' g prot.</small></button>'}).join("")+"</div>";
  h+='<div class="card" style="margin-top:12px"><div class="row"><label class="f" style="flex:1 1 100%">Otro alimento o comida<input id="fn" placeholder="Ej. Tacos de bistec"></label><label class="f">kcal<input id="fk" inputmode="numeric"></label><label class="f">Prot. (g)<input id="fp" inputmode="decimal"></label><label class="f">Carbs (g)<input id="fc" inputmode="decimal"></label><label class="f">Grasa (g)<input id="ff" inputmode="decimal"></label></div><button class="btn" style="margin-top:12px" onclick="addC()">Agregar</button></div>';
  var L=logOf(d);
  h+='<h2 class="s">Lo que he comido</h2><div class="card">'+(L.length?L.map(function(x,i){return '<div class="li"><span>'+esc(x.n)+'<br><span class="mut">'+n0(x.k)+' kcal · '+n0(x.p)+' g prot.</span></span><button onclick="delF('+i+')" aria-label="Borrar">×</button></div>'}).join(""):'<p class="mut" style="margin:0">Aún no has registrado nada. Toca un alimento de arriba.</p>')+"</div>";
  var w=lastW(),pr=g.wm>g.w0?Math.max(0,Math.min(1,(w-g.w0)/(g.wm-g.w0))):0;
  h+='<h2 class="s">Meta de peso</h2><div class="card"><div class="bar" style="margin:0"><div class="l"><span>'+g.w0+' kg → <b>'+g.wm+' kg</b></span><span>Hoy: <b>'+w+' kg</b> · '+Math.round(pr*100)+' %</span></div><i><u style="width:'+pr*100+'%;background:var(--ac)"></u></i></div><p class="mut" style="margin:10px 0 0">Siguiente meta: '+g.w2+' kg y evaluar. Tu peso de hoy sale de la pestaña Peso.</p></div>';
  var sm=g.p*4+g.c*4+g.f*9,df=sm-g.kcal,okm=Math.abs(df)<=50;
  h+='<details class="card"'+(co?" open":"")+' ontoggle="co=this.open"><summary>⚙️ Configuración y metas</summary><p class="mut">23 años · 1.77 m · gym 4 días por semana (7–9 pm). Son valores de partida: ajústalos según cómo avance tu peso.</p><div class="row">'+[["kcal","Calorías"],["p","Proteínas (g)"],["c","Carbohidratos (g)"],["f","Grasas (g)"],["w0","Peso inicial (kg)"],["wm","Meta (kg)"],["w2","Siguiente meta (kg)"]].map(function(x){return '<label class="f">'+x[1]+'<input inputmode="decimal" data-k="'+x[0]+'" value="'+g[x[0]]+'" onchange="cfg(this)"></label>'}).join("")+'</div>';
  h+='<p class="'+(okm?"ok":"mut")+'" style="margin:12px 0 0">'+(okm?"✓ Tus macros ("+n0(sm)+" kcal) cuadran con tu objetivo.":"Tus macros suman "+n0(sm)+" kcal: "+n0(Math.abs(df))+" kcal "+(df>0?"más":"menos")+" que tu objetivo de "+n0(g.kcal)+".")+'</p><button class="btn s" style="margin-top:10px;background:none;color:var(--ink);border:1px solid var(--line)" onclick="resetG()">Restablecer valores iniciales</button></details>';
  return h;
}
function addP(i){var x=P[i];pushF({n:x[0],k:x[1],p:x[2],c:x[3],f:x[4]})}
function addC(){var k=num($("#fk").value);if(!k){toast("Escribe las calorías");return}pushF({n:$("#fn").value.trim()||"Comida",k:k,p:num($("#fp").value)||0,c:num($("#fc").value)||0,f:num($("#ff").value)||0})}
function pushF(x){var d=day();(st.food.log[d]=st.food.log[d]||[]).push(x);save();toast("Agregado");render()}
function delF(i){st.food.log[day()].splice(i,1);save();render()}
function cfg(el){var v=num(el.value);if(v>0){st.food.g[el.dataset.k]=v;save()}render()}
function resetG(){st.food.g=Object.assign({},DG);save();render()}
var AN=[["fr","Frente relajado"],["ff","Frente flexionado"],["pi","Perfil izquierdo"],["pd","Perfil derecho"],["er","Espalda relajada"],["ef","Espalda flexionada"],["pg","Piernas"],["dt","Detalle muscular"]];
var ZN=["Bíceps","Tríceps","Antebrazos","Pecho","Hombros","Abdomen","Cuádriceps","Pantorrillas"],GR=["Pecho","Brazos","Espalda","Hombros","Piernas","Abdomen"];
var PH=[],U={},dbp=null,dbok=null,ev={v:"home",sid:"",desc:true,fa:"",fg:"",fd:"",cA:"",cB:"",ca:"fr",cm:"s"},ad=null,vwr=null,cf=null;
const aname=k=>(AN.find(a=>a[0]==k)||[0,"?"])[1];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const url=p=>U[p.id]||(U[p.id]=URL.createObjectURL(p.blob));
const T=d=>new Date(d+"T00:00");
const fdl=d=>T(d).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open("gymjournal",1);r.onupgradeneeded=()=>r.result.createObjectStore("photos",{keyPath:"id"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
const ps=(m,f)=>dbp.then(db=>new Promise((res,rej)=>{const t=db.transaction("photos",m),q=f(t.objectStore("photos"));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
const pput=o=>ps("readwrite",s=>s.put(o));
const pdel=id=>ps("readwrite",s=>s.delete(id));
function initDB(){dbp=idb();dbp.then(()=>ps("readonly",s=>s.getAll())).then(a=>{PH=a||[];dbok=true;render()}).catch(()=>{dbok=false;render()})}
function shrink(f){return new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const s=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);c.toBlob(b=>{URL.revokeObjectURL(u);b?res(b):rej()},"image/jpeg",.9)};im.onerror=()=>rej();im.src=u})}
const S_=()=>st.sess.slice().sort((a,b)=>a.d<b.d?-1:1);
const phs=sid=>PH.filter(p=>p.sid==sid);
const phA=(s,a)=>phs(s.id).find(p=>p.ang==a);
const repP=(s,a)=>phA(s,a)||phA(s,"fr")||phs(s.id)[0];
function span(a,b){const d=Math.abs(Math.round((T(b)-T(a))/864e5));return d<14?d+(d==1?" día":" días"):d<60?Math.round(d/7)+" semanas":(d/30.4).toFixed(1).replace(".0","")+" meses"}
function lab(s){const f=S_()[0];if(!f||f.id==s.id)return "Inicio";return "Semana "+Math.round((T(s.d)-T(f.d))/6048e5)}
const wFor=d=>{const e=st.peso.find(x=>x.d==d);return e?e.k:""};
const gsel=(id,ph)=>`<option value="">${ph}</option>`+id;

function vEvo(){
  if(dbok===false)return '<div class="card"><b>No se pudo activar el almacenamiento de fotos.</b><p class="mut">Este navegador no permite guardar archivos aquí (por ejemplo, modo privado o un visor restringido). Abre el archivo descargado en Chrome, Edge o Safari para usar Evolución física.</p></div>';
  if(dbok===null)return '<p class="mut">Cargando tus fotos…</p>';
  return ev.v=="cmp"?vCmp():ev.v=="ses"?vSes():vHome();
}
function guide(){return `<details class="card"><summary>📋 Cómo tomar mis fotos</summary><ul class="gl"><li>Usa una iluminación similar en cada sesión.</li><li>Mantén la misma distancia y encuadre, con la cámara a una altura parecida.</li><li>Elige un fondo sencillo.</li><li>Conserva la misma postura y ángulo.</li><li>Fotografíate más o menos a la misma hora del día.</li><li>No compares una foto tomada después de entrenar con otra en reposo: el bombeo cambia la apariencia temporalmente.</li></ul></details><p class="mut" style="margin:12px 2px">🔒 Tus fotos se guardan solo en este dispositivo, dentro de este navegador. No se suben ni se comparten. Si borras los datos del navegador, se pierden: descarga las que quieras conservar. Tampoco entran en el texto de Respaldo.</p>`}
function vHome(){
  const all=S_(),q='<p class="tag" style="margin-top:0">Los cambios se construyen con constancia. Documenta tu progreso y observa tu evolución.</p>';
  if(!all.length)return q+'<div class="card empty"><div class="big">📸</div><h3>Tu diario visual empieza aquí</h3><p class="mut">Toma tus primeras fotos hoy y compáralas en unas semanas.</p><button class="btn" onclick="openAdd()">Crear mi primera sesión</button></div>'+guide();
  const f=all[0],l=all[all.length-1],p=repP(l);
  let h=q+'<div class="card hero">'+(p?`<img src="${url(p)}" alt="Foto más reciente" onclick="vw('${p.id}')">`:'<div class="ph">Sin fotos</div>')+'</div>';
  h+=`<div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><b>${fd(l.d)}</b><span>Última sesión</span></div><div class="stat"><b>${fd(f.d)}</b><span>Primera sesión</span></div><div class="stat"><b>${span(f.d,today())}</b><span>Desde que empecé</span></div><div class="stat"><b>${l.w?l.w+" kg":"–"}</b><span>Peso última sesión</span></div></div>`;
  h+='<div class="row"><button class="btn" style="flex:2" onclick="openAdd()">+ Agregar fotografías</button><button class="btn" style="flex:1;background:none;color:var(--ink);border:1px solid var(--line)" onclick="openCmp()">Comparar</button></div>';
  const op=(arr,v)=>arr.map(a=>`<option value="${a[0]}"${v==a[0]?" selected":""}>${a[1]}</option>`).join("");
  h+=`<h2 class="s">Historial</h2><div class="card"><div class="row"><label class="f">Ángulo<select onchange="ev.fa=this.value;render()"><option value="">Todos</option>${op(AN,ev.fa)}</select></label><label class="f">Grupo muscular<select onchange="ev.fg=this.value;render()"><option value="">Todos</option>${op(GR.map(g=>[g,g]),ev.fg)}</select></label><label class="f">Desde<input type="date" value="${ev.fd}" onchange="ev.fd=this.value;render()"></label><label class="f">Orden<select onchange="ev.desc=this.value=='1';render()"><option value="1"${ev.desc?" selected":""}>Más reciente primero</option><option value="0"${ev.desc?"":" selected"}>Más antigua primero</option></select></label></div></div>`;
  let L=all.filter(s=>(!ev.fa||phA(s,ev.fa))&&(!ev.fg||(s.m||[]).includes(ev.fg))&&(!ev.fd||s.d>=ev.fd));
  if(ev.desc)L.reverse();
  h+=L.length?L.map(s=>{const i=all.indexOf(s),pr=i>0?all[i-1]:null,t=repP(s,ev.fa);return `<div class="card tl" onclick="openS('${s.id}')">${t?`<img src="${url(t)}" alt="">`:'<div class="ph"></div>'}<div><b>${lab(s)}</b><br>${fdl(s.d)}<br><span class="mut">${s.w?s.w+" kg · ":""}${phs(s.id).length} fotos${pr?" · "+span(pr.d,s.d)+" desde la anterior":""}</span></div></div>`}).join(""):'<p class="mut">Ninguna sesión coincide con los filtros.</p>';
  return h+guide();
}
function openS(id){ev.v="ses";ev.sid=id;render();scrollTo(0,0)}
function vSes(){
  const s=st.sess.find(x=>x.id==ev.sid);if(!s){ev.v="home";return vHome()}
  const l=phs(s.id),A=S_(),i=A.indexOf(s),pr=i>0?A[i-1]:null,te=T(s.d),t0=te-12096e5;
  const ent=st.ses.filter(x=>T(x.d)>=t0&&T(x.d)<=te).length;
  const dy=Object.keys(st.food.log).filter(d=>T(d)>=t0&&T(d)<=te&&st.food.log[d].length);
  const k=dy.length?dy.reduce((a,d)=>a+tot(d).k,0)/dy.length:0,pp=dy.length?dy.reduce((a,d)=>a+tot(d).p,0)/dy.length:0;
  let h=`<button class="mini" onclick="ev.v='home';render()">← Evolución</button><h2 class="s">${lab(s)} · ${fdl(s.d)}</h2>`;
  h+=`<div class="card"><div class="row"><label class="f">Fecha<input type="date" value="${s.d}" onchange="upS('d',this.value)"></label><label class="f">Peso (kg)<input inputmode="decimal" value="${s.w||""}" onchange="upS('w',this.value)"></label></div><label class="f" style="margin-top:10px">Notas y cambios que he notado<textarea rows="3" onchange="upS('n',this.value)">${esc(s.n||"")}</textarea></label><p class="mut" style="margin:10px 0 6px">Grupos que estoy priorizando</p><div class="row">${GR.map(g=>`<button class="chipm${(s.m||[]).includes(g)?" on":""}" onclick="tgM('${g}')">${g}</button>`).join("")}</div>`;
  h+=`<p class="mut" style="margin:12px 0 0">${pr?"Pasaron "+span(pr.d,s.d)+" desde la sesión anterior"+(pr.w&&s.w?" ("+(s.w-pr.w>0?"+":"")+(s.w-pr.w).toFixed(1)+" kg)":"")+". ":""}En los 14 días previos: ${ent} entrenos registrados${dy.length?`, promedio de ${n0(k)} kcal y ${n0(pp)} g de proteína al día`:""}.</p></div>`;
  h+=`<div class="row" style="margin-bottom:12px"><button class="btn s" onclick="openAdd('${s.id}')">+ Agregar fotografías</button></div><div class="pg">`;
  h+=l.map(p=>`<div class="tile"><img src="${url(p)}" alt="" onclick="vw('${p.id}')"><select onchange="setA('${p.id}',this.value)">${AN.map(a=>`<option value="${a[0]}"${p.ang==a[0]?" selected":""}>${a[1]}</option>`).join("")}</select>${p.ang=="dt"?`<select onchange="setZ('${p.id}',this.value)"><option value="">Zona…</option>${ZN.map(z=>`<option${p.z==z?" selected":""}>${z}</option>`).join("")}</select>`:""}${p.note?`<span class="mut">${esc(p.note)}</span>`:""}<div class="row"><button class="mini" onclick="rpl('${p.id}')">Reemplazar</button><button class="mini" onclick="dlP('${p.id}')">Descargar</button><button class="mini" onclick="askP('${p.id}')">Eliminar</button></div></div>`).join("")+'</div>';
  if(!l.length)h+='<p class="mut">Esta sesión no tiene fotos todavía.</p>';
  return h+`<div class="row" style="margin-top:14px"><button class="mini" onclick="dlS('${s.id}')">Descargar sesión</button><button class="mini" onclick="askS('${s.id}')">Eliminar sesión</button></div><input type="file" id="rf" accept="image/*" hidden>`;
}
function upS(k,v){const s=st.sess.find(x=>x.id==ev.sid);if(k=="w"){const w=num(v);s.w=w>0?w:"";if(w>0&&!st.peso.some(x=>x.d==s.d))st.peso.push({d:s.d,k:w})}else s[k]=v||(k=="d"?s.d:"");save();render()}
function tgM(g){const s=st.sess.find(x=>x.id==ev.sid);s.m=s.m||[];const i=s.m.indexOf(g);i<0?s.m.push(g):s.m.splice(i,1);save();render()}
function setA(id,a){const p=PH.find(x=>x.id==id);p.ang=a;if(a!="dt")p.z="";pput(p).then(render).catch(()=>toast("No se pudo guardar"))}
function setZ(id,z){const p=PH.find(x=>x.id==id);p.z=z;pput(p).catch(()=>toast("No se pudo guardar"))}
function rpl(id){const i=$("#rf");i.onchange=async()=>{const f=i.files[0],p=PH.find(x=>x.id==id),old=p.blob;if(!f)return;try{p.blob=await shrink(f);await pput(p);URL.revokeObjectURL(U[id]);delete U[id];toast("Foto reemplazada")}catch(e){p.blob=old;toast("No se pudo reemplazar")}render()};i.click()}
function dlP(id){const p=PH.find(x=>x.id==id),s=st.sess.find(x=>x.id==p.sid),a=document.createElement("a");a.href=url(p);a.download="evolucion-"+s.d+"-"+p.ang+".jpg";document.body.appendChild(a);a.click();a.remove()}
function dlS(sid){phs(sid).forEach((p,i)=>setTimeout(()=>dlP(p.id),i*400))}
function askP(id){cf={m:"¿Eliminar esta fotografía? No se puede deshacer.",f:()=>{pdel(id).then(()=>{PH=PH.filter(x=>x.id!=id);delete U[id];cf=null;rOv();render()}).catch(()=>toast("No se pudo eliminar"))}};rOv()}
function askS(sid){const n=phs(sid).length;cf={m:"¿Eliminar esta sesión y sus "+n+" fotografías? No se puede deshacer.",f:async()=>{try{for(const p of phs(sid)){await pdel(p.id);delete U[p.id]}PH=PH.filter(x=>x.sid!=sid);st.sess=st.sess.filter(x=>x.id!=sid);save();ev.v="home";cf=null;rOv();render()}catch(e){toast("No se pudo eliminar")}}};rOv()}
function vw(id){const p=PH.find(x=>x.id==id),s=st.sess.find(x=>x.id==p.sid);vwr={s:url(p),c:fdl(s.d)+" · "+aname(p.ang)+(s.w?" · "+s.w+" kg":"")};rOv()}

function openCmp(){const A=S_();if(A.length<2){toast("Necesitas al menos 2 sesiones");return}ev.v="cmp";firstLast();scrollTo(0,0)}
function firstLast(){const A=S_(),a=A[0],b=A[A.length-1];ev.cA=a.id;ev.cB=b.id;ev.ca=(AN.find(x=>phA(a,x[0])&&phA(b,x[0]))||AN[0])[0];render()}
function vCmp(){
  const A=S_(),a=st.sess.find(x=>x.id==ev.cA),b=st.sess.find(x=>x.id==ev.cB);
  if(!a||!b){ev.v="home";return vHome()}
  const opt=id=>A.map(s=>`<option value="${s.id}"${s.id==id?" selected":""}>${lab(s)} · ${fd(s.d)}</option>`).join("");
  let h=`<button class="mini" onclick="ev.v='home';render()">← Evolución</button><h2 class="s">Comparar</h2><div class="card"><div class="row"><label class="f">Antes<select onchange="ev.cA=this.value;render()">${opt(ev.cA)}</select></label><label class="f">Después<select onchange="ev.cB=this.value;render()">${opt(ev.cB)}</select></label><label class="f">Ángulo<select onchange="ev.ca=this.value;render()">${AN.map(x=>`<option value="${x[0]}"${ev.ca==x[0]?" selected":""}>${x[1]}</option>`).join("")}</select></label></div><div class="row" style="margin-top:10px"><button class="mini" onclick="firstLast()">Primera vs última</button><button class="chipm${ev.cm=="s"?" on":""}" onclick="ev.cm='s';render()">Lado a lado</button><button class="chipm${ev.cm=="d"?" on":""}" onclick="ev.cm='d';render()">Deslizador</button></div></div>`;
  const pa=phA(a,ev.ca),pb=phA(b,ev.ca);
  const fig=(s,p)=>`<figure>${p?`<img src="${url(p)}" alt="" onclick="vw('${p.id}')">`:'<div class="ph">Sin foto de este ángulo</div>'}<figcaption><b>${fd(s.d)}</b><br>${s.w?s.w+" kg":"Sin peso"}</figcaption></figure>`;
  if(ev.cm=="s")h+=`<div class="cp">${fig(a,pa)}${fig(b,pb)}</div>`;
  else if(pa&&pb)h+=`<div class="cmpw" style="--p:50%"><img class="b" src="${url(pb)}" alt=""><img class="a" src="${url(pa)}" alt=""><i class="ln"></i><span class="tg l">Antes · ${fd(a.d)}</span><span class="tg r">Después · ${fd(b.d)}</span></div><input type="range" min="0" max="100" value="50" aria-label="Deslizador" oninput="document.querySelector('.cmpw').style.setProperty('--p',this.value+'%')">`;
  else h+='<div class="card"><p class="mut" style="margin:0">Falta la foto de este ángulo en una de las dos sesiones.</p></div>';
  const dw=a.w&&b.w?b.w-a.w:null;
  return h+`<p class="mut" style="text-align:center;margin-top:12px">Entre ambas fotos: ${span(a.d,b.d)}${dw!==null?" · peso "+(dw>0?"+":"")+dw.toFixed(1)+" kg":""}. Las fotos se muestran sin ningún retoque.</p>`;
}

function openAdd(sid){const s=sid&&st.sess.find(x=>x.id==sid),d=s?s.d:today();ad={d:d,w:s&&s.w?s.w:wFor(d),wt:false,n:"",m:[],f:[],busy:false};rOv()}
function adD(v){ad.d=v||today();if(!ad.wt){const s=st.sess.find(x=>x.d==ad.d);ad.w=(s&&s.w)||wFor(ad.d)}rOv()}
async function addF(fl){for(const f of Array.from(fl)){try{const b=await shrink(f),used=ad.f.map(x=>x.ang),a=(AN.find(x=>!used.includes(x[0]))||AN[7])[0];ad.f.push({b:b,u:URL.createObjectURL(b),ang:a,z:"",note:""})}catch(e){toast("No pude leer una imagen")}}rOv()}
function rmF(i){URL.revokeObjectURL(ad.f[i].u);ad.f.splice(i,1);rOv()}
function adM(g){const i=ad.m.indexOf(g);i<0?ad.m.push(g):ad.m.splice(i,1);rOv()}
async function saveAd(){
  if(!ad.f.length){toast("Agrega al menos una foto");return}
  ad.busy=true;rOv();let s;
  try{
    try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
    s=st.sess.find(x=>x.d==ad.d);
    if(!s){s={id:uid(),d:ad.d,w:"",n:"",m:[]};st.sess.push(s)}
    const w=num(ad.w);if(w>0){s.w=w;if(!st.peso.some(x=>x.d==s.d))st.peso.push({d:s.d,k:w})}
    if(ad.n.trim())s.n=ad.n.trim();
    ad.m.forEach(g=>{if(!s.m.includes(g))s.m.push(g)});
    for(const x of ad.f){const r={id:uid(),sid:s.id,ang:x.ang,z:x.z,note:x.note,blob:x.b};await pput(r);PH.push(r)}
    save();ad.f.forEach(x=>URL.revokeObjectURL(x.u));ad=null;ev.v="ses";ev.sid=s.id;toast("Sesión guardada");rOv();render();scrollTo(0,0);
  }catch(e){if(s&&!phs(s.id).length)st.sess=st.sess.filter(x=>x.id!=s.id);save();if(ad)ad.busy=false;toast("No se pudo guardar las fotos. Intenta de nuevo");rOv();render()}
}
function rAd(){
  return `<div class="ovb"><div class="sh"><div class="row" style="justify-content:space-between"><h2 class="s" style="margin:0">Nueva sesión</h2><button class="mini" onclick="ad=null;rOv()">✕</button></div><div class="row" style="margin-top:10px"><label class="f">Fecha<input type="date" value="${ad.d}" onchange="adD(this.value)"></label><label class="f">Peso (kg)<input inputmode="decimal" value="${ad.w}" oninput="ad.w=this.value;ad.wt=true" placeholder="opcional"></label></div><div class="row" style="margin:12px 0"><label class="btn s lb">+ Agregar fotografías<input type="file" accept="image/*" multiple hidden onchange="addF(this.files)"></label><label class="btn s lb alt">📷 Tomar foto<input type="file" accept="image/*" capture="environment" hidden onchange="addF(this.files)"></label></div><div class="pg">${ad.f.map((x,i)=>`<div class="tile"><img src="${x.u}" alt=""><select onchange="ad.f[${i}].ang=this.value;rOv()">${AN.map(a=>`<option value="${a[0]}"${x.ang==a[0]?" selected":""}>${a[1]}</option>`).join("")}</select>${x.ang=="dt"?`<select onchange="ad.f[${i}].z=this.value"><option value="">Zona…</option>${ZN.map(z=>`<option${x.z==z?" selected":""}>${z}</option>`).join("")}</select>`:""}<input placeholder="Nota (opcional)" oninput="ad.f[${i}].note=this.value" value="${esc(x.note)}"><button class="mini" onclick="rmF(${i})">Quitar</button></div>`).join("")}</div><label class="f" style="margin-top:12px">Notas de la sesión (cómo percibo mi progreso)<textarea rows="3" oninput="ad.n=this.value">${esc(ad.n)}</textarea></label><p class="mut" style="margin:12px 0 6px">Grupos que estoy priorizando</p><div class="row">${GR.map(g=>`<button class="chipm${ad.m.includes(g)?" on":""}" onclick="adM('${g}')">${g}</button>`).join("")}</div><details style="margin:12px 0"><summary>Lista de comprobación (opcional)</summary>${["Iluminación similar","Distancia de cámara similar","Postura consistente","Fotos de los ángulos principales","Peso corporal registrado"].map(t=>`<label class="ck"><input type="checkbox"> ${t}</label>`).join("")}</details><button class="btn" onclick="saveAd()"${ad.busy?" disabled":""}>${ad.busy?"Guardando…":"Guardar sesión"}</button></div></div>`;
}
function rOv(){
  let h="";
  if(ad)h=rAd();
  else if(vwr)h=`<div class="ovb dark"><div class="vz"><img src="${vwr.s}" alt="" onclick="this.classList.toggle('z')"></div><div class="vc"><span>${esc(vwr.c)}</span><button class="mini" onclick="vwr=null;rOv()">Cerrar</button></div></div>`;
  else if(cf)h=`<div class="ovb c"><div class="dlg"><p style="margin-top:0">${cf.m}</p><div class="row"><button class="btn s" style="background:#e03131" onclick="cf.f()">Eliminar</button><button class="btn s" style="background:none;color:var(--ink);border:1px solid var(--line)" onclick="cf=null;rOv()">Cancelar</button></div></div></div>`;
  $("#ov").innerHTML=h;
}
var ROT=["UA","LA","UB","LB"],cc="",BD={up:["SUBIR PESO","#2f9e44"],keep:["MANTENER PESO","#e8590c"],set:["AGREGAR UNA SERIE","#4c8bf5"],down:["REDUCIR CARGA","#e03131"],"new":["SIN HISTORIAL","#77736b"],none:["SEGUIR REGISTRANDO","#77736b"]};
var PAIN=/dolor|dol[ií]|duel|molest|lesi|tir[oó]n/i;
function tg(s){var m=/(\d+)\s*×\s*(\d+)(?:–(\d+))?/.exec(s);if(m)return{n:+m[1],lo:+m[2],hi:+(m[3]||m[2]),ok:true};var q=/(\d+)/.exec(s);return{n:q?+q[1]:2,ok:false}}
function sets_(x,i){var r=(x.ex&&x.ex[i])||[],o=[];for(var j=0;j<6;j+=2){var w=num(r[j]),n=num(r[j+1]);if(w>0&&n>0)o.push({w:w,r:n})}return o}
function hist(key,i){return st.ses.filter(function(x){return x.t==key}).sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0}).map(function(x){return{d:x.d,e:+x.e||3,n:x.n||"",ok:!(x.ex&&x.ex[i]&&x.ex[i][6]),s:sets_(x,i)}}).filter(function(h){return h.s.length})}
function top_(h){var m=Math.max.apply(null,h.s.map(function(a){return a.w}));return{w:m,r:h.s.filter(function(a){return a.w>=m}).map(function(a){return a.r})}}
var sum_=function(a){return a.reduce(function(x,y){return x+y},0)};
function vol(h){return sum_(h.s.map(function(a){return a.w*a.r}))}
function rnd(v){return Math.round(v/2.5)*2.5}
function inc(w){return Math.min(10,Math.max(2.5,rnd(w*.05)))}
function prog(a,b){var A=top_(a),B=top_(b);return B.w>A.w||vol(b)>vol(a)}
function anl(key,i){
  var e=PLAN[key].ex[i],t=tg(e[1]),H=hist(key,i),n=H.length,L=H[n-1];
  if(!L)return{a:"new",t:t,H:H,goal:"Elige un peso con el que llegues al mínimo del rango con técnica sólida",x:"Todavía no hay registros de este ejercicio. Empieza con un peso con el que llegues al mínimo del rango con buena técnica y deja 1–2 repeticiones en reserva."};
  var P=H[n-2],c=top_(L),avg=sum_(c.r)/c.r.length,res="";
  var last=L.s.map(function(a){return a.w+"×"+a.r}).join(" · ");
  if(!t.ok)return{a:"none",t:t,H:H,L:L,goal:"Supera tu marca anterior",x:"Este ejercicio no tiene rango de repeticiones fijo. Última vez: "+last+". Intenta superar esa marca con buena técnica."};
  if(PAIN.test(L.n))return{a:"keep",t:t,H:H,L:L,goal:c.w+" lb · sin subir carga",x:"Anotaste una molestia en tu última sesión. No subas la carga: cuida la técnica y, si el dolor persiste, consulta a un profesional."};
  var low=avg<t.lo,Pl=P&&top_(P).w>=c.w&&sum_(top_(P).r)/top_(P).r.length<t.lo;
  var Q=H[n-3],regress=P&&Q&&vol(L)<.9*vol(P)&&vol(P)<.9*vol(Q);
  var tired=P&&L.e<=2&&P.e<=2&&vol(L)<vol(P);
  if((low&&Pl)||regress||tired){var w=rnd(c.w*.9);return{a:"down",t:t,H:H,L:L,goal:w+" lb × "+t.lo+"–"+t.hi,x:"Tu rendimiento bajó en las últimas sesiones. Reduce a unos "+w+" lb (~10 %), cuida la técnica y reconstruye con más repeticiones. Revisa también sueño, comida y descanso."}}
  var full=c.r.length>=t.n&&c.r.every(function(r){return r>=t.hi});
  if(full){
    if(!L.ok)return{a:"keep",t:t,H:H,L:L,goal:c.w+" lb · afianza la técnica",x:"Llegaste a "+t.hi+" repeticiones, pero marcaste la técnica como dudosa. Mantén el peso hasta que se vea sólida."};
    if(L.e<3)return{a:"keep",t:t,H:H,L:L,goal:c.w+" lb · consolida",x:"Completaste todas las series, pero tu energía fue baja. Repite el peso y sube cuando te sientas mejor."};
    var w2=c.w+inc(c.w);return{a:"up",t:t,H:H,L:L,goal:w2+" lb × "+t.lo+"–"+t.hi,x:"Completaste "+t.n+" series de "+t.hi+" repeticiones con buena técnica. Sube a "+w2+" lb y vuelve a trabajar desde "+t.lo+" repeticiones."}
  }
  if(n>=3&&prog(H[n-3],H[n-2])&&prog(H[n-2],L)&&(H[n-3].e+H[n-2].e+L.e)/3>=3.5&&H.slice(-3).every(function(h){return h.ok})&&L.s.length>=t.n&&L.s.length<=t.n&&t.n<3)
    return{a:"set",t:t,H:H,L:L,goal:c.w+" lb · "+(t.n+1)+" series",x:"Llevas 3 sesiones progresando y con buena energía. Puedes tolerar más volumen: agrega 1 serie ("+t.n+" → "+(t.n+1)+") con el mismo peso."};
  var g=Math.min(t.hi,Math.min.apply(null,c.r)+1);
  res=(L.s.length<t.n?"Completa las "+t.n+" series. ":"")+(low?"Primero llega al mínimo de "+t.lo+" repeticiones. ":"")+"Mantén "+c.w+" lb e intenta "+g+" repeticiones en cada serie (última vez: "+last+").";
  return{a:"keep",t:t,H:H,L:L,goal:c.w+" lb × "+g+"+ reps",x:res};
}
function coachLine(key,i){var r=anl(key,i),b=BD[r.a];if(r.a=="new")return '<div class="cc mut">Coach: sin historial, elige un peso con técnica sólida.</div>';return '<div class="cc"><span class="bdg" style="background:'+b[1]+'">'+b[0]+'</span><span>'+r.goal+'</span></div>'}
function gl(){
  var A=st.ses.slice().sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0}),L=A[A.length-1],td=T(today());
  var next=L?ROT[(ROT.indexOf(L.t)+1)%4]:"UA",since=L?Math.round((td-T(L.d))/864e5):null;
  var wk=[0,1,2,3].map(function(k){return A.filter(function(x){var d=Math.round((td-T(x.d))/864e5);return d>=7*k&&d<7*(k+1)}).length});
  var en=A.slice(-3).map(function(x){return +x.e||3}),em=en.length?sum_(en)/en.length:0;
  var pw=st.peso.slice().sort(function(a,b){return a.d<b.d?-1:1}).filter(function(x){return Math.round((td-T(x.d))/864e5)<=21}),rate=null;
  if(pw.length>=2){var dd=(T(pw[pw.length-1].d)-T(pw[0].d))/864e5;if(dd>=7)rate=(pw[pw.length-1].k-pw[0].k)/(dd/7)}
  var ks=Object.keys(st.food.log).filter(function(d){var q=Math.round((td-T(d))/864e5);return q>=0&&q<7&&st.food.log[d].length});
  var kc=ks.length?sum_(ks.map(function(d){return tot(d).k}))/ks.length:null,pr=ks.length?sum_(ks.map(function(d){return tot(d).p}))/ks.length:null;
  return{next:next,L:L,since:since,wk:wk,em:em,rate:rate,kc:kc,pr:pr,n:A.length}
}
function vCoach(){
  var g=gl(),key=cc||g.next,tgt=st.food.g,h='<p class="tag" style="margin-top:0">Tu coach revisa tus registros y te dice qué hacer en el siguiente entreno. Son recomendaciones automáticas basadas en sobrecarga progresiva.</p>';
  if(!g.n)h+='<div class="card empty"><div class="big">🏋️</div><h3>Aún no hay entrenos registrados</h3><p class="mut">Guarda tu primera sesión en Entrenar y aquí aparecerá tu análisis.</p><button class="btn" onclick="go(\'ent\')">Ir a entrenar</button></div>';
  else{
    var nx=PLAN[g.next];
    h+='<div class="card"><span class="mut">Siguiente sesión sugerida</span><h3 style="margin:4px 0 6px;font-size:20px">'+nx.n+' · '+nx.s+'</h3><p class="mut" style="margin:0 0 12px">Tu última sesión fue '+PLAN[g.L.t].n+' ('+(g.since==0?"hoy":"hace "+g.since+(g.since==1?" día":" días"))+'). '+(g.since>=4?'Llevas varios días sin entrenar: retoma sin tratar de compensar.':g.since==0?'Descansa y come bien: el músculo crece en la recuperación.':'Sigue la rotación para repartir el trabajo de cada grupo muscular.')+'</p><button class="btn" onclick="cur=\''+g.next+'\';go(\'ent\')">Entrenar ahora</button></div>';
    var rt=g.rate;
    h+='<div class="stats"><div class="stat"><b>'+g.wk[0]+'/4</b><span>Entrenos esta semana</span></div><div class="stat"><b>'+g.em.toFixed(1)+'</b><span>Energía (últ. 3)</span></div><div class="stat"><b>'+(rt===null?"–":(rt>0?"+":"")+rt.toFixed(2))+'</b><span>kg por semana</span></div></div>';
    var m=[];
    m.push("Últimas 4 semanas (de la más reciente): "+g.wk.join(", ")+" entrenos. Tu meta son 4 por semana."+(g.wk[0]<3&&g.wk[1]<3?" Llevas dos semanas por debajo de 3: la constancia pesa más que cualquier ajuste de carga.":""));
    if(rt!==null)m.push(rt<.1?"Tu peso casi no sube. Para ganar masa quizá necesites unas 150–250 kcal más al día.":rt>.6?"Tu peso sube rápido. Vigila que no sea demasiada grasa: puedes bajar un poco las calorías.":"Tu peso sube a un ritmo adecuado para ganar masa de forma gradual.");
    if(g.kc!==null)m.push("Promedio de los últimos días con registro: "+n0(g.kc)+" kcal y "+n0(g.pr)+" g de proteína (metas: "+n0(tgt.kcal)+" y "+n0(tgt.p)+")."+(g.kc<tgt.kcal*.9?" Estás por debajo del 90 % de tu meta de calorías: es lo primero que conviene corregir.":""));
    h+='<div class="card cx">'+m.map(function(x){return "<p>"+x+"</p>"}).join("")+'</div>';
  }
  h+='<h2 class="s">Recomendaciones por ejercicio</h2><div class="seg">'+ROT.map(function(k){return '<button class="'+(k==key?"on":"")+'" onclick="cc=\''+k+'\';render()">'+PLAN[k].n+'<small>'+PLAN[k].s+'</small></button>'}).join("")+'</div>';
  PLAN[key].ex.forEach(function(e,i){
    var r=anl(key,i),b=BD[r.a];
    h+='<div class="card ex cx"><h3>'+e[0]+'</h3><div class="t">Objetivo: '+e[1]+'</div><span class="bdg" style="background:'+b[1]+'">'+b[0]+'</span><p><b>'+(r.a=="new"?"":"Próxima meta: "+r.goal)+'</b></p><p>'+r.x+'</p>';
    var hs=r.H.slice(-3).reverse();
    if(hs.length)h+='<p class="mut">Historial (lb): '+hs.map(function(x){return fd(x.d)+" → "+x.s.map(function(a){return a.w+"×"+a.r}).join(" · ")}).join(" | ")+'</p>';
    h+='</div>';
  });
  return h+xCoach()+'<p class="mut" style="margin:12px 2px">El coach usa reglas fijas sobre tus registros y supone buena técnica salvo que la marques en Entrenar. No sustituye a un entrenador ni a un profesional de la salud: si algo te duele, no subas la carga.</p>';
}
var AI=null,SMPp=null,fa=null,chatBusy=false,chatCtl=null,chatLive="",chatErr="",cqv="";
function smp(){if(!SMPp)SMPp=(async function(){try{return window.claude?await claude.use("sample"):null}catch(e){return null}})();return SMPp}
function aiErr(e){var c=e&&e.code;return c=="not_granted"?"Necesitas permitir que la página use tu cuenta de Claude.":c=="rate_limited"?"Demasiadas solicitudes seguidas. Espera un momento.":c=="images_unavailable"||c=="not_declared"?"Este visor no permite enviar imágenes.":c=="refused"?"Claude no pudo procesar esa solicitud.":c=="cancelled"?"":"No se pudo completar. Intenta de nuevo."}
/* ---- autoguardado de lo que escribes en Entrenar ---- */
function dgt(){var d=(st.draft||{})[cur];if(d&&Date.now()-(d._t||0)>1728e5){delete st.draft[cur];save();return {}}return d||{}}
function rd_(){var d=dgt();if(d.d&&$("#sd"))$("#sd").value=d.d;if(d.e&&$("#se"))$("#se").value=d.e;if(d.n&&$("#sn"))$("#sn").value=d.n;
  document.querySelectorAll(".set input").forEach(function(el){var v=d[el.dataset.i+"_"+el.dataset.j];if(v)el.value=v});
  document.querySelectorAll("[data-t]").forEach(function(el){if(d["t"+el.dataset.t]==="x")el.checked=false})}
function dw_(e){
  if(tab!="ent")return;var el=e.target,k=null,v=el.value;
  if(el.dataset&&(el.dataset.x!==undefined||el.dataset.xn!==undefined)){
    st.draft=st.draft||{};var D=st.draft[cur]=st.draft[cur]||{};D.xs=D.xs||[];var isN=el.dataset.xn!==undefined,xi=+(isN?el.dataset.xn:el.dataset.x),X=D.xs[xi];
    if(X){if(isN)X.n=v;else X.v[+el.dataset.j]=v;D._t=Date.now();save()}
    if(isN&&e.type=="change"){var lr=lastX(v)||[];document.querySelectorAll('[data-x="'+xi+'"]').forEach(function(q){q.placeholder=lr[+q.dataset.j]||(+q.dataset.j%2?"reps":"lb")})}
    return;
  }
  if(el.matches&&el.matches(".set input"))k=el.dataset.i+"_"+el.dataset.j;
  else if(el.id=="sd")k="d";else if(el.id=="se")k="e";else if(el.id=="sn")k="n";
  else if(el.dataset&&el.dataset.t!==undefined){k="t"+el.dataset.t;v=el.checked?"":"x"}
  if(k===null)return;
  st.draft=st.draft||{};var d=st.draft[cur]=st.draft[cur]||{};d[k]=v;d._t=Date.now();save();
}
document.addEventListener("input",dw_);document.addEventListener("change",dw_);
/* ---- IA: calorías con foto ---- */
function photoCard(){
  var h='<h2 class="s">Calcular con foto (IA)</h2><div class="card">';
  if(AI===false)return h+'<p class="mut" style="margin:0">Esta función usa tu cuenta de Claude y solo está disponible al abrir la página desde su enlace publicado en claude.ai, no desde el archivo descargado.</p></div>';
  if(AI===null)return h+'<p class="mut" style="margin:0">Conectando con la IA…</p></div>';
  h+='<p class="mut" style="margin-top:0">Toma o elige una foto de tu plato y la IA estima los alimentos, calorías y macros. La foto se envía a Claude con tu cuenta solo cuando toques Analizar y no se guarda aquí. Es una estimación: corrígela si conoces las porciones.</p><div class="row"><label class="btn s lb">📷 Tomar foto<input type="file" accept="image/*" capture="environment" hidden onchange="pickPh(this.files)"></label><label class="btn s lb alt">Elegir foto<input type="file" accept="image/*" hidden onchange="pickPh(this.files)"></label></div>';
  if(fa){
    h+='<img src="'+fa.u+'" alt="Foto de la comida" style="width:100%;max-height:300px;object-fit:contain;border-radius:12px;margin-top:12px;background:var(--bg)">';
    h+='<label class="f" style="margin-top:10px">Detalles opcionales (porciones, ingredientes, aceite…)<input value="'+esc(fa.note||"")+'" oninput="fa.note=this.value" placeholder="Ej. 2 tortillas y carne asada"></label>';
    h+='<button class="btn" style="margin-top:10px"'+(fa.busy?" disabled":"")+' onclick="anaPh()">'+(fa.busy?"Analizando…":fa.items?"Analizar de nuevo":"Analizar foto")+'</button>';
    if(fa.err)h+='<p style="color:#e03131;margin:10px 0 0">'+esc(fa.err)+'</p>';
    if(fa.items){
      if(fa.items.length){
        var T={k:0,p:0,c:0,f:0};fa.items.forEach(function(x){T.k+=x.k;T.p+=x.p;T.c+=x.c;T.f+=x.f});
        h+='<div style="margin-top:12px">'+fa.items.map(function(x,i){return '<div class="li"><span>'+esc(x.n)+' <span class="mut">('+esc(x.por)+')</span><br><span class="mut">'+n0(x.k)+' kcal · '+n0(x.p)+' g prot. · '+n0(x.c)+' g carb. · '+n0(x.f)+' g grasa</span></span><button onclick="fa.items.splice('+i+',1);render()" aria-label="Quitar">×</button></div>'}).join("")+'</div>';
        h+='<p style="margin:10px 0 4px"><b>Total: '+n0(T.k)+' kcal · '+n0(T.p)+' g proteína · '+n0(T.c)+' g carbohidratos · '+n0(T.f)+' g grasa</b></p><p class="mut" style="margin:0 0 10px">Confianza: '+esc(fa.conf||"media")+'. '+esc(fa.nota||"")+'</p><button class="btn" onclick="addPh()">Agregar al día</button>';
      }else h+='<p class="mut" style="margin:10px 0 0">No encontré comida en la foto. '+esc(fa.nota||"")+'</p>';
    }
  }
  return h+'</div>';
}
async function pickPh(fl){var f=fl&&fl[0];if(!f)return;try{var b=await shrink(f);if(fa)URL.revokeObjectURL(fa.u);fa={b:b,u:URL.createObjectURL(b),note:"",items:null,busy:false,err:""};render()}catch(e){toast("No pude leer la imagen")}}
async function anaPh(){
  var f=await smp();if(!f){toast("IA no disponible");return}
  var me=fa;me.busy=true;me.err="";render();
  var q='Eres un nutriólogo deportivo. Analiza la foto de una comida (la cocina mexicana casera es común). Identifica cada alimento visible, estima su porción (gramos o medida casera) y sus calorías y macros. Sé realista y no subestimes aceites, salsas ni bebidas. '+(me.note?'Detalles del usuario: '+me.note+'. ':'')+'Responde SOLO con JSON, sin texto extra, con esta forma: {"items":[{"n":"nombre","por":"porción estimada","k":0,"p":0,"c":0,"f":0}],"conf":"alta|media|baja","nota":"una frase breve con tus supuestos"}. k=kcal, p=proteína en g, c=carbohidratos en g, f=grasa en g, todos enteros. Si no hay comida, deja items vacío y explícalo en nota.';
  try{
    var lim=await f.limits();if(!lim.images)throw{code:"images_unavailable"};
    var r=await f.json(q,{images:[me.b],cache:false});
    me.items=(r.items||[]).map(function(x){return{n:String(x.n||"Alimento"),por:String(x.por||""),k:Math.max(0,+x.k||0),p:Math.max(0,+x.p||0),c:Math.max(0,+x.c||0),f:Math.max(0,+x.f||0)}});
    me.conf=r.conf||"media";me.nota=r.nota||"";
  }catch(e){me.err=aiErr(e)||"Cancelado."}
  me.busy=false;if(tab=="food")render();
}
function addPh(){var d=day(),L=(st.food.log[d]=st.food.log[d]||[]);fa.items.forEach(function(x){L.push({n:x.n+(x.por?" ("+x.por+")":""),k:x.k,p:x.p,c:x.c,f:x.f})});save();URL.revokeObjectURL(fa.u);fa=null;toast("Agregado al día");render()}
/* ---- IA: preguntas al coach ---- */
var QS=["¿Cuántas proteínas necesito al día para ganar músculo?","¿Cómo mejoro mi press inclinado?","¿Qué como antes de entrenar a las 7 pm?","¿Cómo sé si estoy comiendo lo suficiente?"];
function fmt(t){return esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>")}
function ctx_(){
  var g=st.food.g,w=lastW(),L=[],td=tot(today());
  ROT.forEach(function(k){st.ses.filter(function(x){return x.t==k}).sort(function(a,b){return a.d<b.d?-1:1}).slice(-2).forEach(function(x){L.push(PLAN[k].n+" "+x.d+" (energía "+x.e+"/5): "+PLAN[k].ex.map(function(e,i){var q=sets_(x,i);return q.length?e[0]+" "+q.map(function(a){return a.w+"lb×"+a.r}).join(", "):""}).filter(Boolean).join("; "))})});
  return "Perfil: hombre de 23 años, 1.77 m, peso actual "+w+" kg (inicial "+g.w0+" kg, meta "+g.wm+" kg y luego "+g.w2+" kg). Entrena 4 días por semana en gimnasio entre las 7 y las 9 pm; estudia y trabaja; come sobre todo comida casera (México). Objetivo: ganar masa muscular (brazos, pecho y piernas) con apariencia atlética. Metas diarias: "+g.kcal+" kcal, "+g.p+" g de proteína, "+g.c+" g de carbohidratos y "+g.f+" g de grasa. Hoy lleva "+n0(td.k)+" kcal y "+n0(td.p)+" g de proteína. Los pesos de los ejercicios están en libras (lb). Entrenos recientes:\n"+(L.length?L.join("\n"):"aún sin registros")
}
var SYS="Eres un entrenador personal y asesor de nutrición deportiva dentro de una app de seguimiento de gimnasio. Responde en español, con tono cercano, claro y práctico, en pocos párrafos o viñetas cortas. Usa los datos del usuario solo cuando ayuden a responder. Los pesos de ejercicios están en libras. No des diagnósticos médicos: si menciona dolor persistente, lesión, mareos o una condición de salud, sugiere consultar a un profesional. No recomiendes dietas extremas ni suplementos peligrosos. Si no sabes algo, dilo.";
function vIA(){
  var h='<p class="tag" style="margin-top:0">Pregúntale lo que quieras sobre entrenamiento, técnica y alimentación. Conoce tus metas y tus últimos entrenos.</p>';
  if(AI===false)return h+'<div class="card"><p class="mut" style="margin:0">Esta función usa tu cuenta de Claude y solo está disponible al abrir la página desde su enlace publicado en claude.ai, no desde el archivo descargado.</p></div>';
  if(AI===null)return h+'<p class="mut">Conectando con la IA…</p>';
  h+='<div id="cl">'+st.chat.map(function(m){return '<div class="bub '+(m.role=="user"?"me":"ai")+'">'+fmt(m.content)+'</div>'}).join("")+(chatBusy?'<div class="bub ai" id="cl_live">'+(chatLive?fmt(chatLive):"Pensando…")+'</div>':"")+(chatErr?'<p style="color:#e03131">'+esc(chatErr)+'</p>':"")+'</div>';
  if(!st.chat.length)h+='<div class="row" style="margin-bottom:12px">'+QS.map(function(q,i){return '<button class="chipm" onclick="send(QS['+i+'])">'+esc(q)+'</button>'}).join("")+'</div>';
  h+='<div class="card"><textarea id="cq" rows="2" placeholder="Escribe tu duda…" oninput="cqv=this.value"></textarea><div class="row" style="margin-top:10px"><button class="btn s" onclick="send()"'+(chatBusy?" disabled":"")+'>Enviar</button>'+(chatBusy?'<button class="mini" onclick="chatCtl&&chatCtl.abort()">Detener</button>':"")+(st.chat.length&&!chatBusy?'<button class="mini" onclick="clrChat()">Borrar conversación</button>':"")+'</div><p class="mut" style="margin:10px 0 0">Tus mensajes y un resumen de tus metas y entrenos se envían a Claude con tu cuenta. Es orientación general: no sustituye a un médico ni a un entrenador presencial.</p></div>';
  return h;
}
function ia_(){var q=$("#cq");if(q)q.value=cqv;var l=$("#cl_live")||($("#cl")&&$("#cl").lastElementChild);if(l&&l.scrollIntoView&&st.chat.length)l.scrollIntoView({block:"nearest"})}
function clrChat(){st.chat=[];chatErr="";save();render()}
async function send(q){
  var t=(q||cqv||"").trim();if(!t||chatBusy)return;
  var f=await smp();if(!f){toast("IA no disponible");return}
  st.chat.push({role:"user",content:t});st.chat=st.chat.slice(-30);save();cqv="";chatErr="";chatBusy=true;chatLive="";chatCtl=new AbortController();render();
  var turns=[{role:"user",content:SYS+"\n\nDatos del usuario:\n"+ctx_()}].concat(st.chat.slice(-12));
  try{
    var r=await f(turns,{cache:false,signal:chatCtl.signal,onText:function(x){chatLive=x.text;var e=$("#cl_live");if(e)e.innerHTML=fmt(chatLive)}});
    st.chat.push({role:"assistant",content:r.text+(r.truncated?"\n\n(Respuesta cortada: pídeme que continúe.)":"")});
  }catch(e){if(e&&e.text)st.chat.push({role:"assistant",content:e.text+"\n\n(Respuesta interrumpida)"});chatErr=aiErr(e)}
  chatBusy=false;chatCtl=null;chatLive="";save();if(tab=="ia")render();
}
function lastX(name){var k=(name||"").trim().toLowerCase();if(!k)return null;var A=st.ses.slice().sort(function(a,b){return a.d<b.d?-1:1}).reverse();for(var i=0;i<A.length;i++){var f=(A[i].x||[]).find(function(x){return x.n.toLowerCase()==k});if(f)return f.r}return null}
function xNames(){var o={};ROT.forEach(function(k){PLAN[k].ex.forEach(function(e){o[e[0]]=1})});st.ses.forEach(function(s){(s.x||[]).forEach(function(x){o[x.n]=1})});return Object.keys(o)}
function xCards(){
  var xs=dgt().xs||[],h='<h2 class="s">Otras variantes o ejercicios</h2><p class="mut" style="margin:0 0 10px">¿Hiciste otro ejercicio o una variante hoy? Agrégalo aquí y se guarda con esta sesión.</p><datalist id="xdl">'+xNames().map(function(n){return '<option value="'+esc(n)+'">'}).join("")+'</datalist>';
  xs.forEach(function(x,i){
    var lr=lastX(x.n)||[];
    h+='<div class="card ex"><label class="f">Ejercicio<input data-xn="'+i+'" list="xdl" value="'+esc(x.n)+'" placeholder="Ej. Press declinado con mancuernas"></label><div class="sets" style="margin-top:10px">';
    for(var j=0;j<3;j++)h+='<div class="xset"><b>Serie '+(j+1)+'</b><input inputmode="decimal" data-x="'+i+'" data-j="'+(j*2)+'" value="'+esc(x.v[j*2]||"")+'" placeholder="'+(lr[j*2]||"lb")+'" aria-label="Peso"><input inputmode="numeric" data-x="'+i+'" data-j="'+(j*2+1)+'" value="'+esc(x.v[j*2+1]||"")+'" placeholder="'+(lr[j*2+1]||"reps")+'" aria-label="Repeticiones"></div>';
    h+='</div><div class="row" style="margin-top:10px"><button class="mini" onclick="rmX('+i+')">Quitar</button></div></div>';
  });
  return h+'<button class="btn" style="background:none;color:var(--ink);border:1px solid var(--line);margin-bottom:12px" onclick="addX()">+ Agregar ejercicio o variante</button>';
}
function addX(){st.draft=st.draft||{};var D=st.draft[cur]=st.draft[cur]||{};D.xs=D.xs||[];D.xs.push({n:"",v:["","","","","",""]});D._t=Date.now();save();render()}
function rmX(i){var D=(st.draft||{})[cur];if(D&&D.xs){D.xs.splice(i,1);save()}render()}
function xCoach(){
  var m={};st.ses.slice().sort(function(a,b){return a.d<b.d?-1:1}).forEach(function(s){(s.x||[]).forEach(function(x){var k=x.n.toLowerCase();(m[k]=m[k]||{n:x.n,H:[]}).H.push({d:s.d,s:sets_({ex:[x.r]},0)})})});
  var ks=Object.keys(m);if(!ks.length)return"";
  return '<h2 class="s">Variantes y extras</h2>'+ks.map(function(k){var o=m[k],hs=o.H.slice(-3).reverse();return '<div class="card cx"><h3 style="margin:0 0 6px;font-size:15px">'+esc(o.n)+'</h3><p class="mut" style="margin:0">Historial (lb): '+hs.map(function(h){return fd(h.d)+" → "+h.s.map(function(a){return a.w+"×"+a.r}).join(" · ")}).join(" | ")+'</p><p style="margin:6px 0 0">Sin rango objetivo: intenta superar tu marca anterior con buena técnica.</p></div>'}).join("");
}
function vResp(){
  return '<div class="card"><h3 style="margin:0 0 6px">Copia de seguridad</h3><p class="mut" style="margin:0 0 12px">Tu progreso se guarda en este navegador. Para pasarlo a otro dispositivo, o para no perderlo, genera el respaldo, cópialo y pégalo allá en el cuadro antes de restaurar.</p><button class="btn s" onclick="expo()">Generar respaldo</button><textarea id="bk" rows="5" style="margin-top:12px" placeholder="Aquí aparece tu respaldo o pega el de otro dispositivo"></textarea><div class="row" style="margin-top:10px"><button class="btn s" onclick="cp()">Copiar</button><button class="btn s" onclick="impo()">Restaurar (reemplaza lo actual)</button></div></div>';
}
function expo(){$("#bk").value=JSON.stringify(st);toast("Respaldo generado")}
function cp(){var t=$("#bk");if(!t.value)expo();t.select();try{navigator.clipboard.writeText(t.value)}catch(e){document.execCommand("copy")}toast("Copiado")}
function impo(){try{var v=JSON.parse($("#bk").value);if(!v||!Array.isArray(v.peso)||!Array.isArray(v.ses))throw 0;st=norm(v);save();toast("Progreso restaurado");render()}catch(e){toast("Respaldo no válido")}}
render();initDB();smp().then(function(f){AI=!!f;if(tab=="ia"||tab=="food")render()});
