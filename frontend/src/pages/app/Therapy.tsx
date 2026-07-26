import { useState } from "react";
import { Search, PlayCircle, Clock, User, Sparkles, Video, Calendar, Star, Trophy, Target, Gamepad2, PenTool, BookOpen, Smile, Frown, Meh, Angry, Flame } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const therapyVideos = [
  {
    id: 1,
    title: "Breathing Exercises",
    therapist: "Dr. Smith",
    duration: "10 mins",
    thumbnailColor: "bg-secondary",
    emoji: "🌬️",
    tags: ["Calming", "Focus"]
  },
  {
    id: 2,
    title: "Handling Frustration",
    therapist: "Therapist Anna",
    duration: "15 mins",
    thumbnailColor: "bg-primary",
    emoji: "💛",
    tags: ["Emotions", "Growth"]
  },
  {
    id: 3,
    title: "Sleep Better Tonight",
    therapist: "Dr. Lee",
    duration: "12 mins",
    thumbnailColor: "bg-accent",
    emoji: "🌙",
    tags: ["Rest", "Evening"]
  },
  {
    id: 4,
    title: "Social Confidence",
    therapist: "Dr. Smith",
    duration: "20 mins",
    thumbnailColor: "bg-secondary",
    emoji: "🤝",
    tags: ["Social", "Practice"]
  },
  {
    id: 5,
    title: "Morning Positivity",
    therapist: "Therapist Anna",
    duration: "5 mins",
    thumbnailColor: "bg-primary",
    emoji: "☀️",
    tags: ["Morning", "Joy"]
  },
  {
    id: 6,
    title: "Understanding Big Feelings",
    therapist: "Dr. Lee",
    duration: "18 mins",
    thumbnailColor: "bg-accent",
    emoji: "🌊",
    tags: ["Emotions", "Learning"]
  }
];

const quickActivities = [
  { title: "Emotion Match", icon: <Smile className="w-6 h-6" />, color: "bg-blue-100 border-blue-400 text-blue-700" },
  { title: "Memory Game", icon: <Gamepad2 className="w-6 h-6" />, color: "bg-purple-100 border-purple-400 text-purple-700" },
  { title: "Drawing Time", icon: <PenTool className="w-6 h-6" />, color: "bg-green-100 border-green-400 text-green-700" },
  { title: "Social Story", icon: <BookOpen className="w-6 h-6" />, color: "bg-orange-100 border-orange-400 text-orange-700" },
];

const Therapy = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mood, setMood] = useState<string | null>(null);

  const filteredVideos = therapyVideos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.therapist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppShell title="Therapy Session" subtitle="Watch videos uploaded by your doctor to help you feel your best." fullWidth>
      
      <div className="flex flex-col gap-10 pb-10">
        
        {/* TOP BAR: Mood Check & Search */}
        <div className="grid lg:grid-cols-2 gap-8 items-center z-10" style={{ animation: "fade-up 0.4s ease forwards" }}>
          
          {/* Mood Check */}
          <div className="calm-card bg-white p-6 border-4 border-foreground shadow-pop flex flex-col sm:flex-row items-center justify-between gap-6">
            <h2 className="text-xl font-black text-foreground text-center sm:text-left">How are you feeling today?</h2>
            <div className="flex gap-2 sm:gap-4">
              {[
                { emoji: "😊", label: "Happy", color: "hover:bg-green-100" },
                { emoji: "😐", label: "Okay", color: "hover:bg-yellow-100" },
                { emoji: "😢", label: "Sad", color: "hover:bg-blue-100" },
                { emoji: "😟", label: "Worried", color: "hover:bg-purple-100" },
                { emoji: "😠", label: "Angry", color: "hover:bg-red-100" },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 text-3xl sm:text-4xl rounded-2xl border-4 transition-all flex items-center justify-center
                    ${mood === m.label ? 'border-foreground shadow-pop bg-secondary -translate-y-2' : 'border-transparent bg-muted/50 hover:-translate-y-1 hover:border-foreground/20'}
                  `}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-4 border-foreground bg-white shadow-pop focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all text-lg font-bold placeholder:font-bold placeholder:text-muted-foreground"
              placeholder="Search for videos or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* MAIN GRID: Dashboard Areas */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Progress & Next Session */}
          <div className="lg:col-span-3 flex flex-col gap-6" style={{ animation: "fade-up 0.4s ease 100ms forwards" }}>
            
            {/* My Progress */}
            <div className="calm-card bg-blue-50 border-4 border-foreground shadow-pop p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-black text-blue-900">My Progress</h3>
              </div>
              <ul className="space-y-4 font-bold text-lg text-blue-800">
                <li className="flex justify-between items-center bg-white px-4 py-2 rounded-xl border-2 border-blue-200">
                  <span>⭐ Sessions Attended</span> <span>12</span>
                </li>
                <li className="flex justify-between items-center bg-white px-4 py-2 rounded-xl border-2 border-blue-200">
                  <span>🏅 Badges Earned</span> <span>6</span>
                </li>
                <li className="flex justify-between items-center bg-white px-4 py-2 rounded-xl border-2 border-blue-200">
                  <span>🔥 Practice Streak</span> <span>5 days</span>
                </li>
              </ul>
            </div>

            {/* Reward Section */}
            <div className="calm-card bg-yellow-100 border-4 border-foreground shadow-pop p-6 text-center relative overflow-hidden group">
               <div className="absolute top-2 right-2 text-yellow-400 animate-spin-slow opacity-50"><Star className="w-16 h-16 fill-current"/></div>
              <h3 className="text-xl font-black text-yellow-800 mb-2 relative z-10">You earned a new badge!</h3>
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-foreground shadow-pop flex items-center justify-center my-4 relative z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-transform">
                <span className="text-5xl">🏆</span>
              </div>
              <p className="font-black text-xl text-yellow-900 relative z-10">Kind Communicator</p>
            </div>

            {/* Next Session */}
            <div className="calm-card bg-purple-50 border-4 border-foreground shadow-pop p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-purple-500" />
                <h3 className="text-2xl font-black text-purple-900">Next Session</h3>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-purple-200">
                <p className="font-black text-xl text-purple-900 mb-1">Tomorrow</p>
                <div className="flex items-center justify-between text-purple-700 font-bold">
                  <span>10:00 AM</span>
                  <span className="bg-purple-100 px-3 py-1 rounded-full text-sm">Dr. Mehta</span>
                </div>
              </div>
            </div>

          </div>

          {/* MIDDLE: Live Session & Goals */}
          <div className="lg:col-span-6 flex flex-col gap-6" style={{ animation: "fade-up 0.4s ease 200ms forwards" }}>
            
            {/* Live Session Banner */}
            <div className="calm-card bg-gradient-to-br from-green-300 via-green-200 to-green-100 border-4 border-foreground shadow-pop-lg p-8 sm:p-10 flex flex-col items-center gap-6 relative overflow-hidden group text-center flex-1 justify-center">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/30 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/40 rounded-full blur-xl animate-float pointer-events-none" />

              <div className="w-32 h-32 bg-white border-4 border-foreground rounded-full shadow-pop flex items-center justify-center animate-wiggle relative z-10">
                <span className="text-6xl">🧑‍⚕️</span>
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-foreground w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              
              <div className="z-10">
                <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Live Session Today!</h2>
                <p className="text-xl font-bold text-foreground/80 mb-8">Dr. Mehta is ready to play some fun games with you.</p>
                
                <a 
                  href="/app/therapy/room" 
                  className="inline-flex items-center justify-center h-20 px-12 text-3xl font-black rounded-[2rem] bg-primary text-primary-foreground border-4 border-foreground shadow-pop hover:shadow-pop-xl hover:-translate-y-3 transition-all active:translate-y-1 active:shadow-pop group-hover:animate-bounce-slow"
                >
                  <Video className="w-10 h-10 mr-4" /> Join Now
                </a>
              </div>
            </div>

            {/* Today's Goal */}
            <div className="calm-card bg-red-50 border-4 border-foreground shadow-pop p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-red-500" />
                <h3 className="text-2xl font-black text-red-900">Today's Goal</h3>
              </div>
              <p className="text-red-700 font-bold mb-4">A simple reminder from the doctor.</p>
              
              <div className="flex flex-col gap-3">
                <div className="bg-white border-2 border-red-200 rounded-xl p-4 flex items-center gap-4 group cursor-pointer hover:border-red-400 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">😊</div>
                  <span className="font-bold text-lg text-red-900">Practice saying "Hello"</span>
                </div>
                <div className="bg-white border-2 border-red-200 rounded-xl p-4 flex items-center gap-4 group cursor-pointer hover:border-red-400 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⭐</div>
                  <span className="font-bold text-lg text-red-900">Complete one breathing exercise</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Quick Activities */}
          <div className="lg:col-span-3 flex flex-col gap-6" style={{ animation: "fade-up 0.4s ease 300ms forwards" }}>
            
            <div className="calm-card bg-orange-50 border-4 border-foreground shadow-pop p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Gamepad2 className="w-8 h-8 text-orange-500" />
                <h3 className="text-2xl font-black text-orange-900">Quick Activities</h3>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                {quickActivities.map((activity, index) => (
                  <button 
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-4 ${activity.color} bg-white shadow-sm hover:shadow-pop hover:-translate-y-1 transition-all text-left font-black text-lg`}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border-2 border-current">
                      {activity.icon}
                    </div>
                    {activity.title}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM: Therapy Videos */}
        <div style={{ animation: "fade-up 0.4s ease 400ms forwards" }}>
          <div className="flex items-center gap-3 mb-6">
            <PlayCircle className="w-8 h-8 text-foreground" />
            <h3 className="text-3xl font-black text-foreground">Therapy Videos</h3>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="calm-card text-center py-12 relative overflow-hidden bg-white border-4 border-foreground shadow-pop">
              <div className="flex justify-center gap-3 mb-4">
                <span className="text-6xl animate-bounce-slow">🔍</span>
              </div>
              <h3 className="text-2xl font-black mb-2">No videos found!</h3>
              <p className="text-muted-foreground text-lg font-bold">Try searching for something else like "Sleep" or "Dr. Smith".</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="calm-card bg-white p-4 flex flex-col group cursor-pointer hover:-translate-y-2 hover:shadow-pop-lg transition-all duration-300 relative overflow-hidden border-4 border-foreground shadow-pop"
                >
                  {/* Video Thumbnail Placeholder */}
                  <div className={`w-full aspect-video rounded-xl ${video.thumbnailColor} border-4 border-foreground mb-4 relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent mix-blend-overlay" />
                    <span className="text-6xl group-hover:scale-110 group-hover:animate-wiggle transition-transform duration-300 relative z-10">
                      {video.emoji}
                    </span>
                    <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <div className="w-16 h-16 rounded-full bg-primary border-4 border-foreground flex items-center justify-center shadow-pop-sm group-hover:scale-110 transition-transform duration-300">
                        <PlayCircle className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-black text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                    
                    <div className="flex items-center gap-2 text-base text-muted-foreground mb-4 font-bold">
                      <User className="w-5 h-5 text-primary" />
                      <span>{video.therapist}</span>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t-4 border-muted">
                      <div className="flex gap-1.5 flex-wrap">
                        {video.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-accent text-accent-foreground text-sm font-black rounded-full border-2 border-foreground/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-black text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
};

export default Therapy;
