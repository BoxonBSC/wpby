import { PlinkoGame } from '@/components/plinko/PlinkoGame';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0f0c07]">
      <Navbar />
      <main className="pt-16">
        <PlinkoGame />
      </main>
    </div>
  );
};

export default Index;
