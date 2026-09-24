/* ---------- CONFIG: real emails via EmailJS (optional). Leave empty to preview emails in the Email log only ---------- */
const BACKEND_URL = ''; // optional LLM extraction API, e.g. 'http://localhost:8000/extract'. Empty = built-in rules
const EMAILJS = { publicKey:'', serviceId:'', templateId:'' }; // template variables: to_email, subject, message

/* ---------- Demo data (replace with output of the extraction backend) ---------- */
const USERS = [
 {email:'meera@demo.com',pw:'manager123',name:'Meera Nair',role:'admin'},
 {email:'ravi@demo.com',pw:'pass123',name:'Ravi Kumar',role:'user'},
 {email:'priya@demo.com',pw:'pass123',name:'Priya Shah',role:'user'},
 {email:'arjun@demo.com',pw:'pass123',name:'Arjun Das',role:'user'}];
const nm = e => (USERS.find(u=>u.email===e)||{}).name || 'Unassigned';
const day = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const MEETINGS = [
 {id:'M1',title:'Sprint Planning',date:day(-14),attendees:['meera@demo.com','ravi@demo.com','priya@demo.com','arjun@demo.com'],
  summary:'Team agreed to lock the release for month end and start a pilot with the Beta vendor.',
  decisions:['Go with the Beta vendor pilot'],open:['Who emails the vendor about pricing was left unclear'],
  lines:[['Meera','Let us lock the release for the end of the month.'],['Ravi','I will finish the payment API integration by Friday.'],['Meera','Priya, please prepare the vendor comparison sheet by next Wednesday, 3 PM.'],['Arjun','Someone should email the vendor about pricing.'],['Meera','Decision: we go with the Beta vendor pilot.'],['Arjun','I will set up the staging server today.']]},
 {id:'M2',title:'Weekly Sync',date:day(-7),attendees:['meera@demo.com','ravi@demo.com','priya@demo.com','arjun@demo.com'],
  summary:'Payment API is running late. Vendor sheet is drafted. QA checklist assigned.',
  decisions:[],open:['Pricing email to vendor still has no owner'],
  lines:[['Meera','Ravi, how is the payment API?'],['Ravi','Still in progress, I need two more days.'],['Priya','The vendor sheet is drafted, I will send it Monday.'],['Meera','Arjun, you will draft the QA checklist by Thursday.'],['Meera','Open question: who owns the pricing email to the vendor?']]},
 {id:'M3',title:'Release Review',date:day(-1),attendees:['meera@demo.com','ravi@demo.com','priya@demo.com','arjun@demo.com'],
  summary:'Release postponed by one week. Payment API and QA checklist still open.',
  decisions:['Postpone the release by one week'],open:['Pricing email to vendor is still unowned'],
  lines:[['Meera','Ravi, the payment API is now due this Friday at 5 PM.'],['Priya','The vendor sheet is shared, done.'],['Meera','Arjun, the QA checklist is still pending.'],['Meera','Priya, please write the release notes by Tuesday.'],['Meera','Decision: we postpone the release by one week.']]}];
// ev = [meeting, line number (1-based)]; time only when spoken in the meeting
const ITEMS = [
 {id:'A1',task:'Finish payment API integration',owner:'ravi@demo.com',conf:'explicit',ms:['M1','M2','M3'],due:day(3),time:'17:00',ev:[['M1',2],['M3',1]],q:'I will finish the payment API integration by Friday.',base:'active'},
 {id:'A2',task:'Prepare vendor comparison sheet',owner:'priya@demo.com',conf:'explicit',ms:['M1','M2'],due:day(-3),time:'15:00',ev:[['M1',3],['M2',3]],q:'Priya, please prepare the vendor comparison sheet by next Wednesday, 3 PM.',base:'active'},
 {id:'A3',task:'Email vendor about pricing',owner:'',conf:'ambiguous',ms:['M1','M2','M3'],due:'',time:'',ev:[['M1',4],['M2',5]],q:'Someone should email the vendor about pricing.',base:'active'},
 {id:'A4',task:'Draft QA checklist',owner:'arjun@demo.com',conf:'explicit',ms:['M2','M3'],due:day(1),time:'',ev:[['M2',4],['M3',3]],q:'Arjun, you will draft the QA checklist by Thursday.',base:'active'},
 {id:'A5',task:'Write release notes',owner:'priya@demo.com',conf:'explicit',ms:['M3'],due:day(5),time:'',ev:[['M3',4]],q:'Priya, please write the release notes by Tuesday.',base:'active'},
 {id:'A6',task:'Set up staging server',owner:'arjun@demo.com',conf:'explicit',ms:['M1'],due:day(-10),time:'',ev:[['M1',6]],q:'I will set up the staging server today.',base:'done'}];
const CHECK = {extracted:7,verified:6,rejected:1}; // 1 candidate was rejected: its quote was not found in the transcript

/* ---------- Metrack logo (M with a completed-check badge) ---------- */
let _lg=0;
const LOGO=(s=44)=>{const id='mg'+(++_lg);return `<svg width="${s}" height="${s}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Metrack logo"><defs><linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a6cf0"/><stop offset="1" stop-color="#061a3f"/></linearGradient><linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#a9c8ff"/></linearGradient></defs><rect width="48" height="48" rx="13" fill="url(#${id}a)"/><rect x=".75" y=".75" width="46.5" height="46.5" rx="12.5" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.5"/><path d="M11 35V14l11 13 11-13v21" fill="none" stroke="url(#${id}b)" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="37" cy="37" r="8.5" fill="#34d399" stroke="#061a3f" stroke-width="2.5"/><path d="M33.2 37l2.6 2.6 4.6-5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`};
try{ const ic=document.createElement('link'); ic.rel='icon'; ic.href='data:image/svg+xml,'+encodeURIComponent(LOGO(64)); document.head.appendChild(ic); }catch(e){}

/* ---------- State + storage ---------- */
let P = {status:{},owner:{},sent:{},mail:[],up:{m:[],i:[]},patch:{},rej:0};
try{ P = Object.assign(P, JSON.parse(localStorage.getItem('mat')||'{}')); }catch(e){}
const save = () => { try{ localStorage.setItem('mat',JSON.stringify(P)); }catch(e){} };
P.up=P.up||{m:[],i:[]}; P.patch=P.patch||{}; P.rej=P.rej||0;
P.up.m.forEach(m=>MEETINGS.push(m)); P.up.i.forEach(i=>ITEMS.push(i));
ITEMS.forEach(i=>{ if(P.patch[i.id]) Object.assign(i,P.patch[i.id]); });
const chk = () => { const v=ITEMS.length, r=1+P.rej; return {v, e:v+r, r}; };
let S = {user:null,tab:'active',who:'all',q:''};
try{ const u=sessionStorage.getItem('mat_u'); if(u) S.user=USERS.find(x=>x.email===u)||null; }catch(e){}

/* ---------- Helpers ---------- */
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const owner = i => P.owner[i.id] ?? i.owner;
const deadline = i => i.due ? new Date(i.due+'T'+(i.time||'23:59')+':00') : null;
const fmtDate = i => { if(!i.due) return 'No date mentioned'; const d=new Date(i.due+'T00:00:00'); return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})+(i.time?', '+i.time:''); };
function state(i){ const s=P.status[i.id]||i.base; if(s==='active'){ const d=deadline(i); if(d && d<new Date()) return 'notsubmitted'; } return s; }
const tag = i => { const s=state(i); if(s==='done') return '<span class="tag t-done">Done</span>'; if(s==='notsubmitted') return '<span class="tag t-bad">Not submitted</span>';
  return i.ms.length>1 ? `<span class="tag t-carry">Carried over (${i.ms.length} meetings)</span>` : '<span class="tag t-new">New</span>'; };
const daysTo = i => Math.round((new Date(i.due+'T00:00:00')-new Date(day(0)+'T00:00:00'))/864e5);

/* ---------- Email reminders ---------- */
async function sendMail(to,subject,message){
  const key=[to,subject].join('|')+'|'+day(0);
  if(P.sent[key]) return; P.sent[key]=1;
  P.mail.unshift({to,subject,message,at:new Date().toLocaleString()}); P.mail=P.mail.slice(0,60);
  if(EMAILJS.publicKey && typeof emailjs!=='undefined'){ try{ await emailjs.send(EMAILJS.serviceId,EMAILJS.templateId,{to_email:to,subject,message},{publicKey:EMAILJS.publicKey}); }catch(e){ console.error('Email failed',e); } }
}
function runReminders(){
  // Demo scheduler: runs at login. In production, run this daily on a server.
  const active = ITEMS.filter(i=>state(i)==='active' && i.due);
  for(const i of active){
    const o=owner(i), d=daysTo(i);
    if(o && d<=2) sendMail(o,`Reminder: "${i.task}" is due ${fmtDate(i)}`,`Hi ${nm(o)}, you committed to "${i.task}" in the meeting. Deadline: ${fmtDate(i)}.`);
    if(d<=1) sendMail('meera@demo.com',`Deadline ${d<=0?'today':'tomorrow'}: ${nm(o)} - "${i.task}"`,`${nm(o)} must submit "${i.task}" by ${fmtDate(i)}.`);
  }
  save();
}

/* ---------- Views ---------- */
function loginView(msg){
  return `<div class="split"><section class="l-left">${LOGO(68)}<h1 class="wm">Me<span>track</span></h1><p class="sub">Meeting Accountability Tracker</p><p>Turn every meeting into clear owners, deadlines and follow-through.</p>
  <ul><li>Every action item traced to its transcript line</li><li>Email reminders before deadlines</li><li>A clear history of what was submitted</li></ul></section>
  <section class="l-right"><form id="lf"><h2>Welcome back</h2><p class="mute">Sign in with your work email.</p>
  <label for="em">Email</label><input id="em" type="email" required autocomplete="username">
  <label for="pw">Password</label><input id="pw" type="password" required autocomplete="current-password">
  <div class="err" id="er">${msg||''}</div><button class="btn pri" style="width:100%;padding:11px">Sign in</button>
  <div class="demo">Demo accounts<br>Admin: <code>meera@demo.com</code> / <code>manager123</code><br>User: <code>ravi@demo.com</code>, <code>priya@demo.com</code>, <code>arjun@demo.com</code> / <code>pass123</code></div></form></section></div>`;
}
function evidenceBtn(i){ return `<button class="btn sm" data-ev="${i.id}">View source</button>`; }
function row(i,mgr,hist){
  const o=owner(i);
  const ownerCell = mgr ? `<td>${o?esc(nm(o)):`<span class="tag t-amb">Unassigned</span><br><select data-assign="${i.id}"><option value="">Assign to...</option>${USERS.filter(u=>u.role==='user').map(u=>`<option value="${u.email}">${u.name}</option>`).join('')}</select>`}${i.conf==='ambiguous'&&!o?'<div class="mute">Ambiguous: "someone"</div>':''}</td>`:'';
  const act = mgr ? `<td>${state(i)!=='done'?`<button class="btn sm pri" data-done="${i.id}">Mark submitted</button>`:'<span class="mute">Submitted</span>'}</td>`:'';
  return `<tr><td><b>${esc(i.task)}</b><div class="mute">"${esc(i.q)}" <span class="tag t-done" title="Quote found in transcript">Verified</span></div></td>${ownerCell}<td>${i.ms.map(m=>esc((MEETINGS.find(x=>x.id===m)||{title:m}).title)).join(', ')}</td><td>${fmtDate(i)}</td><td>${tag(i)}</td><td>${evidenceBtn(i)}</td>${act}</tr>`;
}
function table(list,mgr,hist){
  if(!list.length) return '<div class="card empty">Nothing here yet.</div>';
  return `<div class="scroll"><table><thead><tr><th>Task</th>${mgr?'<th>Owner</th>':''}<th>Meetings</th><th>Deadline</th><th>Status</th><th>Source</th>${mgr?'<th>Action</th>':''}</tr></thead><tbody>${list.map(i=>row(i,mgr,hist)).join('')}</tbody></table></div>`;
}
function meetingsView(u){
  const mine = MEETINGS.filter(m=>u.role==='admin'||m.attendees.includes(u.email));
  return `<div class="grid">${mine.map(m=>{
    const its=ITEMS.filter(i=>i.ms[0]===m.id && (u.role==='admin'||owner(i)===u.email));
    return `<div class="card"><h2>${esc(m.title)}</h2><div class="mute">${new Date(m.date+'T00:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})} - ${m.attendees.map(nm).join(', ')}</div>
    <p>${esc(m.summary)}</p>
    <h3>Decisions</h3>${m.decisions.length?`<ul class="p">${m.decisions.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>`:'<div class="mute">None recorded</div>'}
    <h3>Unresolved</h3><ul class="p">${m.open.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>
    <h3>${u.role==='admin'?'Action items raised':'Your action items'}</h3>${its.length?`<ul class="p">${its.map(i=>`<li>${esc(i.task)} (${esc(nm(owner(i)))}, ${fmtDate(i)})</li>`).join('')}</ul>`:'<div class="mute">None</div>'}
    <button class="btn sm" data-tr="${m.id}">View transcript</button></div>`}).join('')}</div>`;
}
function mailView(){
  return P.mail.length?`<div class="card">${P.mail.map(m=>`<div class="mail"><b>To: ${esc(m.to)}</b> <span class="mute">${esc(m.at)}</span><br>${esc(m.subject)}<div class="mute">${esc(m.message)}</div></div>`).join('')}</div>`:'<div class="card empty">No reminder emails yet.</div>';
}
function dash(){
  const u=S.user, mgr=u.role==='admin';
  const mineAll = ITEMS.filter(i=>mgr||owner(i)===u.email);
  let act = mineAll.filter(i=>state(i)==='active'), his = mineAll.filter(i=>state(i)!=='active');
  if(mgr && S.who!=='all'){ act=act.filter(i=>owner(i)===S.who); his=his.filter(i=>owner(i)===S.who); }
  if(mgr && S.q){ const qq=S.q.trim().toLowerCase(); act=act.filter(i=>nm(owner(i)).toLowerCase().includes(qq)); his=his.filter(i=>nm(owner(i)).toLowerCase().includes(qq)); }
  const tabs = mgr?[['active','Active'],['upload','Upload transcript'],['history','History'],['meetings','Meeting summaries'],['mail','Email log']]:[['active','Active'],['history','History'],['meetings','Meeting summaries']];
  let body='';
  if(S.tab==='active'){
    const soon = !mgr && act.filter(i=>i.due && daysTo(i)<=2);
    body += soon.length?`<div class="alert"><b>Due soon</b><ul>${soon.map(i=>`<li>${esc(i.task)} - ${fmtDate(i)}</li>`).join('')}</ul><div class="mute">A reminder was also sent to ${esc(u.email)}.</div></div>`:'';
    if(mgr) body += `<div class="stats"><div class="stat"><b>${act.length}</b><span>Active items</span></div><div class="stat"><b>${act.filter(i=>!owner(i)).length}</b><span>Need an owner</span></div><div class="stat"><b>${ITEMS.filter(i=>state(i)==='notsubmitted').length}</b><span>Not submitted</span></div><div class="stat"><b>${chk().v}/${chk().e}</b><span>Verified in transcript (${chk().r} rejected)</span></div></div>`;
    body += table(act,mgr,false);
  } else if(S.tab==='history'){
    body += table(his,mgr,true);
  } else if(S.tab==='meetings') body += meetingsView(u);
  else if(S.tab==='upload') body += uploadView(); else body += mailView();
  const filter = mgr && (S.tab==='active'||S.tab==='history') ? `<div style="margin-bottom:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><label class="mute">User </label><select id="who"><option value="all">All users</option>${USERS.filter(x=>x.role==='user').map(x=>`<option value="${x.email}" ${S.who===x.email?'selected':''}>${x.name}</option>`).join('')}</select><input id="usearch" type="text" placeholder="Search user by name..." value="${esc(S.q||'')}" style="max-width:220px"></div>`:'';
  const icons={active:'\u25A6',upload:'\u21EA',history:'\u27F2',meetings:'\u2630',mail:'\u2709'};
  const titles={active:mgr?'Active action items':'My action items',upload:'Upload a transcript',history:mgr?'History of all users':'My history',meetings:'Meeting summaries',mail:'Reminder email log'};
  const ini=u.name.split(' ').map(x=>x[0]).join('');
  return `<div class="shell"><aside class="side"><div class="brand" id="home" role="button" tabindex="0" title="Go to home" aria-label="Go to home page"><span class="logo">${LOGO(42)}</span><div><b class="wm">Me<span>track</span></b><small>${mgr?'Admin':'User'} workspace</small></div></div>
  <nav>${tabs.map(t=>`<button data-tab="${t[0]}" class="${S.tab===t[0]?'on':''}"><span class="ic">${icons[t[0]]}</span>${t[1]}</button>`).join('')}</nav>
  <div class="me"><span class="av">${esc(ini)}</span><div><b>${esc(u.name)}</b><small>${esc(u.email)}</small></div><button class="btn sm" id="lo">Sign out</button></div></aside>
  <main class="main"><header class="hero"><small>${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}</small><h1>${titles[S.tab]}</h1></header><div class="content">${filter}${body}</div></main></div>`;
}
function modal(html){ const m=document.createElement('div'); m.className='modal'; m.innerHTML=`<div>${html}<p><button class="btn" id="mc">Close</button></p></div>`; document.body.appendChild(m); m.onclick=e=>{ if(e.target===m||e.target.id==='mc') m.remove(); }; }
function transcript(id,hit){ const m=MEETINGS.find(x=>x.id===id); return `<h2>${esc(m.title)}</h2><div class="mute">${m.date}</div>${m.lines.map((l,n)=>`<div class="ln ${hit.includes(n+1)?'hit':''}"><i>Line ${n+1}</i><b>${esc(l[0])}:</b> ${esc(l[1])}</div>`).join('')}`; }

/* ---------- Upload + extraction ---------- */
const WD={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
const isoAdd=(iso,n)=>{ const d=new Date(iso+'T00:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const nextDow=(iso,dow)=>{ let n=(dow-new Date(iso+'T00:00:00').getDay()+7)%7; if(n===0) n=7; return isoAdd(iso,n); };
const byFirst=n=>USERS.find(u=>u.name.split(' ')[0].toLowerCase()===String(n).trim().toLowerCase());
function parseDue(t,md){
  const s=t.toLowerCase(); let due='';
  const iso=s.match(/\b(\d{4}-\d{2}-\d{2})\b/), w=s.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if(iso) due=iso[1]; else if(/\btomorrow\b/.test(s)) due=isoAdd(md,1); else if(/\btoday\b/.test(s)) due=md;
  else if(/\bnext week\b/.test(s)) due=isoAdd(md,7); else if(/\bend of (the )?week\b/.test(s)) due=nextDow(md,5); else if(w) due=nextDow(md,WD[w[1]]);
  let time=''; const a=s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/), b=s.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if(a){ let h=+a[1]%12; if(a[3]==='pm') h+=12; time=String(h).padStart(2,'0')+':'+(a[2]||'00'); } else if(b) time=b[1].padStart(2,'0')+':'+b[2];
  return {due, time: due?time:''};
}
function parseLines(text){
  return text.split(/\r?\n/).map(l=>l.replace(/^\s*[\[(]?\d{1,2}:\d{2}(:\d{2})?[\])]?\s*/,'').trim()).filter(Boolean).map(l=>{
    const m=l.match(/^([A-Za-z][A-Za-z .'-]{0,28}?)\s*[:\u2013-]\s+(.+)$/);
    return m && !/^(decision|open question|action|note|agenda)$/i.test(m[1].trim()) ? [m[1].trim(),m[2].trim()] : ['',l]; });
}
function ruleExtract(lines,md){
  const out={items:[],decisions:[],open:[],rejected:0};
  lines.forEach(([sp,tx],n)=>{
    const s=tx.toLowerCase();
    if(/^decision\s*[:\-]|\b(we (have )?(decided|agreed)|it was decided)\b/.test(s)) out.decisions.push(tx.replace(/^decision\s*[:\-]\s*/i,''));
    if(/open question|unresolved|not sure who|who owns|who will/.test(s)) out.open.push(tx);
    if(tx.trim().endsWith('?')) return;
    let owner='',conf='',task=tx;
    const addr=tx.match(/^([A-Z][a-z]+),?\s+(please|you will|you'll|can you|could you|you need to|you should)\b\s*(will\s+|to\s+)?/);
    if(addr){ const u=byFirst(addr[1]); owner=u?u.email:''; conf=u?'explicit':'ambiguous'; task=tx.slice(addr[0].length); }
    else if(/\b(i will|i'll|i am going to|i can take)\b/.test(s)){ const u=byFirst(sp.split(' ')[0]); owner=u?u.email:''; conf=u?'explicit':'ambiguous'; task=tx.replace(/^.*?\b(i will|i'll|i am going to|i can take)\s+/i,''); }
    else if(/\b(someone|somebody|we should|we need to|we will|we'll|let's)\b/.test(s)){ conf='ambiguous'; }
    else return;
    task=task.replace(/[.!]+$/,''); task=task.charAt(0).toUpperCase()+task.slice(1);
    const d=parseDue(tx,md);
    out.items.push({task:task.slice(0,90),owner,conf,due:d.due,time:d.time,quote:tx,line:n+1});
  });
  return out;
}
async function backendExtract(lines,md,mid){
  const r=await fetch(BACKEND_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({meeting_id:mid,date:md,lines:lines.map((l,i)=>({n:i+1,speaker:l[0],text:l[1]}))})});
  if(!r.ok) throw new Error('Backend returned '+r.status);
  const d=await r.json(), out={items:[],decisions:d.decisions||[],open:d.open||[],rejected:0};
  (d.items||[]).forEach(it=>{ const L=lines[(it.line||0)-1];
    if(L && it.quote && L[1].includes(it.quote)) out.items.push({task:it.task,owner:it.owner_email||'',conf:it.conf||(it.owner_email?'explicit':'ambiguous'),due:it.due||'',time:it.time||'',quote:it.quote,line:it.line});
    else out.rejected++; }); // quote not found in the transcript = rejected, never shown
  return out;
}
async function readFile(f){
  const n=f.name.toLowerCase();
  if(n.endsWith('.txt')) return await f.text();
  if(n.endsWith('.docx')){ if(typeof mammoth==='undefined') throw new Error('The Word reader did not load. Check your internet connection and reload.');
    return (await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value; }
  if(n.endsWith('.pdf')){ if(typeof pdfjsLib==='undefined') throw new Error('The PDF reader did not load. Check your internet connection and reload.');
    pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise; let out='';
    for(let p=1;p<=pdf.numPages;p++){ const c=await (await pdf.getPage(p)).getTextContent(); let y=null;
      c.items.forEach(it=>{ const yy=Math.round(it.transform[5]); if(y!==null&&Math.abs(yy-y)>2) out+='\n'; out+=it.str; if(it.hasEOL) out+='\n'; y=yy; }); out+='\n'; }
    return out; }
  throw new Error('Unsupported file type. Upload a PDF, a Word (.docx) or a .txt file.');
}
async function ingest(title,md,file){
  const lines=parseLines(await readFile(file));
  if(!lines.length) throw new Error('No text found in this file. Scanned PDFs need OCR first.');
  const mid='U'+Date.now().toString(36); let res,used='built-in rules';
  if(BACKEND_URL){ try{ res=await backendExtract(lines,md,mid); used='the backend LLM'; }catch(e){ console.error(e); } }
  if(!res) res=ruleExtract(lines,md);
  P.rej+=res.rejected||0;
  const words=t=>new Set(t.toLowerCase().split(/\W+/).filter(x=>x.length>3));
  let added=0,carried=0;
  res.items.forEach((it,k)=>{
    const A=words(it.task);
    const m=ITEMS.find(x=>{ if(x.ms.includes(mid)) return false; const o=owner(x); if(o&&it.owner&&o!==it.owner) return false;
      const B=words(x.task), c=[...A].filter(w=>B.has(w)).length; return Math.min(A.size,B.size)>0 && c/Math.min(A.size,B.size)>=0.6; });
    if(m){ m.ms=[...m.ms,mid]; m.ev=[...m.ev,[mid,it.line]]; P.patch[m.id]={ms:m.ms,ev:m.ev}; carried++; }
    else { const n={id:'U'+Date.now().toString(36)+k,task:it.task,owner:it.owner,conf:it.conf,ms:[mid],due:it.due,time:it.time,ev:[[mid,it.line]],q:it.quote,base:'active'}; ITEMS.push(n); P.up.i.push(n); added++; }
  });
  const mt={id:mid,title,date:md,attendees:USERS.map(u=>u.email),
    summary:`Uploaded transcript with ${lines.length} lines. Found ${res.items.length} action items, ${res.decisions.length} decisions and ${res.open.length} unresolved issues using ${used}.`,
    decisions:res.decisions,open:res.open,lines}; MEETINGS.push(mt); P.up.m.push(mt);
  const unowned=res.items.filter(i=>!i.owner).length;
  return `<b>${esc(title)}</b> was added using ${used}.<br>${added} new action items, ${carried} matched an earlier item and are now marked carried over${res.rejected?`, ${res.rejected} rejected because the quote was not in the transcript`:''}.${unowned?`<br>${unowned} have no clear owner. Assign them in the Active tab.`:''}<br>`;
}
function uploadView(){
  return `<div class="card up"><h2>Upload a meeting transcript</h2><p class="mute">Accepted files: PDF, Word (.docx) or .txt. Put one speaker turn per line, for example <code>Ravi: I will finish the report by Friday.</code></p>
  <label class="fl" for="ut">Meeting title</label><input id="ut" type="text" placeholder="Weekly Sync">
  <label class="fl" for="ud">Meeting date</label><input id="ud" type="date" value="${day(0)}">
  <label class="fl" for="uf">Transcript file</label><input id="uf" type="file" accept=".pdf,.docx,.txt">
  <p><button class="btn pri" id="ub">Extract action items</button></p><div id="um" class="mute"></div>
  <p class="mute">Extraction method: ${BACKEND_URL?'backend LLM (falls back to built-in rules if it is unreachable)':'built-in rules. Set BACKEND_URL in the script to use an LLM.'}</p></div>`;
}

/* ---------- Render + events ---------- */
function render(){
  const a=document.getElementById('app');
  document.body.className = S.user ? '' : 'lo';
  a.innerHTML = S.user ? dash() : loginView();
  if(!S.user){
    document.getElementById('lf').onsubmit=e=>{ e.preventDefault();
      const u=USERS.find(x=>x.email===document.getElementById('em').value.trim().toLowerCase() && x.pw===document.getElementById('pw').value);
      if(!u){ document.getElementById('er').textContent='Email or password is incorrect. Check both and try again.'; return; }
      S.user=u; S.tab='active'; S.who='all'; S.q=''; try{sessionStorage.setItem('mat_u',u.email);}catch(e){} runReminders(); render(); };
    return;
  }
  document.getElementById('lo').onclick=()=>{ S.user=null; try{sessionStorage.removeItem('mat_u');}catch(e){} render(); };
  a.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ S.tab=b.dataset.tab; render(); });
  const goHome=()=>{ S.tab='active'; S.who='all'; S.q=''; render(); window.scrollTo(0,0); };
  const hm=document.getElementById('home'); hm.onclick=goHome; hm.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); goHome(); } };
  const w=document.getElementById('who'); if(w) w.onchange=()=>{ S.who=w.value; render(); };
  const us=document.getElementById('usearch'); if(us){ us.oninput=()=>{ S.q=us.value; render(); us.focus(); us.setSelectionRange(us.value.length,us.value.length); }; }
  a.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{ P.status[b.dataset.done]='done'; save(); render(); });
  a.querySelectorAll('[data-assign]').forEach(s=>s.onchange=()=>{ if(s.value){ P.owner[s.dataset.assign]=s.value; save(); runReminders(); render(); } });
  a.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>{ const i=ITEMS.find(x=>x.id===b.dataset.ev); const ms=[...new Set(i.ev.map(e=>e[0]))];
    modal(`<h2>${esc(i.task)}</h2><p class="mute">Highlighted lines are the source of this item.</p>${ms.map(m=>transcript(m,i.ev.filter(e=>e[0]===m).map(e=>e[1]))).join('<hr>')}`); });
  a.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>modal(transcript(b.dataset.tr,[])));
  const ub=document.getElementById('ub');
  if(ub) ub.onclick=async()=>{
    const f=document.getElementById('uf').files[0], out=document.getElementById('um');
    const title=document.getElementById('ut').value.trim(), md=document.getElementById('ud').value;
    if(!title||!md||!f){ out.className='err'; out.textContent='Enter a meeting title, pick the meeting date, and choose a file.'; return; }
    ub.disabled=true; out.className='mute'; out.textContent='Reading the file and extracting action items...';
    try{ const r=await ingest(title,md,f); save(); runReminders(); out.className=''; out.innerHTML=r+' <button class="btn sm pri" id="go">View active items</button>';
      document.getElementById('go').onclick=()=>{ S.tab='active'; render(); }; }
    catch(e){ out.className='err'; out.textContent=e.message||'Upload failed.'; }
    ub.disabled=false; };
}
render();
if(S.user) runReminders();
