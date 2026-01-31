import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ChestTier, RewardType, REWARDS } from '@/config/chest';

interface Chest3DProps {
  tier: ChestTier;
  isOpening: boolean;
  isOpened: boolean;
  reward?: RewardType;
  onOpenComplete?: () => void;
}

export function Chest3D({ tier, isOpening, isOpened, reward, onOpenComplete }: Chest3DProps) {
  const chestRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  const [lidAngle, setLidAngle] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [particles, setParticles] = useState(false);

  const rewardConfig = reward ? REWARDS[reward] : null;

  useFrame((state, delta) => {
    if (!chestRef.current || !lidRef.current) return;

    // 开箱动画
    if (isOpening && !isOpened) {
      // 震动阶段
      if (lidAngle < 0.1) {
        setShakeIntensity(prev => Math.min(prev + delta * 2, 1));
        chestRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 30) * shakeIntensity * 0.05;
        chestRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 25) * shakeIntensity * 0.03;
        
        if (shakeIntensity >= 1) {
          setLidAngle(0.1);
          setParticles(true);
        }
      } 
      // 开盖阶段
      else if (lidAngle < Math.PI * 0.6) {
        setLidAngle(prev => {
          const newAngle = prev + delta * 3;
          if (newAngle >= Math.PI * 0.6) {
            onOpenComplete?.();
          }
          return Math.min(newAngle, Math.PI * 0.6);
        });
        chestRef.current.rotation.x = 0;
        chestRef.current.rotation.z = 0;
      }
    }

    // 应用盖子角度
    lidRef.current.rotation.x = -lidAngle;

    // 悬浮动画
    if (!isOpening) {
      chestRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      chestRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={chestRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        {/* 宝箱底座 */}
        <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.6, 1]} />
          <meshStandardMaterial 
            color={tier.metalColor} 
            metalness={0.8} 
            roughness={0.3}
          />
        </mesh>

        {/* 宝箱主体 */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[1.3, 0.7, 0.9]} />
          <meshStandardMaterial 
            color={tier.color} 
            metalness={0.6} 
            roughness={0.4}
          />
        </mesh>

        {/* 金属装饰条 */}
        {[-0.5, 0, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0.46]} castShadow>
            <boxGeometry args={[0.08, 0.65, 0.02]} />
            <meshStandardMaterial 
              color="#C9A347" 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* 宝箱盖子 */}
        <group position={[0, 0.4, -0.4]}>
          <mesh ref={lidRef} castShadow>
            <group position={[0, 0.2, 0.4]}>
              {/* 盖子主体 */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.35, 0.15, 0.95]} />
                <meshStandardMaterial 
                  color={tier.color} 
                  metalness={0.6} 
                  roughness={0.4}
                />
              </mesh>
              {/* 盖子弧形部分 */}
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 1.3, 32, 1, false, 0, Math.PI]} />
                <meshStandardMaterial 
                  color={tier.color} 
                  metalness={0.6} 
                  roughness={0.4}
                />
              </mesh>
              {/* 宝石装饰 */}
              <mesh position={[0, 0.3, 0.35]}>
                <octahedronGeometry args={[0.15]} />
                <meshStandardMaterial 
                  color={tier.gemColor} 
                  metalness={0.3} 
                  roughness={0.1}
                  emissive={tier.gemColor}
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          </mesh>
        </group>

        {/* 锁扣 */}
        <mesh position={[0, 0.1, 0.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial 
            color="#C9A347" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* 开箱粒子效果 */}
      {particles && (
        <Sparkles
          count={100}
          scale={3}
          size={6}
          speed={2}
          color={rewardConfig?.glowColor || tier.gemColor}
        />
      )}

      {/* 奖励光柱 */}
      {isOpened && reward && reward !== 'no_win' && (
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.3, 0.8, 3, 32, 1, true]} />
          <meshBasicMaterial
            color={rewardConfig?.color || '#FFD700'}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
