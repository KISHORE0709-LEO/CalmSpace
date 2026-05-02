import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const floaters = ["🌈", "⭐", "🦋", "🌸", "🎈", "✨", "🌻", "💙"];

const NotFound = () => {
  const location = useLocation();
  const [clicked, setClicked] = useState<string | null>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">

      {/* floating emojis */}
      {floaters.map((e, i) => (
        <span
          key={i}
          onClick={() => { setClicked(e); setTimeout(() => setClicked(null), 600); }}
          className={`fixed text-4xl cursor-pointer select-none z-10 hover:scale-150 transition-transform ${
            i % 3 === 0 ? "animate-float" : i % 3 === 1 ? "animate-float-delay" : "animate-bounce-slow"
          }`}
          style={{ top: `${10 + (i * 11) % 80}%`, left: `${5 + (i * 13) % 90}%`, opacity: 0.35 }}
        >
          {e}
        </span>
      ))}

      {/* burst on click */}
      {clicked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <span className="text-9xl animate-scale-in">{clicked}</span>
        </div>
      )}

      <div className="text-center relative z-20 px-6">
        {/* animated 404 */}
        <div className="relative inline-block mb-6">
          <div className="text-[10rem] md:text-[14rem] font-black leading-none text-foreground/10 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl md:text-9xl animate-bounce-slow">😕</span>
          </div>
        </div>

        <div className="bg-card border-2 border-foreground rounded-[2rem] shadow-pop-lg p-10 max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-3 right-5 text-2xl animate-float opacity-50">🌈</div>
          <div className="absolute bottom-3 left-5 text-xl animate-float-delay opacity-50">✨</div>

          <h1 className="text-3xl font-black tracking-tight mb-3">Oops! Page not found</h1>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            This page seems to have wandered off. Let's get you back somewhere safe and calm. 💙
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all"
          >
            Take me home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
