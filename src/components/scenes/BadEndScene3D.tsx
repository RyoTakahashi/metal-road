import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Metalhead } from '../../three/Metalhead';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

/** 雨（細い縦の筋が落ち続ける）。 */
function Rain({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 24,
        z: (Math.random() - 0.5) * 16 - 2,
        y: Math.random() * 14,
        speed: 8 + Math.random() * 6,
      })),
    [count],
  );
  useFrame((_, dt) => {
    drops.forEach((d, i) => {
      d.y -= d.speed * dt;
      if (d.y < 0) d.y += 14;
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.015, 0.6, 0.015]} />
      <meshBasicMaterial color="#3a4a6a" transparent opacity={0.5} />
    </instancedMesh>
  );
}

function LoneFigure() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = 0.12 + Math.sin(clock.elapsedTime * 0.8) * 0.02;
  });
  return (
    <group position={[0, 0, 0]}>
      <group ref={ref}>
        <Metalhead position={[0, 0, 0]} hair="#6a6a76" instrument="guitar" headbang={false} />
      </group>
    </group>
  );
}

function CamSway() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.15) * 0.8;
    camera.position.y = 1.8;
    camera.position.z = 5.5;
    camera.lookAt(0, 1.1, 0);
  });
  return null;
}

export function BadEndScene3D() {
  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 1.8, 5.5], fov: 46 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <color attach="background" args={['#06070d']} />
      <fog attach="fog" args={['#06070d', 6, 22]} />
      <ambientLight intensity={0.42} color="#3a4a6a" />
      <hemisphereLight intensity={0.3} color="#2a3550" groundColor="#04040a" />
      <directionalLight position={[2, 6, 4]} intensity={0.55} color="#8a9ac0" />
      <spotLight position={[0, 7, 3]} angle={0.45} penumbra={0.8} intensity={85} distance={18} color="#aac0e0" />
      <pointLight position={[0, 2, 3]} intensity={14} distance={10} color="#7a8ab0" />

      {/* 濡れた地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#0a0c14" roughness={0.3} metalness={0.5} />
      </mesh>

      <LoneFigure />
      <Rain />
      <CamSway />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur radius={0.5} />
        <Vignette eskil={false} offset={0.2} darkness={0.95} />
      </EffectComposer>
    </Canvas>
  );
}
