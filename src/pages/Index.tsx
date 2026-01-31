import { HiLoGame } from '@/components/hilo';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0f0c07 0%, #0a0908 100%)',
      }}
    >
      <Navbar />
      <main className="pt-16">
        <HiLoGame />
      </main>
    </div>
  );
};

export default Index;
