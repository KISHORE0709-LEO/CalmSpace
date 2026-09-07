import { useState, useEffect } from "react";
// Removed DoctorShell import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Save, Bot, Sparkles, Gamepad2, ShieldAlert, FileText, CheckCircle2, History as HistoryIcon } from "lucide-react";

export default function CarePlan() {
  const { toast } = useToast();
  
  // Mock initial state
  const initialState = {
    botTone: "Gentle",
    proactiveCheckins: true,
    escalationSensitivity: "Medium",
    brightness: [60],
    defaultAudio: "Soft piano",
    animationSpeed: "Slow",
    worlds: {
      world1: true,
      world2: true,
      world3: false,
    },
    difficulty: "Extra guided",
    threshold: [50],
    notifyCaregiver: true,
    careNotes: "Reducing bot sensitivity given recent improvement; monitor for 2 weeks."
  };

  const [settings, setSettings] = useState(initialState);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check for unsaved changes by comparing with initial state (simple stringify check for mock)
  useEffect(() => {
    const isChanged = JSON.stringify(settings) !== JSON.stringify(initialState);
    setHasUnsavedChanges(isChanged);
  }, [settings]);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      toast({
        title: "Care Plan Updated",
        description: "Your changes have been saved and applied to the patient's app.",
        className: "bg-green-100 border-2 border-green-600 text-green-900 font-bold",
      });
    }, 800);
  };

  return (
    <div className="w-full">
      {/* Patient Selector & Top Controls (Reused Header Style) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm text-2xl font-black">
            L
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none mb-1">Leo Jenkins</h1>
            <p className="text-muted-foreground font-bold">Care Plan Editor • 8 yrs</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 flex-wrap bg-background p-2 px-4 border-2 border-foreground rounded-xl shadow-pop-sm">
             <div className="text-sm font-bold flex flex-col items-end">
               <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active since Oct 12, 2025</span>
               <span className="text-muted-foreground text-xs">Last updated by Dr. Sarah, Oct 28, 2025</span>
             </div>
             <Button 
               onClick={handleSave}
               disabled={!hasUnsavedChanges || isSaving}
               className={`h-12 border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all font-black rounded-xl ${hasUnsavedChanges ? 'bg-primary text-primary-foreground hover:shadow-pop' : 'bg-muted text-muted-foreground opacity-70'}`}
             >
               <Save className="w-4 h-4 mr-2" /> 
               {isSaving ? "Saving..." : "Save Changes"}
               {hasUnsavedChanges && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />}
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bot (Mitra) Behavior Settings */}
        <div className="calm-card p-6 animate-fade-up">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 border-2 border-foreground flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black">Bot (Mitra) Behavior</h3>
              <p className="text-sm text-muted-foreground font-medium">Configure companion interactions</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Response Tone</label>
              <Select value={settings.botTone} onValueChange={(val) => setSettings({...settings, botTone: val})}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gentle">Gentle (Empathetic & Soft)</SelectItem>
                  <SelectItem value="Neutral">Neutral (Objective)</SelectItem>
                  <SelectItem value="Direct-coaching">Direct Coaching (Action-oriented)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/20">
              <div>
                <label className="font-bold text-sm block">Proactive Check-ins</label>
                <span className="text-xs text-muted-foreground font-medium">Mitra initiates conversation during transitions</span>
              </div>
              <Switch 
                checked={settings.proactiveCheckins}
                onCheckedChange={(val) => setSettings({...settings, proactiveCheckins: val})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Crisis Escalation Sensitivity</label>
              <Select value={settings.escalationSensitivity} onValueChange={(val) => setSettings({...settings, escalationSensitivity: val})}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low (Fewer alerts, relies on explicit distress)</SelectItem>
                  <SelectItem value="Medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="High">High (Flags subtle language cues immediately)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sensory Dashboard Defaults */}
        <div className="calm-card p-6 animate-fade-up-delay-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 border-2 border-foreground flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black">Sensory Defaults</h3>
                <p className="text-sm text-muted-foreground font-medium">In-app UI settings only (No OS control)</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm">Default Brightness Level</label>
                <span className="font-black text-sm bg-muted px-2 py-1 rounded-md">{settings.brightness[0]}%</span>
              </div>
              <Slider 
                value={settings.brightness} 
                onValueChange={(val) => setSettings({...settings, brightness: val})}
                max={100} step={1}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Default Background Audio</label>
              <Select value={settings.defaultAudio} onValueChange={(val) => setSettings({...settings, defaultAudio: val})}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rain">Rain & Nature</SelectItem>
                  <SelectItem value="Soft piano">Soft Piano (Focus)</SelectItem>
                  <SelectItem value="White noise">White Noise</SelectItem>
                  <SelectItem value="None">None (Silent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Animation Speed</label>
              <Select value={settings.animationSpeed} onValueChange={(val) => setSettings({...settings, animationSpeed: val})}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Slow">Slow (Reduced motion)</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Off">Off (Static only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Social Skills Game (Assigned Modules) */}
        <div className="calm-card p-6 animate-fade-up flex flex-col">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 border-2 border-foreground flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black">Social Skills Modules</h3>
              <p className="text-sm text-muted-foreground font-medium">Assigned interactive worlds</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-xl border-2 border-foreground bg-background/50 space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Active Worlds</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">World 1: School/College Life</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-1 inline-block">Level 3 / 5</span>
                </div>
                <Switch 
                  checked={settings.worlds.world1}
                  onCheckedChange={(val) => setSettings({...settings, worlds: {...settings.worlds, world1: val}})}
                />
              </div>
              <hr className="border-border/50" />
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">World 2: Social/Peer Situations</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-1 inline-block">Level 1 / 5</span>
                </div>
                <Switch 
                  checked={settings.worlds.world2}
                  onCheckedChange={(val) => setSettings({...settings, worlds: {...settings.worlds, world2: val}})}
                />
              </div>
              <hr className="border-border/50" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">World 3: Conflict/Confrontation</span>
                  <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 mt-1 inline-block">Locked by Doctor</span>
                </div>
                <Switch 
                  checked={settings.worlds.world3}
                  onCheckedChange={(val) => setSettings({...settings, worlds: {...settings.worlds, world3: val}})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">Game Difficulty / Pace</label>
              <Select value={settings.difficulty} onValueChange={(val) => setSettings({...settings, difficulty: val})}>
                <SelectTrigger className="w-full h-12 border-2 border-foreground bg-background rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard Progression</SelectItem>
                  <SelectItem value="Extra guided">Extra Guided (Slower pace, more hints)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Crisis Threshold Tuning & Care Notes */}
        <div className="flex flex-col gap-8 animate-fade-up-delay-2">
          {/* Crisis Threshold */}
          <div className="calm-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 border-2 border-foreground flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black">Crisis Threshold Tuning</h3>
                <p className="text-sm text-muted-foreground font-medium">LSTM risk triggers for external alerts</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-sm block">Parent Alert Threshold</label>
                  <span className={`font-black text-sm px-2 py-1 rounded-md border-2 ${settings.threshold[0] < 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                    Score &gt; {settings.threshold[0]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground -mt-2 mb-2 font-medium">
                  Lowering this increases sensitivity (default is 67).
                </p>
                <Slider 
                  value={settings.threshold} 
                  onValueChange={(val) => setSettings({...settings, threshold: val})}
                  max={100} step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-muted/20">
                <label className="font-bold text-sm block">Notify Caregiver Additionally</label>
                <Switch 
                  checked={settings.notifyCaregiver}
                  onCheckedChange={(val) => setSettings({...settings, notifyCaregiver: val})}
                />
              </div>
            </div>
          </div>

          {/* Doctor's Care Notes */}
          <div className="calm-card p-6 flex-1 flex flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground border-2 border-foreground flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black">Care Plan Rationale</h3>
              </div>
            </div>
            
            <textarea 
              className="w-full flex-1 min-h-[120px] p-4 rounded-xl border-2 border-foreground shadow-pop-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm leading-relaxed mb-4"
              value={settings.careNotes}
              onChange={(e) => setSettings({...settings, careNotes: e.target.value})}
              placeholder="Document reasoning for care plan changes..."
            />

            <div className="mt-auto">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <HistoryIcon className="w-3 h-3" /> Previous Entries
              </h4>
              <div className="space-y-3">
                <div className="text-sm bg-background p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs">Dr. Sarah</span>
                    <span className="text-[10px] font-bold text-muted-foreground">Oct 12, 2025</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">Initial plan created. Focus on World 1 & 2 for social integration.</p>
                </div>
                <div className="text-sm bg-background p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs">Dr. Sarah</span>
                    <span className="text-[10px] font-bold text-muted-foreground">Sep 05, 2025</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">Adjusted audio defaults to Rain to aid sensory transition post-school.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
