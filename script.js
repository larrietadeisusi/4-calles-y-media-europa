
const start = new Date('2026-06-27T00:00:00');
const end = new Date('2026-07-18T23:59:59');
const preview = new URLSearchParams(location.search).get('preview') === '1';

function normalize(s){
 return (s||'').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
}
function todayIndex(){
 if(preview) return 0;
 const now = new Date();
 const d = Math.floor((now - start)/86400000);
 if(d < 0) return -1;
 if(d >= TRIP_DAYS.length) return TRIP_DAYS.length-1;
 return d;
}
function daysToReturn(){
 const now=new Date();
 const diff=Math.ceil((new Date('2026-07-18T00:00:00')-now)/86400000);
 return Math.max(0,diff);
}
function updateCountdown(){
 const el=document.getElementById('countdown');
 const n=daysToReturn();
 el.innerHTML = `❤️ ${n} días para volver a abrazarte`;
}
updateCountdown();

const positions=[
[22,88],[33,77],[29,67],[44,58],[54,50],[45,42],[60,34],[50,27],[64,21],[75,14],
[74,14],[73,14],[65,20],[64,20],[63,20],[62,20],[58,28],[57,37],[51,47],[43,60],[35,75],[22,88]
];

function setActive(id){
 document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 window.scrollTo(0,0);
}
function goHome(){setActive('home')}
function goMap(){
 setActive('mapScreen');
 renderMap();
}
function renderMap(){
 const idx=todayIndex();
 const p=document.getElementById('points');
 p.innerHTML='';
 const song = document.getElementById('songCard');
 const current = TRIP_DAYS[Math.max(0,idx)];
 song.textContent = "🎵 " + (current?.song || "Hoy suena: hogar");
 TRIP_DAYS.forEach((d,i)=>{
   const b=document.createElement('button');
   b.className='point '+(i<idx?'open':i===idx?'today':'locked');
   b.style.left=positions[i][0]+'%';
   b.style.top=positions[i][1]+'%';
   b.innerHTML=`<span class="n">${i+1}</span>`;
   b.onclick=()=>openDay(i);
   p.appendChild(b);
 });
}
function openDay(i){
 const idx=todayIndex();
 setActive('dayScreen');
 document.getElementById('dayMeta').textContent=`Día ${i+1} · ${TRIP_DAYS[i].date} · ${TRIP_DAYS[i].place}`;
 const q=document.getElementById('questionBox');
 const m=document.getElementById('memoryBox');
 m.classList.add('hidden'); m.innerHTML='';
 if(i>idx){
   q.innerHTML=`<div class="locked-note">🔒 Este punto todavía no se ha abierto.<br><br>Vuelve el ${TRIP_DAYS[i].date}.</div>`;
   return;
 }
 const d=TRIP_DAYS[i];
 q.innerHTML=`<div class="q-title">Pregunta del día</div>
 <div class="q-text">${d.question}</div>
 <input id="answer" placeholder="Escribe aquí..." autocomplete="off">
 <button class="primary" style="margin-top:16px" onclick="checkAnswer(${i})">Comprobar</button>
 <div id="err" class="error"></div>`;
 setTimeout(()=>document.getElementById('answer')?.focus(),200);
}
function checkAnswer(i){
 const d=TRIP_DAYS[i];
 const val=normalize(document.getElementById('answer').value);
 const valid=d.answers.map(normalize);
 if(valid.includes(val)){
   showMemory(i);
 }else{
   document.getElementById('err').textContent='Respuesta incorrecta 😜 prueba otra vez.';
 }
}
function showMemory(i){
 const d=TRIP_DAYS[i];
 const q=document.getElementById('questionBox');
 const m=document.getElementById('memoryBox');
 q.innerHTML='<div class="q-title">Recuerdo desbloqueado</div><div class="q-text">❤️</div>';
 const media = d.type === 'video'
 ? `<video class="media" controls playsinline src="${d.media}" onerror="this.replaceWith(placeholder(${i+1}))"></video>`
 : `<img class="media" src="${d.media}" alt="Recuerdo día ${i+1}" onerror="this.replaceWith(placeholder(${i+1}))">`;
 m.innerHTML=`${media}<div class="song-card">🎵 ${d.song}</div><div class="message">${d.message}</div><button class="primary" onclick="goMap()">Volver al mapa</button>`;
 m.classList.remove('hidden');
 try{navigator.vibrate && navigator.vibrate(40)}catch(e){}
}
function placeholder(n){
 const div=document.createElement('div');
 div.className='placeholder';
 div.innerHTML=`<div>📸<br><br>Foto/Vídeo del día ${n}<br><small>Cuando subas el archivo aparecerá aquí.</small></div>`;
 return div;
}
