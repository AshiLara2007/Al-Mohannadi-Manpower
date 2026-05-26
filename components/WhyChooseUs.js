'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function WhyChooseUs() {
  const { translations } = useContext(AppContext);

  const reasons = [
    { icon: 'fa-shield-halved', title: translations.whyTitle, desc: translations.whyDesc1, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: 'fa-user-check', title: 'Verified Workers', desc: translations.whyDesc2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { icon: 'fa-headset', title: '24/7 Support', desc: translations.whyDesc3, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: 'fa-bolt', title: 'Fast Processing', desc: translations.whyDesc4, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <section className="py-16 px-6 text-center">
      <div className="text-xs font-bold text-primary uppercase tracking-[3px] mb-3">{translations.whyChoose}</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">{translations.whyTitle}</h2>
      <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
        {reasons.map((reason, i) => (
          <div key={i} className="why-card">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 ${reason.bg} ${reason.color}`}>
              <i className={`fa-solid ${reason.icon}`}></i>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{reason.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{reason.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}