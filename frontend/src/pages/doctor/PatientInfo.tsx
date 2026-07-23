import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { ArrowLeft, User, Activity, AlertCircle, MessageCircle, Heart, Brain, Utensils, Pill, ShieldAlert, GraduationCap, Stethoscope, Moon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("snapshot");

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

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-up-delay-1">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Leo Jenkins</h1>
          <p className="text-muted-foreground font-bold text-lg flex items-center gap-2">
            8 years old <span className="w-1.5 h-1.5 rounded-full bg-foreground/30"></span> Grade 3 <span className="w-1.5 h-1.5 rounded-full bg-foreground/30"></span> Comprehensive Clinical Record
          </p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-red-100 text-red-700 border-2 border-red-300 font-bold rounded-xl text-sm flex items-center shadow-sm">
             <AlertCircle className="w-4 h-4 mr-2" /> High Anxiety Profile
           </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-up-delay-2">
        <TabsList className="mb-8 w-full justify-start h-auto p-1.5 bg-muted rounded-2xl overflow-x-auto flex-nowrap shrink-0 border-2 border-foreground/10">
          <TabsTrigger value="snapshot" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <User className="w-4 h-4" /> Clinical Snapshot
          </TabsTrigger>
          <TabsTrigger value="development" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <Brain className="w-4 h-4" /> Development
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <Activity className="w-4 h-4" /> Behavior & Sensory
          </TabsTrigger>
          <TabsTrigger value="medical" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <Stethoscope className="w-4 h-4" /> Medical
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
            <Home className="w-4 h-4" /> Daily Living
          </TabsTrigger>
        </TabsList>

        {/* Snapshot Tab */}
        <TabsContent value="snapshot" className="m-0 border-none p-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="calm-card p-6 bg-red-50/50 border-red-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 border-2 border-red-200 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-red-900">Chief Concern</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-red-800">Primary Reason:</span> Frequent school meltdowns.</div>
                <div><span className="font-bold text-red-800">Symptoms:</span> High anxiety during transitions, severe sensitivity to noise.</div>
                <div><span className="font-bold text-red-800">Onset:</span> Beginning of the new school year (2 months ago).</div>
                <div><span className="font-bold text-red-800">Severity:</span> Moderate to severe; actively disrupts learning.</div>
                <div><span className="font-bold text-red-800">Daily Impact:</span> Avoidance of school, disrupted family routine.</div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border-2 border-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Demographics</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-bold text-muted-foreground block text-xs uppercase">Full Name</span> Leo Jenkins</div>
                  <div><span className="font-bold text-muted-foreground block text-xs uppercase">DOB</span> 14 May 2017</div>
                  <div><span className="font-bold text-muted-foreground block text-xs uppercase">Gender</span> Male</div>
                  <div><span className="font-bold text-muted-foreground block text-xs uppercase">Vitals</span> 128cm / 28kg</div>
                  <div className="col-span-2"><span className="font-bold text-muted-foreground block text-xs uppercase">School</span> Oakwood Elementary, Grade 3</div>
                  <div className="col-span-2"><span className="font-bold text-muted-foreground block text-xs uppercase">Address</span> 123 Maple Street, Cityville</div>
                  <div className="col-span-2"><span className="font-bold text-muted-foreground block text-xs uppercase">Emergency Contact</span> Jane Jenkins (Mother) - 555-0102</div>
                </div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-200 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Mental Health Status</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Anxiety:</span> High generalized anxiety.</div>
                <div><span className="font-bold text-muted-foreground">ADHD symptoms:</span> Mild inattention in class.</div>
                <div><span className="font-bold text-muted-foreground">Current Stressors:</span> Triggered strongly by academic demands and transitions.</div>
              </div>
            </div>

          </div>
        </TabsContent>

        {/* Development Tab */}
        <TabsContent value="development" className="m-0 border-none p-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 border-2 border-purple-200 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Autism History</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Age Diagnosed:</span> 3 years old (by Dr. Smith, Pediatric Neurologist)</div>
                <div><span className="font-bold text-muted-foreground">Support Level:</span> Level 1 (Requiring support)</div>
                <div><span className="font-bold text-muted-foreground">Previous Evaluations:</span> ADOS-2 administered at age 4.</div>
                <div><span className="font-bold text-muted-foreground">Developmental Milestones:</span> Speech delayed until age 3.5.</div>
                <div><span className="font-bold text-muted-foreground">Skill Regression:</span> None reported.</div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-200 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Communication Profile</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Preferred Method:</span> Spoken language (verbal).</div>
                <div><span className="font-bold text-muted-foreground">Receptive Language:</span> Needs single-step directions.</div>
                <div><span className="font-bold text-muted-foreground">Expressive Challenges:</span> Struggles with abstract concepts.</div>
                <div><span className="font-bold text-muted-foreground">Social Pragmatics:</span> Avoids direct eye contact, struggles with conversational turn-taking.</div>
              </div>
            </div>

            <div className="calm-card p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 border-2 border-green-200 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Education & Interventions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium leading-relaxed">
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-2">School Status</span>
                  Mainstream classroom with an active IEP.
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-2">Accommodations</span>
                  Extra time on tasks, scheduled sensory breaks, visual schedule on desk.
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-2">Therapies</span>
                  Occupational Therapy (1x/week), Social Skills Group (bi-weekly).
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-2">Current Goals</span>
                  Reduce school-related anxiety, improve peer interaction during recess.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Behavior & Sensory Tab */}
        <TabsContent value="behavior" className="m-0 border-none p-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 border-2 border-orange-200 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Sensory Processing</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Auditory:</span> Highly sensitive to loud sounds (wears noise-canceling headphones).</div>
                <div><span className="font-bold text-muted-foreground">Visual:</span> Mildly sensitive to fluorescent lights.</div>
                <div><span className="font-bold text-muted-foreground">Tactile:</span> Cannot tolerate clothing tags or tight clothes.</div>
                <div><span className="font-bold text-muted-foreground">Olfactory:</span> Sensitive to perfumes.</div>
                <div><span className="font-bold text-muted-foreground">Proprioceptive:</span> Pain sensitivity has a high threshold (under-responsive).</div>
                <div><span className="font-bold text-muted-foreground">Vestibular:</span> Overwhelmed in busy, moving crowds.</div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 border-2 border-yellow-200 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Behavioral Patterns</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Stimming:</span> Hand flapping when excited. Echolalia (movie quotes) when stressed.</div>
                <div><span className="font-bold text-muted-foreground">Routines:</span> High distress with changes; heavily relies on visual schedules.</div>
                <div><span className="font-bold text-muted-foreground">Meltdowns:</span> 2-3 times per week, usually at school.</div>
                <div><span className="font-bold text-muted-foreground">Aggression:</span> Occasionally throws objects when deeply overwhelmed.</div>
                <div><span className="font-bold text-muted-foreground">Elopement:</span> Known flight risk when highly distressed.</div>
              </div>
            </div>

            <div className="calm-card p-6 lg:col-span-2 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-black mb-4 text-primary">Strengths & Coping Strategies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium leading-relaxed">
                <div>
                  <span className="font-bold text-primary block mb-1">Special Interests</span>
                  Deeply interested in engineering, building complex models, and memorizing local transit maps.
                </div>
                <div>
                  <span className="font-bold text-primary block mb-1">Effective Calming Strategies</span>
                  Responds well to deep pressure therapy, sorting lego blocks by color/size, and listening to familiar music.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Medical Tab */}
        <TabsContent value="medical" className="m-0 border-none p-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 border-2 border-cyan-200 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Medical History</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Previous Illnesses:</span> Frequent ear infections as a toddler.</div>
                <div><span className="font-bold text-muted-foreground">Surgeries:</span> Ear tubes inserted at age 2.</div>
                <div><span className="font-bold text-muted-foreground">Neurological:</span> No history of seizures or epilepsy.</div>
                <div><span className="font-bold text-muted-foreground">Senses:</span> Vision and hearing tests within normal limits.</div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 border-2 border-pink-200 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Medications & Allergies</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Current Prescriptions:</span> None active.</div>
                <div><span className="font-bold text-muted-foreground">OTC / Supplements:</span> Melatonin 3mg (nightly for sleep onset), Daily Multivitamin.</div>
                <div><span className="font-bold text-red-600">Allergies:</span> Penicillin.</div>
              </div>
            </div>

            <div className="calm-card p-6 lg:col-span-2">
              <h3 className="text-xl font-black mb-4">Family History</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-medium leading-relaxed">
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-1">Autism</span>
                  Uncle on father's side.
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-1">Anxiety/Depression</span>
                  Mother diagnosed with GAD.
                </div>
                <div>
                  <span className="font-bold text-muted-foreground block text-xs uppercase mb-1">ADHD</span>
                  None known.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Daily Living Tab */}
        <TabsContent value="daily" className="m-0 border-none p-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 border-2 border-green-200 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Adaptive Skills</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Dressing:</span> Independent but needs prompting to stay on task.</div>
                <div><span className="font-bold text-muted-foreground">Hygiene:</span> Dislikes teeth brushing due to sensory aversion.</div>
                <div><span className="font-bold text-muted-foreground">Toileting:</span> Fully trained.</div>
                <div><span className="font-bold text-muted-foreground">Time Management:</span> Requires visual timers for activity transitions.</div>
                <div><span className="font-bold text-muted-foreground">Safety Awareness:</span> Limited road safety awareness.</div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 border-2 border-blue-200 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Sleep Profile</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Routine:</span> Requires a strict 8:00 PM wind-down routine.</div>
                <div><span className="font-bold text-muted-foreground">Sleep Onset:</span> Often takes 1-2 hours to fall asleep.</div>
                <div><span className="font-bold text-muted-foreground">Maintenance:</span> Occasional night awakenings (1-2 times/week).</div>
                <div><span className="font-bold text-muted-foreground">Daytime:</span> Moderate daytime sleepiness, especially on demanding school days.</div>
              </div>
            </div>

            <div className="calm-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 border-2 border-orange-200 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">Nutrition</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div><span className="font-bold text-muted-foreground">Preferences:</span> Highly selective (bland foods, plain pasta, chicken nuggets).</div>
                <div><span className="font-bold text-muted-foreground">Aversions:</span> Avoids mixed textures or sauces entirely.</div>
                <div><span className="font-bold text-muted-foreground">Appetite:</span> Normal volume intake.</div>
                <div><span className="font-bold text-muted-foreground">Gastrointestinal:</span> Occasional constipation.</div>
              </div>
            </div>
            
            <div className="calm-card p-6">
              <h3 className="text-xl font-black mb-4">Support System</h3>
              <div className="space-y-4 text-sm font-medium leading-relaxed">
                <div>Lives with both mother and father in a stable home environment.</div>
                <div>Supportive extended family (grandparents) live nearby and assist with childcare when needed.</div>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </DoctorShell>
  );
}
