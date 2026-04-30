import { Outlet } from 'react-router-dom';
import FloatingLines from '../../shared/components/FloatingLines/FloatingLines';

// Constantes FUERA del componente para evitar re-renders del WebGL
const BG_WAVES = ["top", "middle", "bottom"];
const BG_GRADIENT = ["#a427e4", "#6f6f6f", "#6a6a6a"];

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a12] font-['Cormorant_Garamond','Playfair_Display',Georgia,serif]">
      <div className="absolute inset-0 z-0">
        <FloatingLines
          enabledWaves={BG_WAVES}
          lineCount={8}
          lineDistance={8}
          bendRadius={8}
          bendStrength={-2}
          interactive
          parallax={true}
          animationSpeed={1}
          linesGradient={BG_GRADIENT}
        />
      </div>
      <div className="relative z-10 w-[94%] max-w-[580px] animate-glassSlideUp">
        <Outlet />
      </div>
    </div>
  );
};
