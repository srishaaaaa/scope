import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useInView, usePageVisible, useQuality } from '../lib/hooks';

// One connected dark gallery for the hero: the model photograph stands on a plinth above a reflective floor, framed by
// two light slabs at different depths and lit by an ice-blue rim light. The camera follows the pointer and the page scroll;
// a slow light sweep crosses the panel. The scene colour matches the hero panel so it reads as part of the page.
const PH = 3.5, PD = 0.08, BG = '#12232C';

// Real photography when there is some (admin hero photo, else a product photo); otherwise a typographic brand panel is
// drawn on a canvas in the logo colours. The logo image is never used.
function usePanelTexture(src) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    let dead = false;
    const finish = t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; if (!dead) setTex(t) };
    const brand = () => {
      const c = document.createElement('canvas'); c.width = 800; c.height = 1000; const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 800, 1000); grad.addColorStop(0, '#0e1c23'); grad.addColorStop(0.6, '#1B3340'); grad.addColorStop(1, '#477E90');
      g.fillStyle = grad; g.fillRect(0, 0, 800, 1000);
      g.strokeStyle = 'rgba(127,174,195,.18)'; g.lineWidth = 1; for (let i = 0; i <= 800; i += 80) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1000); g.stroke() } for (let i = 0; i <= 1000; i += 80) { g.beginPath(); g.moveTo(0, i); g.lineTo(800, i); g.stroke() }
      g.fillStyle = '#fff'; g.font = '700 210px "Space Grotesk", Manrope, Arial, sans-serif'; g.fillText('SCOPE', 60, 560); g.fillText('13', 60, 760);
      g.fillStyle = '#7FAEC3'; g.font = '600 26px "Space Grotesk", Arial, sans-serif'; g.fillText('CONTEMPORARY MENSWEAR', 64, 900);
      finish(new THREE.CanvasTexture(c));
    };
    if (src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => finish(new THREE.Texture(img)); img.onerror = brand; img.src = src } else brand();
    return () => { dead = true };
  }, [src]);
  return tex;
}

function sweepTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 8; const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 128, 0); grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(0.5, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 8); return new THREE.CanvasTexture(c);
}

function Panel() {
  const map = usePanelTexture(Panel.src);
  const group = useRef(), sweep = useRef();
  const sweepMap = useMemo(sweepTexture, []);
  const aspect = map?.image?.width ? Math.max(0.55, Math.min(1.25, map.image.width / map.image.height)) : 0.8;
  const W = PH * aspect;
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#0b1318', roughness: 0.4, metalness: 0.7 });
    return [side, side, side, side, new THREE.MeshBasicMaterial({ map }), side];
  }, [map]);
  useFrame(({ clock, pointer }) => {
    const g = group.current; if (!g) return;
    g.rotation.y += ((-0.16 + pointer.x * 0.16) - g.rotation.y) * 0.05;
    g.rotation.x += ((-pointer.y * 0.05) - g.rotation.x) * 0.05;
    g.position.y = 2.15 + Math.sin(clock.elapsedTime * 0.7) * 0.035;
    if (sweep.current) sweep.current.position.x = Math.sin(clock.elapsedTime * 0.55) * (W / 2 - 0.4);
  });
  if (!map) return null;
  return (
    <group>
      <mesh position={[0, 0.16, 0]} receiveShadow><boxGeometry args={[W + 1.1, 0.32, 1.5]} /><meshStandardMaterial color="#0f1d25" roughness={0.35} metalness={0.6} /></mesh>
      <mesh position={[0, 0.335, 0]}><boxGeometry args={[W + 0.5, 0.02, 1.05]} /><meshStandardMaterial color="#7FAEC3" roughness={0.2} metalness={0.9} emissive="#2c5568" emissiveIntensity={0.6} /></mesh>
      <group ref={group} position={[0, 2.15, 0]}>
        <mesh material={mats}><boxGeometry args={[W, PH, PD]} /></mesh>
        <mesh ref={sweep} position={[0, 0, PD / 2 + 0.004]}><planeGeometry args={[0.8, PH]} /><meshBasicMaterial map={sweepMap} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      </group>
    </group>
  );
}

function Room({ low }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 40]} />
        {low
          ? <meshStandardMaterial color="#0f1d25" roughness={0.5} metalness={0.3} />
          : <MeshReflectorMaterial blur={[300, 80]} resolution={768} mixBlur={1} mixStrength={34} roughness={0.7} depthScale={0.9} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#0e1b22" metalness={0.5} mirror={0.8} />}
      </mesh>
      {/* light slabs at different depths */}
      <mesh position={[-4.4, 3.6, -3]}><boxGeometry args={[0.12, 7.2, 0.5]} /><meshBasicMaterial color="#7FAEC3" transparent opacity={0.5} /></mesh>
      <mesh position={[4.9, 3.6, -4.2]}><boxGeometry args={[0.1, 7.2, 0.5]} /><meshBasicMaterial color="#477E90" transparent opacity={0.55} /></mesh>
      <mesh position={[0, 4.2, -6]}><planeGeometry args={[30, 12]} /><meshBasicMaterial color="#16303b" /></mesh>
    </group>
  );
}

function Rig() {
  const { camera } = useThree();
  useFrame(({ pointer }) => {
    const p = Math.min(1, window.scrollY / 700);
    const tx = 0.4 + pointer.x * 0.6 + p * 0.5, ty = 1.9 + pointer.y * 0.28 + p * 0.5, tz = 8.4 - p * 1.6;
    camera.position.x += (tx - camera.position.x) * 0.06; camera.position.y += (ty - camera.position.y) * 0.06; camera.position.z += (tz - camera.position.z) * 0.06;
    camera.lookAt(0, 2.0, 0);
  });
  return null;
}

export default function HeroScene({ src, reduced }) {
  const q = useQuality();
  const ref = useRef();
  const inView = useInView(ref, { rootMargin: '60px' });
  const visible = usePageVisible();
  Panel.src = src;
  return (
    <div ref={ref} className="s13-h-canvas">
      <Canvas flat frameloop={reduced ? 'demand' : inView && visible ? 'always' : 'never'} dpr={q.dpr} camera={{ position: [0.4, 1.9, 8.4], fov: 32, near: 0.1, far: 60 }} gl={{ antialias: !q.low, powerPreference: 'high-performance' }}>
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 9, 24]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 3, -2.6]} intensity={16} distance={10} color="#7FAEC3" />
        <pointLight position={[-3, 1, 3]} intensity={5} distance={9} color="#477E90" />
        <Rig />
        <Room low={q.low} />
        <Panel />
      </Canvas>
    </div>
  );
}
