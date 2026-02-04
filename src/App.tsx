import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GoldParticles } from "@/components/GoldParticles";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { shouldShowMaintenance } from "@/config/maintenance";
import Index from "./pages/Index";
import History from "./pages/History";
import Rules from "./pages/Rules";
import ClaimGift from "./pages/ClaimGift";
import ChainGamePage from "./pages/ChainGamePage";
import NotFound from "./pages/NotFound";

// 初始化 Web3Modal
import "@/config/web3modal";

const queryClient = new QueryClient();

// 维护模式包装组件
function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [searchParams] = useSearchParams();

  // 检查是否显示维护页面
  if (shouldShowMaintenance(address, searchParams)) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
}

// 应用路由（需要在 BrowserRouter 内部使用 useSearchParams）
function AppRoutes() {
  return (
    <MaintenanceWrapper>
      <GoldParticles />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/history" element={<History />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/claim/:claimCode" element={<ClaimGift />} />
        <Route path="/chain-game" element={<ChainGamePage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MaintenanceWrapper>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <WalletProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AudioProvider>
      </WalletProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
