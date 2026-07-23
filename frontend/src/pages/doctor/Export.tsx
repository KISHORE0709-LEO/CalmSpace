import { useState, useEffect } from "react";
// Removed DoctorShell import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, ActivitySquare, ShieldAlert, Database, Loader2, History, Lock, FileType, CheckCircle2 } from "lucide-react";

// Mock Data
const exportHistory = [
  { id: "EXP-8902", type: "Full Care Record", patient: "Leo Jenkins", range: "Last 90 Days", date: "Oct 28, 2025 - 14:30", format: "PDF" },
  { id: "EXP-8901", type: "De-identified Research Export", patient: "All Patients", range: "Last 30 Days", date: "Oct 25, 2025 - 09:15", format: "CSV" },
  { id: "EXP-8900", type: "Session Summary Report", patient: "Emma Watson", range: "Last 7 Days", date: "Oct 22, 2025 - 11:45", format: "PDF" },
  { id: "EXP-8899", type: "Risk Assessment Report", patient: "Leo Jenkins", range: "Last 30 Days", date: "Oct 15, 2025 - 16:20", format: "PDF" },
];

const reportTypes = [
  { id: "session", title: "Session Summary Report", desc: "Recent bot interactions & emotion logs, plain-language summary.", icon: FileText },
  { id: "analytics", title: "Clinical Analytics Report", desc: "Charts & data from Clinical Analytics tab, formatted for print.", icon: ActivitySquare },
  { id: "risk", title: "Risk Assessment Report", desc: "LSTM score trend, contributing factors & doctor's notes.", icon: ShieldAlert },
  { id: "full", title: "Full Care Record", desc: "Everything combined into a comprehensive clinical record.", icon: Database },
  { id: "research", title: "De-identified Research Export", desc: "Strips PII, formatted for aggregate analysis (IEEE publication data pipeline).", icon: Lock, highlight: true },
];

export default function ExportReports() {
  const { toast } = useToast();
  
  const [patient, setPatient] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState<string | null>(null);
  const [format, setFormat] = useState("pdf");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState(exportHistory);

  // Auto-switch format constraints based on report type
  useEffect(() => {
    if (reportType === "research") {
      setFormat("csv");
    } else if (reportType !== null && format === "csv") {
      setFormat("pdf");
    }
  }, [reportType]);

  const handleGenerate = () => {
    if (!reportType) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated Successfully",
        description: "Your report has been downloaded and added to the history log.",
        className: "bg-green-100 border-2 border-green-600 text-green-900 font-bold",
      });
      
      // Add to history
      const selectedType = reportTypes.find(t => t.id === reportType)?.title || "Report";
      const newEntry = {
        id: `EXP-${8903 + Math.floor(Math.random() * 100)}`,
        type: selectedType,
        patient: patient === "all" ? "All Patients" : (patient === "leo" ? "Leo Jenkins" : "Emma Watson"),
        range: dateRange === "7" ? "Last 7 Days" : (dateRange === "30" ? "Last 30 Days" : "Last 90 Days"),
        date: "Just now",
        format: format.toUpperCase()
      };
      setHistory([newEntry, ...history]);
    }, 1500);
  };

  const selectedReportDef = reportTypes.find(t => t.id === reportType);

  return (
    <div className="w-full">
      {/* Top Header & Patient Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm text-2xl font-black">
            <FileType className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none mb-1">Export Reports</h1>
            <p className="text-muted-foreground font-bold">Generate clinical documentation and de-identified data exports</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Target Patient(s)</label>
            <Select value={patient} onValueChange={setPatient}>
              <SelectTrigger className="w-[200px] h-12 border-2 border-foreground shadow-pop-sm font-bold bg-background rounded-xl">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-black text-primary">All Patients (Bulk)</SelectItem>
                <SelectItem value="leo">Leo Jenkins (8 yrs)</SelectItem>
                <SelectItem value="emma">Emma Watson (10 yrs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Configuration */}
        <div className="xl:col-span-2 space-y-6 animate-fade-up">
          
          <div className="calm-card p-6">
            <h3 className="text-xl font-black mb-4">1. Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = reportType === type.id;
                return (
                  <div 
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 flex items-start gap-4 ${
                      isSelected 
                        ? 'border-foreground bg-primary/10 shadow-pop-sm' 
                        : 'border-border/50 bg-background hover:border-foreground/30 hover:bg-muted/50'
                    } ${type.highlight && !isSelected ? 'border-blue-200 bg-blue-50/30' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-foreground ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${type.highlight && isSelected ? 'bg-blue-600 text-white' : ''} ${type.highlight && !isSelected ? 'bg-blue-100 text-blue-600 border-blue-600' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{type.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{type.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="calm-card p-6 flex flex-col justify-center">
              <h3 className="text-lg font-black mb-4">2. Date Range</h3>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="calm-card p-6 flex flex-col justify-center">
              <h3 className="text-lg font-black mb-4">3. Format</h3>
              <Select value={format} onValueChange={setFormat} disabled={!reportType}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold disabled:opacity-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf" disabled={reportType === "research"}>PDF Document (Clinical)</SelectItem>
                  <SelectItem value="csv" disabled={reportType !== "research"}>CSV Raw Data (Research)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            size="lg"
            onClick={handleGenerate}
            disabled={!reportType || isGenerating}
            className="w-full h-14 text-lg border-2 border-foreground shadow-pop hover:-translate-y-1 transition-all font-black rounded-xl"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Report...</>
            ) : (
              <><Download className="w-5 h-5 mr-2" /> Generate & Download</>
            )}
          </Button>
        </div>

        {/* Right Column: Preview Panel */}
        <div className="xl:col-span-1 animate-fade-up-delay-1">
          <div className="calm-card p-6 h-full flex flex-col bg-muted/20">
            <h3 className="text-xl font-black mb-4">Document Preview</h3>
            
            {!reportType ? (
              <div className="flex-1 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-center p-8 bg-background/50">
                <p className="text-muted-foreground font-bold text-sm">Select a report type to view a preview.</p>
              </div>
            ) : (
              <div className="flex-1 border-2 border-foreground rounded-xl bg-white p-4 shadow-sm flex flex-col relative overflow-hidden">
                {/* Mock Preview Content */}
                <div className="border-b-2 border-muted pb-3 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-primary uppercase tracking-wider">{selectedReportDef?.title}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded-full border border-foreground/20 flex items-center justify-center shrink-0">
                       <FileType className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-4 bg-muted/50 rounded-md w-3/4"></div>
                  <div className="h-4 bg-muted/50 rounded-md w-full"></div>
                  <div className="h-4 bg-muted/50 rounded-md w-5/6"></div>
                  
                  {format === "pdf" && (
                    <div className="mt-6 border-2 border-muted rounded-lg h-24 bg-muted/20 flex items-end justify-center p-2 relative overflow-hidden">
                      {/* Fake chart bars */}
                      <div className="w-full flex items-end justify-around gap-2 px-4">
                         <div className="w-4 h-[40%] bg-blue-200 rounded-t-sm"></div>
                         <div className="w-4 h-[70%] bg-blue-300 rounded-t-sm"></div>
                         <div className="w-4 h-[30%] bg-blue-200 rounded-t-sm"></div>
                         <div className="w-4 h-[90%] bg-blue-400 rounded-t-sm"></div>
                      </div>
                    </div>
                  )}

                  {format === "csv" && (
                    <div className="mt-4 p-2 bg-slate-900 rounded-lg overflow-hidden">
                      <p className="text-[8px] font-mono text-green-400 leading-tight">
                        timestamp,patient_id,risk_score,trigger<br/>
                        170923,anonym_839,45,null<br/>
                        170924,anonym_839,68,sleep_disruption<br/>
                        170925,anonym_839,72,conflict_world3
                      </p>
                    </div>
                  )}

                  <div className="h-4 bg-muted/50 rounded-md w-1/2 mt-4"></div>
                  <div className="h-4 bg-muted/50 rounded-md w-full"></div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 pointer-events-none"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export History Table */}
      <div className="calm-card p-6 animate-fade-up-delay-2 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <History className="w-5 h-5" /> Export History
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Log of previously generated documents</p>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="pb-3 font-black px-4">Report Type</th>
                <th className="pb-3 font-black px-4">Target Patient</th>
                <th className="pb-3 font-black px-4">Date Range</th>
                <th className="pb-3 font-black px-4">Generated On</th>
                <th className="pb-3 font-black px-4">Format</th>
                <th className="pb-3 font-black px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {history.map((item, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 font-bold flex items-center gap-2">
                    {item.format === 'CSV' ? <Database className="w-4 h-4 text-blue-600" /> : <FileText className="w-4 h-4 text-primary" />}
                    {item.type}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.patient === 'All Patients' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-muted text-foreground'}`}>
                      {item.patient}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{item.range}</td>
                  <td className="py-4 px-4">{item.date}</td>
                  <td className="py-4 px-4">
                    <span className="font-black text-[10px] uppercase tracking-wider bg-foreground text-background px-2 py-1 rounded-sm">
                      {item.format}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-2 border-transparent hover:border-foreground hover:bg-background">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
