# Round-5 shots + checks. usage: python3 tools/shoot.py bc|tc   (needs tools/mkcopy.sh + http.server :8881 on /tmp/r5site)
import asyncio, json, sys, os
from playwright.async_api import async_playwright
APP=sys.argv[1]; ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")
BASE="http://127.0.0.1:8881/app/"+("table/index.html" if APP=="tc" else "index.html")
PH=[(320,568),(360,640),(375,667),(390,844),(430,932),(844,390),(932,430)]; PAD=[(820,1180),(1180,820),(1024,1366),(1366,1024)]
SCR=(sys.argv[2].split(",") if len(sys.argv)>2 else ["history","historyall","dice","rules","speed","quick","quickpv","drill","drillfb"])
IPAD=len(sys.argv)<=3 or sys.argv[3]!="noipad"
CHECK=r"""()=>{const R=document.querySelector('.r5.host');const roll=window.__r5&&window.__r5.roll;const out={};
const rr=roll&&roll.getBoundingClientRect();
const onScreen=e=>{const r=e.getBoundingClientRect();if(!r.width||r.right<=0||r.left>=innerWidth||r.bottom<=0||r.top>=innerHeight)return false;const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!h&&(e.contains(h)||h.contains(e)||!!h.closest('.r5-scrim'))};
out.rollOnPage=!!roll&&onScreen(roll);
const modal=!!R.querySelector('.r5-scrim');out.modal=modal;out.rotate=!!R.querySelector('.r5-rotate');
const els=[...R.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0});
// taps
out.smallTaps=[...R.querySelectorAll('button,[role=switch]')].filter(b=>{const r=b.getBoundingClientRect();if(!r.width)return false;const p=b.closest('.r5-sw');const h=p?p.getBoundingClientRect().height:r.height;return h<43.5||r.width<43.5}).map(b=>(b.className||b.tagName)+':'+Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height));
// truncation / overflow
out.trunc=els.filter(e=>{const cs=getComputedStyle(e);if(cs.textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+1)return true;if(['hidden','clip'].includes(cs.overflowX)&&e.scrollWidth>e.clientWidth+1&&!e.matches('.r5-sheet,.r5-body,.r5-timer'))return true;
  if(e.children.length===0&&e.textContent.trim()){const r=e.getBoundingClientRect();const sc=e.closest('.r5-body');const lim=sc?sc.getBoundingClientRect():{left:0,right:innerWidth};if(r.right>lim.right+1||r.left<lim.left-1)return true;}return false}).map(e=>e.className+':'+e.textContent.trim().slice(0,30));
// contrast
const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return [p[0],p[1],p[2],p.length>3?p[3]:1]};
const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
const bgOf=e=>{let stack=[];for(let n=e;n;n=n.parentElement){const cs=getComputedStyle(n);const gi=cs.backgroundImage;if(gi&&gi.startsWith('linear-gradient')){const cols=[...gi.matchAll(/rgba?\([^)]+\)/g)].map(m=>parse(m[0]));return {cols,stack}}const b=parse(cs.backgroundColor);if(b&&b[3]>0){if(b[3]>=.98)return {cols:[b],stack};stack.push(b)}}return {cols:[[4,6,10,1]],stack}};
const blend=(base,stack)=>{let c=base.slice(0,3);for(let i=stack.length-1;i>=0;i--){const s=stack[i];c=c.map((v,k)=>v*(1-s[3])+s[k]*s[3])}return c};
let worst=99,wtxt='';for(const e of els){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden')continue;let fg=parse(cs.color);const {cols,stack}=bgOf(e);
  for(const b of cols){const bg=blend(b,stack);let f=fg.slice(0,3);if(fg[3]<1)f=f.map((v,k)=>v*fg[3]+bg[k]*(1-fg[3]));let op=1;for(let n=e;n;n=n.parentElement)op*=+getComputedStyle(n).opacity;if(op<1)f=f.map((v,k)=>v*op+bg[k]*(1-op));const L1=lum(f),L2=lum(bg);const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);if(cr<worst){worst=cr;wtxt=e.textContent.trim().slice(0,30)+' '+cs.color}}}
out.minContrast=Math.round(worst*100)/100;out.minContrastAt=wtxt;
// mascots in view
out.mascots=[...document.querySelectorAll('img')].filter(i=>/mascots\//.test(i.src)&&!/\/hud\//.test(i.src)&&getComputedStyle(i).visibility!=='hidden'&&(()=>{const r=i.getBoundingClientRect();if(!r.width||r.right<=0||r.left>=innerWidth||r.bottom<=0||r.top>=innerHeight)return false;const h=document.elementFromPoint(Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),Math.min(innerHeight-1,Math.max(0,r.top+r.height/2)));return h===i})()).map(i=>i.src.split('/').pop());
// non-modal: never on ROLL/SHOOT
if(!modal&&rr){out.rollHit=[...R.querySelectorAll('.r5-dice,.r5-quick,.r5-pop,.r5-fastpill')].filter(e=>{const r=e.getBoundingClientRect();return !(r.right<=rr.left||r.left>=rr.right||r.bottom<=rr.top||r.top>=rr.bottom)}).map(e=>e.className);
  const h=document.elementFromPoint(rr.left+rr.width/2,rr.top+rr.height/2);out.rollLive=!!h&&!!h.closest(roll.matches('.tc-shoot')?'.tc-shoot':"[data-act='roll']");
  out.inView=[...R.querySelectorAll('.r5-dice,.r5-quick,.r5-pop')].every(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})}
return out}"""
SEED_BC="""async()=>{const E=await import('/app/js/engine.mjs');const g=E.createGame();g.phase='point';g.point=6;g.bets.pass=500;
localStorage.setItem('bb-bubble-craps-v1',JSON.stringify({settings:{sound:false,autoRoll:false,tutorOn:false,reduced:false,badgeToasts:false,seenBlaze:{warm:true,hot:true,blazing:true},chip:500},game:g,allRolls:[]}))}"""
SEED_TC="""async()=>{const E=await import('/app/js/engine.mjs');const R=await import('/app/js/rail.mjs');const g=E.createGame({profile:'table'});g.phase='point';g.point=6;g.bets.pass=1000;g.bankroll=99000;
localStorage.setItem('bb-table-craps-v1',JSON.stringify({game:g,rail:R.railBreakdown(99000),settings:{chip:500,tutor:false},rebuilt:0}))}"""
async def seed(b):
  pg=await b.new_page();await pg.goto(BASE);await pg.evaluate("localStorage.clear()");await pg.evaluate(SEED_TC if APP=="tc" else SEED_BC);await pg.close()
async def one(b,w,h,s,res):
  pg=await b.new_page();await pg.set_viewport_size({"width":w,"height":h});errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:120]))
  await pg.goto(BASE+"?r5="+s,wait_until="networkidle");await pg.wait_for_function("window.__r5&&window.__r5.ready",timeout=15000);await pg.wait_for_timeout(500)
  d=os.path.join(ROOT,"shots",APP,s);os.makedirs(d,exist_ok=True);await pg.screenshot(path=f"{d}/{s}-{w}x{h}.png")
  c=await pg.evaluate(CHECK);c.update(app=APP,s=s,size=f"{w}x{h}",errs=errs);res.append(c);print(json.dumps(c),flush=True);await pg.close()
async def main():
  res=[]
  async with async_playwright() as p:
    br=await p.chromium.launch();b=await br.new_context();await seed(b)
    for s in SCR:
      for w,h in PH+PAD:
        try: await one(b,w,h,s,res)
        except Exception as e: print(json.dumps({"app":APP,"s":s,"size":f"{w}x{h}","fail":str(e)[:200]}),flush=True)
    for w,h in (PAD if IPAD else []):
      pg=await b.new_page();await pg.set_viewport_size({"width":w,"height":h});await pg.goto(f"http://127.0.0.1:8881/round5/proto/ipad.html?app={APP}",wait_until="networkidle");await pg.wait_for_timeout(4500)
      d=os.path.join(ROOT,"shots",APP,"ipad");os.makedirs(d,exist_ok=True);await pg.screenshot(path=f"{d}/ipad-{w}x{h}.png")
      info=await pg.evaluate("""()=>[...document.querySelectorAll('iframe')].map(f=>{const d=f.contentDocument;const r=f.getBoundingClientRect();const ro=d.querySelector("[data-act='roll'],.tc-shoot");const rr=ro&&ro.getBoundingClientRect();
        return {col:f.title,w:Math.round(r.width),h:Math.round(r.height),roll:!!rr&&rr.width>0&&rr.bottom<=r.height&&rr.right<=r.width&&rr.left>=0,small:[...d.querySelectorAll('button')].filter(x=>{const q=x.getBoundingClientRect();return q.width>0&&q.right>0&&q.left<r.width&&(q.width<44||q.height<44)}).length}})""")
      print(json.dumps({"app":APP,"s":"ipad","size":f"{w}x{h}","cols":info}),flush=True);res.append({"app":APP,"s":"ipad","size":f"{w}x{h}","cols":info});await pg.close()
    await br.close()
  json.dump(res,open(os.path.join(ROOT,"shots",f"verify-{APP}{'-delta' if not IPAD else ''}.json"),"w"),indent=1)
asyncio.run(main())
