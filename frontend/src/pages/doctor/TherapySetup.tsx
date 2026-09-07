import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { 
  Calendar, Clock, Users, Target, Video, Link as LinkIcon, 
  CheckCircle2, Activity, FileText, ClipboardList, History,
  Brain, MessageCircle, Heart, PenTool, Wind
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TherapySetup() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState("rahul");
  const [sessionType, setSessionType] = useState("follow-up");
  const [duration, setDuration] = useState("45");
  const [participants, setParticipants] = useState({
    parent: true,
    caregiver: false,
    shadow: false,
  });
  const [activities, setActivities] = useState({
    emotionCards: false,
    socialStory: false,
    conversation: false,
    matching: false,
    drawing: false,
    breathing: false
  });
  const [showLink, setShowLink] = useState(false);

  const handleStart = () => {
    navigate("/doctor/therapy/room");
  };

  const toggleParticipant = (key: keyof typeof participants) => {
    setParticipants(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleActivity = (key: keyof typeof activities) => {
    setActivities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DoctorShell title="Therapy Session Setup" subtitle="Configure and launch a new virtual session" fullWidth={true}>
      <div className="mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* LEFT COLUMN (Main Setup) */}
          <div className="lg:col-span-7 space-y-8 animate-fade-up">
            
            {/* Patient Selection & History */}
            <div className="calm-card space-y-6">
               <div className="space-y-3">
                 <label className="text-xl font-black flex items-center gap-3 text-foreground">
                   <Users className="w-6 h-6 text-primary" /> Select Patient
                 </label>
                 <Select value={patient} onValueChange={setPatient}>
                   <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-background focus:ring-primary focus:ring-offset-2">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="rahul" className="font-bold text-lg">Rahul Kumar (8 yrs)</SelectItem>
                      <SelectItem value="mia" className="font-bold text-lg">Mia Wong (10 yrs)</SelectItem>
                      <SelectItem value="samira" className="font-bold text-lg">Samira Patel (7 yrs)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               {/* Previous Session Summary */}
               {patient === "rahul" && (
                 <div className="bg-background rounded-2xl p-5 border-2 border-foreground shadow-pop-sm relative overflow-hidden group hover:-translate-y-1 transition-transform mt-4">
                   <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 rounded-bl-2xl font-black text-xs border-b-2 border-l-2 border-foreground">Last Session</div>
                   <h4 className="font-black flex items-center gap-2 mb-4 text-foreground/80 text-lg">
                     <History className="w-5 h-5 text-primary" /> Summary
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                     <div className="space-y-1">
                       <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Stress</span>
                       <div className="font-black text-orange-500 text-base">Moderate</div>
                     </div>
                     <div className="space-y-1">
                       <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Homework</span>
                       <div className="font-black text-green-600 text-base">Completed</div>
                     </div>
                     <div className="space-y-1">
                       <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Focus</span>
                       <div className="font-black text-blue-600 text-base">80%</div>
                     </div>
                     <div className="space-y-1 col-span-2 md:col-span-1">
                       <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Notes</span>
                       <div className="font-black text-foreground text-sm line-clamp-2">Eye contact improving</div>
                     </div>
                   </div>
                 </div>
               )}
            </div>

            {/* Session Details Card */}
            <div className="calm-card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-lg font-black flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary" /> Session Type
                  </label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-background hover:bg-muted/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial" className="font-bold text-lg">Initial Assessment</SelectItem>
                      <SelectItem value="follow-up" className="font-bold text-lg">Follow-up Therapy</SelectItem>
                      <SelectItem value="speech" className="font-bold text-lg">Speech Therapy</SelectItem>
                      <SelectItem value="behavioral" className="font-bold text-lg">Behavioral Therapy</SelectItem>
                      <SelectItem value="social" className="font-bold text-lg">Social Skills Training</SelectItem>
                      <SelectItem value="parent" className="font-bold text-lg">Parent Counseling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-lg font-black flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" /> Duration
                  </label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-background hover:bg-muted/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30" className="font-bold text-lg">30 mins</SelectItem>
                      <SelectItem value="45" className="font-bold text-lg">45 mins</SelectItem>
                      <SelectItem value="60" className="font-bold text-lg">60 mins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Primary Goals Card */}
            <div className="calm-card space-y-3 bg-accent/40 border-accent-foreground/30">
              <label className="text-lg font-black flex items-center gap-3">
                <Target className="w-5 h-5 text-accent-foreground" /> Primary Therapy Goals
              </label>
              <textarea 
                className="w-full h-32 border-2 border-foreground shadow-pop-sm rounded-xl p-4 font-bold text-base resize-none focus:outline-none focus:ring-4 focus:ring-primary/50 bg-background leading-relaxed"
                placeholder="Enter custom goals or select from templates..."
                defaultValue="• Emotional Regulation&#10;• Eye Contact&#10;• Social Communication&#10;• Emotion Recognition&#10;• Reduce Anxiety"
              ></textarea>
            </div>

            {/* Notes Card */}
            <div className="calm-card space-y-3">
              <label className="text-lg font-black flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" /> Session Notes
              </label>
              <textarea 
                className="w-full h-24 border-2 border-foreground shadow-pop-sm rounded-xl p-4 font-bold text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background leading-relaxed"
                placeholder="E.g., Child had a stressful school day. Focus on calming exercises first."
                defaultValue="Child had a stressful school day.&#10;Focus on calming exercises first."
              ></textarea>
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-8 animate-fade-up-delay-1">
            
            {/* Additional Participants */}
            <div className="calm-card space-y-4 bg-secondary/20 border-secondary/40">
              <label className="text-lg font-black flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary-foreground" /> Additional Participants
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => toggleParticipant('parent')}
                  className={`p-4 rounded-xl border-2 font-bold transition-all text-sm flex items-center gap-3 ${participants.parent ? 'border-secondary bg-secondary text-secondary-foreground shadow-pop-sm' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.parent ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                  Parent
                </button>
                <button 
                  onClick={() => toggleParticipant('caregiver')}
                  className={`p-4 rounded-xl border-2 font-bold transition-all text-sm flex items-center gap-3 ${participants.caregiver ? 'border-secondary bg-secondary text-secondary-foreground shadow-pop-sm' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.caregiver ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                  Caregiver
                </button>
                <button 
                  onClick={() => toggleParticipant('shadow')}
                  className={`p-4 rounded-xl border-2 font-bold transition-all text-sm flex items-center gap-3 sm:col-span-2 ${participants.shadow ? 'border-secondary bg-secondary text-secondary-foreground shadow-pop-sm' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted'}`}
                >
                  {participants.shadow ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                  Shadow Teacher
                </button>
              </div>
            </div>

            {/* Therapy Activities */}
            <div className="calm-card space-y-4">
              <label className="text-lg font-black flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-primary" /> Therapy Activities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActivityButton 
                  active={activities.emotionCards} 
                  onClick={() => toggleActivity('emotionCards')}
                  icon={<Heart className="w-5 h-5" />}
                  label="Emotion Cards"
                />
                <ActivityButton 
                  active={activities.socialStory} 
                  onClick={() => toggleActivity('socialStory')}
                  icon={<Brain className="w-5 h-5" />}
                  label="Social Story"
                />
                <ActivityButton 
                  active={activities.conversation} 
                  onClick={() => toggleActivity('conversation')}
                  icon={<MessageCircle className="w-5 h-5" />}
                  label="Conversation"
                />
                <ActivityButton 
                  active={activities.matching} 
                  onClick={() => toggleActivity('matching')}
                  icon={<Target className="w-5 h-5" />}
                  label="Matching Game"
                />
                <ActivityButton 
                  active={activities.drawing} 
                  onClick={() => toggleActivity('drawing')}
                  icon={<PenTool className="w-5 h-5" />}
                  label="Drawing"
                />
                <ActivityButton 
                  active={activities.breathing} 
                  onClick={() => toggleActivity('breathing')}
                  icon={<Wind className="w-5 h-5" />}
                  label="Breathing"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="calm-card space-y-3">
              <label className="text-lg font-black flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" /> Schedule
              </label>
              <div className="w-full border-2 border-foreground shadow-pop-sm font-bold h-14 rounded-xl text-lg bg-muted flex items-center justify-between px-4 opacity-90 cursor-not-allowed">
                <span className="text-foreground">Right Now</span>
                <span className="text-xs font-black bg-foreground text-background px-3 py-1 rounded-md">DEFAULT</span>
              </div>
            </div>

            {/* ACTION BUTTON AREA */}
            <div className="pt-4">
              {!showLink ? (
                <Button 
                  onClick={() => setShowLink(true)}
                  className="w-full h-20 text-2xl font-black rounded-[1.5rem] bg-primary text-primary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-background/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative flex items-center justify-center">
                    <LinkIcon className="w-7 h-7 mr-3" /> Generate Session Link
                  </span>
                </Button>
              ) : (
                <div className="calm-card bg-primary/10 border-primary border-dashed space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xl md:text-2xl text-primary-foreground">Ready to Start!</h3>
                    <span className="bg-background text-foreground px-4 py-2 rounded-full text-sm font-bold border-2 border-foreground flex items-center gap-2 shadow-pop-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Link Generated
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row items-stretch gap-4">
                    <Input 
                      readOnly 
                      value="https://calmspace.app/meet/rhl-xptz-bnq" 
                      className="flex-1 font-mono text-lg font-bold border-2 border-foreground shadow-pop-sm rounded-xl h-14 bg-background px-4 focus-visible:ring-0"
                    />
                    <Button variant="outline" className="h-14 px-8 border-2 border-foreground shadow-pop-sm rounded-xl font-black text-lg bg-background hover:bg-muted active:translate-y-0.5 active:shadow-none transition-all">
                      Copy Link
                    </Button>
                  </div>
                  <Button 
                    onClick={handleStart}
                    className="w-full h-20 text-2xl font-black rounded-[1.5rem] bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all mt-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-background/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative flex items-center justify-center">
                      <Video className="w-8 h-8 mr-3" /> Enter Therapy Room
                    </span>
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DoctorShell>
  );
}

function ActivityButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-[1rem] border-2 font-bold transition-all text-xs sm:text-sm flex flex-col items-center justify-center gap-2 h-24 ${active ? 'border-primary bg-primary text-primary-foreground shadow-pop-sm -translate-y-1' : 'border-border/50 bg-background text-muted-foreground hover:bg-muted/50 hover:border-foreground/30'}`}
    >
      <div className={`${active ? 'text-primary-foreground scale-110' : 'text-muted-foreground'} transition-transform duration-300`}>
        {icon}
      </div>
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}

