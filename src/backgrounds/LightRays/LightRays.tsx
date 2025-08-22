// "use client";
// import { useRef, useEffect, useState } from "react";
// import { Renderer, Program, Triangle, Mesh } from "ogl";

// export type RaysOrigin =
//   | "top-center"
//   | "top-left"
//   | "top-right"
//   | "right"
//   | "left"
//   | "bottom-center"
//   | "bottom-right"
//   | "bottom-left";

// interface LightRaysProps {
//   raysOrigin?: RaysOrigin;
//   raysColor?: string;
//   raysSpeed?: number;
//   lightSpread?: number;
//   rayLength?: number;
//   pulsating?: boolean;
//   fadeDistance?: number;
//   saturation?: number;
//   followMouse?: boolean;
//   mouseInfluence?: number;
//   noiseAmount?: number;
//   distortion?: number;
//   className?: string;
// }

// const DEFAULT_COLOR = "#ffffff";

// const hexToRgb = (hex: string): [number, number, number] => {
//   const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return m
//     ? [
//         parseInt(m[1], 16) / 255,
//         parseInt(m[2], 16) / 255,
//         parseInt(m[3], 16) / 255,
//       ]
//     : [1, 1, 1];
// };

// const getAnchorAndDir = (
//   origin: RaysOrigin,
//   w: number,
//   h: number,
// ): { anchor: [number, number]; dir: [number, number] } => {
//   const outside = 0.2;
//   switch (origin) {
//     case "top-left":
//       return { anchor: [0, -outside * h], dir: [0, 1] };
//     case "top-right":
//       return { anchor: [w, -outside * h], dir: [0, 1] };
//     case "left":
//       return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
//     case "right":
//       return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
//     case "bottom-left":
//       return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
//     case "bottom-center":
//       return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
//     case "bottom-right":
//       return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
//     default: // "top-center"
//       return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
//   }
// };

// const LightRays: React.FC<LightRaysProps> = ({
//   raysOrigin = "top-center",
//   raysColor = DEFAULT_COLOR,
//   raysSpeed = 1,
//   lightSpread = 1,
//   rayLength = 2,
//   pulsating = false,
//   fadeDistance = 1.0,
//   saturation = 1.0,
//   followMouse = true,
//   mouseInfluence = 0.1,
//   noiseAmount = 0.0,
//   distortion = 0.0,
//   className = "",
// }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const uniformsRef = useRef<any>(null);
//   const rendererRef = useRef<Renderer | null>(null);
//   const mouseRef = useRef({ x: 0.5, y: 0.5 });
//   const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
//   const animationIdRef = useRef<number | null>(null);
//   const meshRef = useRef<any>(null);
//   const cleanupFunctionRef = useRef<(() => void) | null>(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const observerRef = useRef<IntersectionObserver | null>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         const entry = entries[0];
//         setIsVisible(entry.isIntersecting);
//       },
//       { threshold: 0.1 },
//     );

//     observerRef.current.observe(containerRef.current);

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//         observerRef.current = null;
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!isVisible || !containerRef.current) return;

//     if (cleanupFunctionRef.current) {
//       cleanupFunctionRef.current();
//       cleanupFunctionRef.current = null;
//     }

//     const initializeWebGL = async () => {
//       if (!containerRef.current) return;

//       await new Promise((resolve) => setTimeout(resolve, 10));

//       if (!containerRef.current) return;

//       const renderer = new Renderer({
//         dpr: Math.min(window.devicePixelRatio, 2),
//         alpha: true,
//       });
//       rendererRef.current = renderer;

//       const gl = renderer.gl;
//       gl.canvas.style.width = "100%";
//       gl.canvas.style.height = "100%";

//       while (containerRef.current.firstChild) {
//         containerRef.current.removeChild(containerRef.current.firstChild);
//       }
//       containerRef.current.appendChild(gl.canvas);

//       const vert = `
// attribute vec2 position;
// varying vec2 vUv;
// void main() {
//   vUv = position * 0.5 + 0.5;
//   gl_Position = vec4(position, 0.0, 1.0);
// }`;

//       const frag = `precision highp float;

// uniform float iTime;
// uniform vec2  iResolution;

// uniform vec2  rayPos;
// uniform vec2  rayDir;
// uniform vec3  raysColor;
// uniform float raysSpeed;
// uniform float lightSpread;
// uniform float rayLength;
// uniform float pulsating;
// uniform float fadeDistance;
// uniform float saturation;
// uniform vec2  mousePos;
// uniform float mouseInfluence;
// uniform float noiseAmount;
// uniform float distortion;

// varying vec2 vUv;

// float noise(vec2 st) {
//   return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
// }

// float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
//                   float seedA, float seedB, float speed) {
//   vec2 sourceToCoord = coord - raySource;
//   vec2 dirNorm = normalize(sourceToCoord);
//   float cosAngle = dot(dirNorm, rayRefDirection);

//   float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
//   float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

//   float distance = length(sourceToCoord);
//   float maxDistance = iResolution.x * rayLength;
//   float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
//   float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
//   float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

//   float baseStrength = clamp(
//     (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
//     (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
//     0.0, 1.0
//   );

//   return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
// }

// void mainImage(out vec4 fragColor, in vec2 fragCoord) {
//   vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
//   vec2 finalRayDir = rayDir;
//   if (mouseInfluence > 0.0) {
//     vec2 mouseScreenPos = mousePos * iResolution.xy;
//     vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
//     finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
//   }

//   vec4 rays1 = vec4(1.0) *
//                rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
//                            1.5 * raysSpeed);
//   vec4 rays2 = vec4(1.0) *
//                rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
//                            1.1 * raysSpeed);

//   fragColor = rays1 * 0.5 + rays2 * 0.4;

//   if (noiseAmount > 0.0) {
//     float n = noise(coord * 0.01 + iTime * 0.1);
//     fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
//   }

//   float brightness = 1.0 - (coord.y / iResolution.y);
//   fragColor.x *= 0.1 + brightness * 0.8;
//   fragColor.y *= 0.3 + brightness * 0.6;
//   fragColor.z *= 0.5 + brightness * 0.5;

//   if (saturation != 1.0) {
//     float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
//     fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
//   }

//   fragColor.rgb *= raysColor;
// }

// void main() {
//   vec4 color;
//   mainImage(color, gl_FragCoord.xy);
//   gl_FragColor  = color;
// }`;

//       const uniforms = {
//         iTime: { value: 0 },
//         iResolution: { value: [1, 1] },

//         rayPos: { value: [0, 0] },
//         rayDir: { value: [0, 1] },

//         raysColor: { value: hexToRgb(raysColor) },
//         raysSpeed: { value: raysSpeed },
//         lightSpread: { value: lightSpread },
//         rayLength: { value: rayLength },
//         pulsating: { value: pulsating ? 1.0 : 0.0 },
//         fadeDistance: { value: fadeDistance },
//         saturation: { value: saturation },
//         mousePos: { value: [0.5, 0.5] },
//         mouseInfluence: { value: mouseInfluence },
//         noiseAmount: { value: noiseAmount },
//         distortion: { value: distortion },
//       };
//       uniformsRef.current = uniforms;

//       const geometry = new Triangle(gl);
//       const program = new Program(gl, {
//         vertex: vert,
//         fragment: frag,
//         uniforms,
//       });
//       const mesh = new Mesh(gl, { geometry, program });
//       meshRef.current = mesh;

//       const updatePlacement = () => {
//         if (!containerRef.current || !renderer) return;

//         renderer.dpr = Math.min(window.devicePixelRatio, 2);

//         const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
//         renderer.setSize(wCSS, hCSS);

//         const dpr = renderer.dpr;
//         const w = wCSS * dpr;
//         const h = hCSS * dpr;

//         uniforms.iResolution.value = [w, h];

//         const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
//         uniforms.rayPos.value = anchor;
//         uniforms.rayDir.value = dir;
//       };

//       const loop = (t: number) => {
//         if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
//           return;
//         }

//         uniforms.iTime.value = t * 0.001;

//         if (followMouse && mouseInfluence > 0.0) {
//           const smoothing = 0.92;

//           smoothMouseRef.current.x =
//             smoothMouseRef.current.x * smoothing +
//             mouseRef.current.x * (1 - smoothing);
//           smoothMouseRef.current.y =
//             smoothMouseRef.current.y * smoothing +
//             mouseRef.current.y * (1 - smoothing);

//           uniforms.mousePos.value = [
//             smoothMouseRef.current.x,
//             smoothMouseRef.current.y,
//           ];
//         }

//         try {
//           renderer.render({ scene: mesh });
//           animationIdRef.current = requestAnimationFrame(loop);
//         } catch (error) {
//           console.warn("WebGL rendering error:", error);
//           return;
//         }
//       };

//       window.addEventListener("resize", updatePlacement);
//       updatePlacement();
//       animationIdRef.current = requestAnimationFrame(loop);

//       cleanupFunctionRef.current = () => {
//         if (animationIdRef.current) {
//           cancelAnimationFrame(animationIdRef.current);
//           animationIdRef.current = null;
//         }

//         window.removeEventListener("resize", updatePlacement);

//         if (renderer) {
//           try {
//             const canvas = renderer.gl.canvas;
//             const loseContextExt =
//               renderer.gl.getExtension("WEBGL_lose_context");
//             if (loseContextExt) {
//               loseContextExt.loseContext();
//             }

//             if (canvas && canvas.parentNode) {
//               canvas.parentNode.removeChild(canvas);
//             }
//           } catch (error) {
//             console.warn("Error during WebGL cleanup:", error);
//           }
//         }

//         rendererRef.current = null;
//         uniformsRef.current = null;
//         meshRef.current = null;
//       };
//     };

//     initializeWebGL();

//     return () => {
//       if (cleanupFunctionRef.current) {
//         cleanupFunctionRef.current();
//         cleanupFunctionRef.current = null;
//       }
//     };
//   }, [
//     isVisible,
//     raysOrigin,
//     raysColor,
//     raysSpeed,
//     lightSpread,
//     rayLength,
//     pulsating,
//     fadeDistance,
//     saturation,
//     followMouse,
//     mouseInfluence,
//     noiseAmount,
//     distortion,
//   ]);

//   useEffect(() => {
//     if (!uniformsRef.current || !containerRef.current || !rendererRef.current)
//       return;

//     const u = uniformsRef.current;
//     const renderer = rendererRef.current;

//     u.raysColor.value = hexToRgb(raysColor);
//     u.raysSpeed.value = raysSpeed;
//     u.lightSpread.value = lightSpread;
//     u.rayLength.value = rayLength;
//     u.pulsating.value = pulsating ? 1.0 : 0.0;
//     u.fadeDistance.value = fadeDistance;
//     u.saturation.value = saturation;
//     u.mouseInfluence.value = mouseInfluence;
//     u.noiseAmount.value = noiseAmount;
//     u.distortion.value = distortion;

//     const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
//     const dpr = renderer.dpr;
//     const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
//     u.rayPos.value = anchor;
//     u.rayDir.value = dir;
//   }, [
//     raysColor,
//     raysSpeed,
//     lightSpread,
//     raysOrigin,
//     rayLength,
//     pulsating,
//     fadeDistance,
//     saturation,
//     mouseInfluence,
//     noiseAmount,
//     distortion,
//   ]);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (!containerRef.current || !rendererRef.current) return;
//       const rect = containerRef.current.getBoundingClientRect();
//       const x = (e.clientX - rect.left) / rect.width;
//       const y = (e.clientY - rect.top) / rect.height;
//       mouseRef.current = { x, y };
//     };

//     if (followMouse) {
//       window.addEventListener("mousemove", handleMouseMove);
//       return () => window.removeEventListener("mousemove", handleMouseMove);
//     }
//   }, [followMouse]);

//   return (
//     <div
//       ref={containerRef}
//       className={`w-full h-full pointer-events-none z-[3] overflow-hidden relative ${className}`.trim()}
//     />
//   );
// };

// export default LightRays;

"use client";
import React, { useEffect, useRef } from "react";

export interface LightRaysProps {
  /** 0–1 overall opacity of the effect */
  opacity?: number;
  /** CSS color used for each ray (you can pass rgba/hex/hsl) */
  rayColor?: string;
  /** number of beams rendered */
  beams?: number;
  /** how wide the beams spread (0–1) */
  spread?: number;
  /** animation speed (0 = static) */
  speed?: number;
  /** 0–1 blur multiplier */
  blurAmount?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Canvas-based light-rays background.
 * No `any` usage; fully typed so it passes `@typescript-eslint/no-explicit-any`.
 */
const LightRays: React.FC<LightRaysProps> = ({
  opacity = 0.9,
  rayColor = "#ffffff",
  beams = 6,
  spread = 0.7,
  speed = 0.2,
  blurAmount = 0.6,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const t0Ref = useRef<number>(0);

  // resize the canvas to the element size * DPR
  const resize = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const draw = (time: number): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // clear
    ctx.clearRect(0, 0, w, h);

    // composite & blur feel
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = "lighter";

    const centerX = w / 2;
    const topY = 0;
    const bottomY = h * (0.75 + 0.25 * spread);

    // dynamic rotation
    const elapsed = (time - t0Ref.current) * 0.001; // seconds
    const rotation = elapsed * (speed * 0.5); // radians/second scale

    // soft vignette background (very subtle)
    const gV = ctx.createRadialGradient(centerX, h * 0.2, 10, centerX, h * 0.2, Math.max(w, h));
    gV.addColorStop(0, "rgba(255,255,255,0.04)");
    gV.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gV;
    ctx.fillRect(0, 0, w, h);

    // beam params
    const count = Math.max(1, Math.floor(beams));
    const angleStep = (Math.PI * 2) / count;

    // blur with shadow (cheap but good-looking)
    ctx.shadowColor = rayColor;
    ctx.shadowBlur = Math.max(0, Math.min(80, (w + h) * 0.03 * blurAmount));

    for (let i = 0; i < count; i++) {
      const a = i * angleStep + rotation;
      const widthAtBottom = Math.max(40, w * 0.06 * spread); // in pixels

      ctx.save();
      ctx.translate(centerX, 0); // pivot at the top center
      ctx.rotate(a);

      // gradient per beam
      const g = ctx.createLinearGradient(0, topY, 0, bottomY);
      g.addColorStop(0.0, "rgba(255,255,255,0.0)");
      g.addColorStop(0.15, "rgba(255,255,255,0.12)");
      g.addColorStop(0.6, `${toRgba(rayColor, 0.24)}`);
      g.addColorStop(1.0, "rgba(255,255,255,0.0)");
      ctx.fillStyle = g;

      // trapezoid beam
      ctx.beginPath();
      ctx.moveTo(-widthAtBottom * 0.15, topY);
      ctx.lineTo(widthAtBottom * 0.15, topY);
      ctx.lineTo(widthAtBottom * 0.5, bottomY);
      ctx.lineTo(-widthAtBottom * 0.5, bottomY);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // reset for next frame
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;

    rafRef.current = window.requestAnimationFrame(draw);
  };

  useEffect(() => {
    t0Ref.current = performance.now();
    resize();
    const onResize = (): void => resize();
    window.addEventListener("resize", onResize);
    rafRef.current = window.requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opacity, rayColor, beams, spread, speed, blurAmount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        mixBlendMode: "screen",
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

/** turn any CSS color into rgba with a specific alpha (simple fallback for hex or rgb) */
function toRgba(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    // #rgb or #rrggbb
    const hex = color.replace("#", "");
    const parse = (s: string): number => parseInt(s, 16);
    if (hex.length === 3) {
      const r = parse(hex[0] + hex[0]);
      const g = parse(hex[1] + hex[1]);
      const b = parse(hex[2] + hex[2]);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (hex.length === 6) {
      const r = parse(hex.slice(0, 2));
      const g = parse(hex.slice(2, 4));
      const b = parse(hex.slice(4, 6));
      return `rgba(${r},${g},${b},${alpha})`;
    }
  }
  // assume it’s already a CSS color we can wrap
  return color.startsWith("rgba(")
    ? color.replace(/rgba\(([^)]+),\s*([0-9.]+)\)/, `rgba($1, ${alpha})`)
    : `rgba(255,255,255,${alpha})`;
}

export default LightRays;

