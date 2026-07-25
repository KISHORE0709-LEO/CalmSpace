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
      <div className="max-w-3xl mx-auto mt-8 pb-16">
        <div className="flex flex-col gap-8">
          
          {/* Main Setup Card */}
          <div className="calm-card p-8 md:p-10 space-y-8 animate-fade-up bg-white">
            
            <div className="space-y-3">
              <label className="text-lg font-black flex items-center gap-3 border-b-2 border-foreground/10 pb-2">
                <Users className="w-5 h-5 text-primary" /> Select Patient
              </label>
              <Select value={patient} onValueChange={setPatient}>
                <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rahul" className="font-bold text-lg">Rahul Kumar (8 yrs)</SelectItem>
                  <SelectItem value="mia" className="font-bold text-lg">Mia Wong (10 yrs)</SelectItem>
                  <SelectItem value="samira" className="font-bold text-lg">Samira Patel (7 yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-lg font-black flex items-center gap-3 border-b-2 border-foreground/10 pb-2">
                <Users className="w-5 h-5 text-primary" /> Additional Participants
              </label>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => toggleParticipant('parent')}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 font-bold transition-all text-base flex items-center justify-center gap-3 ${participants.parent ? 'border-primary bg-primary text-primary-foreground shadow-pop' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.parent && <CheckCircle2 className="w-5 h-5" />}
                  Parents
                </button>
                <button 
                  onClick={() => toggleParticipant('caregiver')}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 font-bold transition-all text-base flex items-center justify-center gap-3 ${participants.caregiver ? 'border-primary bg-primary text-primary-foreground shadow-pop' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.caregiver && <CheckCircle2 className="w-5 h-5" />}
                  Caregiver
                </button>
                <button 
                  onClick={() => toggleParticipant('shadow')}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 font-bold transition-all text-base flex items-center justify-center gap-3 ${participants.shadow ? 'border-primary bg-primary text-primary-foreground shadow-pop' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.shadow && <CheckCircle2 className="w-5 h-5" />}
                  Shadow Teacher
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-lg font-black flex items-center gap-3 border-b-2 border-foreground/10 pb-2">
                  <Clock className="w-5 h-5 text-primary" /> Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="font-bold text-lg">30 mins</SelectItem>
                    <SelectItem value="45" className="font-bold text-lg">45 mins</SelectItem>
                    <SelectItem value="60" className="font-bold text-lg">60 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-lg font-black flex items-center gap-3 border-b-2 border-foreground/10 pb-2">
                  <Calendar className="w-5 h-5 text-primary" /> Schedule
                </label>
                <div className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-muted flex items-center px-4 cursor-not-allowed opacity-80 text-muted-foreground">
                  Right Now
                </div>
              </div>
            </div>
          </div>

          {/* Goals Card */}
          <div className="calm-card space-y-4 animate-fade-up-delay-1 bg-accent/30 border-accent-foreground/20 p-8 md:p-10">
            <label className="text-xl font-black flex items-center gap-3 text-accent-foreground border-b-2 border-accent-foreground/20 pb-2">
              <Target className="w-6 h-6" /> Primary Therapy Goals
            </label>
            <textarea 
              className="w-full h-32 border-2 border-foreground shadow-pop-sm rounded-xl p-4 font-bold text-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-white leading-relaxed"
              placeholder="E.g., Improve eye contact duration, practice turn-taking in social games..."
              defaultValue="Work on emotional regulation during transitions. Introduce new social story for school routine."
            ></textarea>
          </div>

          {/* Action Section */}
          <div className="animate-fade-up-delay-2">
            {!showLink ? (
              <Button 
                onClick={() => setShowLink(true)}
                className="w-full h-20 text-2xl font-black rounded-[1.5rem] bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all"
              >
                <LinkIcon className="w-7 h-7 mr-3" /> Generate Session Link
              </Button>
            ) : (
              <div className="calm-card space-y-6 border-primary bg-primary/10 p-8 md:p-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-2xl">Invitation Generated</h3>
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border-2 border-green-300">Sent via App</span>
                </div>
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  <Input 
                    readOnly 
                    value="https://calmspace.app/meet/rhl-xptz-bnq" 
                    className="flex-1 font-mono text-lg font-bold border-2 border-foreground shadow-pop-sm rounded-xl h-14 bg-white px-4"
                  />
                  <Button variant="outline" className="h-14 px-8 border-2 border-foreground shadow-pop-sm rounded-xl font-black text-lg bg-white hover:bg-muted">
                    Copy
                  </Button>
                </div>
                <Button 
                  onClick={handleStart}
                  className="w-full h-20 text-2xl font-black rounded-[1.5rem] bg-primary text-primary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all mt-6"
                >
                  <Video className="w-8 h-8 mr-3" /> Enter Therapy Room
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </DoctorShell>
  );
}
