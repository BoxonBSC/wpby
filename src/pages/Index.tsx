import { ChestGame } from '@/components/chest';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0f0c07]">
      <Navbar />
      <main className="pt-16">
        <ChestGame />
      </main>
    </div>
  );
};

export default Index;
