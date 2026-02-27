import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, HandHeart, EyeOff, Lock, MessageCircleHeart, Frown, Smile, Angry } from "lucide-react";

export default function Landing() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Secret");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const moods = [
    { name: "Love", emoji: "❤️" },
    { name: "Sad", emoji: "😔" },
    { name: "Secret", emoji: "🤫" },
    { name: "Funny", emoji: "😂" },
    { name: "Rant", emoji: "😤" }
  ];

  const handleSubmit = async () => {
    if (!content.trim() || content.length > 500) return;
    setIsSubmitting(true);
    try {
      const categories = ["Romance", "Funny", "Dark Secrets", "School", "Work", "Misc", "Family", "Deep"];
      const colors = ["bg-pink-100", "bg-yellow-100", "bg-purple-100", "bg-blue-100", "bg-green-100", "bg-orange-100"];
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      await fetch("/api/confessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, category, color, mood }),
      });
      setShowModal(true);
      setContent("");
      setMood("Secret");
    } catch (error) {
      console.error("Failed to post confession", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-20 relative">
      <div className="absolute top-20 left-10 md:left-40 animate-pulse text-primary/40 pointer-events-none select-none">
        <Heart className="size-16 fill-current" />
      </div>
      <div className="absolute bottom-20 right-10 md:right-40 animate-pulse delay-700 text-purple-400/30 pointer-events-none select-none">
        <Mail className="size-14 fill-current" />
      </div>
      <div className="absolute top-40 right-20 animate-pulse delay-300 text-accent/30 pointer-events-none select-none">
        <HandHeart className="size-12 fill-current" />
      </div>

      <div className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(255,143,171,0.3)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/50 dark:border-white/5 p-8 md:p-12 relative overflow-hidden group/card">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="space-y-2">
            <h1 className="font-cute text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              BlushBox <span className="align-middle text-4xl md:text-5xl">💌</span>
            </h1>
            <p className="text-gray-800 dark:text-gray-300 text-lg md:text-xl font-medium max-w-lg mx-auto">
              Share your secrets anonymously with the world. No login required, just pure feelings.
            </p>
          </div>

          <div className="w-full mt-4 space-y-4">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {moods.map(m => (
                <button
                  key={m.name}
                  onClick={() => setMood(m.name)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    mood === m.name 
                      ? "bg-primary text-white shadow-md transform scale-105" 
                      : "bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-white/50 dark:border-white/10"
                  }`}
                >
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>

            <div className="relative group">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                className="w-full min-h-[160px] bg-white dark:bg-gray-900/50 border-2 border-secondary dark:border-gray-700 rounded-2xl p-5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 resize-none text-lg shadow-inner" 
                placeholder="Write your secret here..."
              />
              <div className="absolute bottom-4 left-4 text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm transition-colors duration-300 bg-white/80 dark:bg-gray-800/80 text-gray-400">
                <span className={content.length >= 500 ? "text-red-500" : ""}>{content.length}</span>/500
              </div>
              <div className="absolute bottom-4 right-4 text-gray-400 text-xs font-semibold bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-md backdrop-blur-sm">
                Anonymous
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || content.length > 500}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-primary/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group-hover/card:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Sending..." : "Send Secret"} <span className="text-xl">💖</span>
            </button>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => navigate("/feed")}
              className="inline-flex items-center gap-2 text-gray-800 dark:text-gray-400 font-bold hover:text-primary dark:hover:text-primary transition-colors group"
            >
              View Confessions 
              <span className="text-xl group-hover:scale-110 transition-transform">👀</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20 w-full max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-cute text-3xl font-bold text-gray-900 dark:text-white mb-3">Why BlushBox?</h2>
          <p className="text-gray-800 dark:text-gray-400">A safe space to let it all out.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center mb-4">
              <EyeOff className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Fully Anonymous</h3>
            <p className="text-gray-800 dark:text-gray-400 text-sm leading-relaxed">
              We don't track your IP or identity. Your secrets are safe with us, completely untraceable.
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center mb-4">
              <Lock className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Safe & Secure</h3>
            <p className="text-gray-800 dark:text-gray-400 text-sm leading-relaxed">
              End-to-end encryption ensures your thoughts remain private until you choose to share them.
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="size-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center mb-4">
              <MessageCircleHeart className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Supportive Community</h3>
            <p className="text-gray-800 dark:text-gray-400 text-sm leading-relaxed">
              Read others' confessions and send support without revealing who you are.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center transform scale-100 border-4 border-secondary dark:border-gray-700 overflow-hidden">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full h-32 overflow-hidden pointer-events-none">
              <div className="absolute top-2 left-[10%] text-xl animate-bounce" style={{animationDelay: "0.1s"}}>💖</div>
              <div className="absolute top-6 left-[20%] text-lg text-primary animate-pulse">✨</div>
              <div className="absolute top-1 left-[30%] w-2 h-2 bg-yellow-300 rounded-full"></div>
              <div className="absolute top-8 left-[40%] text-xl animate-bounce" style={{animationDelay: "0.3s"}}>💝</div>
              <div className="absolute top-3 left-[50%] w-3 h-3 bg-blue-200 rotate-45"></div>
              <div className="absolute top-5 left-[60%] text-lg text-accent animate-pulse">✨</div>
              <div className="absolute top-2 left-[70%] text-xl animate-bounce" style={{animationDelay: "0.2s"}}>💖</div>
              <div className="absolute top-7 left-[80%] w-2 h-2 bg-green-200 rounded-full"></div>
              <div className="absolute top-4 left-[90%] text-lg text-primary">🎉</div>
            </div>
            
            <div className="mt-10 relative z-10 space-y-4">
              <div className="w-16 h-16 bg-babyblue/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">
                🔒
              </div>
              <h3 className="font-cute text-2xl font-bold text-babyblue dark:text-blue-300">
                Your secret is safe with us! ✨
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Thank you for sharing. Your confession has been sent anonymously into the universe.
              </p>
              
              <div className="pt-4">
                <button 
                  onClick={() => navigate("/feed")}
                  className="w-full bg-peach hover:bg-opacity-90 text-white font-cute font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-peach/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  View Confessions 👀
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="mt-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
