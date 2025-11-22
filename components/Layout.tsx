import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "text-wave-accent border-b-2 border-wave-accent" 
      : "text-gray-400 hover:text-white transition-colors";
  };

  return (
    <div className="min-h-screen flex flex-col bg-wave-950 text-slate-50 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-wave-900/80 backdrop-blur-md border-b border-wave-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                {/* Logo Placeholder */}
                <div className="w-8 h-8 bg-gradient-to-br from-wave-accent to-wave-secondary rounded-lg flex items-center justify-center font-bold text-white">
                  W
                </div>
                <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-wave-accent to-wave-secondary">
                  WAVEWARZ
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className={`px-3 py-2 text-sm font-medium ${isActive('/')}`}>
                  Dashboard
                </Link>
                <Link to="/battles" className={`px-3 py-2 text-sm font-medium ${isActive('/battles')}`}>
                  Battles
                </Link>
                <a 
                  href="https://wavewarz.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Live Platform
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col items-end">
                 <span className="text-xs text-gray-400">Solana Mainnet</span>
                 <span className="text-xs text-wave-success flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-wave-success animate-pulse"></span>
                   Online
                 </span>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-wave-900 border-t border-wave-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 WaveWarZ. Built on Solana.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0 text-sm text-gray-500">
              <a href="#" className="hover:text-white">Whitepaper</a>
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;