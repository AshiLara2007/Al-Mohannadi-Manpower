'use client';

import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';

export default function Navbar() {
  const { currentView, setCurrentView, translations, toggleLanguage, language, toggleTheme, theme } = useContext(AppContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: translations.home },
    { id: 'candidates', label: translations.candidates },
    { id: 'about', label: translations.about },
    { id: 'contact', label: translations.contact },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 px-6 md:px-16 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md h-20 shadow-sm' : 'bg-transparent h-24'}`}>
      <div className="flex justify-between items-center h-full">
        <button onClick={() => setCurrentView('home')} className="logo-btn">
          <img src="https://placehold.co/70x70/53B1E0/white?text=AM" alt="Logo" className={`transition-all ${scrolled ? 'h-[50px]' : 'h-[65px]'} w-auto rounded-full`} />
        </button>

        <ul className="hidden md:flex gap-4">
          {navItems.map(item => (
            <li key={item.id}>
              <button onClick={() => setCurrentView(item.id)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${currentView === item.id ? 'text-primary bg-primary/10 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3">
          <button onClick={toggleLanguage} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium">
            <i className="fa-solid fa-globe mr-2"></i> {language}
          </button>
          <button onClick={toggleTheme} className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm">
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
          <button className="bg-primary/10 border border-primary text-primary px-5 py-2 rounded-lg text-sm font-semibold">
            <i className="fa-solid fa-shield-halved mr-2"></i> Admin
          </button>
        </div>

        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden flex flex-col gap-1.5">
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded"></span>
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded"></span>
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-white rounded"></span>
        </button>
      </div>

      {mobileMenu && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-gray-900 shadow-lg p-4 border-t border-gray-200 dark:border-gray-800">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); setMobileMenu(false); }} className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
          <button onClick={() => { toggleLanguage(); setMobileMenu(false); }} className="block w-full text-left px-4 py-3 text-sm">
            <i className="fa-solid fa-globe mr-2"></i> {language === 'EN' ? 'العربية' : 'English'}
          </button>
          <button onClick={() => { toggleTheme(); setMobileMenu(false); }} className="block w-full text-left px-4 py-3 text-sm">
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} mr-2`}></i> {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      )}
    </nav>
  );
}