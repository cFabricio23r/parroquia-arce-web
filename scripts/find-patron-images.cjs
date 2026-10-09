const fs = require('fs')
const queries = {
  vianney: 'John Vianney portrait', lourdes: 'Our Lady of Lourdes statue', rosario: 'Our Lady of the Rosary painting',
  jose: 'Saint Joseph child Jesus painting', antonio: 'Saint Anthony of Padua painting', guadalupe: 'Our Lady of Guadalupe original',
  ana: 'Saint Anne Virgin Mary painting', auxiliadora: 'Mary Help of Christians painting', esteban: 'Saint Stephen martyr painting',
  transito: 'Dormition Virgin Mary painting', carlos: 'Saint Charles Borromeo portrait', joaquin: 'Saint Joachim painting',
  juanpablo: 'John Paul II portrait', romero: 'Oscar Romero portrait', sagrado: 'Sacred Heart Jesus painting',
}
async function main() {
 const results = {}
 for (const [key, query] of Object.entries(queries)) {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.search = new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'4',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'700'})
  const r=await fetch(url,{headers:{'User-Agent':'ParishContentReview/1.0'},signal:AbortSignal.timeout(30000)})
  if(!r.ok) throw new Error(`${r.status} ${key}`)
  const data=await r.json();results[key]=Object.values(data.query?.pages||{}).map(p=>({title:p.title,...p.imageinfo?.[0]}))
  console.log(key,results[key].map(p=>`${p.title} [${p.extmetadata?.LicenseShortName?.value}]`).join('\n'))
 }
 fs.writeFileSync('content-audits/2026-10-06/image-candidates.json',JSON.stringify(results,null,2))
}
main().catch(e=>{console.error(e);process.exit(1)})
