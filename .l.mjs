import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport:{width:1280,height:800}, deviceScaleFactor:2 })).newPage();
const tryClick=async(by,arg)=>{ try{ const l = by==='role'? p.getByRole('button',{name:arg}) : p.locator(arg); if(await l.count()){ await l.first().click({timeout:900}); return true; } }catch{} return false; };
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' });
await p.waitForTimeout(900);
await tryClick('text','旅を始める'); // fallback below
await tryClick('role',/旅を始める/);
await p.waitForSelector('.board3d canvas',{timeout:15000});
let shot=false;
for(let i=0;i<200 && !shot;i++){
  if(await p.locator('.live-modal').count()){ await p.waitForTimeout(1200); await p.screenshot({path:'/tmp/shots/live-review.png'}); shot=true; break; }
  // generic advance: try every actionable button in priority order
  if(await tryClick('role',/つづき/)){ await p.waitForTimeout(250); continue; }
  if(await tryClick('role',/次へ/)){ await p.waitForTimeout(250); continue; }
  if(await tryClick('role',/続ける/)){ await p.waitForTimeout(250); continue; }
  if(await tryClick('css','.branch-choice')){ await p.waitForTimeout(600); continue; }
  if(await tryClick('css','.modal .choice')){ await p.waitForTimeout(400); continue; }
  if(await tryClick('role',/サイコロを振る/)){ await p.waitForTimeout(1250); continue; }
  await p.waitForTimeout(250);
}
console.log('done', shot);
await b.close();
