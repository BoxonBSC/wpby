import { CrashGame } from '@/components/crash';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0f0c07]">
      <Navbar />
      <main className="pt-16">
        <CrashGame />
      </main>
    </div>
  );
};

export default Index;
