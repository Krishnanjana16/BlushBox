import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Share2, Sparkles, Search, Smile, Lock, GraduationCap, Briefcase, FileText, Users, Moon, Heart, Frown, Angry, Flag, Dices, Flame } from "lucide-react";
import CommentModal from "../components/CommentModal";

interface Confession {
  id: number;
  content: string;
  category: string;
  color: string;
  mood: string;
  reaction_love: number;
  reaction_relate: number;
  reaction_shocked: number;
  reaction_funny: number;
  report_count: number;
  comment_count: number;
  created_at: string;
}

export default function Feed() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [dailyConfession, setDailyConfession] = useState<Confession | null>(null);
  const [activeMood, setActiveMood] = useState("All");
  const [sortBy, setSortBy] = useState("latest"); // latest, trending
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);

  const moods = [
    { name: "All", emoji: "✨" },
    { name: "Love", emoji: "❤️" },
    { name: "Sad", emoji: "😔" },
    { name: "Secret", emoji: "🤫" },
    { name: "Funny", emoji: "😂" },
    { name: "Rant", emoji: "😤" }
  ];

  useEffect(() => {
    fetchConfessions();
    fetchDailyConfession();
  }, [activeMood, sortBy]);

  const fetchConfessions = async () => {
    try {
      const url = new URL("/api/confessions", window.location.origin);
      if (activeMood !== "All") url.searchParams.append("mood", activeMood);
      if (sortBy === "trending") url.searchParams.append("sort", "trending");
      
      const res = await fetch(url.toString());
      const data = await res.json();
      setConfessions(data);
    } catch (error) {
      console.error("Failed to fetch confessions", error);
    }
  };

  const fetchDailyConfession = async () => {
    try {
      const res = await fetch("/api/confessions/daily");
      const data = await res.json();
      setDailyConfession(data);
    } catch (error) {
      console.error("Failed to fetch daily confession", error);
    }
  };

  const fetchRandomConfession = async () => {
    try {
      const res = await fetch("/api/confessions/random");
      const data = await res.json();
      if (data) {
        setConfessions([data]);
        setActiveMood("All");
      }
    } catch (error) {
      console.error("Failed to fetch random confession", error);
    }
  };

  const handleReact = async (id: number, type: string) => {
    try {
      await fetch(`/api/confessions/${id}/react`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      
      setConfessions(confessions.map(c => {
        if (c.id === id) {
          return { ...c, [`reaction_${type}`]: c[`reaction_${type}` as keyof Confession] as number + 1 };
        }
        return c;
      }));

      if (dailyConfession && dailyConfession.id === id) {
        setDailyConfession({ ...dailyConfession, [`reaction_${type}`]: dailyConfession[`reaction_${type}` as keyof Confession] as number + 1 });
      }
    } catch (error) {
      console.error("Failed to react to confession", error);
    }
  };

  const handleReport = async (id: number) => {
    try {
      await fetch(`/api/confessions/${id}/report`, { method: "POST" });
      alert("Confession reported. Thank you for keeping BlushBox safe.");
    } catch (error) {
      console.error("Failed to report confession", error);
    }
  };

  const filteredConfessions = confessions.filter(c => {
    return c.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const ConfessionCard: React.FC<{ confession: Confession, isDaily?: boolean }> = ({ confession, isDaily = false }) => (
    <div 
      className={`break-inside-avoid rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow ${confession.color} dark:border dark:border-black/10 relative ${isDaily ? 'border-4 border-yellow-300 shadow-yellow-200/50' : ''}`}
    >
      {isDaily && (
        <div className="absolute -top-4 -right-4 bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transform rotate-3">
          <Sparkles className="size-3" /> Confession of the Day 💌
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-white/50 dark:bg-black/10 rounded-md text-gray-800 flex items-center gap-1">
            {moods.find(m => m.name === confession.mood)?.emoji} {confession.mood}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-medium">
            {formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}
          </span>
          <button onClick={() => handleReport(confession.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Report">
            <Flag className="size-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-900 text-lg leading-relaxed mb-6 font-medium">
        {confession.content}
      </p>
      
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/10">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => handleReact(confession.id, 'love')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/70 rounded-full text-gray-700 transition-colors text-sm font-semibold">
            ❤️ {confession.reaction_love}
          </button>
          <button onClick={() => handleReact(confession.id, 'relate')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/70 rounded-full text-gray-700 transition-colors text-sm font-semibold">
            😢 {confession.reaction_relate}
          </button>
          <button onClick={() => handleReact(confession.id, 'shocked')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/70 rounded-full text-gray-700 transition-colors text-sm font-semibold">
            😮 {confession.reaction_shocked}
          </button>
          <button onClick={() => handleReact(confession.id, 'funny')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/70 rounded-full text-gray-700 transition-colors text-sm font-semibold">
            😂 {confession.reaction_funny}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedConfession(confession)}
            className="flex items-center gap-1.5 text-gray-700 hover:text-blue-500 transition-colors bg-white/40 hover:bg-white/70 px-3 py-1.5 rounded-full"
          >
            <MessageSquare className="size-4" />
            <span className="font-semibold text-sm">{confession.comment_count}</span>
          </button>
          <button className="text-gray-500 hover:text-gray-800 transition-colors p-1.5">
            <Share2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-grow px-4 py-8 md:px-8 max-w-7xl mx-auto w-full">
      {dailyConfession && (
        <div className="mb-12">
          <ConfessionCard confession={dailyConfession} isDaily={true} />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="font-cute text-4xl font-bold text-gray-900 dark:text-white">Confessions</h1>
          <button 
            onClick={fetchRandomConfession}
            className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm"
          >
            <Dices className="size-4" /> Random
          </button>
        </div>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search secrets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/60 dark:bg-gray-800/60 border border-white/50 dark:border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
          {moods.map(m => (
            <button
              key={m.name}
              onClick={() => setActiveMood(m.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeMood === m.name 
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md" 
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-white/50 dark:border-white/10"
              }`}
            >
              <span>{m.emoji}</span> {m.name}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-white/60 dark:bg-gray-800/60 rounded-full p-1 border border-white/50 dark:border-white/10">
          <button 
            onClick={() => setSortBy("latest")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${sortBy === "latest" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
          >
            Latest
          </button>
          <button 
            onClick={() => setSortBy("trending")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1 ${sortBy === "trending" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
          >
            <Flame className="size-3.5 text-orange-500" /> Trending
          </button>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredConfessions.map(confession => (
          <ConfessionCard key={confession.id} confession={confession} />
        ))}
      </div>

      {filteredConfessions.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-white/50 dark:bg-gray-800/50 mb-4 text-2xl">
            👻
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No secrets found</h3>
          <p className="text-gray-500 dark:text-gray-400">Be the first to share a secret in this category!</p>
        </div>
      )}

      {selectedConfession && (
        <CommentModal 
          confession={selectedConfession} 
          onClose={() => setSelectedConfession(null)} 
          onCommentAdded={() => {
            fetchConfessions();
          }}
        />
      )}
    </main>
  );
}
