import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { Metalhead } from '../three/Metalhead';


/** スポットライト（色つき・首振り）＋ボリューム風の光円錐。 */
function MovingSpot({ x, color, swing, phase }: { x: number; color: string; swing: number; phase: number }) {
  const light = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const cone = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const tx = Math.sin(t * 0.6 + phase) * swing;
    if (target.current) target.current.position.set(tx, 0.6, 1.5);
    if (light.current) light.current.target = target.current!;
    if (cone.current) {
      cone.current.rotation.z = -Math.atan2(tx - x, 6) ;
      const m = cone.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.10 + Math.sin(t * 2 + phase) * 0.03;
    }
  });
  return (
    <group>
      <spotLight
        ref={light}
        position={[x, 6.2, 1.2]}
        angle={0.34}
        penumbra={0.6}
        intensity={140}
        distance={22}
        color={color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <object3D ref={target} position={[0, 0.6, 1.5]} />
      {/* 光の筋（加算ブレンド＋ブルームで光って見える） */}
      <mesh ref={cone} position={[x, 3.2, 1.2]}>
        <coneGeometry args={[1.5, 6, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** 観客（ローポリ・シルエット）。InstancedMesh でまとめてヘドバン。 */
function Crowd() {
  const COUNT = 60;
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: -8 + (i % 20) * 0.85 + (Math.random() - 0.5) * 0.3,
        z: 4.4 + Math.floor(i / 20) * 1.15,
        phase: Math.random() * Math.PI * 2,
        h: 1.0 + Math.random() * 0.5,
      })),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    data.forEach((d, i) => {
      const bob = Math.sin(t * 5 + d.phase) * 0.09;
      dummy.position.set(d.x, d.h / 2 + bob, d.z);
      dummy.scale.set(0.4, d.h, 0.4);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(d.x, d.h + 0.16 + bob, d.z);
      dummy.scale.set(0.42, 0.42, 0.42);
      dummy.updateMatrix();
      heads.current?.setMatrixAt(i, dummy.matrix);
    });
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#08080f" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, COUNT]} castShadow>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

/** 浮遊する光の粒（エンバー）。 */
function Embers() {
  const ref = useRef<THREE.Points>(null);
  const N = 120;
  const positions = useMemo(() => {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      a[i * 3] = (Math.random() - 0.5) * 18;
      a[i * 3 + 1] = Math.random() * 7;
      a[i * 3 + 2] = (Math.random() - 0.5) * 10 + 2;
    }
    return a;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.02;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += 0.004;
      if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={N} />
      </bufferGeometry>
      <pointsMaterial color="#ffb34a" size={0.07} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/** カメラのゆっくりしたドリー＋手持ち風の揺れ。 */
function CameraRig() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.18) * 1.6;
    camera.position.y = 2.2 + Math.sin(t * 0.5) * 0.1;
    camera.position.z = 7.4 + Math.sin(t * 0.12) * 0.5;
    camera.lookAt(0, 1.5, -0.2);
  });
  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#04040a']} />
      <fog attach="fog" args={['#06060f', 10, 30]} />

      <ambientLight intensity={0.22} color="#3a3a55" />
      <hemisphereLight intensity={0.26} color="#3a3a66" groundColor="#000000" />
      {/* キーライト（弱め・暖色） */}
      <directionalLight position={[0, 8, 6]} intensity={0.4} color="#ffd2a0" />
      {/* バンド用フロントフィル（主役を見せる。白飛びしない程度） */}
      <pointLight position={[0, 2.8, 5]} intensity={34} distance={15} decay={2} color="#ffe7cf" />
      {/* バンド用キーのスポット（原点＝バンド中心を照らす） */}
      <spotLight position={[0, 7, 5]} angle={0.55} penumbra={0.8} intensity={140} distance={22} color="#fff2e0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* バックのリムライト（バンドを背景から浮かせる） */}
      <pointLight position={[0, 3, -2.6]} intensity={40} distance={12} decay={2} color="#ff2a4a" />

      <MovingSpot x={-3.2} color="#ff2238" swing={3} phase={0} />
      <MovingSpot x={3.2} color="#9b5cff" swing={3} phase={2.1} />
      <MovingSpot x={0} color="#5aa0ff" swing={2} phase={4.0} />

      {/* ステージ床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0c0c14" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* ステージ前縁の赤ライン */}
      <mesh position={[0, 0.02, 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 0.16]} />
        <meshBasicMaterial color="#ff2238" toneMapped={false} />
      </mesh>

      {/* バックの壁＋トラス */}
      <mesh position={[0, 4, -3.5]} receiveShadow>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#0a0a12" roughness={1} />
      </mesh>
      {[-5, -2.5, 0, 2.5, 5].map((x) => (
        <mesh key={x} position={[x, 4.2, -3.2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 7, 6]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* LEDバナー */}
      <mesh position={[0, 6.6, -3.1]}>
        <planeGeometry args={[7, 1.1]} />
        <meshBasicMaterial color="#1a0408" toneMapped={false} />
      </mesh>

      {/* アンプ */}
      {[-4.3, 4.3].map((x) => (
        <mesh key={x} position={[x, 0.7, -1]} castShadow>
          <boxGeometry args={[1.6, 1.4, 1]} />
          <meshStandardMaterial color="#15151c" flatShading roughness={0.8} />
        </mesh>
      ))}

      {/* バンド（主役なので少し前＆大きめ） */}
      <group position={[0, 0, 0.6]} scale={1.15}>
        <Metalhead position={[-2.1, 0, -0.6]} hair="#9b5cff" instrument="guitar" phase={0.5} />
        <Metalhead position={[0, 0, 0.3]} hair="#d11a35" instrument="vocal" phase={0} />
        <Metalhead position={[2.1, 0, -0.6]} hair="#2bb6a8" instrument="bass" phase={1.1} />
      </group>

      <Crowd />
      <Embers />
      <CameraRig />

      <EffectComposer multisampling={0}>
        <SMAA />
        <Bloom intensity={1.3} luminanceThreshold={0.35} luminanceSmoothing={0.85} mipmapBlur radius={0.7} />
        <ChromaticAberration offset={new THREE.Vector2(0.0009, 0.0012)} radialModulation={false} modulationOffset={0} />
        <Vignette eskil={false} offset={0.25} darkness={0.95} />
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.35} />
      </EffectComposer>
    </>
  );
}

/** PS2級フル3Dの縦スライス：ライブステージ。 */
export function LiveStageScene3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 2.6, 9.5], fov: 42 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Scene />
    </Canvas>
  );
}
