import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useQuality } from '../lib/hooks';

// One connected gallery scene: a white room with a reflective floor, a plinth carrying the campaign panel, and two
// architectural slabs at different depths. A single key light follows the pointer and casts the real shadows.
// The camera responds to the pointer and to scroll progress (0 at the top of the page, 1 once the hero has left).
const PH = 3.4, PD = 0.08;

// The panel carries real photography when there is some (admin hero photo, else the first product photo). Otherwise a
// typographic panel in the brand colours is drawn on a canvas. The logo image is never used here.
function usePanelTexture(src) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    let dead = false;
    const finish = t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; if (!dead) setTex(t) };
    const brand = () => {
      const c = document.createElement('canvas'); c.width = 800; c.height = 1000; const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 800, 1000); grad.addColorStop(0, '#12232C'); grad.addColorStop(0.6, '#1B3340'); grad.addColorStop(1, '#477E90');
      g.fillStyle = grad; g.fillRect(0, 0, 800, 1000);
      g.strokeStyle = 'rgba(127,174,195,.18)'; g.lineWidth = 1; for (let i = 0; i <= 800; i += 80) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1000); g.stroke() } for (let i = 0; i <= 1000; i += 80) { g.beginPath(); g.moveTo(0, i); g.lineTo(800, i); g.stroke() }
      g.fillStyle = '#fff'; g.font = '700 210px "Space Grotesk", Manrope, Arial, sans-serif'; g.textBaseline = 'alphabetic'; g.fillText('SCOPE', 60, 560); g.fillText('13', 60, 760);
      g.fillStyle = '#7FAEC3'; g.font = '600 26px "Space Grotesk", Arial, sans-serif'; g.fillText('CONTEMPORARY MENSWEAR', 64, 900);
      finish(new THREE.CanvasTexture(c));
    };
    if (src) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => finish(new THREE.Texture(img)); img.onerror = brand; img.src = src } else brand();
    return () => { dead = true };
  }, [src]);
  return tex;
}

function Poster({ shift, src }) {
  const map = usePanelTexture(src);
  const ref = useRef();
  const aspect = map?.image?.width ? Math.max(0.55, Math.min(1.2, map.image.width / map.image.height)) : 0.8;
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5, metalness: 0.4 });
    return [side, side, side, side, new THREE.MeshBasicMaterial({ map }), side];
  }, [map]);
  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    ref.current.rotation.y += ((-0.14 + pointer.x * 0.1) - ref.current.rotation.y) * 0.05;
    ref.current.position.y = 2.0 + Math.sin(clock.elapsedTime * 0.7) * 0.03;
  });
  return (
    <group position={[shift, 0, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow><boxGeometry args={[Math.max(3.4, PH * aspect + 0.9), 0.3, 1.5]} /><meshStandardMaterial color="#F4F4F4" roughness={0.6} /></mesh>
      <mesh position={[0, 0.31, 0]} receiveShadow><boxGeometry args={[Math.max(2.8, PH * aspect + 0.3), 0.02, 1.0]} /><meshStandardMaterial color="#DCDCDC" roughness={0.3} metalness={0.6} /></mesh>
      {map && <mesh ref={ref} position={[0, 2.0, 0]} castShadow material={mats}><boxGeometry args={[PH * aspect, PH, PD]} /></mesh>}
    </group>
  );
}

function Room({ low }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        {low
          ? <meshStandardMaterial color="#F4F4F4" roughness={0.7} />
          : <MeshReflectorMaterial blur={[400, 100]} resolution={768} mixBlur={1} mixStrength={18} roughness={0.85} depthScale={0.8} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#F2F2F2" metalness={0.15} mirror={0} />}
      </mesh>
      <mesh position={[0, 5, -6]} receiveShadow><planeGeometry args={[60, 14]} /><meshStandardMaterial color="#FAFAFA" roughness={0.95} /></mesh>
      {/* architectural slabs at different depths */}
      <mesh position={[-4.6, 4, -3.2]} castShadow receiveShadow><boxGeometry args={[1.1, 8, 1.1]} /><meshStandardMaterial color="#EFEFEF" roughness={0.9} /></mesh>
      <mesh position={[7.4, 4, -4.2]} castShadow receiveShadow><boxGeometry args={[3.2, 8, 0.5]} /><meshStandardMaterial color="#E9E9E9" roughness={0.9} /></mesh>
      <mesh position={[0.5, 7.4, -5.4]} castShadow receiveShadow><boxGeometry args={[18, 0.35, 1.2]} /><meshStandardMaterial color="#F4F4F4" roughness={0.9} /></mesh>
    </group>
  );
}

function Rig({ progress, shift }) {
  const light = useRef();
  const { camera, scene } = useThree();
  useFrame(({ pointer }) => {
    const p = progress.current;
    const tx = 0.5 + pointer.x * 0.55 + p * 0.8, ty = 1.9 + pointer.y * 0.25 + p * 0.7, tz = 8.2 - p * 2.4;
    camera.position.x += (tx - camera.position.x) * 0.06; camera.position.y += (ty - camera.position.y) * 0.06; camera.position.z += (tz - camera.position.z) * 0.06;
    camera.lookAt(shift * 0.55, 2.0 + p * 0.2, 0);
    if (light.current) { light.current.position.x += ((pointer.x * 4 - 3) - light.current.position.x) * 0.05; light.current.position.y = 8 + pointer.y * 1.5 }
    scene.fog.near = 12 - p * 2;
  });
  return <directionalLight ref={light} position={[-3, 8, 6]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-4} shadow-camera-far={30} shadow-bias={-0.0004} />;
}

function Scene({ progress, src }) {
  const q = useQuality();
  const aspect = useThree(s => s.size.width / s.size.height);
  const halfW = Math.tan((32 * Math.PI) / 360) * 8.2 * aspect;
  const shift = Math.max(1.2, Math.min(halfW * 0.62, 3.2));
  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <fog attach="fog" args={['#ffffff', 12, 30]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#ffffff', '#DCDCDC', 0.5]} />
      <Rig progress={progress} shift={shift} />
      <Room low={q.low} />
      <Poster shift={shift} src={src} />
      <ContactShadows position={[shift, 0.012, 0]} opacity={0.35} scale={9} blur={2.6} far={2.5} />
    </>
  );
}

export default function HeroScene({ progress, active, reduced, src }) {
  const q = useQuality();
  return (
    <Canvas flat shadows frameloop={reduced ? 'demand' : active ? 'always' : 'never'} dpr={q.dpr} camera={{ position: [0.5, 1.9, 8.2], fov: 32, near: 0.1, far: 60 }} gl={{ antialias: !q.low, powerPreference: 'high-performance' }}>
      <Scene progress={progress} src={src} />
    </Canvas>
  );
}
