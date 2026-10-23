const fs=require('fs'); const path=require('path'); const sharp=require('sharp')
const dir='content-audits/2026-10-06/assets';fs.mkdirSync(dir,{recursive:true})
const selections={
 vianney:'File:Johnvianney.jpg',lourdes:'File:Statue of Our Lady of Lourdes.jpg',
 rosario:'File:(Castres) La Vierge au chapelet - Murillo - Musée Goya.jpg',jose:'File:Guido Reni - Saint Joseph and the Christ Child - Google Art Project.jpg',
 guadalupe:'File:Virgen de Guadalupe 1531.jpg',ana:'File:Leonardo da Vinci - Virgin and Child with St Anne C2RMF retouched.jpg',
 auxiliadora:'File:Procesion de Maria Auxiliadora - 2025 - Madrid 20.jpg',
 transito:'File:The Dormition of the Virgin - MET DP-18895-001.jpg',carlos:'File:Carlo Borromeo.jpg',
 juanpablo:'File:Pope John Paul II portrait.jpg',romero:'File:Óscar Romero, 1979 (headshot).jpg',
 sagrado:'File:Batoni sacred heart.jpg',joaquin:'File:San Joaquín - Pedro Ruiz González.jpg',
 fatima:'File:2026-07-19 Statue of Our Lady of Fátima in Bombarral.jpg',
}
const clean=s=>(s||'').replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim()
async function main(){
 const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',titles:Object.values(selections).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'700'})
 const r=await fetch(u,{headers:{'User-Agent':'ParishContentReview/1.0 (content research)'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`Commons metadata ${r.status}`)
 const data=await r.json();const pages=Object.values(data.query?.pages||{});const manifest={}
 for(const [key,title] of Object.entries(selections)){
  const p=pages.find(p=>p.title===title); const i=p?.imageinfo?.[0];if(!i){console.log('MISSING',key);continue}
  const license=clean(i.extmetadata?.LicenseShortName?.value);if(!/Public domain|CC0|CC BY|PDM/.test(license)){console.log('SKIP LICENSE',key,license);continue}
  manifest[key]={title,url:i.thumburl||i.url,source:i.descriptionurl,license,licenseUrl:i.extmetadata?.LicenseUrl?.value,author:clean(i.extmetadata?.Artist?.value),description:clean(i.extmetadata?.ImageDescription?.value),file:path.resolve(dir,`${key}.jpg`)}
 }
 fs.writeFileSync('content-audits/2026-10-06/patron-images.json',JSON.stringify(manifest,null,2))
 for(const [key,m] of Object.entries(manifest)){
  const r=await fetch(m.url,{headers:{'User-Agent':'ParishContentReview/1.0'},signal:AbortSignal.timeout(30000)});if(!r.ok){console.log('DOWNLOAD FAILED',key,r.status);continue}
  await sharp(Buffer.from(await r.arrayBuffer())).jpeg({quality:88}).toFile(m.file);console.log('IMAGE',key,m.license,m.description.slice(0,180))
 }
 const snapshot=JSON.parse(fs.readFileSync('content-audits/2026-10-06/snapshot.json','utf8')); const media=new Map()
 for(const x of [...snapshot.sectors,...snapshot.groups])for(const m of [x.logo,x.cover,x.groupPhoto,...(x.gallery||[])].filter(Boolean))if(/WhatsApp|Captura de pantalla|\.(jpg|jpeg|png)$/i.test(m.alt||'')||['jumi','escuela de predicadores'].includes(m.alt))media.set(m.id,m)
 for(const [id,m] of media){const r=await fetch(m.url,{signal:AbortSignal.timeout(30000)});if(r.ok)await sharp(Buffer.from(await r.arrayBuffer())).jpeg().toFile(path.join(dir,`media-${id}.jpg`))}
 const files=fs.readdirSync(dir).filter(f=>f.endsWith('.jpg'));const tiles=[]
 for(let n=0;n<files.length;n++){const thumb=await sharp(path.join(dir,files[n])).resize(160,170,{fit:'contain',background:'#fff'}).extend({bottom:25,background:'#fff'}).composite([{input:Buffer.from(`<svg width="160" height="25"><text x="5" y="18" font-size="13">${files[n]}</text></svg>`),top:170,left:0}]).toBuffer();tiles.push({input:thumb,left:(n%6)*160,top:Math.floor(n/6)*195})}
 await sharp({create:{width:960,height:Math.ceil(files.length/6)*195,channels:3,background:'#ddd'}}).composite(tiles).jpeg().toFile(path.join(dir,'review-sheet.jpg'))
}
main().catch(e=>{console.error(e);process.exit(1)})
