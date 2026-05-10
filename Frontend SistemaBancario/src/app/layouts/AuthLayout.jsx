import { Outlet } from 'react-router-dom';
import logo from '../../assets/logo.png';
import LightPillar from '../../shared/components/LightPillar/LightPillar';
import '../../styles/lumina-auth.css';

export const AuthLayout = () => {
  return (
    <main className="lumina-auth-shell">
      <section className="lumina-auth-left">
        <div className="lumina-auth-content">
          <Outlet />
        </div>
      </section>

      <aside className="lumina-auth-right" aria-hidden="true">
        <div className="lumina-visual">
          <LightPillar
            topColor="#EAB308"
            bottomColor="#A855F7"
            intensity={1}
            rotationSpeed={0.4}
            glowAmount={0.003}
            pillarWidth={3.6}
            pillarHeight={0.4}
            noiseIntensity={0.1}
            pillarRotation={17}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
        <img
          src={logo}
          alt=""
          className="lumina-logo-mark"
          draggable="false"
        />
      </aside>
    </main>
  );
};
