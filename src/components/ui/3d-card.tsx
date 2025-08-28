// "use client";

// import { cn } from "@/lib/utils";

// import React, {
//   createContext,
//   useState,
//   useContext,
//   useRef,
//   useEffect,
// } from "react";

// const MouseEnterContext = createContext<
//   [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
// >(undefined);

// export const CardContainer = ({
//   children,
//   className,
//   containerClassName,
// }: {
//   children?: React.ReactNode;
//   className?: string;
//   containerClassName?: string;
// }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isMouseEntered, setIsMouseEntered] = useState(false);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!containerRef.current) return;
//     const { left, top, width, height } =
//       containerRef.current.getBoundingClientRect();
//     const x = (e.clientX - left - width / 2) / 25;
//     const y = (e.clientY - top - height / 2) / 25;
//     containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
//   };

//   const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
//     setIsMouseEntered(true);
//     if (!containerRef.current) return;
//   };

//   const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!containerRef.current) return;
//     setIsMouseEntered(false);
//     containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
//   };
//   return (
//     <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
//       <div
//         className={cn(
//           "py-20 flex items-center justify-center",
//           containerClassName
//         )}
//         style={{
//           perspective: "1000px",
//         }}
//       >
//         <div
//           ref={containerRef}
//           onMouseEnter={handleMouseEnter}
//           onMouseMove={handleMouseMove}
//           onMouseLeave={handleMouseLeave}
//           className={cn(
//             "flex items-center justify-center relative transition-all duration-200 ease-linear",
//             className
//           )}
//           style={{
//             transformStyle: "preserve-3d",
//           }}
//         >
//           {children}
//         </div>
//       </div>
//     </MouseEnterContext.Provider>
//   );
// };

// export const CardBody = ({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => {
//   return (
//     <div
//       className={cn(
//         "h-96 w-96 [transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// export const CardItem = ({
//   as: Tag = "div",
//   children,
//   className,
//   translateX = 0,
//   translateY = 0,
//   translateZ = 0,
//   rotateX = 0,
//   rotateY = 0,
//   rotateZ = 0,
//   ...rest
// }: {
//   as?: React.ElementType;
//   children: React.ReactNode;
//   className?: string;
//   translateX?: number | string;
//   translateY?: number | string;
//   translateZ?: number | string;
//   rotateX?: number | string;
//   rotateY?: number | string;
//   rotateZ?: number | string;
//   [key: string]: any;
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const [isMouseEntered] = useMouseEnter();

//   useEffect(() => {
//     handleAnimations();
//   }, [isMouseEntered]);

//   const handleAnimations = () => {
//     if (!ref.current) return;
//     if (isMouseEntered) {
//       ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
//     } else {
//       ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
//     }
//   };

//   return (
//     <Tag
//       ref={ref}
//       className={cn("w-fit transition duration-200 ease-linear", className)}
//       {...rest}
//     >
//       {children}
//     </Tag>
//   );
// };

// // Create a hook to use the context
// export const useMouseEnter = () => {
//   const context = useContext(MouseEnterContext);
//   if (context === undefined) {
//     throw new Error("useMouseEnter must be used within a MouseEnterProvider");
//   }
//   return context;
// };


// "use client";

// import React, { useRef, useEffect } from "react";

// type SparklesProps = {
//   /** Number of particles on screen */
//   count?: number;
//   /** Fill color for particles (supports rgba/hex) */
//   color?: string;
//   className?: string;
//   style?: React.CSSProperties;
// };

// interface Particle {
//   x: number;
//   y: number;
//   vx: number;
//   vy: number;
//   r: number;
//   life: number;
//   maxLife: number;
// }

// export default function Sparkles({
//   count = 80,
//   color = "rgba(255,255,255,0.85)",
//   className,
//   style,
// }: SparklesProps) {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const particlesRef = useRef<Particle[]>([]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
//     if (!ctx) return;

//     const dpr = Math.min(window.devicePixelRatio || 1, 2);

//     const resize = () => {
//       const rect = canvas.getBoundingClientRect();
//       canvas.width = Math.floor(rect.width * dpr);
//       canvas.height = Math.floor(rect.height * dpr);
//       // draw in CSS pixels; scale canvas context by DPR
//       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
//     };

//     const createParticle = (): Particle => ({
//       x: Math.random() * canvas.clientWidth,
//       y: Math.random() * canvas.clientHeight,
//       vx: (Math.random() - 0.5) * 0.6,
//       vy: (Math.random() - 0.5) * 0.6,
//       r: Math.random() * 1.8 + 0.6,
//       life: 0,
//       maxLife: 200 + Math.random() * 200,
//     });

//     // init
//     resize();
//     particlesRef.current = Array.from({ length: count }, createParticle);

//     const onResize = () => resize();
//     window.addEventListener("resize", onResize);

//     const step = () => {
//       // clear in device pixels (transform handles CSS px)
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const W = canvas.clientWidth;
//       const H = canvas.clientHeight;

//       for (const p of particlesRef.current) {
//         p.x += p.vx;
//         p.y += p.vy;
//         p.life += 1;

//         // wrap-around edges
//         if (p.x < -10) p.x = W + 10;
//         if (p.x > W + 10) p.x = -10;
//         if (p.y < -10) p.y = H + 10;
//         if (p.y > H + 10) p.y = -10;

//         // respawn when life exceeded
//         if (p.life > p.maxLife) {
//           const next = createParticle();
//           p.x = next.x;
//           p.y = next.y;
//           p.vx = next.vx;
//           p.vy = next.vy;
//           p.r = next.r;
//           p.life = next.life;
//           p.maxLife = next.maxLife;
//         }

//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = color;
//         ctx.fill();
//       }

//       rafRef.current = requestAnimationFrame(step);
//     };

//     rafRef.current = requestAnimationFrame(step);

//     return () => {
//       if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
//       window.removeEventListener("resize", onResize);
//     };
//   }, [count, color]);

//   return <canvas ref={canvasRef} className={className} style={style} />;
// }

"use client";

import React, { useRef, useEffect } from "react";

type SparklesProps = {
  /** Number of particles on screen */
  count?: number;
  /** Fill color for particles (supports rgba/hex) */
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
}

export default function Sparkles({
  count = 80,
  color = "rgba(255,255,255,0.85)",
  className,
  style,
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      // draw in CSS pixels; scale canvas context by DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.8 + 0.6,
      life: 0,
      maxLife: 200 + Math.random() * 200,
    });

    // init
    resize();
    particlesRef.current = Array.from({ length: count }, createParticle);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const step = () => {
      // clear in device pixels (transform handles CSS px)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.clientWidth;
      const H = canvas.clientHeight;

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        // wrap-around edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // respawn when life exceeded
        if (p.life > p.maxLife) {
          const n = createParticle();
          p.x = n.x;
          p.y = n.y;
          p.vx = n.vx;
          p.vy = n.vy;
          p.r = n.r;
          p.life = n.life;
          p.maxLife = n.maxLife;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [count, color]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}


