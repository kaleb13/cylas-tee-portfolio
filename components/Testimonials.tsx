"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TESTIMONIALS = [
  { id:1, quote:"Amazing, did far more than expected. Was prompt and respectful. Anything he was unsure doing, he would research and give me a good understanding. I will use again for all my work in the future.", name:"Kai A.", location:"Australia" },
  { id:2, quote:"Cylas Tee went above and beyond with his amazing service. He was so receptive to our business needs and prompt with solutions that we did not even consider before. He's a WordPress Legend!", name:"Juan M.", location:"Australia" },
  { id:3, quote:"Cylas Tee is a great person to work with. He is very helpful and approachable and is always available to answer any questions. He gives clear guidelines and communicates as a friend.", name:"Kalab A.", location:"Ethiopia" },
  { id:4, quote:"Amazing work. Very professional and knowledgeable. Will do the above and beyond for your project. Will recommend to anyone.", name:"Dean A.", location:"United States" },
  { id:5, quote:"Cylas Tee is a pleasure to work with! He is quick and communicative.", name:"Jay M.", location:"United States" },
  { id:6, quote:"The work is neat and fast, the communication is excellent! I highly recommend Cylas Tee!", name:"Romain R.", location:"Switzerland" },
];

function clamp(v:number,mn=0,mx=1){return Math.min(Math.max(v,mn),mx);}
function ss(v:number,a:number,b:number){const t=clamp((v-a)/(b-a));return t*t*(3-2*t);}

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress]         = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered]       = useState(false);
  const N = TESTIMONIALS.length;


  /* scroll progress */
  useEffect(()=>{
    const onScroll=()=>{
      const el=sectionRef.current; if(!el)return;
      const rect=el.getBoundingClientRect();
      const scrollable=el.offsetHeight-window.innerHeight;
      setProgress(clamp(-rect.top/Math.max(scrollable,1)));
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    onScroll();
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);

  /* auto-advance testimonials */
  useEffect(()=>{
    if(isHovered||progress>0.45)return;
    const t=setInterval(()=>setCurrentIndex(p=>(p+1)%N),5000);
    return()=>clearInterval(t);
  },[isHovered,currentIndex,progress,N]);





  /* phases */

  // Section entry: white panel slides in from right, timed with Services pushing left
  // Testimonials starts at -100vh overlap; entry 0.05→0.25 of its own progress
  const sectionEntry = ss(progress, 0.05, 0.25);
  const sectionX     = `${(1 - sectionEntry) * 100}%`;

  // p2: CTA — slides in from right (0.42→0.58)
  const p2    = ss(progress, 0.42, 0.58);
  const p2X   = `${(1 - p2) * 100}%`;

  // p1: testimonials — visible after entry, pushed left by p2 (0.42→0.58)
  const p1Out = ss(progress, 0.42, 0.58);
  const p1X   = `${p1Out * -100}%`;
  const p1Op  = sectionEntry * (1 - p2);

  // Phase active states for triggering CSS transitions
  const isP1 = progress >= 0.0 && progress < 0.50;
  const isP2 = progress >= 0.50;

  const phaseStyle=(op:number,tx:string):React.CSSProperties=>({position:"absolute",inset:0,opacity:op,transform:`translateX(${tx})`,pointerEvents:op<0.05?"none":"auto",transition:"none",willChange:"transform"});

  const next=()=>setCurrentIndex(p=>(p+1)%N);
  const prev=()=>setCurrentIndex(p=>(p-1+N)%N);

  /* static background color for both phases (#F4F2EE) */
  const bgColor = "#F4F2EE";

  return (
    <div ref={sectionRef} id="testimonials" style={{height:"380vh",backgroundColor:"transparent",position:"relative",zIndex:25,marginTop:"-100vh"}}>
      <div style={{position:"sticky",top:0,height:"100vh",width:"100%",overflow:"hidden",backgroundColor:bgColor,transform:`translateX(${sectionX})`,willChange:"transform"}}>

        {/* gold top line */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(174,140,60,0.3) 50%,transparent)"}}/>

        {/* ── PHASE 1: Testimonials — slides in from right, pushed left by CTA ── */}
        <div style={{...phaseStyle(p1Op, p1X),display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"0 24px"}}>
          <p style={{fontSize:"11px",letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(15,15,15,0.45)",marginBottom:"20px",opacity:isP1?1:0,transform:isP1?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"0ms"}}>Testimonials</p>
          <h2 className="testimonials-heading" style={{fontSize:"clamp(36px,5vw,64px)",fontWeight:300,color:"#0B1014",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:"24px",opacity:isP1?1:0,transform:isP1?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"100ms"}}>Words From His Clients</h2>
          <div style={{width:"60px",height:"1px",backgroundColor:"#AE8C3C",marginBottom:"40px",opacity:isP1?1:0,transform:isP1?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"180ms"}}/>
          <div onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}
            style={{position:"relative",width:"100%",height:"300px",display:"flex",justifyContent:"center",alignItems:"center",perspective:"1000px",opacity:isP1?1:0,transform:isP1?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"260ms"}}>
            {TESTIMONIALS.map((t,i)=>{
              let offset=(i-currentIndex)%N;
              if(offset<-Math.floor(N/2))offset+=N;
              if(offset>Math.floor(N/2))offset-=N;
              const isCenter=offset===0,isLeft=offset===-1,isRight=offset===1,isHide=Math.abs(offset)>1;
              const tx=isLeft?"-65%":isRight?"65%":isHide?(offset<0?"-100%":"100%"):"0%";
              const sc=isCenter?1:isHide?0.7:0.85,op=isCenter?1:isHide?0:0.4;
              return (
                <div key={t.id} onClick={()=>{if(isLeft)prev();if(isRight)next();}}
                  className="testimonial-card"
                  style={{position:"absolute",width:"clamp(300px,40vw,480px)",height:"260px",backgroundColor:"#FFFFFF",
                    boxShadow:isCenter?"0 30px 60px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.03)":"0 10px 30px rgba(0,0,0,0.04)",
                    borderRadius:"4px",padding:"32px",display:"flex",flexDirection:"column",justifyContent:"space-between",
                    transform:`translateX(${tx}) scale(${sc})`,opacity:op,zIndex:isCenter?10:isHide?0:5,
                    pointerEvents:isHide?"none":"auto",cursor:isCenter?"default":"pointer",
                    transition:"all 0.6s cubic-bezier(0.25,1,0.5,1)"}}>
                  <div>
                    <div style={{display:"flex",gap:"4px",marginBottom:"14px"}}>
                      {[1,2,3,4,5].map(s=><svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#AE8C3C"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>)}
                    </div>
                    <p style={{fontSize:"14px",lineHeight:1.8,color:"rgba(11,16,20,0.75)"}}>&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
                    <div style={{width:"40px",height:"40px",borderRadius:"50%",backgroundColor:"rgba(174,140,60,0.08)",border:"1px solid rgba(174,140,60,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:"14px",fontWeight:500,color:"#AE8C3C"}}>{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{fontSize:"13px",fontWeight:500,color:"#0B1014",marginBottom:"2px"}}>{t.name}</p>
                      <p style={{fontSize:"11px",color:"rgba(11,16,20,0.5)",letterSpacing:"0.04em",textTransform:"uppercase"}}>{t.location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"24px",marginTop:"28px",opacity:isP1?1:0,transform:isP1?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"340ms"}}>
            {[prev,null,next].map((fn,idx)=>fn?(
              <button key={idx} onClick={fn}
                style={{width:"44px",height:"44px",borderRadius:"50%",border:"1px solid rgba(174,140,60,0.3)",backgroundColor:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#AE8C3C",transition:"all 0.3s ease"}}
                onMouseOver={e=>{e.currentTarget.style.backgroundColor="#AE8C3C";e.currentTarget.style.color="#FFF";}}
                onMouseOut={e=>{e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#AE8C3C";}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={idx===0?"M15 18L9 12L15 6":"M9 18L15 12L9 6"} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ):(
              <div key="dots" style={{display:"flex",gap:"8px"}}>
                {TESTIMONIALS.map((_,di)=>(
                  <div key={di} onClick={()=>setCurrentIndex(di)}
                    style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:currentIndex===di?"#AE8C3C":"rgba(174,140,60,0.3)",cursor:"pointer",transition:"all 0.3s ease",transform:currentIndex===di?"scale(1.5)":"scale(1)"}}/>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── PHASE 2: CTA — slides in from right, pushes testimonials left ── */}
        <div style={{...phaseStyle(p2, p2X),position:"absolute",inset:0,overflow:"hidden"}}>


          {/* content */}
          <div style={{position:"relative",zIndex:1,height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",textAlign:"center"}}>
            <p style={{fontSize:"11px",letterSpacing:"0.28em",textTransform:"uppercase",color:"#AE8C3C",fontWeight:600,marginBottom:"32px",display:"flex",alignItems:"center",gap:"14px",opacity:isP2?1:0,transform:isP2?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"0ms"}}>
              <span style={{display:"inline-block",width:"36px",height:"1px",backgroundColor:"#AE8C3C",opacity:0.5}}/>
              Ready to build something exceptional
              <span style={{display:"inline-block",width:"36px",height:"1px",backgroundColor:"#AE8C3C",opacity:0.5}}/>
            </p>

            <h2 className="cta-headline" style={{fontSize:"clamp(48px,9vw,108px)",fontWeight:200,color:"#0B1014",lineHeight:1.0,letterSpacing:"-0.04em",marginBottom:"10px",opacity:isP2?1:0,transform:isP2?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"100ms"}}>
              Let&apos;s create
            </h2>
            <h2 className="cta-headline" style={{fontSize:"clamp(48px,9vw,108px)",fontWeight:200,color:"#AE8C3C",lineHeight:1.0,letterSpacing:"-0.04em",marginBottom:"44px",opacity:isP2?1:0,transform:isP2?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"100ms"}}>
              together.
            </h2>

            <p style={{fontSize:"clamp(15px,2vw,17px)",lineHeight:1.85,color:"rgba(11,16,20,0.55)",fontWeight:300,maxWidth:"500px",margin:"0 auto 52px",opacity:isP2?1:0,transform:isP2?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"180ms"}}>
              Cylas Tee builds digital experiences that move people — from personal brands to revenue-generating funnels. One conversation is all it takes.
            </p>

            <div className="cta-buttons-row" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"28px",flexWrap:"wrap",opacity:isP2?1:0,transform:isP2?"translateY(0)":"translateY(30px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"260ms"}}>
              <Link href="/contact" id="contact-cta-primary"
                style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"18px 48px",backgroundColor:"#AE8C3C",border:"1px solid #AE8C3C",color:"#FFFFFF",fontSize:"12px",fontWeight:500,letterSpacing:"0.22em",textTransform:"uppercase",textDecoration:"none",borderRadius:"2px",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)"}}
                onMouseOver={e=>{e.currentTarget.style.backgroundColor="#C9A84C";e.currentTarget.style.borderColor="#C9A84C";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseOut={e=>{e.currentTarget.style.backgroundColor="#AE8C3C";e.currentTarget.style.borderColor="#AE8C3C";e.currentTarget.style.transform="translateY(0)";}}>
                Start A Conversation
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/contact"
                style={{fontSize:"11px",fontWeight:400,letterSpacing:"0.24em",textTransform:"uppercase",color:"rgba(11,16,20,0.4)",textDecoration:"none",transition:"all 0.4s ease"}}
                onMouseOver={e=>{e.currentTarget.style.color="#AE8C3C";e.currentTarget.style.letterSpacing="0.3em";}}
                onMouseOut={e=>{e.currentTarget.style.color="rgba(11,16,20,0.4)";e.currentTarget.style.letterSpacing="0.24em";}}>
                Or send a direct email →
              </Link>
            </div>
          </div>

          {/* bottom bar */}
          <div className="cta-footer-bar" style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 48px",borderTop:"1px solid rgba(11,16,20,0.07)",flexWrap:"wrap",gap:"12px",zIndex:2,opacity:isP2?1:0,transform:isP2?"translateY(0)":"translateY(15px)",transition:"transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",transitionDelay:"340ms"}}>
            <p style={{fontSize:"11px",color:"rgba(11,16,20,0.3)",margin:0}}>
              &copy; {new Date().getFullYear()} Cylas Tee &nbsp;&middot;&nbsp;
              <a href="#" style={{color:"inherit",textDecoration:"none"}} onMouseOver={e=>e.currentTarget.style.color="#AE8C3C"} onMouseOut={e=>e.currentTarget.style.color="rgba(11,16,20,0.3)"}>Privacy</a>
              &nbsp;&middot;&nbsp;
              <a href="#" style={{color:"inherit",textDecoration:"none"}} onMouseOver={e=>e.currentTarget.style.color="#AE8C3C"} onMouseOut={e=>e.currentTarget.style.color="rgba(11,16,20,0.3)"}>Terms</a>
            </p>
            <div style={{display:"flex",gap:"18px"}}>
              {[
                {l:"Facebook",p:"M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.009C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"},
                {l:"X",p:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"},
                {l:"YouTube",p:"M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"},
              ].map(s=>(
                <a key={s.l} href="#" aria-label={s.l} style={{color:"rgba(11,16,20,0.3)",transition:"color 0.2s"}} onMouseOver={e=>e.currentTarget.style.color="#AE8C3C"} onMouseOut={e=>e.currentTarget.style.color="rgba(11,16,20,0.3)"}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d={s.p}/></svg>
                </a>
              ))}
            </div>
            <p style={{fontSize:"11px",color:"rgba(11,16,20,0.18)",margin:0}}>Not affiliated with Facebook, Inc.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
