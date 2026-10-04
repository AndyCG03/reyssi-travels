import React from 'react';
import {
  AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

// Paleta y tipografía del sitio.
const C = {
  rey: '#1C87C9', oscuro: '#0B2A4A', noche: '#071B30', cielo: '#8BD4F4', sol: '#FFB547', blanco: '#FFFFFF',
};
const fontCss = `
@font-face{font-family:'League Spartan';font-weight:400;src:url(${staticFile('league-spartan-latin-400-normal.woff2')}) format('woff2');}
@font-face{font-family:'League Spartan';font-weight:700;src:url(${staticFile('league-spartan-latin-700-normal.woff2')}) format('woff2');}
@font-face{font-family:'League Spartan';font-weight:800;src:url(${staticFile('league-spartan-latin-800-normal.woff2')}) format('woff2');}`;
const font = "'League Spartan', sans-serif";

const useIn = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 200}});
};

const Rise: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay = 0, children, style}) => {
  const p = useIn(delay);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * 60}px)`, ...style}}>{children}</div>;
};

const Eyebrow: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.cielo}) => (
  <div style={{fontSize: 34, fontWeight: 700, letterSpacing: 8, textTransform: 'uppercase', color}}>{children}</div>
);

const PhotoBg: React.FC<{dim?: number}> = ({dim = 0.75}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 150], [1.18, 1.02], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Img src={staticFile('Hero.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />
      <AbsoluteFill style={{background: `linear-gradient(to bottom, rgba(7,27,48,${dim}) 0%, rgba(7,27,48,${dim - 0.2}) 45%, rgba(7,27,48,.95) 100%)`}} />
    </AbsoluteFill>
  );
};

/* 1. Presentación */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const logo = useIn(4);
  return (
    <AbsoluteFill>
      <PhotoBg dim={0.55} />
      <AbsoluteFill style={{padding: '0 90px 260px', justifyContent: 'flex-end', color: C.blanco}}>
        <Img src={staticFile('logo-blanco.png')} style={{width: 360, opacity: logo, transform: `scale(${0.9 + logo * 0.1})`, marginBottom: 70}} />
        <Rise delay={14}><div style={{fontSize: 132, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4}}>Viajes que se convierten en</div></Rise>
        <Rise delay={22}><div style={{fontSize: 132, fontWeight: 800, lineHeight: 1.05, letterSpacing: -4, color: C.sol}}>historias.</div></Rise>
        <Rise delay={34} style={{marginTop: 36}}>
          <div style={{fontSize: 46, lineHeight: 1.35, opacity: 0.9}}>Diseñamos experiencias únicas para viajeros que buscan más que un destino, buscan recuerdos.</div>
        </Rise>
        <div style={{height: 6, marginTop: 60, background: C.rey, width: interpolate(f, [30, 110], [0, 900], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 2. Por qué confiar */
const trust = [
  ['Atención personalizada', 'Te acompañamos antes, durante y después de tu viaje.'],
  ['Pagos seguros', 'Tus pagos están protegidos y respaldados.'],
  ['Asistencia 24/7', 'Estamos contigo en todo momento de tu viaje.'],
  ['Viajes a tu medida', 'Itinerarios diseñados según tus sueños y necesidades.'],
];
const Trust: React.FC = () => (
  <AbsoluteFill style={{background: C.noche, color: C.blanco, padding: '200px 90px', justifyContent: 'center'}}>
    <Rise><Eyebrow>Viaja tranquilo</Eyebrow></Rise>
    <Rise delay={6}><div style={{fontSize: 104, fontWeight: 800, lineHeight: 1, letterSpacing: -3, margin: '24px 0 70px'}}>¿Por qué confiar en nosotros?</div></Rise>
    {trust.map(([t, d], i) => (
      <Rise key={t} delay={16 + i * 9} style={{display: 'flex', gap: 36, alignItems: 'flex-start', padding: '34px 0', borderTop: '2px solid rgba(255,255,255,.12)'}}>
        <div style={{width: 22, height: 22, borderRadius: 99, background: C.sol, marginTop: 18, flex: 'none'}} />
        <div>
          <div style={{fontSize: 56, fontWeight: 700}}>{t}</div>
          <div style={{fontSize: 40, opacity: 0.75, marginTop: 8, lineHeight: 1.3}}>{d}</div>
        </div>
      </Rise>
    ))}
  </AbsoluteFill>
);

/* 3. Destinos */
const destinos = ['Europa', 'Turquía', 'Dubái', 'Japón', 'Corea', 'China', 'Canadá', 'Sudamérica', 'Cuba y Caribe', 'Cruceros'];
const Destinos: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.oscuro, color: C.blanco, justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{padding: '0 90px'}}>
        <Rise><Eyebrow>Paquetes a todo el mundo</Eyebrow></Rise>
        <Rise delay={6}><div style={{fontSize: 104, fontWeight: 800, lineHeight: 1, letterSpacing: -3, margin: '24px 0 80px'}}>¿A dónde quieres ir?</div></Rise>
      </div>
      {[0, 1, 2].map(row => {
        const list = [...destinos.slice(row * 3), ...destinos.slice(0, row * 3), ...destinos];
        const dir = row % 2 ? 1 : -1;
        const x = dir * f * (5 + row) - (row % 2 ? 1400 : 0);
        return (
          <div key={row} style={{display: 'flex', gap: 28, transform: `translateX(${x}px)`, marginBottom: 28, whiteSpace: 'nowrap'}}>
            {list.map((d, i) => (
              <div key={i} style={{fontSize: 70, fontWeight: 800, padding: '26px 48px', borderRadius: 999,
                background: (i + row) % 3 === 0 ? C.rey : 'rgba(255,255,255,.08)', border: '2px solid rgba(255,255,255,.14)'}}>{d}</div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 4. Cómo reservar */
const pasos = [
  ['Explora los paquetes', 'Entra a reyssitravels.com/viajes y filtra por región: Europa, Asia, Medio Oriente, Caribe y más.'],
  ['Elige tu viaje', 'Revisa itinerario, fechas y precio del paquete que te guste.'],
  ['Escríbenos', 'Por WhatsApp o con el formulario de contacto. Te respondemos en menos de 24 horas.'],
  ['Confirma y viaja', 'Confirmamos disponibilidad, recibes tu cotización y pagas de forma segura.'],
];
const Reservar: React.FC = () => {
  const f = useCurrentFrame();
  const active = Math.min(3, Math.max(0, Math.floor((f - 20) / 45)));
  return (
    <AbsoluteFill style={{background: '#F7F9FB', color: C.oscuro, padding: '180px 90px', justifyContent: 'center'}}>
      <Rise><Eyebrow color={C.rey}>Así de fácil</Eyebrow></Rise>
      <Rise delay={6}><div style={{fontSize: 104, fontWeight: 800, lineHeight: 1, letterSpacing: -3, margin: '24px 0 70px'}}>Cómo reservar tu paquete</div></Rise>
      <div style={{position: 'relative'}}>
        <div style={{position: 'absolute', left: 47, top: 40, bottom: 40, width: 4, background: '#E4E9EE'}} />
        <div style={{position: 'absolute', left: 47, top: 40, width: 4, background: C.rey,
          height: interpolate(f, [20, 200], [0, 1100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
        {pasos.map(([t, d], i) => (
          <Rise key={t} delay={20 + i * 45} style={{display: 'flex', gap: 44, alignItems: 'flex-start', marginBottom: 56, position: 'relative'}}>
            <div style={{width: 98, height: 98, borderRadius: 99, flex: 'none', display: 'grid', placeItems: 'center',
              fontSize: 50, fontWeight: 800, color: C.blanco, background: i <= active ? C.rey : '#B8C4CF',
              boxShadow: i === active ? '0 0 0 14px rgba(28,135,201,.18)' : 'none'}}>{i + 1}</div>
            <div style={{paddingTop: 6}}>
              <div style={{fontSize: 58, fontWeight: 700}}>{t}</div>
              <div style={{fontSize: 40, lineHeight: 1.3, color: '#4B5563', marginTop: 8}}>{d}</div>
            </div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* 5. Socios y respaldo */
const logos = ['aeromexico', 'iberia', 'turkishairlines', 'unitedairlines', 'americanairlines', 'britishairways', 'delta', 'ana', 'expedia'];
const nombres = ['Mega Travel', 'Euro Mundo', 'Viva Aerobus', 'Air Europa', 'WestJet', 'Assist Card', 'Hertz', 'Enterprise', 'Alamo'];
const Socios: React.FC = () => (
  <AbsoluteFill style={{background: C.noche, color: C.blanco, padding: '200px 90px', justifyContent: 'center'}}>
    <Rise><Eyebrow>Socios comerciales</Eyebrow></Rise>
    <Rise delay={6}><div style={{fontSize: 104, fontWeight: 800, lineHeight: 1, letterSpacing: -3, margin: '24px 0 70px'}}>Viajamos con los mejores</div></Rise>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28}}>
      {logos.map((l, i) => (
        <Rise key={l} delay={14 + i * 3} style={{height: 170, borderRadius: 28, background: 'rgba(255,255,255,.06)', display: 'grid', placeItems: 'center'}}>
          <Img src={staticFile(`${l}.svg`)} style={{width: 92, height: 92, filter: 'invert(1)'}} />
        </Rise>
      ))}
    </div>
    <Rise delay={46} style={{marginTop: 44, fontSize: 38, lineHeight: 1.5, opacity: 0.75}}>{nombres.join(' · ')}</Rise>
    <Rise delay={60} style={{marginTop: 70, padding: '34px 40px', borderLeft: `6px solid ${C.sol}`, background: 'rgba(255,255,255,.05)'}}>
      <div style={{fontSize: 34, opacity: 0.75}}>Agencia de viajes inscrita en el</div>
      <div style={{fontSize: 48, fontWeight: 700, marginTop: 6}}>Registro Nacional de Turismo</div>
      <div style={{fontSize: 44, color: C.sol, fontWeight: 700, marginTop: 6}}>No. 04090051209f</div>
    </Rise>
  </AbsoluteFill>
);

/* 6. Llamado a la acción */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 6) * 0.025;
  return (
    <AbsoluteFill>
      <PhotoBg dim={0.8} />
      <AbsoluteFill style={{padding: '0 90px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: C.blanco}}>
        <Rise><Img src={staticFile('logo-blanco.png')} style={{width: 380}} /></Rise>
        <Rise delay={8} style={{margin: '70px 0 40px'}}>
          <div style={{fontSize: 108, fontWeight: 800, lineHeight: 1, letterSpacing: -3}}>Tu próxima aventura empieza hoy</div>
        </Rise>
        <Rise delay={18}>
          <div style={{transform: `scale(${pulse})`, background: C.rey, borderRadius: 999, padding: '40px 70px', fontSize: 56, fontWeight: 700, boxShadow: '0 20px 60px rgba(28,135,201,.5)'}}>
            WhatsApp +52 55 1484 6761
          </div>
        </Rise>
        <Rise delay={28} style={{marginTop: 50, fontSize: 52, fontWeight: 700}}>reyssitravels.com</Rise>
        <Rise delay={34} style={{marginTop: 16, fontSize: 38, opacity: 0.8}}>reservas@reyssitravels.com · @reyssi.travels</Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Duraciones (frames a 30 fps) con fundido entre escenas.
const scenes: [React.FC, number][] = [[Intro, 150], [Trust, 150], [Destinos, 120], [Reservar, 240], [Socios, 165], [Cta, 150]];
const FADE = 12;
export const REEL_FRAMES = scenes.reduce((a, [, d]) => a + d, 0) - FADE * (scenes.length - 1);

const Fade: React.FC<{d: number; first: boolean; children: React.ReactNode}> = ({d, first, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, FADE, d - FADE, d], [first ? 1 : 0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const Reel: React.FC = () => {
  let start = 0;
  return (
    <AbsoluteFill style={{background: C.noche, fontFamily: font}}>
      <style>{fontCss}</style>
      {scenes.map(([S, d], i) => {
        const from = start;
        start += d - FADE;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <Fade d={d} first={i === 0}><S /></Fade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
