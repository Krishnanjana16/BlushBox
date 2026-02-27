import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-background-dark/80 border-b border-white/40 dark:border-white/10 px-6 py-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-tr from-primary to-accent text-white shadow-lg shadow-primary/30">
            <Heart className="size-6 fill-current" />
          </div>
          <span className="font-cute text-2xl font-bold tracking-tight text-gray-900 dark:text-white">BlushBox</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/feed" className={`text-sm font-semibold transition-colors ${location.pathname === '/feed' ? 'text-primary' : 'text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-primary'}`}>Feed</Link>
          <a href="#" className="text-sm font-semibold text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Trending</a>
          <a href="#" className="text-sm font-semibold text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">My Confessions</a>
          <a href="#" className="text-sm font-semibold text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/" className="hidden md:flex bg-primary hover:bg-accent text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-md shadow-primary/30 transition-all duration-200">
            Post Secret
          </Link>
        </div>
      </div>
    </header>
  );
}
