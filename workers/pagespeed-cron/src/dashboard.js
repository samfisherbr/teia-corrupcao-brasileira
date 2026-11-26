/**
 * Página única servida em GET /. Não traz dado nenhum: o histórico vem de
 * GET /history, com o token que a pessoa digita (guardado só no navegador dela).
 * Todo texto vindo do banco entra na página por textContent, nunca por innerHTML.
 */
export const DASHBOARD_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>PageSpeed · Teia da Corrupção</title>
<style>
:root{--bg:#fff;--fg:#1a1a1a;--muted:#6b6b6b;--line:#e3e3e3;--card:#f7f7f8;--c1:#1f6feb;--c2:#2da44e;--c3:#d4a72c;--c4:#cf222e;--good:#2da44e;--warn:#d4a72c;--bad:#cf222e}
@media (prefers-color-scheme:dark){:root{--bg:#0f1115;--fg:#e8e8e8;--muted:#9a9a9a;--line:#2a2d34;--card:#171a20;--c1:#58a6ff;--c2:#3fb950;--c3:#e3b341;--c4:#ff7b72}}
*{box-sizing:border-box}body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif}
main{max-width:980px;margin:0 auto}h1{font-size:1.25rem;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 16px}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
input,button{font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg)}
button{cursor:pointer}button[aria-pressed=true]{background:var(--c1);color:#fff;border-color:var(--c1)}
#token{flex:1;min-width:200px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px}
.tile b{display:block;font-size:1.6rem}.tile span{color:var(--muted);font-size:.85rem}.tile small{color:var(--muted)}
section{margin-bottom:22px}h2{font-size:1rem;margin:0 0 6px}
svg{width:100%;height:auto;display:block;background:var(--card);border:1px solid var(--line);border-radius:8px}
.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:.85rem;color:var(--muted);margin-top:6px}
.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px}
table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{text-align:right;padding:6px 8px;border-bottom:1px solid var(--line)}th:first-child,td:first-child,th:last-child,td:last-child{text-align:left}
.wrap{overflow-x:auto}#msg{color:var(--bad);min-height:1.4em}
</style>
</head>
<body><main>
<h1>PageSpeed · Teia da Corrupção</h1>
<p class="sub" id="sub">Histórico diário (Google PageSpeed Insights, rodando no Cloudflare)</p>
<div class="bar">
  <input id="token" type="password" placeholder="Token de acesso (API_TOKEN)" autocomplete="off" aria-label="Token de acesso">
  <button id="load">Carregar</button>
  <button data-s="mobile" aria-pressed="true">Mobile</button>
  <button data-s="desktop" aria-pressed="false">Desktop</button>
</div>
<div id="msg" role="status"></div>
<div class="tiles" id="tiles"></div>
<section><h2>Notas (0–100)</h2><div id="scores"></div></section>
<section><h2>Tempo de carregamento do maior elemento (LCP, ms)</h2><div id="lcp"></div></section>
<section><h2>Bloqueio de thread (TBT, ms)</h2><div id="tbt"></div></section>
<section><h2>Últimas execuções</h2><div class="wrap"><table id="table"></table></div></section>
</main>
<script>
(function(){
var NS='http://www.w3.org/2000/svg',strategy='mobile',rows=[];
var $=function(id){return document.getElementById(id)};
var store={get:function(){try{return localStorage.getItem('psi_token')||''}catch(e){return ''}},set:function(v){try{localStorage.setItem('psi_token',v)}catch(e){}}};
$('token').value=store.get();
function el(n,a,t){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(t!=null)e.textContent=t;return e}
function fmt(v,d){return v==null?'—':Number(v).toFixed(d||0)}
function line(target,series,opts){
  target.textContent='';
  var W=720,H=240,L=44,R=12,T=12,B=26,pts=rows.length;
  if(pts<1){target.textContent='Sem dados.';return}
  var all=[];series.forEach(function(s){rows.forEach(function(r){if(r[s.key]!=null)all.push(r[s.key])})});
  var lo=opts.min!=null?opts.min:Math.min.apply(null,all),hi=opts.max!=null?opts.max:Math.max.apply(null,all);
  if(hi===lo){hi=lo+1}
  var svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':opts.label});
  for(var g=0;g<=4;g++){var y=T+(H-T-B)*g/4,v=hi-(hi-lo)*g/4;
    svg.appendChild(el('line',{x1:L,x2:W-R,y1:y,y2:y,stroke:'var(--line)'}));
    svg.appendChild(el('text',{x:L-6,y:y+4,'text-anchor':'end','font-size':11,fill:'var(--muted)'},fmt(v)));}
  var X=function(i){return pts===1?(L+W-R)/2:L+(W-L-R)*i/(pts-1)},Y=function(v){return T+(H-T-B)*(1-(v-lo)/(hi-lo))};
  [0,pts-1].forEach(function(i){if(rows[i])svg.appendChild(el('text',{x:X(i),y:H-8,'text-anchor':i?'end':'start','font-size':11,fill:'var(--muted)'},rows[i].analyzed_at.slice(0,10)))});
  series.forEach(function(s){var d='',pen=false;
    rows.forEach(function(r,i){if(r[s.key]==null){pen=false;return}d+=(pen?'L':'M')+X(i)+' '+Y(r[s.key])+' ';pen=true;});
    svg.appendChild(el('path',{d:d,fill:'none',stroke:s.color,'stroke-width':2}));
    rows.forEach(function(r,i){if(r[s.key]!=null){var c=el('circle',{cx:X(i),cy:Y(r[s.key]),r:3,fill:s.color});c.appendChild(el('title',{},s.label+' · '+r.analyzed_at.slice(0,10)+': '+fmt(r[s.key],s.d)));svg.appendChild(c)}});});
  target.appendChild(svg);
  var lg=document.createElement('div');lg.className='legend';
  series.forEach(function(s){var sp=document.createElement('span'),i=document.createElement('i');i.style.background=s.color;sp.appendChild(i);sp.appendChild(document.createTextNode(s.label));lg.appendChild(sp)});
  target.appendChild(lg);
}
function render(){
  var last=rows[rows.length-1],prev=rows[rows.length-2],t=$('tiles');t.textContent='';
  if(!last){$('msg').textContent='Nenhuma execução salva para '+strategy+'.';}
  [['performance','Desempenho'],['accessibility','Acessibilidade'],['best_practices','Boas práticas'],['seo','SEO']].forEach(function(m){
    var d=document.createElement('div');d.className='tile';var b=document.createElement('b'),s=document.createElement('span'),sm=document.createElement('small');
    b.textContent=last?fmt(last[m[0]]):'—';s.textContent=m[1];
    if(last&&prev&&last[m[0]]!=null&&prev[m[0]]!=null){var dl=last[m[0]]-prev[m[0]];sm.textContent=' '+(dl>0?'+':'')+dl+' vs. anterior'}
    if(last&&last[m[0]]!=null)b.style.color=last[m[0]]>=90?'var(--good)':last[m[0]]>=50?'var(--warn)':'var(--bad)';
    d.appendChild(b);d.appendChild(s);d.appendChild(sm);t.appendChild(d)});
  line($('scores'),[{key:'performance',label:'Desempenho',color:'var(--c1)'},{key:'accessibility',label:'Acessibilidade',color:'var(--c2)'},{key:'best_practices',label:'Boas práticas',color:'var(--c3)'},{key:'seo',label:'SEO',color:'var(--c4)'}],{min:0,max:100,label:'Notas ao longo do tempo'});
  line($('lcp'),[{key:'lab_lcp_ms',label:'LCP (laboratório)',color:'var(--c1)'},{key:'field_lcp_ms',label:'LCP (usuários reais)',color:'var(--c2)'}],{min:0,label:'LCP'});
  line($('tbt'),[{key:'lab_tbt_ms',label:'TBT',color:'var(--c3)'}],{min:0,label:'TBT'});
  var tb=$('table');tb.textContent='';
  var hd=document.createElement('tr');['Data','Desemp.','Acess.','Prát.','SEO','LCP ms','CLS','TBT ms','Origem'].forEach(function(h){var th=document.createElement('th');th.textContent=h;hd.appendChild(th)});tb.appendChild(hd);
  rows.slice(-15).reverse().forEach(function(r){var tr=document.createElement('tr');
    [r.analyzed_at.replace('T',' ').slice(0,16),fmt(r.performance),fmt(r.accessibility),fmt(r.best_practices),fmt(r.seo),fmt(r.lab_lcp_ms),fmt(r.lab_cls,3),fmt(r.lab_tbt_ms),r.source+(r.note?' · '+r.note:'')].forEach(function(v){var td=document.createElement('td');td.textContent=v;tr.appendChild(td)});tb.appendChild(tr)});
}
function load(){
  var tok=$('token').value.trim();$('msg').textContent='';
  if(!tok){$('msg').textContent='Digite o token.';return}
  fetch('/history?limit=120&strategy='+strategy,{headers:{authorization:'Bearer '+tok}}).then(function(r){
    if(r.status===401){throw new Error('Token incorreto.')}
    if(!r.ok){throw new Error('Erro '+r.status)}
    return r.json()}).then(function(d){store.set(tok);rows=d.rows||[];render()}).catch(function(e){$('msg').textContent=e.message});
}
$('load').onclick=load;$('token').onkeydown=function(e){if(e.key==='Enter')load()};
document.querySelectorAll('button[data-s]').forEach(function(b){b.onclick=function(){strategy=b.dataset.s;document.querySelectorAll('button[data-s]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});if($('token').value.trim())load()}});
if($('token').value)load();
})();
</script>
</body></html>`;
