// Shared browser/test semantics: selected apps form a union; other filters intersect.
export function readApps(params, valid) {
  return new Set(params.getAll('app').flatMap(value=>value.split(',')).filter(value=>valid.includes(value)));
}
export function matchesRecord(row, selected, filters) {
  return (!selected.size||selected.has(row.app))&&Object.entries(filters).every(([key,value])=>value==='all'||row[key]===value);
}
export function writeQuery(selected, order, filters) {
  const params=new URLSearchParams();
  for(const app of order)if(selected.has(app))params.append('app',app);
  for(const [key,value] of Object.entries(filters))if(value!=='all')params.set(key,value);
  return params.toString();
}
