"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Use a plain 2D canvas — gives us full control over blur
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    // CSS blur on the whole canvas — softens every circle edge naturally
    canvas.style.filter = "blur(40px)";
    canvas.style.pointerEvents = "none";
    mount.appendChild(canvas);

    let W = mount.clientWidth;
    let H = mount.clientHeight;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d")!;

    type Puff = {
      x: number;
      y: number;
      r: number;         // radius
      vx: number;
      vy: number;
      opacity: number;
      targetOpacity: number;
      age: number;
      maxAge: number;
      growing: boolean;
    };

    const MAX_OPACITY = 0.13;
    const COUNT = 22;
    const puffs: Puff[] = [];

    const spawn = (randomAge = false): Puff => {
      const maxAge = 300 + Math.random() * 250;
      const age = randomAge ? Math.floor(Math.random() * maxAge) : 0;
      return {
        x: Math.random() * W,
        y: randomAge ? Math.random() * H : H + 60,
        r: 80 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.4 + Math.random() * 0.5),
        opacity: 0,
        targetOpacity: MAX_OPACITY * (0.5 + Math.random() * 0.5),
        age,
        maxAge,
        growing: true,
      };
    };

    for (let i = 0; i < COUNT; i++) puffs.push(spawn(true));

    let animId: number;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      puffs.forEach((p, i) => {
        p.age++;
        p.x += p.vx;
        p.y += p.vy;

        // Slowly expand radius as it rises
        p.r += 0.08;

        const t = p.age / p.maxAge;

        // Fade envelope
        if (t < 0.2) {
          p.opacity = (t / 0.2) * p.targetOpacity;
        } else if (t < 0.7) {
          p.opacity = p.targetOpacity;
        } else {
          p.opacity = ((1 - t) / 0.3) * p.targetOpacity;
        }

        // Draw soft radial gradient circle
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0,   `rgba(255,255,255,${p.opacity})`);
        grad.addColorStop(0.4, `rgba(255,255,255,${p.opacity * 0.4})`);
        grad.addColorStop(0.75,`rgba(255,255,255,${p.opacity * 0.08})`);
        grad.addColorStop(1,   `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Respawn when off screen or life ends
        if (p.y + p.r < 0 || p.age >= p.maxAge) {
          puffs[i] = spawn(false);
        }
      });
    };

    draw();

    const onResize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
