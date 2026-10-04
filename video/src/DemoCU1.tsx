// Video de respaldo de la demo en Neo4j: CU1 de punta a punta + dictámenes de CU2 y FR-07, 1920×1080 a 30 fps, sin audio.
// Todo lo que se ve del Browser son capturas reales grabadas por capturas/grabar.mjs (public/rec/).
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import manifiesto from '../public/rec/manifiesto.json';

const { fontFamily } = loadFont('normal', { weights: ['500', '700', '800'], subsets: ['latin', 'latin-ext'] });

const FPS = 30;
const ANCHO = 1920;
const ALTO_BROWSER = 990; // 2560×1320 de captura → 1920×990
const ALTO_ROTULO = 1080 - ALTO_BROWSER;
const TITULO = 3 * FPS;
const CIERRE = 3 * FPS;

const COLOR: Record<string, string> = { INT: '#38BDF8', MAT: '#F59E0B', MAN: '#C084FC', COM: '#CBD5E1' };
const FONDO = '#0B1020';

// Zoom sobre la última captura de los pasos de grafo: vista general → acercamiento al foco → vista general.
const ZOOM = { general: 40, acercar: 25, sostener: 75, alejar: 20, final: 20 };
const FRAMES_ZOOM = ZOOM.general + ZOOM.acercar + ZOOM.sostener + ZOOM.alejar + ZOOM.final;

type Captura = { archivo: string; frames: number };
type Foco = { indice: number; x: number; y: number; w: number; h: number };
type Paso = { id: string; sm: string; rotulo: string; capturas: Captura[]; foco?: Foco };
const PASOS = manifiesto.pasos as Paso[];

const framesCaptura = (paso: Paso, i: number) =>
  paso.foco && paso.foco.indice === i ? FRAMES_ZOOM : paso.capturas[i].frames;
const duracionPaso = (paso: Paso) => paso.capturas.reduce((s, _, i) => s + framesCaptura(paso, i), 0);

export const DURACION_TOTAL = TITULO + PASOS.reduce((s, p) => s + duracionPaso(p), 0) + CIERRE;

const suave = Easing.inOut(Easing.cubic);

const Grafo: React.FC<{ src: string; foco: Foco }> = ({ src, foco }) => {
  const f = useCurrentFrame();
  const escalaMax = Math.min(2.2, Math.max(1.3, Math.min(0.75 / foco.w, 0.75 / foco.h)));
  const t1 = ZOOM.general, t2 = t1 + ZOOM.acercar, t3 = t2 + ZOOM.sostener, t4 = t3 + ZOOM.alejar;
  const k = interpolate(f, [t1, t2, t3, t4], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: suave });
  const s = 1 + (escalaMax - 1) * k;
  const cx = (foco.x + foco.w / 2) * ANCHO;
  const cy = (foco.y + foco.h / 2) * ALTO_BROWSER;
  const tx = Math.min(0, Math.max(ANCHO - ANCHO * s, ANCHO / 2 - cx * s));
  const ty = Math.min(0, Math.max(ALTO_BROWSER - ALTO_BROWSER * s, ALTO_BROWSER / 2 - cy * s));
  return (
    <Img
      src={src}
      style={{ width: ANCHO, height: ALTO_BROWSER, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}
    />
  );
};

const PasoBrowser: React.FC<{ paso: Paso }> = ({ paso }) => {
  const f = useCurrentFrame();
  // captura que corresponde al frame actual
  let i = 0, inicio = 0;
  while (i < paso.capturas.length - 1 && f >= inicio + framesCaptura(paso, i)) { inicio += framesCaptura(paso, i); i++; }
  const src = staticFile(`rec/${paso.capturas[i].archivo}`);
  const color = COLOR[paso.sm];
  const entrada = interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: FONDO }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: ANCHO, height: ALTO_BROWSER, overflow: 'hidden' }}>
        {paso.foco && paso.foco.indice === i ? (
          <Sequence from={inicio} layout="none">
            <Grafo src={src} foco={paso.foco} />
          </Sequence>
        ) : (
          <Img src={src} style={{ width: ANCHO, height: ALTO_BROWSER }} />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: ALTO_ROTULO,
          background: FONDO,
          borderTop: `4px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '0 40px',
          fontFamily,
          opacity: entrada,
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 11, background: color, flexShrink: 0 }} />
        <div style={{ fontSize: 36, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{paso.rotulo}</div>
      </div>
    </AbsoluteFill>
  );
};

const Placa: React.FC<{ arriba: string; texto: string; abajo: string }> = ({ arriba, texto, abajo }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 8, 82, 90], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: FONDO, fontFamily, color: '#E8EDF7', justifyContent: 'center', padding: '0 140px' }}>
      <div style={{ opacity: op }}>
        <div style={{ fontSize: 30, color: '#93A0BC', fontWeight: 500, marginBottom: 22 }}>{arriba}</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.12 }}>{texto}</div>
        <div style={{ display: 'flex', gap: 14, margin: '38px 0 30px' }}>
          {[COLOR.INT, COLOR.MAT, COLOR.MAN].map((c) => (
            <div key={c} style={{ width: 150, height: 10, borderRadius: 5, background: c }} />
          ))}
        </div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{abajo}</div>
      </div>
    </AbsoluteFill>
  );
};

export const DemoCU1: React.FC = () => {
  let desde = TITULO;
  return (
    <AbsoluteFill style={{ backgroundColor: FONDO }}>
      <Sequence durationInFrames={TITULO}>
        <Placa
          arriba="Grupo 11 · UTN FRM · Inteligencia Artificial"
          texto="Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial"
          abajo="Demo en Neo4j: CU1 «Café Andino», CU2 y FR-07"
        />
      </Sequence>
      {PASOS.map((paso) => {
        const dur = duracionPaso(paso);
        const seq = (
          <Sequence key={paso.id} from={desde} durationInFrames={dur}>
            <PasoBrowser paso={paso} />
          </Sequence>
        );
        desde += dur;
        return seq;
      })}
      <Sequence from={desde} durationInFrames={CIERRE}>
        <Placa
          arriba="Neo4j 5.21 · consultas y resultados reales"
          texto="El sistema estructura, infiere, alerta y explica."
          abajo="La decisión la toma el fabricante."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
