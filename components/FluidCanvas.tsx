"use client";
import { useEffect, useRef } from "react";

// ─── WebGL Fluid Simulation ───────────────────────────────────────────────────
// Ported from the reference "Smoky mouse effect" vanilla JS implementation.
// Runs as a transparent overlay on the hero section, reacting to mouse movement.

export default function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── config ──────────────────────────────────────────────────────────────
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 2.0,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 10,
      SPLAT_RADIUS: 0.4,
      SPLAT_FORCE: 5000,
      SHADING: true,
      TRANSPARENT: true,
      BACK_COLOR: { r: 0, g: 0, b: 0 },
    };

    // ── pointer ──────────────────────────────────────────────────────────────
    interface Pointer {
      id: number; texcoordX: number; texcoordY: number;
      prevTexcoordX: number; prevTexcoordY: number;
      deltaX: number; deltaY: number;
      down: boolean; moved: boolean; color: [number, number, number];
    }
    const pointer: Pointer = {
      id: -1, texcoordX: 0, texcoordY: 0,
      prevTexcoordX: 0, prevTexcoordY: 0,
      deltaX: 0, deltaY: 0,
      down: false, moved: false, color: [0.2, 0.15, 0.05],
    };

    // ── WebGL context ─────────────────────────────────────────────────────────
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | WebGLRenderingContext | null;
    const isWebGL2 = !!gl;
    if (!gl) gl = (canvas.getContext("webgl", params) || canvas.getContext("experimental-webgl", params)) as WebGLRenderingContext | null;
    if (!gl) return;

    const GL = gl as WebGLRenderingContext;

    let halfFloat: OES_texture_half_float | null = null;
    let supportLinearFiltering: OES_texture_half_float_linear | OES_texture_float_linear | null = null;

    if (isWebGL2) {
      (GL as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
      supportLinearFiltering = GL.getExtension("OES_texture_float_linear");
    } else {
      halfFloat = GL.getExtension("OES_texture_half_float");
      supportLinearFiltering = GL.getExtension("OES_texture_half_float_linear");
    }

    GL.clearColor(0, 0, 0, 1);

    const halfFloatTexType = isWebGL2
      ? (GL as WebGL2RenderingContext).HALF_FLOAT
      : halfFloat ? (halfFloat as OES_texture_half_float).HALF_FLOAT_OES : GL.UNSIGNED_BYTE;

    const getSupportedFormat = (internalFormat: number, format: number, type: number): { internalFormat: number; format: number } | null => {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        if (internalFormat === (GL as WebGL2RenderingContext).R16F)
          return getSupportedFormat((GL as WebGL2RenderingContext).RG16F, (GL as WebGL2RenderingContext).RG, type);
        if (internalFormat === (GL as WebGL2RenderingContext).RG16F)
          return getSupportedFormat((GL as WebGL2RenderingContext).RGBA16F, GL.RGBA, type);
        return null;
      }
      return { internalFormat, format };
    };

    const supportRenderTextureFormat = (internalFormat: number, format: number, type: number): boolean => {
      const tex = GL.createTexture()!;
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = GL.createFramebuffer()!;
      GL.bindFramebuffer(GL.FRAMEBUFFER, fbo);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
      return GL.checkFramebufferStatus(GL.FRAMEBUFFER) === GL.FRAMEBUFFER_COMPLETE;
    };

    let formatRGBA: { internalFormat: number; format: number } | null;
    let formatRG: { internalFormat: number; format: number } | null;
    let formatR: { internalFormat: number; format: number } | null;

    if (isWebGL2) {
      const GL2 = GL as WebGL2RenderingContext;
      formatRGBA = getSupportedFormat(GL2.RGBA16F, GL2.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(GL2.RG16F, GL2.RG, halfFloatTexType);
      formatR = getSupportedFormat(GL2.R16F, GL2.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(GL.RGBA, GL.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(GL.RGBA, GL.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(GL.RGBA, GL.RGBA, halfFloatTexType);
    }

    // ── shader helpers ────────────────────────────────────────────────────────
    const compileShader = (type: number, src: string, keywords?: string[]): WebGLShader => {
      let source = src;
      if (keywords) source = keywords.map(k => `#define ${k}\n`).join("") + source;
      const shader = GL.createShader(type)!;
      GL.shaderSource(shader, source);
      GL.compileShader(shader);
      return shader;
    };

    const createProgram = (vs: WebGLShader, fs: WebGLShader): WebGLProgram => {
      const prog = GL.createProgram()!;
      GL.attachShader(prog, vs); GL.attachShader(prog, fs);
      GL.linkProgram(prog);
      return prog;
    };

    const getUniforms = (prog: WebGLProgram): Record<string, WebGLUniformLocation> => {
      const u: Record<string, WebGLUniformLocation> = {};
      const n = GL.getProgramParameter(prog, GL.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = GL.getActiveUniform(prog, i)!.name;
        u[name] = GL.getUniformLocation(prog, name)!;
      }
      return u;
    };

    // ── shaders ───────────────────────────────────────────────────────────────
    const baseVS = compileShader(GL.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform vec2 texelSize;
      void main(){
        vUv=aPosition*0.5+0.5;
        vL=vUv-vec2(texelSize.x,0.0); vR=vUv+vec2(texelSize.x,0.0);
        vT=vUv+vec2(0.0,texelSize.y); vB=vUv-vec2(0.0,texelSize.y);
        gl_Position=vec4(aPosition,0.0,1.0);
      }`);

    const blurVS = compileShader(GL.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR;
      uniform vec2 texelSize;
      void main(){
        vUv=aPosition*0.5+0.5;
        float o=1.33333333;
        vL=vUv-texelSize*o; vR=vUv+texelSize*o;
        gl_Position=vec4(aPosition,0.0,1.0);
      }`);

    const blurFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR;
      uniform sampler2D uTexture;
      void main(){
        vec4 s=texture2D(uTexture,vUv)*0.29411764;
        s+=texture2D(uTexture,vL)*0.35294117;
        s+=texture2D(uTexture,vR)*0.35294117;
        gl_FragColor=s;
      }`);

    const copyFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture;
      void main(){ gl_FragColor=texture2D(uTexture,vUv); }`);

    const clearFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value;
      void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`);

    const displaySrc = `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uContent;
      uniform float uDistortion;
      uniform vec2 texelSize;
      void main(){
        vec2 vel = texture2D(uVelocity, vUv).xy;
        vec2 displacedUv = vUv - vel * uDistortion;
        displacedUv = clamp(displacedUv, 0.0, 1.0);
        
        gl_FragColor = texture2D(uContent, displacedUv);
      }`;

    const splatFS = compileShader(GL.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uTarget;
      uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
      void main(){
        vec2 p=vUv-point.xy; p.x*=aspectRatio;
        vec3 splat=exp(-dot(p,p)/radius)*color;
        vec3 base=texture2D(uTarget,vUv).xyz;
        gl_FragColor=vec4(base+splat,1.0);
      }`);

    const advectionFS = compileShader(GL.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 texelSize; uniform vec2 dyeTexelSize; uniform float dt; uniform float dissipation;
      vec4 bilerp(sampler2D sam,vec2 uv,vec2 tsize){
        vec2 st=uv/tsize-0.5; vec2 iuv=floor(st); vec2 fuv=fract(st);
        vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*tsize);
        vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);
        vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*tsize);
        vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);
        return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);
      }
      void main(){
        #ifdef MANUAL_FILTERING
          vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
          vec4 result=bilerp(uSource,coord,dyeTexelSize);
        #else
          vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;
          vec4 result=texture2D(uSource,coord);
        #endif
        float decay=1.0+dissipation*dt;
        gl_FragColor=result/decay;
      }`, supportLinearFiltering ? undefined : ["MANUAL_FILTERING"]);

    const divergenceFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L=texture2D(uVelocity,vL).x; float R=texture2D(uVelocity,vR).x;
        float T=texture2D(uVelocity,vT).y; float B=texture2D(uVelocity,vB).y;
        vec2 C=texture2D(uVelocity,vUv).xy;
        if(vL.x<0.0){L=-C.x;} if(vR.x>1.0){R=-C.x;}
        if(vT.y>1.0){T=-C.y;} if(vB.y<0.0){B=-C.y;}
        gl_FragColor=vec4(0.5*(R-L+T-B),0,0,1);
      }`);

    const curlFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main(){
        float L=texture2D(uVelocity,vL).y; float R=texture2D(uVelocity,vR).y;
        float T=texture2D(uVelocity,vT).x; float B=texture2D(uVelocity,vB).x;
        gl_FragColor=vec4(0.5*(R-L-T+B),0,0,1);
      }`);

    const vorticityFS = compileShader(GL.FRAGMENT_SHADER, `
      precision highp float; precision highp sampler2D;
      varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
      uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
      void main(){
        float L=texture2D(uCurl,vL).x; float R=texture2D(uCurl,vR).x;
        float T=texture2D(uCurl,vT).x; float B=texture2D(uCurl,vB).x;
        float C=texture2D(uCurl,vUv).x;
        vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
        force/=length(force)+0.0001; force*=curl*C; force.y*=-1.0;
        vec2 vel=texture2D(uVelocity,vUv).xy+force*dt;
        vel=min(max(vel,-1000.0),1000.0);
        gl_FragColor=vec4(vel,0,1);
      }`);

    const pressureFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main(){
        float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x;
        float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x;
        float div=texture2D(uDivergence,vUv).x;
        gl_FragColor=vec4((L+R+B+T-div)*0.25,0,0,1);
      }`);

    const gradSubtractFS = compileShader(GL.FRAGMENT_SHADER, `
      precision mediump float; precision mediump sampler2D;
      varying highp vec2 vUv; varying highp vec2 vL; varying highp vec2 vR; varying highp vec2 vT; varying highp vec2 vB;
      uniform sampler2D uPressure; uniform sampler2D uVelocity;
      void main(){
        float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x;
        float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x;
        vec2 vel=texture2D(uVelocity,vUv).xy-vec2(R-L,T-B);
        gl_FragColor=vec4(vel,0,1);
      }`);

    // ── programs ──────────────────────────────────────────────────────────────
    const blurProg   = { p: createProgram(blurVS, blurFS),   u: {} as Record<string, WebGLUniformLocation> };
    const copyProg   = { p: createProgram(baseVS, copyFS),   u: {} as Record<string, WebGLUniformLocation> };
    const clearProg  = { p: createProgram(baseVS, clearFS),  u: {} as Record<string, WebGLUniformLocation> };
    const splatProg  = { p: createProgram(baseVS, splatFS),  u: {} as Record<string, WebGLUniformLocation> };
    const advProg    = { p: createProgram(baseVS, advectionFS), u: {} as Record<string, WebGLUniformLocation> };
    const divProg    = { p: createProgram(baseVS, divergenceFS), u: {} as Record<string, WebGLUniformLocation> };
    const curlProg   = { p: createProgram(baseVS, curlFS),   u: {} as Record<string, WebGLUniformLocation> };
    const vortProg   = { p: createProgram(baseVS, vorticityFS), u: {} as Record<string, WebGLUniformLocation> };
    const presProg   = { p: createProgram(baseVS, pressureFS), u: {} as Record<string, WebGLUniformLocation> };
    const gradProg   = { p: createProgram(baseVS, gradSubtractFS), u: {} as Record<string, WebGLUniformLocation> };

    // display material — with/without SHADING keyword
    const dispProgShading = { p: createProgram(baseVS, compileShader(GL.FRAGMENT_SHADER, displaySrc, ["SHADING"])), u: {} as Record<string, WebGLUniformLocation> };
    const dispProgFlat    = { p: createProgram(baseVS, compileShader(GL.FRAGMENT_SHADER, displaySrc)), u: {} as Record<string, WebGLUniformLocation> };

    [blurProg, copyProg, clearProg, splatProg, advProg, divProg, curlProg, vortProg, presProg, gradProg, dispProgShading, dispProgFlat].forEach(pg => {
      pg.u = getUniforms(pg.p);
    });

    // ── quad blit ────────────────────────────────────────────────────────────
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), GL.STATIC_DRAW);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), GL.STATIC_DRAW);
    GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    GL.enableVertexAttribArray(0);

    type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; texelSizeX: number; texelSizeY: number; attach: (id: number) => number };
    type DoubleFBO = { width: number; height: number; texelSizeX: number; texelSizeY: number; read: FBO; write: FBO; swap: () => void };

    const createFBO = (w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO => {
      GL.activeTexture(GL.TEXTURE0);
      const tex = GL.createTexture()!;
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, param);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, param);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = GL.createFramebuffer()!;
      GL.bindFramebuffer(GL.FRAMEBUFFER, fbo);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
      GL.viewport(0, 0, w, h); GL.clear(GL.COLOR_BUFFER_BIT);
      return { texture: tex, fbo, width: w, height: h, texelSizeX: 1/w, texelSizeY: 1/h, attach(id){ GL.activeTexture(GL.TEXTURE0+id); GL.bindTexture(GL.TEXTURE_2D, tex); return id; } };
    };

    const createDoubleFBO = (w: number, h: number, iF: number, f: number, t: number, p: number): DoubleFBO => {
      let a = createFBO(w, h, iF, f, t, p), b = createFBO(w, h, iF, f, t, p);
      return { width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY, get read(){ return a; }, set read(v){ a=v; }, get write(){ return b; }, set write(v){ b=v; }, swap(){ const tmp=a; a=b; b=tmp; } };
    };

    const blit = (target: FBO | null, clear = false) => {
      if (target == null) { GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight); GL.bindFramebuffer(GL.FRAMEBUFFER, null); }
      else { GL.viewport(0, 0, target.width, target.height); GL.bindFramebuffer(GL.FRAMEBUFFER, target.fbo); }
      if (clear) { GL.clearColor(0,0,0,1); GL.clear(GL.COLOR_BUFFER_BIT); }
      GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    };

    // ── resolution helpers ────────────────────────────────────────────────────
    const scaleByPixelRatio = (v: number) => Math.floor(v * Math.min(window.devicePixelRatio, 2));
    const getResolution = (res: number) => {
      let w = scaleByPixelRatio(GL.drawingBufferWidth), h = scaleByPixelRatio(GL.drawingBufferHeight);
      if (w > h) { h = Math.round(h / w * res); w = res; } else { w = Math.round(w / h * res); h = res; }
      return { width: Math.max(w, 1), height: Math.max(h, 1) };
    };

    // ── framebuffers ──────────────────────────────────────────────────────────
    const filtering = supportLinearFiltering ? GL.LINEAR : GL.NEAREST;
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const rgba = formatRGBA!, rg = formatRG!, r = formatR!;

    GL.disable(GL.BLEND);
    let dye      = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, halfFloatTexType, filtering);
    let velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat,   rg.format,   halfFloatTexType, filtering);
    let divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, halfFloatTexType, GL.NEAREST);
    let curl       = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, halfFloatTexType, GL.NEAREST);
    let pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, halfFloatTexType, GL.NEAREST);

    // canvas resize
    const resizeCanvas = () => {
      const w = scaleByPixelRatio(canvas.clientWidth), h = scaleByPixelRatio(canvas.clientHeight);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; }
      return false;
    };

    // ── simulation step ───────────────────────────────────────────────────────
    const step = (dt: number) => {
      GL.disable(GL.BLEND);

      // curl
      GL.useProgram(curlProg.p);
      GL.uniform2f(curlProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(curlProg.u.uVelocity, velocity.read.attach(0));
      blit(curl);

      // vorticity
      GL.useProgram(vortProg.p);
      GL.uniform2f(vortProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(vortProg.u.uVelocity, velocity.read.attach(0));
      GL.uniform1i(vortProg.u.uCurl, curl.attach(1));
      GL.uniform1f(vortProg.u.curl, config.CURL);
      GL.uniform1f(vortProg.u.dt, dt);
      blit(velocity.write); velocity.swap();

      // divergence
      GL.useProgram(divProg.p);
      GL.uniform2f(divProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(divProg.u.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // clear pressure
      GL.useProgram(clearProg.p);
      GL.uniform1i(clearProg.u.uTexture, pressure.read.attach(0));
      GL.uniform1f(clearProg.u.value, config.PRESSURE);
      blit(pressure.write); pressure.swap();

      // pressure solve
      GL.useProgram(presProg.p);
      GL.uniform2f(presProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(presProg.u.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        GL.uniform1i(presProg.u.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }

      // gradient subtract
      GL.useProgram(gradProg.p);
      GL.uniform2f(gradProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(gradProg.u.uPressure, pressure.read.attach(0));
      GL.uniform1i(gradProg.u.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();

      // advect velocity
      GL.useProgram(advProg.p);
      GL.uniform2f(advProg.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering) GL.uniform2f(advProg.u.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const vId = velocity.read.attach(0);
      GL.uniform1i(advProg.u.uVelocity, vId);
      GL.uniform1i(advProg.u.uSource, vId);
      GL.uniform1f(advProg.u.dt, dt);
      GL.uniform1f(advProg.u.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();

      // advect dye
      if (!supportLinearFiltering) GL.uniform2f(advProg.u.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      GL.uniform1i(advProg.u.uVelocity, velocity.read.attach(0));
      GL.uniform1i(advProg.u.uSource, dye.read.attach(1));
      GL.uniform1f(advProg.u.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    };

    // ── splat ─────────────────────────────────────────────────────────────────
    const splat = (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => {
      const aspect = canvas.width / canvas.height;
      GL.useProgram(splatProg.p);

      GL.uniform1i(splatProg.u.uTarget, velocity.read.attach(0));
      GL.uniform1f(splatProg.u.aspectRatio, aspect);
      GL.uniform2f(splatProg.u.point, x, y);
      GL.uniform3f(splatProg.u.color, dx, dy, 0);
      GL.uniform1f(splatProg.u.radius, config.SPLAT_RADIUS / 100);
      blit(velocity.write); velocity.swap();

      GL.uniform1i(splatProg.u.uTarget, dye.read.attach(0));
      GL.uniform3f(splatProg.u.color, color[0], color[1], color[2]);
      GL.uniform1f(splatProg.u.radius, config.SPLAT_RADIUS / 100);
      blit(dye.write); dye.swap();
    };

    // ── render ────────────────────────────────────────────────────────────────
    // ── content texture & offscreen drawing ───────────────────────────────────
    const offscreenCanvas = typeof window !== "undefined" ? document.createElement("canvas") : null;
    const offctx = offscreenCanvas ? offscreenCanvas.getContext("2d") : null;
    let contentTex = GL.createTexture()!;
    GL.bindTexture(GL.TEXTURE_2D, contentTex);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(/\s+/);
      let line = "";
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
    };

    const img = typeof window !== "undefined" ? new Image() : null;
    if (img) {
      img.src = "/cylas-tee.webp";
    }

    const updateContent = () => {
      if (!offctx || !offscreenCanvas) return;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      offscreenCanvas.width = w;
      offscreenCanvas.height = h;

      // 1. Background
      offctx.fillStyle = "#0B1014";
      offctx.fillRect(0, 0, w, h);

      const scale = w / canvas.clientWidth;
      const clientW = canvas.clientWidth;
      const clientH = canvas.clientHeight;

      // 2. Watermark
      const watermarkFontSize = Math.max(120, Math.min(clientW * 0.3, 380)) * scale;
      offctx.font = `700 ${watermarkFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      offctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      offctx.textAlign = "center";
      offctx.textBaseline = "middle";
      offctx.fillText("Cylas Tee", w / 2, h / 2);

      // 3. Person Image
      const imgContainer = document.getElementById("hero-image");
      const hero = document.getElementById("home");

      if (img && img.complete) {
        let imgX = 0, imgY = 0, imgW = 0, imgH = 0;
        if (hero && imgContainer) {
          const heroRect = hero.getBoundingClientRect();
          const imgRect = imgContainer.getBoundingClientRect();
          imgX = (imgRect.left - heroRect.left) * scale;
          imgY = (imgRect.top - heroRect.top) * scale;
          imgW = imgRect.width * scale;
          imgH = imgRect.height * scale;
        } else {
          imgW = Math.min(600, clientW) * scale;
          imgH = imgW * (900 / 680);
          imgX = (w - imgW) / 2;
          imgY = h - imgH;
        }
        offctx.drawImage(img, imgX, imgY, imgW, imgH);
      }

      // 4. Title Text
      const titleEl = document.getElementById("hero-title");
      if (titleEl) {
        const heroRect = hero ? hero.getBoundingClientRect() : { left: 0, top: 0 };
        const titleRect = titleEl.getBoundingClientRect();
        const titleX = (titleRect.left - heroRect.left) * scale;
        const titleY = (titleRect.top - heroRect.top) * scale;
        const titleW = titleRect.width * scale;

        const titleStyle = window.getComputedStyle(titleEl);
        const fontSize = parseFloat(titleStyle.fontSize) * scale;
        
        offctx.font = `normal ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        offctx.fillStyle = "#ffffff";
        offctx.textAlign = "left";
        offctx.textBaseline = "top";

        const text = titleEl.textContent || "Create Your Website Today";
        const lineHeight = fontSize * 1.15;
        wrapText(offctx, text, titleX, titleY, titleW, lineHeight);
      }

      // 5. Upload to WebGL Content Texture
      GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
      GL.bindTexture(GL.TEXTURE_2D, contentTex);
      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, offscreenCanvas);
    };

    let isMounted = true;
    if (img) {
      img.onload = () => {
        if (isMounted) updateContent();
      };
    }

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (isMounted) updateContent();
      });
    }

    // ── render ────────────────────────────────────────────────────────────────
    const render = () => {
      GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
      GL.enable(GL.BLEND);
      const dp = config.SHADING ? dispProgShading : dispProgFlat;
      GL.useProgram(dp.p);
      
      // Bind velocity texture to unit 0
      GL.uniform1i(dp.u.uVelocity, velocity.read.attach(0));

      // Bind content texture to unit 1
      GL.activeTexture(GL.TEXTURE0 + 1);
      GL.bindTexture(GL.TEXTURE_2D, contentTex);
      GL.uniform1i(dp.u.uContent, 1);

      // Distortion strength
      GL.uniform1f(dp.u.uDistortion, 0.00015);

      if (config.SHADING) GL.uniform2f(dp.u.texelSize, 1/GL.drawingBufferWidth, 1/GL.drawingBufferHeight);
      
      blit(null);
    };

    // ── golden color palette — warm smoke ─────────────────────────────────────
    const goldColors: [number, number, number][] = [
      [0.35, 0.22, 0.04],
      [0.50, 0.35, 0.08],
      [0.25, 0.17, 0.03],
      [0.60, 0.44, 0.10],
      [0.18, 0.12, 0.02],
    ];
    let colorIdx = 0;
    const nextColor = (): [number, number, number] => {
      const c = goldColors[colorIdx % goldColors.length];
      colorIdx++;
      return c;
    };

    // ── animation loop ────────────────────────────────────────────────────────
    let lastTime = Date.now();
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      if (resizeCanvas()) {
        const sR = getResolution(config.SIM_RESOLUTION);
        const dR = getResolution(config.DYE_RESOLUTION);
        dye      = createDoubleFBO(dR.width, dR.height, rgba.internalFormat, rgba.format, halfFloatTexType, filtering);
        velocity = createDoubleFBO(sR.width, sR.height, rg.internalFormat,   rg.format,   halfFloatTexType, filtering);
        divergence = createFBO(sR.width, sR.height, r.internalFormat, r.format, halfFloatTexType, GL.NEAREST);
        curl       = createFBO(sR.width, sR.height, r.internalFormat, r.format, halfFloatTexType, GL.NEAREST);
        pressure   = createDoubleFBO(sR.width, sR.height, r.internalFormat, r.format, halfFloatTexType, GL.NEAREST);
        updateContent();
      }

      if (pointer.moved) {
        pointer.moved = false;
        splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX, pointer.deltaY, pointer.color);
      }

      step(dt);
      render();
    };

    resizeCanvas();
    updateContent();
    loop();

    // ── mouse / touch events ──────────────────────────────────────────────────
    const updatePointer = (x: number, y: number) => {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = x / canvas.clientWidth;
      pointer.texcoordY = 1 - y / canvas.clientHeight;
      pointer.deltaX = (pointer.texcoordX - pointer.prevTexcoordX) * config.SPLAT_FORCE;
      pointer.deltaY = (pointer.texcoordY - pointer.prevTexcoordY) * config.SPLAT_FORCE;
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      if (pointer.moved) pointer.color = nextColor();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth <= 640) return;
      const rect = canvas.getBoundingClientRect();
      updatePointer(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (window.innerWidth <= 640) return;
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      updatePointer(t.clientX - rect.left, t.clientY - rect.top);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      GL.deleteTexture(contentTex);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
