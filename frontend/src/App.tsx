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
import { AuthProvider } from "./contexts/AuthContext.tsx";
// Parent Pages
import ParentCareCircle from "./pages/parent/CareCircle.tsx";
import ParentChat from "./pages/parent/Chat.tsx";
import ParentEmotionalTrend from "./pages/parent/EmotionalTrend.tsx";
import ParentCrisisAlerts from "./pages/parent/CrisisAlerts.tsx";
import ParentSessionReports from "./pages/parent/SessionReports.tsx";
import ParentSocialConfidence from "./pages/parent/SocialConfidence.tsx";
import ParentHistory from "./pages/parent/History.tsx";

// Caregiver Pages
import CaregiverChat from "./pages/caregiver/Chat.tsx";
import CaregiverLiveEmotion from "./pages/caregiver/LiveEmotion.tsx";
import CaregiverAssignedTasks from "./pages/caregiver/AssignedTasks.tsx";
import CaregiverIncidentLogging from "./pages/caregiver/IncidentLogging.tsx";
import CaregiverHandoffNotes from "./pages/caregiver/HandoffNotes.tsx";

// Doctor Pages
import DoctorChat from "./pages/doctor/Chat.tsx";
import DoctorPatients from "./pages/doctor/Patients.tsx";
import PatientInfo from "./pages/doctor/PatientInfo.tsx";
import PatientAnalytics from "./pages/doctor/PatientAnalytics.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          
          {/* Child App Routes */}
          <Route path="/app/feelings" element={<Feelings />} />
          <Route path="/app/mitra" element={<Mitra />} />
          <Route path="/app/social" element={<SocialPractice />} />
          <Route path="/app/caregiver" element={<Caregiver />} />
          <Route path="/app/checkins" element={<CheckIns />} />
          <Route path="/app/alerts" element={<Alerts />} />
          
          {/* Parent Routes */}
          <Route path="/parent/care-circle" element={<ParentCareCircle />} />
          <Route path="/parent/chat" element={<ParentChat />} />
          <Route path="/parent/emotional-trend" element={<ParentEmotionalTrend />} />
          <Route path="/parent/crisis-alerts" element={<ParentCrisisAlerts />} />
          <Route path="/parent/session-reports" element={<ParentSessionReports />} />
          <Route path="/parent/social-confidence" element={<ParentSocialConfidence />} />
          <Route path="/parent/history" element={<ParentHistory />} />
          
          {/* Caregiver Routes */}
          <Route path="/caregiver/chat" element={<CaregiverChat />} />
          <Route path="/caregiver/live-emotion" element={<CaregiverLiveEmotion />} />
          <Route path="/caregiver/tasks" element={<CaregiverAssignedTasks />} />
          <Route path="/caregiver/incident-logging" element={<CaregiverIncidentLogging />} />
          <Route path="/caregiver/handoff-notes" element={<CaregiverHandoffNotes />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/chat" element={<DoctorChat />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/patients/:id/info" element={<PatientInfo />} />
          <Route path="/doctor/patients/:id/analytics" element={<PatientAnalytics />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
