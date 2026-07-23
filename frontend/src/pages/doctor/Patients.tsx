import { useState, useMemo } from "react";
import { DoctorShell } from "@/components/DoctorShell";
import { Users, Search, Filter, AlertCircle, Clock, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

type RiskLevel = "High" | "Medium" | "Low";
type EmotionState = "Calm" | "Anxious" | "Overloaded";

interface Patient {
  id: string;
  name: string;
  age: number;
  riskLevel: RiskLevel;
  emotion: EmotionState;
  lastCheckIn: string;
  guardianName: string;
  unreadMessages: number;
}

const initialMockPatients: Patient[] = [
  { id: "1", name: "Leo Jenkins", age: 8, riskLevel: "Low", emotion: "Calm", lastCheckIn: "2 hours ago", guardianName: "Mr. Jenkins", unreadMessages: 0 },
  { id: "2", name: "Mia Wong", age: 10, riskLevel: "High", emotion: "Overloaded", lastCheckIn: "10 mins ago", guardianName: "Mrs. Wong", unreadMessages: 3 },
  { id: "3", name: "Samira Patel", age: 7, riskLevel: "Medium", emotion: "Anxious", lastCheckIn: "Yesterday", guardianName: "Dr. Patel", unreadMessages: 1 },
  { id: "4", name: "Elijah Smith", age: 9, riskLevel: "Low", emotion: "Calm", lastCheckIn: "5 hours ago", guardianName: "Ms. Smith", unreadMessages: 0 },
  { id: "5", name: "Chloe Garcia", age: 11, riskLevel: "Medium", emotion: "Anxious", lastCheckIn: "Just now", guardianName: "Mr. Garcia", unreadMessages: 0 },
  { id: "6", name: "Noah Kim", age: 6, riskLevel: "High", emotion: "Overloaded", lastCheckIn: "Yesterday", guardianName: "Mrs. Kim", unreadMessages: 5 },
  { id: "7", name: "Ava Johnson", age: 12, riskLevel: "Low", emotion: "Calm", lastCheckIn: "3 days ago", guardianName: "Mr. Johnson", unreadMessages: 0 },
];

const riskConfig = {
  High: { color: "bg-red-100 text-red-800 border-red-300", label: "High Risk" },
  Medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Mild Concern" },
  Low: { color: "bg-green-100 text-green-800 border-green-300", label: "Stable" },
};

const emotionConfig = {
  Calm: { icon: "😌", label: "Calm" },
  Anxious: { icon: "😰", label: "Anxious" },
  Overloaded: { icon: "🤯", label: "Overloaded" },
};

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>(initialMockPatients);
  const [search, setSearch] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const [sortBy, setSortBy] = useState("risk-high");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    let result = patients.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    if (needsAttention) {
      result = result.filter(p => p.riskLevel === "High");
    }

    result.sort((a, b) => {
      if (sortBy === "name-az") return a.name.localeCompare(b.name);
      if (sortBy === "risk-high") {
        const riskWeight = { High: 3, Medium: 2, Low: 1 };
        return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
      }
      if (sortBy === "recent") {
        return a.lastCheckIn.localeCompare(b.lastCheckIn);
      }
      return 0;
    });

    return result;
  }, [patients, search, needsAttention, sortBy]);

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => p.riskLevel === "High").length,
    checkInsToday: patients.filter(p => p.lastCheckIn.includes("ago") || p.lastCheckIn.includes("now")).length,
    unread: patients.reduce((acc, p) => acc + p.unreadMessages, 0)
  };

  const selectedPatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId), 
  [patients, selectedPatientId]);

  return (
    <DoctorShell fullWidth>


      {/* Top Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border-2 border-primary/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
        </div>
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-1">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border-2 border-red-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Needs Attention</p>
            <p className="text-2xl font-black">{stats.highRisk}</p>
          </div>
        </div>
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-2">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Check-ins Today</p>
            <p className="text-2xl font-black">{stats.checkInsToday}</p>
          </div>
        </div>
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-blue-200">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Unread Messages</p>
            <p className="text-2xl font-black">{stats.unread}</p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search patients by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 border-2 border-foreground shadow-pop-sm rounded-xl text-base"
          />
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-3 bg-background p-3 rounded-xl border-2 border-border/50">
            <Switch 
              id="needs-attention" 
              checked={needsAttention}
              onCheckedChange={setNeedsAttention}
              className="data-[state=checked]:bg-red-500"
            />
            <label htmlFor="needs-attention" className="text-sm font-bold cursor-pointer whitespace-nowrap">
              Needs Attention Only
            </label>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-12 border-2 border-foreground shadow-pop-sm rounded-xl font-bold bg-background">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="risk-high">Risk (High to Low)</SelectItem>
              <SelectItem value="recent">Last Check-in</SelectItem>
              <SelectItem value="name-az">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredPatients.map((patient, index) => (
          <div 
            key={patient.id}
            className={`calm-card p-6 group hover:-translate-y-1 hover:shadow-pop transition-all relative animate-fade-up-delay-${(index % 4) + 1}`}
          >
            {patient.unreadMessages > 0 && (
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent border-2 border-foreground shadow-pop-sm flex items-center justify-center z-10 animate-bounce-slow">
                <span className="text-sm font-black text-accent-foreground">{patient.unreadMessages}</span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${patient.riskLevel === 'High' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'} border-2 border-foreground flex items-center justify-center shadow-pop-sm text-2xl font-black`}>
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black">{patient.name}</h3>
                  <p className="text-muted-foreground font-bold text-sm">{patient.age} yrs • {patient.guardianName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-border/50">
                <span className="text-sm font-bold text-muted-foreground">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${riskConfig[patient.riskLevel].color}`}>
                  {riskConfig[patient.riskLevel].label}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-border/50">
                <span className="text-sm font-bold text-muted-foreground">State</span>
                <div className="flex items-center gap-2 font-bold bg-muted px-3 py-1 rounded-full text-sm border-2 border-transparent">
                  <span className="text-lg leading-none">{emotionConfig[patient.emotion].icon}</span>
                  {emotionConfig[patient.emotion].label}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background border-2 border-border/50">
                <span className="text-sm font-bold text-muted-foreground">Check-in</span>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {patient.lastCheckIn}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-border/50 flex justify-end">
              <Button 
                onClick={() => setSelectedPatientId(patient.id)}
                variant="ghost" 
                className="text-sm font-black text-primary hover:text-primary-foreground hover:bg-primary"
              >
                View Details <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-xl font-bold text-muted-foreground">No patients found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      <Dialog open={!!selectedPatientId} onOpenChange={(open) => !open && setSelectedPatientId(null)}>
        <DialogContent className="sm:max-w-xl bg-card border-2 border-foreground shadow-pop sm:rounded-[1.5rem] p-0 overflow-hidden">
          {selectedPatient && (
            <>
              <div className="p-8 bg-muted border-b-2 border-foreground relative">
                <div className="flex items-start gap-6">
                  <div className={`w-24 h-24 rounded-full ${selectedPatient.riskLevel === 'High' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'} border-2 border-foreground flex items-center justify-center shadow-pop-sm text-4xl font-black shrink-0`}>
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-black mb-1">{selectedPatient.name}</DialogTitle>
                    <DialogDescription className="text-lg font-bold text-muted-foreground mb-4">
                      {selectedPatient.age} years old • Guardian: {selectedPatient.guardianName}
                    </DialogDescription>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${riskConfig[selectedPatient.riskLevel].color}`}>
                        {riskConfig[selectedPatient.riskLevel].label}
                      </span>
                      <div className="flex items-center gap-2 font-bold bg-background px-4 py-1.5 rounded-full text-sm border-2 border-border/50">
                        <span className="text-lg leading-none">{emotionConfig[selectedPatient.emotion].icon}</span>
                        {emotionConfig[selectedPatient.emotion].label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-black border-b-2 border-border/50 pb-2">Set Patient Status</h4>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-muted-foreground">Update Risk Level:</span>
                    <Select 
                      value={selectedPatient.riskLevel} 
                      onValueChange={(val: RiskLevel) => {
                        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, riskLevel: val } : p));
                      }}
                    >
                      <SelectTrigger className="w-[200px] border-2 border-foreground shadow-pop-sm font-bold h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Stable (Low Risk)</SelectItem>
                        <SelectItem value="Medium">Mild Concern</SelectItem>
                        <SelectItem value="High">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-black border-b-2 border-border/50 pb-2">Quick Actions</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button className="h-12 border-2 border-foreground shadow-pop-sm hover:-translate-y-1 hover:shadow-pop transition-all bg-primary text-primary-foreground font-black">
                      <MessageCircle className="w-5 h-5 mr-2" /> Message Guardian
                    </Button>
                    <Button variant="outline" className="h-12 border-2 border-foreground shadow-pop-sm hover:-translate-y-1 hover:shadow-pop transition-all font-black">
                      <Clock className="w-5 h-5 mr-2" /> View Full History
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DoctorShell>
  );
};

export default Patients;
