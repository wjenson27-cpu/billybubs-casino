import asyncio,json,sys,os
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np
from scipy import ndimage
B="http://127.0.0.1:8881";OUT="shots/throw";os.makedirs(OUT,exist_ok=True)
SEED="""async()=>{const E=await import('/app/js/engine.mjs');const R=await import('/app/js/rail.mjs');const g=E.createGame({profile:'table'});g.phase='point';g.point=6;g.bankroll=99000;
const b=g.bets;b.pass=1000;b.passOdds=2000;b.come=500;b.field=500;[4,5,8,9,10].forEach(n=>b.place[n]=500);b.comeBets={5:500};if(b.hardways)Object.keys(b.hardways).forEach(k=>b.hardways[k]=100);
localStorage.setItem('bb-table-craps-v1',JSON.stringify({game:g,rail:R.railBreakdown(99000),settings:{chip:500,tutor:false},rebuilt:0}))}"""
START="""async(o)=>{const T=await import('/round5/throw/throw.mjs');window.__T=T;await new Promise(r=>{const l=document.querySelector('link[data-tt]');if(l.sheet)r();else l.onload=r});window.__ev=[];addEventListener('bb:sfx',e=>__ev.push(e.detail.name));addEventListener('bb:haptic',e=>__ev.push('hap:'+e.detail.name));
const p=T.throwDice(Object.assign({hold:true,onSettle:(a,b)=>__ev.push('settle:'+a+'-'+b)},o));
const L=document.querySelector('.tt-layer');if(!L)return {none:true};const an=L.getAnimations({subtree:true});an.forEach(a=>a.pause());
window.__an=an;window.__end=Math.max(...an.map(a=>a.effect.getComputedTiming().endTime));return {end:__end,s:parseFloat(L.querySelector('.tt-die').style.getPropertyValue('--s'))}}"""
SEEK="(t)=>{__an.forEach(a=>a.currentTime=Math.min(t,a.effect.getComputedTiming().endTime));return 1}"
PROBE="""()=>{const L=document.querySelector('.tt-layer');L.style.pointerEvents='auto';L.querySelectorAll('*').forEach(e=>e.style.pointerEvents='auto');
const R=e=>e.getBoundingClientRect(),hit=(a,b)=>!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
const dice=[...L.querySelectorAll('.tt-die')].map(d=>{const r=R(d.querySelector('.c'));let rr=r;[...d.querySelectorAll('.f')].forEach(f=>{const q=R(f);rr={left:Math.min(rr.left,q.left),top:Math.min(rr.top,q.top),right:Math.max(rr.right,q.right),bottom:Math.max(rr.bottom,q.bottom)}});
 const cnt={},mask=[];const x0=Math.floor(rr.left),y0=Math.floor(rr.top),x1=Math.ceil(rr.right),y1=Math.ceil(rr.bottom);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const h=document.elementFromPoint(x+.5,y+.5);if(h&&d.contains(h)&&h.classList.contains('f')){const f=+[...h.classList].find(c=>/^f\\d$/.test(c)).slice(1);cnt[f]=(cnt[f]||0)+1;mask.push([x,y,f])}}
 return {top:+d.querySelector('.tc-cube').dataset.top,cnt,mask,rect:rr}});
const amts=[...document.querySelectorAll('#felt .amt, .tc-shooter .table .amt')].filter(e=>R(e).width);
const hidden=amts.filter(a=>{const r=R(a);const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return (h&&h!==L&&L.contains(h))||dice.some(d=>hit(d.rect,r))}).map(a=>{const r=R(a);const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return a.textContent+'@'+Math.round(r.left)+','+Math.round(r.top)+':'+(h?h.className:'')});
const av=['.tc-shoot','.tc-rail','.tc-dock'].map(s=>document.querySelector(s)).filter(Boolean).map(R);
L.style.pointerEvents='';L.querySelectorAll('*').forEach(e=>e.style.pointerEvents='');
return {dice:dice.map(d=>({top:d.top,cnt:d.cnt,mask:d.mask,rect:d.rect})),amts:amts.length,hidden,cover:dice.some(d=>av.some(a=>hit(d.rect,a))),ev:__ev}}"""
COVER="""()=>{const R=e=>e.getBoundingClientRect(),hit=(a,b)=>!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);const av=['.tc-shoot','.tc-rail','.tc-dock'].map(s=>document.querySelector(s)).filter(e=>e&&R(e).width).map(R);
return [...document.querySelectorAll('.tt-die')].filter(d=>av.some(a=>hit(R(d),a))).map(d=>[R(d).left,R(d).top,R(d).right,R(d).bottom].map(Math.round))}"""
def pips(png,d,S):
    im=np.asarray(Image.open(png).convert('RGB')).astype(int);lum=im.mean(2);m=np.zeros(lum.shape,bool)
    from scipy.spatial import ConvexHull
    from PIL import ImageDraw
    P=np.array([(x*3+1.5,y*3+1.5) for x,y,f in d['mask'] if f==d['top']]);hull=P[ConvexHull(P).vertices]
    M=Image.new('L',(lum.shape[1],lum.shape[0]),0);ImageDraw.Draw(M).polygon([tuple(v) for v in hull],fill=1);m=np.asarray(M).astype(bool)   # face = convex hull of its hit points (3D hit-testing leaks at seams)
    m=ndimage.binary_erosion(m,iterations=6);dark=(lum<0.6*np.median(lum[m]))&m;lab,n=ndimage.label(dark);ys,xs=np.where(m)
    if len(ys) and os.environ.get('DBG'): Image.fromarray(np.where(m[...,None],im,im//4).astype('uint8')[ys.min()-6:ys.max()+6,xs.min()-6:xs.max()+6]).resize(((xs.max()-xs.min()+12)*3,(ys.max()-ys.min()+12)*3)).save(png+f'.d{d["top"]}{len(ys)}.png')
    sz=np.array(ndimage.sum(dark,lab,range(1,n+1)));ring=m&~ndimage.binary_erosion(m,iterations=2);edge=set(np.unique(lab[ring]))
    return int(sum(1 for i in range(1,n+1) if sz[i-1]>=max(12,0.03*S*S)))
async def page_for(b,w,h,pg):
    p=await b.new_page();await p.set_viewport_size({"width":w,"height":h});await p.goto(B+"/app/table/index.html");await p.wait_for_selector(".tc-shoot");await p.wait_for_timeout(400)
    if pg is not None:
        el=await p.query_selector(f"[data-page='{pg}']")
        if el: await el.click(); await p.wait_for_timeout(500)
    return p
async def run(b,w,h,pg,roll,mode="normal",strip=False,noroll=False,tag=""):
    p=await page_for(b,w,h,pg);d1,d2=roll
    st=await p.evaluate(START,{"d1":d1,"d2":d2,"speed":mode if mode!="reduced" else "normal","reduced":mode=="reduced","noRoll":noroll,"lane":False})
    res={"size":f"{w}x{h}","pg":pg,"roll":f"{d1}-{d2}","mode":mode,"noRoll":noroll}
    if st.get("none"): res["none"]=True;res["ok"]=True;res["note"]="felt not on this page: readout only";await p.close();return res
    end=st["end"];cov=False;frames=[]
    for i in range(21):
        await p.evaluate(SEEK,end*i/20);cv=await p.evaluate(COVER);cov=cov or (cv and str(cv))
    if strip:
        for f in ([0,.18,.40,.55,.70,1.0] if mode=="normal" else [0,.5,1.0]):
            await p.evaluate(SEEK,end*f);fn=f"{OUT}/_f{tag}{f}.png";await p.screenshot(path=fn);frames.append(fn)
    await p.evaluate(SEEK,end+1);await p.wait_for_timeout(120)
    fn=f"{OUT}/_end-{w}x{h}-{d1}{d2}-{mode}{'-nr' if noroll else ''}.png";await p.screenshot(path=fn)
    pr=await p.evaluate(PROBE)
    res.update(s=st["s"],surfaceAmts=pr["amts"],hiddenAtSettle=pr["hidden"],coversRollOrRail=cov or pr["cover"])
    dd=[]
    for d,exp in zip(pr["dice"],(d1,d2)):
        maj=max(d["cnt"],key=lambda k:d["cnt"][k]) if d["cnt"] else None
        dd.append({"exp":exp if not noroll else d["top"],"majorityFace":int(maj) if maj else None,"pips":pips(fn,d,st["s"])})
    res["dice"]=dd;res["ok"]=all(x["majorityFace"]==x["exp"] and (x["pips"]==x["exp"]) for x in dd) if not noroll else ("settle:" not in str(pr["ev"]) and not any("dice_wall"==e for e in pr["ev"]))
    res["ok"]=res["ok"] and not res["hiddenAtSettle"] and not res["coversRollOrRail"]
    # after tuck: run a real (unheld) throw and check the layer is gone
    if not noroll and mode=="normal":
        await p.evaluate("()=>document.querySelector('.tt-layer').remove()")
        await p.evaluate("async(o)=>{await __T.throwDice(o)}",{"d1":d1,"d2":d2,"speed":"instant"});res["layerGoneAfterTuck"]=await p.evaluate("()=>!document.querySelector('.tt-layer')")
        res["ok"]=res["ok"] and res["layerGoneAfterTuck"]
    res["ev"]=pr["ev"]
    if strip:
        ims=[Image.open(f) for f in frames];sc=.5 if w<900 else .32;ims=[i.resize((int(i.width*sc),int(i.height*sc))) for i in ims]
        S=Image.new("RGB",(sum(i.width for i in ims)+6*(len(ims)-1),ims[0].height),(20,20,20));x=0
        for i in ims: S.paste(i,(x,0));x+=i.width+6
        S.save(f"{OUT}/strip-{tag}.png");res["strip"]=f"{OUT}/strip-{tag}.png"
    await p.close();return res
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch();b=await br.new_context(device_scale_factor=3);pp=await b.new_page();await pp.goto(B+"/app/table/index.html");await pp.evaluate(SEED);await pp.close()
        jobs=[]
        D=[(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(1,2),(3,4),(5,6),(2,5),(6,4),(1,6)]
        for r in D: jobs.append(dict(w=390,h=844,pg=None,roll=r))
        for (w,h) in [(430,932),(320,568),(932,430),(1180,820),(820,1180)]:
            for r in [(6,6),(3,4),(1,1)]: jobs.append(dict(w=w,h=h,pg=None,roll=r))
        for m in ["fast","instant","reduced"]: jobs.append(dict(w=390,h=844,pg=None,roll=(5,2),mode=m))
        strips=[(390,844,"390x844"),(430,932,"430x932"),(320,568,"320x568"),(932,430,"932x430"),(1180,820,"ipad-1180x820"),(820,1180,"ipad-820x1180")]
        for w,h,t in strips: jobs.append(dict(w=w,h=h,pg=None,roll=(4,3),strip=True,tag=t))
        jobs.append(dict(w=390,h=844,pg=None,roll=(3,3),strip=True,tag="390x844-fast",mode="fast"))
        jobs.append(dict(w=390,h=844,pg=None,roll=(3,3),noroll=True,strip=True,tag="390x844-noroll"))
        for pg in [0,1,2]: jobs.append(dict(w=390,h=844,pg=pg,roll=(2,2),tag=f"pg{pg}"))
        out=[]
        for j in jobs:
            try: out.append(await run(b,**j))
            except Exception as e: out.append({"job":str(j),"err":str(e)[:300]})
        json.dump(out,open(f"{OUT}/verify-throw.json","w"),indent=1);await br.close()
        for r in out: print({k:r.get(k) for k in ("size","pg","roll","mode","noRoll","s","ok","none","err","hiddenAtSettle","coversRollOrRail")},[ (d["exp"],d["majorityFace"],d["pips"]) for d in r.get("dice",[])])
asyncio.run(main())
