import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sparkles } from '@react-three/drei';
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
  const lidRef = useRef<THREE.Group>(null);
  const [lidAngle, setLidAngle] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [particles, setParticles] = useState(false);
  const [openCompleted, setOpenCompleted] = useState(false);

  const rewardConfig = reward ? REWARDS[reward] : null;

  useFrame((state, delta) => {
    if (!chestRef.current || !lidRef.current) return;

    // 开箱动画
    if (isOpening && !openCompleted) {
      // 震动阶段
      if (lidAngle < 0.1) {
        setShakeIntensity(prev => Math.min(prev + delta * 2.5, 1));
        chestRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 35) * shakeIntensity * 0.04;
        chestRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 30) * shakeIntensity * 0.025;
        
        if (shakeIntensity >= 1) {
          setLidAngle(0.1);
          setParticles(true);
        }
      } 
      // 开盖阶段
      else if (lidAngle < Math.PI * 0.75) {
        setLidAngle(prev => {
          const newAngle = prev + delta * 4;
          if (newAngle >= Math.PI * 0.75 && !openCompleted) {
            setOpenCompleted(true);
            onOpenComplete?.();
          }
          return Math.min(newAngle, Math.PI * 0.75);
        });
        chestRef.current.rotation.x = 0;
        chestRef.current.rotation.z = 0;
      }
    }

    // 应用盖子角度 - 从后边缘旋转
    lidRef.current.rotation.x = -lidAngle;

    // 悬浮动画
    if (!isOpening) {
      chestRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      chestRef.current.rotation.y += delta * 0.1;
    }
  });

  // 重置状态
  if (!isOpening && openCompleted) {
    setOpenCompleted(false);
    setLidAngle(0);
    setShakeIntensity(0);
    setParticles(false);
  }

  return (
    <group ref={chestRef} position={[0, 0, 0]}>
      {/* ========== 宝箱底部主体 ========== */}
      <group>
        {/* 主箱体 */}
        <RoundedBox args={[2, 1.1, 1.4]} radius={0.08} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial 
            color={tier.color} 
            metalness={0.85} 
            roughness={0.15}
          />
        </RoundedBox>

        {/* 底部金属边框 */}
        <mesh position={[0, -0.58, 0]} castShadow>
          <boxGeometry args={[2.1, 0.08, 1.5]} />
          <meshStandardMaterial color="#B8860B" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* 顶部金属边框 */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[2.1, 0.08, 1.5]} />
          <meshStandardMaterial color="#B8860B" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* 前面金属条装饰 */}
        {[-0.6, 0, 0.6].map((x, i) => (
          <mesh key={`front-bar-${i}`} position={[x, 0, 0.71]} castShadow>
            <boxGeometry args={[0.12, 1.15, 0.04]} />
            <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
          </mesh>
        ))}

        {/* 侧面金属条 */}
        {[-1.01, 1.01].map((x, i) => (
          <mesh key={`side-bar-${i}`} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 1.15, 0.12]} />
            <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
          </mesh>
        ))}

        {/* 角落铆钉 */}
        {[
          [-0.9, 0.45, 0.71], [0.9, 0.45, 0.71],
          [-0.9, -0.45, 0.71], [0.9, -0.45, 0.71],
          [-0.9, 0, 0.71], [0.9, 0, 0.71],
        ].map((pos, i) => (
          <mesh key={`rivet-${i}`} position={pos as [number, number, number]} castShadow>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.98} roughness={0.05} />
          </mesh>
        ))}

        {/* 中心宝石座 */}
        <mesh position={[0, 0, 0.72]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.08, 32]} />
          <meshStandardMaterial color="#B8860B" metalness={0.95} roughness={0.1} />
        </mesh>
        
        {/* 中心大宝石 */}
        <mesh position={[0, 0, 0.78]} castShadow>
          <dodecahedronGeometry args={[0.13]} />
          <meshStandardMaterial 
            color={tier.gemColor}
            metalness={0.2}
            roughness={0.05}
            emissive={tier.gemColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* ========== 宝箱盖子 ========== */}
      <group ref={lidRef} position={[0, 0.55, -0.7]}>
        <group position={[0, 0.3, 0.7]}>
          {/* 盖子主体 - 带弧度 */}
          <RoundedBox args={[2.05, 0.15, 1.45]} radius={0.05} smoothness={4} position={[0, 0, 0]} castShadow>
            <meshStandardMaterial color={tier.color} metalness={0.85} roughness={0.15} />
          </RoundedBox>

          {/* 弧形顶部 */}
          <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.7, 0.7, 2, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color={tier.color} metalness={0.85} roughness={0.15} />
          </mesh>

          {/* 弧形金属边 */}
          <mesh position={[0, 0.35, 0.73]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.68, 0.04, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
          </mesh>
          <mesh position={[0, 0.35, -0.73]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.68, 0.04, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
          </mesh>

          {/* 盖子金属条 */}
          {[-0.6, 0, 0.6].map((x, i) => (
            <group key={`lid-strip-${i}`}>
              <mesh position={[x, 0.08, 0.73]} castShadow>
                <boxGeometry args={[0.1, 0.08, 0.04]} />
                <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
              </mesh>
              <mesh position={[x, 0.5, 0.5]} castShadow>
                <boxGeometry args={[0.1, 0.08, 0.04]} />
                <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
              </mesh>
              <mesh position={[x, 0.68, 0]} castShadow>
                <boxGeometry args={[0.1, 0.08, 0.04]} />
                <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.08} />
              </mesh>
            </group>
          ))}

          {/* 顶部宝石装饰 */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.06, 32]} />
            <meshStandardMaterial color="#B8860B" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <octahedronGeometry args={[0.1]} />
            <meshStandardMaterial 
              color={tier.gemColor}
              metalness={0.2}
              roughness={0.05}
              emissive={tier.gemColor}
              emissiveIntensity={1}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      </group>

      {/* ========== 锁扣 ========== */}
      <group position={[0, 0.2, 0.75]}>
        {/* 锁扣底座 */}
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.3, 0.1]} />
          <meshStandardMaterial color="#B8860B" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* 锁扣环 */}
        <mesh position={[0, 0.18, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.08, 0.025, 8, 16]} />
          <meshStandardMaterial color="#FFD700" metalness={0.98} roughness={0.05} />
        </mesh>
        {/* 钥匙孔 */}
        <mesh position={[0, 0, 0.06]} castShadow>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ========== 特效 ========== */}
      {particles && (
        <>
          <Sparkles
            count={200}
            scale={5}
            size={10}
            speed={4}
            color={rewardConfig?.glowColor || tier.gemColor}
          />
          <Sparkles
            count={100}
            scale={4}
            size={6}
            speed={3}
            color="#FFD700"
          />
        </>
      )}

      {/* 奖励光柱 */}
      {isOpened && reward && reward !== 'no_win' && (
        <group position={[0, 2.5, 0]}>
          {/* 内层光柱 */}
          <mesh>
            <cylinderGeometry args={[0.3, 0.8, 5, 32, 1, true]} />
            <meshBasicMaterial
              color={rewardConfig?.color || '#FFD700'}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* 外层光晕 */}
          <mesh>
            <cylinderGeometry args={[0.6, 1.2, 5, 32, 1, true]} />
            <meshBasicMaterial
              color={rewardConfig?.color || '#FFD700'}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
