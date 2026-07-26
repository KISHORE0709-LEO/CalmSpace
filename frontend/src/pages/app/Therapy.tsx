import { useState } from "react";
import { Search, PlayCircle, Clock, User, Sparkles, Video } from "lucide-react";
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

const Therapy = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVideos = therapyVideos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    video.therapist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppShell title="Therapy Session" subtitle="Watch videos uploaded by your doctor to help you feel your best.">
      {/* Search Bar */}
      <div className="relative mb-8 max-w-2xl mx-auto z-10" style={{ animation: "fade-up 0.4s ease forwards" }}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-foreground bg-background shadow-pop-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold placeholder:font-normal"
          placeholder="Search for videos, topics, or therapists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse-soft pointer-events-none" />
      </div>

      {/* Live Session Banner */}
      <div className="mb-10 max-w-4xl mx-auto" style={{ animation: "fade-up 0.4s ease 100ms forwards" }}>
        <div className="calm-card bg-gradient-to-br from-green-300 via-green-200 to-green-100 border-4 border-foreground shadow-pop-lg p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
          
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/30 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <div className="absolute top-4 left-4 w-12 h-12 bg-white/40 rounded-full blur-xl animate-float pointer-events-none" />

          <div className="w-32 h-32 shrink-0 bg-white border-4 border-foreground rounded-full shadow-pop flex items-center justify-center animate-wiggle relative z-10">
            <span className="text-6xl">🧑‍⚕️</span>
            <div className="absolute -bottom-2 -right-2 bg-green-500 border-2 border-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2">Live Session Today!</h2>
            <p className="text-xl font-bold text-foreground/80 mb-6">Dr. Mehta is ready to play some fun games with you.</p>
            
            <a 
              href="/app/therapy/room" 
              className="inline-flex items-center justify-center h-16 px-10 text-2xl font-black rounded-2xl bg-primary text-primary-foreground border-4 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all active:translate-y-1 active:shadow-pop-sm group-hover:animate-bounce-slow"
            >
              <Video className="w-8 h-8 mr-3" /> Join Now
            </a>
          </div>
        </div>
      </div>

      {/* Featured / Empty State */}
      {filteredVideos.length === 0 && (
        <div className="calm-card text-center py-12 relative overflow-hidden" style={{ animation: "scale-in 0.5s ease forwards" }}>
           <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/30 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <div className="flex justify-center gap-3 mb-4">
            <span className="text-4xl animate-bounce-slow">🔍</span>
          </div>
          <h3 className="text-xl font-black mb-2">No videos found!</h3>
          <p className="text-muted-foreground text-sm">Try searching for something else like "Sleep" or "Dr. Smith".</p>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => (
          <div 
            key={video.id} 
            className="calm-card bg-background p-4 flex flex-col group cursor-pointer hover:-translate-y-2 hover:shadow-pop-lg transition-all duration-300 relative overflow-hidden"
            style={{ animation: `fade-up 0.5s ease ${index * 100}ms forwards` }}
          >
            {/* Video Thumbnail Placeholder */}
            <div className={`w-full aspect-video rounded-xl ${video.thumbnailColor} border-2 border-foreground mb-4 relative overflow-hidden flex items-center justify-center`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent mix-blend-overlay" />
              
              <span className="text-6xl group-hover:scale-110 group-hover:animate-wiggle transition-transform duration-300 relative z-10">
                {video.emoji}
              </span>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                <div className="w-16 h-16 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-black text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                <User className="w-4 h-4 text-primary" />
                <span>{video.therapist}</span>
              </div>
              
              <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-muted">
                <div className="flex gap-1.5">
                  {video.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full border border-foreground/10">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{video.duration}</span>
                </div>
              </div>
            </div>
            
            {/* Hover decorative element */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}
      </div>
      
    </AppShell>
  );
};

export default Therapy;
