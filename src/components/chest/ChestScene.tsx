import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, ContactShadows, Center } from '@react-three/drei';
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
    <div className="w-full h-full min-h-[500px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 4.5]} fov={45} />
        
        {/* 环境光 */}
        <ambientLight intensity={0.4} />
        
        {/* 主光源 - 顶部 */}
        <directionalLight
          position={[3, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* 补光 - 金色氛围 */}
        <pointLight position={[-4, 3, 2]} intensity={0.8} color="#C9A347" />
        <pointLight position={[4, 3, 2]} intensity={0.8} color="#C9A347" />
        <pointLight position={[0, 2, 4]} intensity={0.5} color="#FFD700" />
        
        {/* 底部反光 */}
        <spotLight
          position={[0, -3, 0]}
          angle={0.6}
          penumbra={1}
          intensity={0.4}
          color="#C9A347"
        />

        {/* 后方光源 */}
        <pointLight position={[0, 2, -3]} intensity={0.3} color="#C9A347" />

        <Suspense fallback={null}>
          {/* 居中的宝箱 */}
          <Center>
            <Chest3D
              tier={tier}
              isOpening={isOpening}
              isOpened={isOpened}
              reward={reward}
              onOpenComplete={onOpenComplete}
            />
          </Center>
          
          {/* 地面阴影 */}
          <ContactShadows
            position={[0, -0.6, 0]}
            opacity={0.6}
            scale={8}
            blur={2.5}
            far={5}
            color="#000000"
          />
          
          {/* 环境贴图 */}
          <Environment preset="city" />
        </Suspense>

        {/* 控制器 */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          enabled={!isOpening}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
