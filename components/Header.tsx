
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string, hash?: string) => {
    setIsOpen(false);
    if (hash) {
      if (location.pathname === path) {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(path);
        setTimeout(() => {
          const element = document.getElementById(hash);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">CareCova</span>
                <span className="text-[10px] text-blue-600 font-bold tracking-[0.2em] uppercase mt-1">CareCova Healthcare</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            {NAV_LINKS.map((link) => (
              <button 
                key={link.label} 
                onClick={() => handleNavClick(link.path, link.hash)}
                className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link to="/apply" className="bg-blue-600 text-white px-7 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
              Apply Now
            </Link>
          </nav>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-6 px-4 space-y-4 animate-in slide-in-from-top duration-300">
          {NAV_LINKS.map((link) => (
            <button 
              key={link.label} 
              onClick={() => handleNavClick(link.path, link.hash)}
              className="block w-full text-left px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl"
            >
              {link.label}
            </button>
          ))}
          <Link 
            to="/apply" 
            className="block w-full text-center bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold"
            onClick={() => setIsOpen(false)}
          >
            Apply Now
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
