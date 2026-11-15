import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, MeshReflectorMaterial } from '@react-three/drei';
import { useInView, usePageVisible, useQuality } from '../../lib/hooks';

// Real 3D showroom: white architecture, reflective floor, suspended geometry, spotlights and floating display panels.
// Panels are DOM cards placed in 3D (drei Html) so product images, price and keyboard focus keep working.
// They render in their own React root, so navigation is handed in as a plain callback (no router context needed).
export const ZONE_GAP = 9;

function Panel({ p, pos, go, inr }) {
  return (
    <group position={pos}>
      <Html transform distanceFactor={4.2} center zIndexRange={[10, 0]}>
        <button type="button" className="s13-sr-card" onClick={() => go(p)} aria-label={`${p.name}, ${inr}`}>
          <span className="s13-sr-img">{p.image ? <img src={p.image} alt="" draggable={false} loading="lazy" /> : <i>{p.name.slice(0, 1)}</i>}</span>
          <strong>{p.name}</strong><em>{inr}</em>
        </button>
      </Html>
    </group>
  );
}

function Zone({ i, zone, go, fmt }) {
  const x = i * ZONE_GAP;
  const ref = useRef();
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 0.6 + i) * 0.12 });
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 2.6, -3.2]}><boxGeometry args={[7.4, 5.2, 0.2]} /><meshStandardMaterial color="#FAFAFA" roughness={0.9} /></mesh>
      <mesh position={[0, 0.05, -2.2]}><boxGeometry args={[6.4, 0.1, 2]} /><meshStandardMaterial color="#F2F2F2" roughness={0.6} /></mesh>
      <mesh ref={ref} position={[0, 2.6, -3]}><torusGeometry args={[1.5, 0.012, 8, 96]} /><meshBasicMaterial color="#A9A9A9" /></mesh>
      <mesh position={[-3.5, 4.4, -1]} rotation={[0.4, 0.6, 0]}><octahedronGeometry args={[0.35]} /><meshStandardMaterial color="#D8D8D8" metalness={0.9} roughness={0.2} /></mesh>
      <mesh position={[3.5, 4.0, -1.4]} rotation={[0.2, 0.3, 0.5]}><icosahedronGeometry args={[0.3]} /><meshStandardMaterial color="#A9A9A9" metalness={0.9} roughness={0.25} /></mesh>
      <spotLight position={[0, 7, 2]} angle={0.6} penumbra={1} intensity={60} color="#ffffff" />
      <Html position={[0, 4.55, -3]} transform distanceFactor={4.2} center><div className="s13-sr-zone">{zone.name}</div></Html>
      {zone.items.slice(0, 3).map((p, k) => <Panel key={p.slug} p={p} pos={[(k - 1) * 2.2, 2 + (k === 1 ? 0.25 : 0), -1.6]} go={go} inr={fmt(p.price)} />)}
    </group>
  );
}

function Rig({ target }) {
  useFrame(({ camera, pointer }) => {
    const x = target * ZONE_GAP;
    camera.position.x += (x + pointer.x * 0.9 - camera.position.x) * 0.045;
    camera.position.y += (2.4 + pointer.y * 0.35 - camera.position.y) * 0.045;
    camera.lookAt(camera.position.x * 0.4 + x * 0.6, 2.3, -2);
  });
  return null;
}

export default function ShowroomScene({ zones, target, go, fmt, reduced }) {
  const ref = useRef();
  const inView = useInView(ref, { rootMargin: '100px' });
  const visible = usePageVisible();
  const q = useQuality();
  return (
    <div ref={ref} className="s13-sr-canvas">
      <Canvas frameloop={inView && visible ? 'always' : 'never'} dpr={q.dpr} camera={{ position: [0, 2.4, 6.5], fov: 50 }} gl={{ antialias: !q.low }}>
        <color attach="background" args={['#ffffff']} />
        <fog attach="fog" args={['#ffffff', 10, 30]} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 8, 5]} intensity={0.8} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ZONE_GAP, 0, 0]}>
          <planeGeometry args={[ZONE_GAP * 4, 24]} />
          {q.low || reduced ? <meshStandardMaterial color="#F2F2F2" roughness={0.5} /> : <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={14} roughness={0.9} depthScale={0.6} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#F5F5F5" metalness={0.2} mirror={0} />}
        </mesh>
        {zones.map((z, i) => <Zone key={z.name} i={i} zone={z} go={go} fmt={fmt} />)}
        <Rig target={target} />
      </Canvas>
    </div>
  );
}
