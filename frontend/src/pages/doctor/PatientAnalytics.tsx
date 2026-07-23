import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, ActivitySquare, Download, ClipboardEdit } from "lucide-react";
import { Button } from "@/components/ui/button";

import Analytics from "./Analytics";
import RiskScore from "./RiskScore";
import ExportReports from "./Export";
import CarePlan from "./CarePlan";

export default function PatientAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <DoctorShell fullWidth>
      <div className="mb-6 flex items-center gap-4 animate-fade-up">
        <Button 
          variant="outline" 
          onClick={() => navigate("/doctor/patients")}
          className="hover:-translate-x-1 transition-transform border-2 border-foreground shadow-pop-sm font-bold rounded-xl h-12"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Patients
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-up-delay-1">
        <TabsList className="mb-8 w-full justify-start h-auto p-1.5 bg-muted rounded-2xl overflow-x-auto flex-nowrap shrink-0 border-2 border-foreground/10">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <BarChart3 className="w-4 h-4" /> Clinical Analytics
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <ActivitySquare className="w-4 h-4" /> LSTM Risk Score
          </TabsTrigger>
          <TabsTrigger value="careplan" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <ClipboardEdit className="w-4 h-4" /> Care Plan Editor
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <Download className="w-4 h-4" /> Export Reports
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="analytics" className="m-0 border-none p-0 outline-none">
            <Analytics />
          </TabsContent>
          <TabsContent value="risk" className="m-0 border-none p-0 outline-none">
            <RiskScore />
          </TabsContent>
          <TabsContent value="careplan" className="m-0 border-none p-0 outline-none">
            <CarePlan />
          </TabsContent>
          <TabsContent value="export" className="m-0 border-none p-0 outline-none">
            <ExportReports />
          </TabsContent>
        </div>
      </Tabs>
    </DoctorShell>
  );
}
