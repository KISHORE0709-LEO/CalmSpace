import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { Calendar, Clock, Users, Target, Video, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TherapySetup() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState("rahul");
  const [duration, setDuration] = useState("45");
  const [participants, setParticipants] = useState({
    parent: true,
    caregiver: false,
    shadow: false,
  });
  const [showLink, setShowLink] = useState(false);

  const handleStart = () => {
    navigate("/doctor/therapy/room");
  };

  const toggleParticipant = (key: keyof typeof participants) => {
    setParticipants(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DoctorShell title="Therapy Session Setup" subtitle="Configure and launch a new virtual session">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Left Col: Setup Form */}
        <div className="space-y-6">
          <div className="calm-card space-y-6 animate-fade-up">
            <div className="space-y-2">
              <label className="text-sm font-black flex items-center gap-2">
                <Users className="w-4 h-4" /> Select Patient
              </label>
              <Select value={patient} onValueChange={setPatient}>
                <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-12 rounded-xl text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rahul" className="font-bold">Rahul Kumar (8 yrs)</SelectItem>
                  <SelectItem value="mia" className="font-bold">Mia Wong (10 yrs)</SelectItem>
                  <SelectItem value="samira" className="font-bold">Samira Patel (7 yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black flex items-center gap-2">
                <Users className="w-4 h-4" /> Additional Participants
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => toggleParticipant('parent')}
                  className={`p-3 rounded-xl border-2 font-bold transition-all text-sm flex items-center gap-2 ${participants.parent ? 'border-primary bg-primary/10 text-primary-foreground shadow-pop-sm' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.parent && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  Parents
                </button>
                <button 
                  onClick={() => toggleParticipant('caregiver')}
                  className={`p-3 rounded-xl border-2 font-bold transition-all text-sm flex items-center gap-2 ${participants.caregiver ? 'border-primary bg-primary/10 text-primary-foreground shadow-pop-sm' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.caregiver && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  Caregiver
                </button>
                <button 
                  onClick={() => toggleParticipant('shadow')}
                  className={`p-3 rounded-xl border-2 font-bold transition-all text-sm flex items-center gap-2 ${participants.shadow ? 'border-primary bg-primary/10 text-primary-foreground shadow-pop-sm' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.shadow && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  Shadow Teacher
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-12 rounded-xl text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="font-bold">30 mins</SelectItem>
                    <SelectItem value="45" className="font-bold">45 mins</SelectItem>
                    <SelectItem value="60" className="font-bold">60 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Schedule
                </label>
                <div className="w-full border-2 border-foreground shadow-pop-sm font-bold h-12 rounded-xl text-lg bg-background flex items-center px-4 cursor-not-allowed opacity-80">
                  Right Now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Session Goals & Action */}
        <div className="space-y-6">
          <div className="calm-card space-y-4 animate-fade-up-delay-1 bg-accent/30 border-accent-foreground/20">
            <label className="text-sm font-black flex items-center gap-2 text-accent-foreground">
              <Target className="w-5 h-5" /> Primary Therapy Goals
            </label>
            <textarea 
              className="w-full h-32 border-2 border-foreground shadow-pop-sm rounded-xl p-4 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="E.g., Improve eye contact duration, practice turn-taking in social games..."
              defaultValue="Work on emotional regulation during transitions. Introduce new social story for school routine."
            ></textarea>
          </div>

          {!showLink ? (
            <Button 
              onClick={() => setShowLink(true)}
              className="w-full h-16 text-xl font-black rounded-2xl bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all animate-fade-up-delay-2"
            >
              <LinkIcon className="w-6 h-6 mr-2" /> Generate Session Link
            </Button>
          ) : (
            <div className="calm-card space-y-4 border-primary bg-primary/10 animate-fade-up">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg">Invitation Generated</h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border-2 border-green-300">Sent via App</span>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value="https://calmspace.app/meet/rhl-xptz-bnq" 
                  className="font-mono text-sm border-2 border-foreground shadow-pop-sm rounded-xl h-12 bg-white"
                />
                <Button variant="outline" className="h-12 px-6 border-2 border-foreground shadow-pop-sm rounded-xl font-black">
                  Copy
                </Button>
              </div>
              <Button 
                onClick={handleStart}
                className="w-full h-16 text-xl font-black rounded-2xl bg-primary text-primary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all mt-4"
              >
                <Video className="w-6 h-6 mr-2" /> Enter Therapy Room
              </Button>
            </div>
          )}
        </div>

      </div>
    </DoctorShell>
  );
}
