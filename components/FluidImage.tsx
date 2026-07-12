"use client";
import { useEffect, useRef, useState } from "react";

interface FluidImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function FluidImage({ src, alt, width, height, style, className }: FluidImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const [useStatic, setUseStatic] = useState(false);

  useEffect(() => {
    const isMobileDevice = 
      /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || 
      window.innerWidth < 1024 ||
      (window.matchMedia && window.matchMedia("(any-pointer: coarse)").matches);
      
    setUseStatic(isMobileDevice);
  }, []);

  useEffect(() => {
    if (useStatic) return;

    const canvas = canvasRef.current;
    const imgEl  = imgRef.current;
    const container = containerRef.current;
    if (!canvas || !imgEl || !container) return;

    const cfg = {
      SIM_RESOLUTION: 64,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 3.0,
      VELOCITY_DISSIPATION: 2.5,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 15,
      CURL: 8,
      SPLAT_RADIUS: 0.35,
      SPLAT_FORCE: 4000,
    };

    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext("webgl2", params) as WebGLRenderingContext | null;
    const isWebGL2 = !!gl;
    if (!gl) gl = (canvas.getContext("webgl", params) || canvas.getContext("experimental-webgl", params)) as WebGLRenderingContext | null;
    if (!gl) return;
    const GL = gl;

    let halfFloat: OES_texture_half_float | null = null;
    let supportLinear: OES_texture_half_float_linear | OES_texture_float_linear | null = null;
    if (isWebGL2) {
      (GL as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
      supportLinear = GL.getExtension("OES_texture_float_linear");
    } else {
      halfFloat = GL.getExtension("OES_texture_half_float");
      supportLinear = GL.getExtension("OES_texture_half_float_linear");
    }

    const halfType = isWebGL2
      ? (GL as WebGL2RenderingContext).HALF_FLOAT
      : halfFloat ? (halfFloat as OES_texture_half_float).HALF_FLOAT_OES : GL.UNSIGNED_BYTE;

    const supportRT = (iF: number, f: number, t: number) => {
      const tex = GL.createTexture()!;
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, iF, 4, 4, 0, f, t, null);
      const fbo = GL.createFramebuffer()!;
      GL.bindFramebuffer(GL.FRAMEBUFFER, fbo);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
      return GL.checkFramebufferStatus(GL.FRAMEBUFFER) === GL.FRAMEBUFFER_COMPLETE;
    };

    const getFmt = (iF: number, f: number, t: number): { iF: number; f: number } | null => {
      if (!supportRT(iF, f, t)) {
        const GL2 = GL as WebGL2RenderingContext;
        if (iF === GL2.R16F)    return getFmt(GL2.RG16F,   GL2.RG,   t);
        if (iF === GL2.RG16F)   return getFmt(GL2.RGBA16F, GL.RGBA,  t);
        return null;
      }
      return { iF, f };
    };

    let fmtRGBA: { iF: number; f: number }, fmtRG: { iF: number; f: number }, fmtR: { iF: number; f: number };
    if (isWebGL2) {
      const GL2 = GL as WebGL2RenderingContext;
      fmtRGBA = getFmt(GL2.RGBA16F, GL2.RGBA, halfType)!;
      fmtRG   = getFmt(GL2.RG16F,   GL2.RG,   halfType)!;
      fmtR    = getFmt(GL2.R16F,    GL2.RED,  halfType)!;
    } else {
      fmtRGBA = getFmt(GL.RGBA, GL.RGBA, halfType)!;
      fmtRG   = fmtRGBA;
      fmtR    = fmtRGBA;
    }

    const compile = (type: number, src: string) => {
      const s = GL.createShader(type)!;
      GL.shaderSource(s, src); GL.compileShader(s); return s;
    };
    const mkProg = (vs: WebGLShader, fs: WebGLShader) => {
      const p = GL.createProgram()!;
      GL.attachShader(p, vs); GL.attachShader(p, fs); GL.linkProgram(p); return p;
    };
    const uniforms = (p: WebGLProgram) => {
      const u: Record<string, WebGLUniformLocation> = {};
      const n = GL.getProgramParameter(p, GL.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const nm = GL.getActiveUniform(p, i)!.name; u[nm] = GL.getUniformLocation(p, nm)!; }
      return u;
    };

    const baseVS = compile(GL.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv,vL,vR,vT,vB;
      uniform vec2 texelSize;
      void main(){
        vUv=aPosition*0.5+0.5;
        vL=vUv-vec2(texelSize.x,0.0); vR=vUv+vec2(texelSize.x,0.0);
        vT=vUv+vec2(0.0,texelSize.y); vB=vUv-vec2(0.0,texelSize.y);
        gl_Position=vec4(aPosition,0.0,1.0);
      }`);

    const clearFS = compile(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value;
      void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`);

    const splatFS = compile(GL.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uTarget;
      uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
      void main(){
        vec2 p=vUv-point.xy; p.x*=aspectRatio;
        vec3 splat=exp(-dot(p,p)/radius)*color;
        vec3 base=texture2D(uTarget,vUv).xyz;
        gl_FragColor=vec4(base+splat,1.0);
      }`);

    const advFS = compile(GL.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uVelocity,uSource;
      uniform vec2 texelSize,dyeTexelSize; uniform float dt,dissipation;
      vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){
        vec2 st=uv/ts-0.5; vec2 i=floor(st); vec2 f=fract(st);
        vec4 a=texture2D(s,(i+vec2(0.5,0.5))*ts);
        vec4 b=texture2D(s,(i+vec2(1.5,0.5))*ts);
        vec4 c=texture2D(s,(i+vec2(0.5,1.5))*ts);
        vec4 d=texture2D(s,(i+vec2(1.5,1.5))*ts);
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }
      void main(){
        vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;
        vec4 result=texture2D(uSource,coord);
        float decay=1.0+dissipation*dt;
        gl_FragColor=result/decay;
      }`);

    const divFS = compile(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity;
      void main(){
        float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x;
        float T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;
        vec2 C=texture2D(uVelocity,vUv).xy;
        if(vL.x<0.0){L=-C.x;} if(vR.x>1.0){R=-C.x;}
        if(vT.y>1.0){T=-C.y;} if(vB.y<0.0){B=-C.y;}
        gl_FragColor=vec4(0.5*(R-L+T-B),0,0,1);
      }`);

    const presFS = compile(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure,uDivergence;
      void main(){
        float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x;
        float T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;
        float div=texture2D(uDivergence,vUv).x;
        gl_FragColor=vec4((L+R+B+T-div)*0.25,0,0,1);
      }`);

    const gradFS = compile(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure,uVelocity;
      void main(){
        float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x;
        float T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;
        vec2 vel=texture2D(uVelocity,vUv).xy-vec2(R-L,T-B);
        gl_FragColor=vec4(vel,0,1);
      }`);

    const dispFS = compile(GL.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity, uContent;
      uniform float uDistortion;
      uniform vec2 uPadding;
      uniform float uImgAspect;
      uniform float uCanvasAspect;
      void main(){
        vec2 vel = texture2D(uVelocity, vUv).xy;
        vec2 displacedUv = vUv - vel * uDistortion;
        
        // Normalize UV to the central image area
        vec2 imgUv = (displacedUv - uPadding) / (1.0 - 2.0 * uPadding);
        
        vec4 imgColor = vec4(0.0);
        if (imgUv.x >= 0.0 && imgUv.x <= 1.0 && imgUv.y >= 0.0 && imgUv.y <= 1.0) {
          // Mathematically perfect rounded corners using standard SDF
          vec2 size = vec2(1.0, 1.0 / uCanvasAspect);
          vec2 pScaled = vec2(imgUv.x, imgUv.y / uCanvasAspect);
          float rad = 0.06;
          vec2 d = abs(pScaled - size * 0.5) - (size * 0.5 - rad);
          float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
          if (dist > rad) {
            imgColor = vec4(0.0);
          } else {
            // Apply proportional object-fit: cover mapping
            vec2 ratio = vec2(
              min(1.0, uCanvasAspect / uImgAspect),
              min(1.0, uImgAspect / uCanvasAspect)
            );
            vec2 texUv = 0.5 + (imgUv - 0.5) * ratio;
            imgColor = texture2D(uContent, texUv);
          }
        }
        
        gl_FragColor = imgColor;
      }`);

    const P = (vs: WebGLShader, fs: WebGLShader) => { const p = mkProg(vs, fs); return { p, u: uniforms(p) }; };
    const clearProg = P(baseVS, clearFS);
    const splatProg = P(baseVS, splatFS);
    const advProg   = P(baseVS, advFS);
    const divProg   = P(baseVS, divFS);
    const presProg  = P(baseVS, presFS);
    const gradProg  = P(baseVS, gradFS);
    const dispProg  = P(baseVS, dispFS);

    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), GL.STATIC_DRAW);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), GL.STATIC_DRAW);
    GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    GL.enableVertexAttribArray(0);

    type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texelSizeX: number; texelSizeY: number; attach: (id: number) => number };
    type DFBO = { read: FBO; write: FBO; swap: () => void; texelSizeX: number; texelSizeY: number };

    const mkFBO = (w: number, h: number, iF: number, f: number, t: number, filter: number): FBO => {
      GL.activeTexture(GL.TEXTURE0);
      const tex = GL.createTexture()!;
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filter);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filter);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, iF, w, h, 0, f, t, null);
      const fbo = GL.createFramebuffer()!;
      GL.bindFramebuffer(GL.FRAMEBUFFER, fbo);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
      GL.viewport(0,0,w,h); GL.clear(GL.COLOR_BUFFER_BIT);
      return { texture:tex, fbo, width:w, height:h, texelSizeX:1/w, texelSizeY:1/h, attach(id){ GL.activeTexture(GL.TEXTURE0+id); GL.bindTexture(GL.TEXTURE_2D,tex); return id; } };
    };

    const mkDFBO = (w: number, h: number, iF: number, f: number, t: number, filter: number): DFBO => {
      let a = mkFBO(w,h,iF,f,t,filter), b = mkFBO(w,h,iF,f,t,filter);
      return { get read(){ return a; }, set read(v){ a=v; }, get write(){ return b; }, set write(v){ b=v; }, swap(){ const tmp=a;a=b;b=tmp; }, texelSizeX:a.texelSizeX, texelSizeY:a.texelSizeY };
    };

    const blit = (target: FBO | null) => {
      if (target == null) { GL.viewport(0,0,GL.drawingBufferWidth,GL.drawingBufferHeight); GL.bindFramebuffer(GL.FRAMEBUFFER, null); }
      else { GL.viewport(0,0,target.width,target.height); GL.bindFramebuffer(GL.FRAMEBUFFER, target.fbo); }
      GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    };

    const pxRatio = Math.min(window.devicePixelRatio, 2);
    const getRes = (res: number) => {
      let w = Math.floor(canvas.clientWidth * pxRatio), h = Math.floor(canvas.clientHeight * pxRatio);
      if (w > h) { h = Math.round(h/w*res); w=res; } else { w=Math.round(w/h*res); h=res; }
      return { width: Math.max(w,1), height: Math.max(h,1) };
    };

    const filter = supportLinear ? GL.LINEAR : GL.NEAREST;
    const sR = getRes(cfg.SIM_RESOLUTION);
    const dR = getRes(cfg.DYE_RESOLUTION);

    let velocity = mkDFBO(sR.width, sR.height, fmtRG.iF, fmtRG.f, halfType, filter);
    let dye      = mkDFBO(dR.width, dR.height, fmtRGBA.iF, fmtRGBA.f, halfType, filter);
    let divFBO   = mkFBO(sR.width, sR.height, fmtR.iF, fmtR.f, halfType, GL.NEAREST);
    let presFBO  = mkDFBO(sR.width, sR.height, fmtR.iF, fmtR.f, halfType, GL.NEAREST);

    // Content texture from the img element
    const contentTex = GL.createTexture()!;
    GL.bindTexture(GL.TEXTURE_2D, contentTex);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

    let contentUploaded = false;
    const uploadContent = () => {
      if (!imgEl.complete || imgEl.naturalWidth === 0) return;
      GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
      GL.bindTexture(GL.TEXTURE_2D, contentTex);
      try { 
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, imgEl); 
        contentUploaded = true;
      } catch(_) {}
    };

    if (imgEl.complete) uploadContent();
    else imgEl.onload = uploadContent;

    const resizeCanvas = () => {
      const w = Math.floor(canvas.clientWidth * pxRatio);
      const h = Math.floor(canvas.clientHeight * pxRatio);
      if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; return true; }
      return false;
    };

    const step = (dt: number) => {
      GL.disable(GL.BLEND);

      // divergence
      GL.useProgram(divProg.p);
      GL.uniform2f(divProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(divProg.u.uVelocity, velocity.read.attach(0));
      blit(divFBO);

      // pressure
      GL.useProgram(clearProg.p);
      GL.uniform1i(clearProg.u.uTexture, presFBO.read.attach(0));
      GL.uniform1f(clearProg.u.value, cfg.PRESSURE);
      blit(presFBO.write); presFBO.swap();

      GL.useProgram(presProg.p);
      GL.uniform2f(presProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(presProg.u.uDivergence, divFBO.attach(0));
      for (let i = 0; i < cfg.PRESSURE_ITERATIONS; i++) {
        GL.uniform1i(presProg.u.uPressure, presFBO.read.attach(1));
        blit(presFBO.write); presFBO.swap();
      }

      // grad subtract
      GL.useProgram(gradProg.p);
      GL.uniform2f(gradProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(gradProg.u.uPressure, presFBO.read.attach(0));
      GL.uniform1i(gradProg.u.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      // advect velocity
      GL.useProgram(advProg.p);
      GL.uniform2f(advProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform2f(advProg.u.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const vId = velocity.read.attach(0);
      GL.uniform1i(advProg.u.uVelocity, vId);
      GL.uniform1i(advProg.u.uSource, vId);
      GL.uniform1f(advProg.u.dt, dt);
      GL.uniform1f(advProg.u.dissipation, cfg.VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();

      // advect dye
      GL.uniform2f(advProg.u.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      GL.uniform1i(advProg.u.uVelocity, velocity.read.attach(0));
      GL.uniform1i(advProg.u.uSource, dye.read.attach(1));
      GL.uniform1f(advProg.u.dissipation, cfg.DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    };

    const splat = (x: number, y: number, dx: number, dy: number) => {
      const aspect = canvas.width / canvas.height;
      GL.useProgram(splatProg.p);
      GL.uniform1i(splatProg.u.uTarget, velocity.read.attach(0));
      GL.uniform1f(splatProg.u.aspectRatio, aspect);
      GL.uniform2f(splatProg.u.point, x, y);
      GL.uniform3f(splatProg.u.color, dx, dy, 0);
      GL.uniform1f(splatProg.u.radius, cfg.SPLAT_RADIUS / 100);
      blit(velocity.write); velocity.swap();

      GL.uniform1i(splatProg.u.uTarget, dye.read.attach(0));
      GL.uniform3f(splatProg.u.color, 0.3, 0.2, 0.04);
      GL.uniform1f(splatProg.u.radius, cfg.SPLAT_RADIUS / 100);
      blit(dye.write); dye.swap();
    };

    const render = () => {
      GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
      GL.enable(GL.BLEND);
      GL.useProgram(dispProg.p);
      GL.uniform1i(dispProg.u.uVelocity, velocity.read.attach(0));
      GL.activeTexture(GL.TEXTURE0 + 1);
      GL.bindTexture(GL.TEXTURE_2D, contentTex);
      GL.uniform1i(dispProg.u.uContent, 1);

      GL.uniform1f(dispProg.u.uDistortion, 0.00018);
      GL.uniform2f(dispProg.u.texelSize, 1/GL.drawingBufferWidth, 1/GL.drawingBufferHeight);

      // Pass padding ratio uniforms (150px padding relative to client canvas bounds)
      const padding = 150;
      const paddingX = padding / (canvas.clientWidth || 1);
      const paddingY = padding / (canvas.clientHeight || 1);
      GL.uniform2f(dispProg.u.uPadding, paddingX, paddingY);

      // Pass image aspect ratio uniform
      const imgAspect = imgEl.naturalWidth / (imgEl.naturalHeight || 1);
      GL.uniform1f(dispProg.u.uImgAspect, imgAspect || 1);

      // Pass canvas aspect ratio uniform (of the central image container)
      const containerW = canvas.clientWidth - 300;
      const containerH = canvas.clientHeight - 300;
      const canvasAspect = containerW / (containerH || 1);
      GL.uniform1f(dispProg.u.uCanvasAspect, canvasAspect || 1);

      blit(null);
    };

    const ptr = { x: 0, y: 0, px: 0, py: 0, moved: false };
    let lastTime = Date.now();
    let animId: number;
    let active = false;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      if (!contentUploaded) {
        uploadContent();
      }

      resizeCanvas();

      if (ptr.moved && active) {
        ptr.moved = false;
        const dx = (ptr.x - ptr.px) * cfg.SPLAT_FORCE;
        const dy = (ptr.py - ptr.y) * cfg.SPLAT_FORCE;
        splat(ptr.x, 1 - ptr.y, dx, dy);
      }

      step(dt);
      render();
    };

    resizeCanvas();
    loop();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const dx = Math.max(rect.left - mouseX, 0, mouseX - rect.right);
      const dy = Math.max(rect.top - mouseY, 0, mouseY - rect.bottom);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1500) {
        active = true;
        ptr.px = ptr.x; ptr.py = ptr.y;
        // Clamp to [-0.25, 1.25] to warp edges naturally from a much broader background hover area
        ptr.x = Math.max(-0.25, Math.min(1.25, (mouseX - rect.left) / rect.width));
        ptr.y = Math.max(-0.25, Math.min(1.25, (mouseY - rect.top)  / rect.height));
        ptr.moved = true;
      } else {
        active = false;
      }
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      GL.deleteTexture(contentTex);
    };
  }, [useStatic]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "block", overflow: "hidden", ...style }} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ 
          width: "100%", 
          height: "auto", 
          display: "block", 
          opacity: useStatic ? 1 : 0,
          transition: "opacity 0.5s ease"
        }}
        crossOrigin="anonymous"
      />
      {!useStatic && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: "-150px",
            left: "-150px",
            width: "calc(100% + 300px)",
            height: "calc(100% + 300px)",
            pointerEvents: "none",
            zIndex: 5,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
