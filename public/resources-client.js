(() => {
 const root=document.querySelector('[data-resource-library]');if(!root)return;
 const form=root.querySelector('form'), fields=['category','language','format'];
 const apply=(push=false)=>{
  const q=new URLSearchParams(location.search);
  for(const key of fields){const value=form.elements[key].value; value?q.set(key,value):q.delete(key);}
  let count=0;
  root.querySelectorAll('[data-resource]').forEach(card=>{
   let visible=0,preview='';
   card.querySelectorAll('[data-variant]').forEach(v=>{
    v.hidden=!!((form.elements.language.value&&v.dataset.language!==form.elements.language.value)||(form.elements.format.value&&v.dataset.format!==form.elements.format.value));
    if(!v.hidden){visible++;preview ||= v.dataset.previewSrc;}
   });
   card.hidden=!visible||!!(form.elements.category.value&&card.dataset.category!==form.elements.category.value);
   if(!card.hidden){count++;card.querySelector('[data-preview]').src=preview;}
  });
  root.querySelector('[data-resource-count]').textContent=`${count} ${root.dataset.countLabel}`;
  root.querySelector('[data-resource-empty]').hidden=count!==0;
  const search=q.toString();if(push)history.pushState(null,'',location.pathname+(search?'?'+search:'')+location.hash);
  document.querySelectorAll('.lang-pill a').forEach(a=>{const u=new URL(a.href);u.search=search;a.href=u.href;});
 };
 const restore=()=>{const q=new URLSearchParams(location.search);for(const key of fields){const select=form.elements[key];select.value=q.get(key)||'';if(select.selectedIndex<0)select.value='';}apply();};
 form.addEventListener('change',()=>apply(true));form.addEventListener('reset',()=>{for(const key of fields)form.elements[key].value='';apply(true);});window.addEventListener('popstate',restore);restore();
})();
