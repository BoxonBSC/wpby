import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Chest3D } from './Chest3D';
import { ChestTier, RewardType } from '@/config/chest';

interface ChestSceneProps {
  tier: ChestTier;
  isOpening: boolean;
  isOpened: boolean;
  reward?: RewardType;
  onOpenComplete?: () => void;
}

export function ChestScene({ tier, isOpening, isOpened, reward, onOpenComplete }: ChestSceneProps) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
        
        {/* 环境光 */}
        <ambientLight intensity={0.3} />
        
        {/* 主光源 */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {/* 补光 */}
        <pointLight position={[-3, 2, 0]} intensity={0.5} color="#C9A347" />
        <pointLight position={[3, 2, 0]} intensity={0.5} color="#C9A347" />
        
        {/* 底部反光 */}
        <spotLight
          position={[0, -2, 0]}
          angle={0.5}
          penumbra={1}
          intensity={0.3}
          color="#C9A347"
        />

        <Suspense fallback={null}>
          <Chest3D
            tier={tier}
            isOpening={isOpening}
            isOpened={isOpened}
            reward={reward}
            onOpenComplete={onOpenComplete}
          />
          
          {/* 地面阴影 */}
          <ContactShadows
            position={[0, -0.8, 0]}
            opacity={0.5}
            scale={5}
            blur={2}
            far={4}
          />
          
          {/* 环境贴图 */}
          <Environment preset="city" />
        </Suspense>

        {/* 控制器 - 仅在非开箱时允许旋转 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          enabled={!isOpening}
        />
      </Canvas>
    </div>
  );
}
