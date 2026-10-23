const root=document.querySelector('[data-archive]');
if(root){
 const form=root.querySelector('form');
 const keys=['app','year','platform','kind'];
 const controls=Object.fromEntries(keys.map(k=>[k,form.elements.namedItem(k)]));
 const events=[...root.querySelectorAll('[data-event]')];
 function render(){
  const params=new URLSearchParams(location.search);
  for(const key of keys){const value=params.get(key)||'all';controls[key].value=[...controls[key].options].some(o=>o.value===value)?value:'all';}
  let count=0;
  for(const row of events){row.hidden=!keys.every(key=>controls[key].value==='all'||row.dataset[key]===controls[key].value);if(!row.hidden)count++;}
  for(const group of root.querySelectorAll('[data-year-group]'))group.hidden=![...group.querySelectorAll('[data-event]')].some(e=>!e.hidden);
  root.querySelector('[data-empty]').hidden=count!==0;
  root.querySelector('[data-result-count]').textContent=`${count} ${root.dataset.countLabel}`;
  for(const panel of root.querySelectorAll('[data-app-summary]'))panel.hidden=panel.dataset.appSummary!==controls.app.value;
  for(const panel of root.querySelectorAll('[data-media-app]'))panel.hidden=controls.app.value!=='all'&&panel.dataset.mediaApp!==controls.app.value;
  root.querySelector('.archive-exhibits').hidden=![...root.querySelectorAll('[data-media-app]')].some(p=>!p.hidden);
  root.querySelector('.archive-layout').classList.toggle('archive-layout--single',root.querySelector('.archive-exhibits').hidden);
  for(const link of root.querySelectorAll('[data-archive-app]')){if(link.dataset.archiveApp===controls.app.value)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}
  for(const link of document.querySelectorAll('.lang-pill a')){const url=new URL(link.href);url.search=location.search;link.href=url.href;}
 }
 function update(){const url=new URL(location.href);url.search='';for(const key of keys)if(controls[key].value!=='all')url.searchParams.set(key,controls[key].value);if(url.href!==location.href)history.pushState(null,'',url);render();}
 form.addEventListener('submit',e=>{e.preventDefault();update();});
 form.addEventListener('change',update);
 form.addEventListener('reset',e=>{e.preventDefault();for(const key of keys)controls[key].value='all';update();});
 root.addEventListener('click',e=>{const link=e.target.closest('[data-archive-app]');if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();for(const key of keys)controls[key].value=key==='app'?link.dataset.archiveApp:'all';update();form.elements.namedItem('app').focus({preventScroll:true});});
 window.addEventListener('popstate',render);render();
}
