(function(){
var Q=[
 {q:"¿Qué es lo que más tiempo te quita cada semana?",o:[["Contestar mensajes y dudas de clientes",{chat:3}],["Pasar facturas y papeles a mano",{fact:3}],["Tareas y seguimientos que se repiten",{tarea:3}],["Tener los datos en varios sitios",{integ:3}]]},
 {q:"¿Por dónde te llegan más consultas o documentos?",o:[["WhatsApp o Instagram",{chat:2}],["Email, PDF o fotos",{fact:2}],["Teléfono o en persona",{tarea:2}],["Mi web o mi tienda online",{integ:2}]]},
 {q:"¿Qué pasa cuando tú no estás?",o:[["Pierdo clientes por tardar en responder",{chat:3}],["Se acumula el papeleo",{fact:3}],["Se me olvida hacer seguimientos",{tarea:3}],["Nadie sabe dónde está cada dato",{integ:3}]]},
 {q:"¿Cuántas herramientas usas para trabajar (email, hojas, CRM, tienda, contabilidad)?",o:[["Una o dos",{tarea:1,chat:1}],["Tres o cuatro",{integ:1,fact:1}],["Cinco o más",{integ:2}],["No lo sé, voy como puedo",{tarea:1}]]}
];
var R={
 chat:{t:"Un asistente de WhatsApp",u:"/servicios/chatbots-ia-whatsapp/",d:"Lo que más te frena son los mensajes y las dudas de clientes. Un asistente que conteste por ti, agende citas y te avise de lo importante es tu mejor primer paso."},
 fact:{t:"Leer facturas y documentos con IA",u:"/servicios/automatizar-facturas-ia/",d:"Lo que más tiempo te come es el papeleo. Que la IA lea facturas, albaranes y pedidos y los apunte donde toca te devuelve horas desde el primer día."},
 tarea:{t:"Automatizar tareas repetitivas",u:"/servicios/automatizacion-tareas-pymes/",d:"Hay trabajo que se repite y no tendrías que hacerlo tú: seguimientos, avisos, informes. Empieza por la tarea que más veces haces."},
 integ:{t:"Conectar tus herramientas",u:"/servicios/integraciones-herramientas/",d:"Tus herramientas no se hablan y duplicas trabajo. Conectarlas hace que los datos pasen solos y deja de haber versiones distintas de lo mismo."}
};
var i=0,sc={chat:0,fact:0,tarea:0,integ:0},box=document.getElementById("quiz");
function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML}
function show(){
 if(i>=Q.length){return done()}
 var q=Q[i],h='<p class="qstep">Pregunta '+(i+1)+' de '+Q.length+'</p><h2>'+esc(q.q)+'</h2><div class="qopts">';
 q.o.forEach(function(o,k){h+='<button type="button" data-k="'+k+'">'+esc(o[0])+'</button>'});
 box.innerHTML=h+'</div>';
 box.querySelectorAll("button").forEach(function(b){b.addEventListener("click",function(){
  var w=q.o[+b.dataset.k][1];for(var k in w)sc[k]+=w[k];i++;show()})});
}
function done(){
 var k=Object.keys(sc).sort(function(a,b){return sc[b]-sc[a]}),a=R[k[0]],b=R[k[1]];
 box.innerHTML='<p class="qstep">Tu resultado</p><h2>Empieza por: '+esc(a.t)+'</h2><p>'+esc(a.d)+'</p>'+
 '<p class="btns"><a class="btn" href="'+a.u+'">Ver cómo lo hago</a> <a class="btn ghost" href="https://one-agency.es/#contacto" rel="noopener">Pedir mi diagnóstico gratis</a></p>'+
 '<p class="small">Segunda opción para más adelante: <a href="'+b.u+'">'+esc(b.t)+'</a>.</p>'+
 '<p class="small"><button type="button" class="link" id="again">Repetir el test</button> · Tus respuestas no salen de tu navegador.</p>';
 document.getElementById("again").addEventListener("click",function(){i=0;sc={chat:0,fact:0,tarea:0,integ:0};show()});
}
show();
})();