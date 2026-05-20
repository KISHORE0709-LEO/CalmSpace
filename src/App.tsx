import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import About from "./pages/About.tsx";
import Feelings from "./pages/app/Feelings.tsx";
import Mitra from "./pages/app/Mitra.tsx";
import SocialPractice from "./pages/app/SocialPractice.tsx";
import Caregiver from "./pages/app/Caregiver.tsx";
import CheckIns from "./pages/app/CheckIns.tsx";
import Alerts from "./pages/app/Alerts.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/app/feelings" element={<Feelings />} />
          <Route path="/app/mitra" element={<Mitra />} />
          <Route path="/app/social" element={<SocialPractice />} />
          <Route path="/app/caregiver" element={<Caregiver />} />
          <Route path="/app/checkins" element={<CheckIns />} />
          <Route path="/app/alerts" element={<Alerts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
