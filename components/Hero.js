'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function Hero() {
  const { setCurrentView, translations } = useContext(AppContext);

  return (
    <section className="relative w-full h-screen flex items-center px-6 md:px-20" style={{
      background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%), url('https://github.com/AshiLara2007/ZODManpower/blob/main/backgroundlimage1.png?raw=true')`,
      backgroundSize: 'cover', backgroundPosition: 'center'
    }}>
      <div className="max-w-[650px] mt-16">
        <div className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary-dark px-4 py-1.5 rounded-full text-[11px] font-bold uppercase mb-6">
          <span className="text-primary text-sm">•</span> {translations.location}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white">AL-<span className="text-primary">MOHANNADI</span></h1>
        <div className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 tracking-[6px] uppercase mt-2 mb-6 relative">
          {translations.manpower}
          <span className="absolute -bottom-3 left-0 w-16 h-0.5 bg-primary"></span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-9">{translations.heroDesc}</p>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => setCurrentView('candidates')} className="btn-primary">{translations.viewCandidates} <i className="fa-solid fa-arrow-right"></i></button>
          <button onClick={() => setCurrentView('contact')} className="btn-secondary">{translations.contactAgency}</button>
        </div>
      </div>
    </section>
  );
}