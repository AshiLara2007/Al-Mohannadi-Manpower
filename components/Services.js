'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function Services() {
  const { translations, setCurrentView } = useContext(AppContext);

  const services = [
    { name: translations.housemaids, icon: 'fa-house-chimney', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { name: translations.drivers, icon: 'fa-car-side', color: 'text-primary', bg: 'bg-primary/10' },
    { name: translations.nurses, icon: 'fa-heart-pulse', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { name: translations.cooks, icon: 'fa-utensils', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { name: translations.teachers, icon: 'fa-graduation-cap', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <section className="py-16 px-6 text-center">
      <div className="text-xs font-bold text-primary uppercase tracking-[3px] mb-3">{translations.ourServices}</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">{translations.servicesTitle}</h2>
      <div className="flex flex-wrap justify-center gap-5 max-w-5xl mx-auto">
        {services.map((service, i) => (
          <div key={i} onClick={() => setCurrentView('candidates')} className="service-card group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${service.bg} ${service.color}`}>
              <i className={`fa-solid ${service.icon}`}></i>
            </div>
            <div className="font-semibold">{service.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}