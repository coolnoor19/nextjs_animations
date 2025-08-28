

import LightRays from "@/backgrounds/LightRays/LightRays";
import Particles from "@/backgrounds/Particles/Particles";
import BentoGlowingGrid from "@/components/own/BentoGlowingGrid";
import ContainerScrollAnimation from "@/components/own/ContainerScrollAnimation";
import CoverDemo from "@/components/own/CoverDemo";


export default function Home() {
  return (
   <div className="bg-slate-600 min-h-screen flex flex-col items-center justify-center p-4">
     {/* BACKGROUND LAYERS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 1) base dark gradient (lowest) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#0b0813]/20 to-[#0b0813]/60" />

        {/* 2) particles (middle) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        {/* 3) LIGHT RAYS (TOP) */}
        {/* Wrap to control stacking and blending – many builds of LightRays use negative z
           internally, so the wrapper guarantees it sits above the others. */}
        <div className="absolute inset-0 z-30 pointer-events-none mix-blend-screen">
          <LightRays
          />

          {/* opacity={0.95}
            rayColor="#ffffff"
            beams={6}
            spread={0.7}
            speed={0.22}
            blurAmount={0.8} this is going to add in the LightRays component */}
        </div>
      </div>
    <BentoGlowingGrid/>
    
    <ContainerScrollAnimation/>
    <CoverDemo/>
   </div>
  );
}
 

