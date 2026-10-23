import {readApps,matchesRecord,writeQuery} from './archive-filters.mjs';
const root=document.querySelector('[data-archive]');
if(root){
 const form=root.querySelector('form');
 const keys=['year','platform','kind'];
 const controls=Object.fromEntries(keys.map(k=>[k,form.elements.namedItem(k)]));
 const buttons=[...root.querySelectorAll('[data-app-toggle]')];
 const order=buttons.map(b=>b.dataset.appToggle);
 const events=[...root.querySelectorAll('[data-event]')];
 let selected=new Set();
 const filters=()=>Object.fromEntries(keys.map(key=>[key,controls[key].value]));
 function render(){
  const params=new URLSearchParams(location.search);
  selected=readApps(params,order);
  for(const key of keys){const value=params.get(key)||'all';controls[key].value=[...controls[key].options].some(o=>o.value===value)?value:'all';}
  let count=0;
  for(const row of events){row.hidden=!matchesRecord(row.dataset,selected,filters());if(!row.hidden)count++;}
  for(const group of root.querySelectorAll('[data-year-group]'))group.hidden=![...group.querySelectorAll('[data-event]')].some(e=>!e.hidden);
  root.querySelector('[data-empty]').hidden=count!==0;
  root.querySelector('[data-result-count]').textContent=`${count} ${root.dataset.countLabel}`;
  for(const button of buttons)button.setAttribute('aria-pressed',String(selected.has(button.dataset.appToggle)));
  root.querySelector('[data-selection-status]').textContent=selected.size?buttons.filter(b=>selected.has(b.dataset.appToggle)).map(b=>b.querySelector('span').textContent.trim()).join(' · '):root.dataset.allLabel;
  root.querySelector('[data-clear-apps]').disabled=!selected.size;
  for(const panel of root.querySelectorAll('[data-app-summary]'))panel.hidden=selected.size!==1||!selected.has(panel.dataset.appSummary);
  for(const panel of root.querySelectorAll('[data-media-app]'))panel.hidden=selected.size?!selected.has(panel.dataset.mediaApp):panel.dataset.featured!=='true';
  root.querySelector('.archive-exhibits').hidden=![...root.querySelectorAll('[data-media-app]')].some(p=>!p.hidden);
  root.querySelector('.archive-layout').classList.toggle('archive-layout--single',root.querySelector('.archive-exhibits').hidden);
  for(const link of document.querySelectorAll('.lang-pill a')){const url=new URL(link.href);url.search=location.search;link.href=url.href;}
 }
 function update(){const url=new URL(location.href);url.search=writeQuery(selected,order,filters());if(url.href!==location.href)history.pushState(null,'',url);render();}
 form.addEventListener('submit',e=>{e.preventDefault();update();});
 form.addEventListener('input',update);
 form.addEventListener('change',update);
 form.addEventListener('reset',e=>{e.preventDefault();selected.clear();for(const key of keys)controls[key].value='all';update();});
 for(const button of buttons)button.addEventListener('click',()=>{const app=button.dataset.appToggle;selected.has(app)?selected.delete(app):selected.add(app);update();});
 root.querySelector('[data-clear-apps]').addEventListener('click',()=>{selected.clear();update();});
 // Timeline links remain single-app deep links; modified clicks keep native behavior.
 root.addEventListener('click',e=>{const link=e.target.closest('[data-archive-app]');if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();selected=new Set([link.dataset.archiveApp]);update();});
 window.addEventListener('popstate',render);render();
}
