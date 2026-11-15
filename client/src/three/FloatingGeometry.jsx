import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useInView, usePageVisible, useQuality } from '../lib/hooks';

// Slow-drifting silver wireframe geometry that leans toward the pointer. Renders only while on screen.
function Shapes({ reduced }) {
  const group = useRef();
  const items = useMemo(() => [
    { k: 'ico', p: [-3.2, 1.4, -1], s: 0.9 }, { k: 'oct', p: [3.4, -0.9, -2], s: 1.1 }, { k: 'torus', p: [2.2, 2.0, -3], s: 0.8 },
    { k: 'box', p: [-2.4, -1.8, -2], s: 0.7 }, { k: 'ring', p: [0.2, -0.2, -5], s: 2.4 },
  ], []);
  useFrame(({ pointer, clock }) => {
    if (!group.current) return;
    group.current.rotation.y += (pointer.x * 0.25 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-pointer.y * 0.15 - group.current.rotation.x) * 0.04;
    group.current.position.z = Math.sin(clock.elapsedTime * 0.2) * 0.2;
  });
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Float key={i} speed={reduced ? 0 : 0.8 + i * 0.15} rotationIntensity={reduced ? 0 : 0.8} floatIntensity={reduced ? 0 : 1.1} position={it.p}>
          <mesh scale={it.s}>
            {it.k === 'ico' && <icosahedronGeometry args={[1, 0]} />}
            {it.k === 'oct' && <octahedronGeometry args={[1, 0]} />}
            {it.k === 'torus' && <torusGeometry args={[1, 0.02, 8, 64]} />}
            {it.k === 'box' && <boxGeometry args={[1, 1, 1]} />}
            {it.k === 'ring' && <torusGeometry args={[1, 0.004, 6, 128]} />}
            <meshBasicMaterial color="#A9A9A9" wireframe transparent opacity={it.k === 'ring' ? 0.5 : 0.7} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function FloatingGeometry({ reduced = false, className = '' }) {
  const ref = useRef();
  const inView = useInView(ref, { rootMargin: '80px' });
  const visible = usePageVisible();
  const q = useQuality();
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <Canvas frameloop={reduced ? 'demand' : inView && visible ? 'always' : 'never'} dpr={q.dpr} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: !q.low, alpha: true }}>
        <Shapes reduced={reduced} />
      </Canvas>
    </div>
  );
}
