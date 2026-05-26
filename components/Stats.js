'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function Stats() {
  const { translations } = useContext(AppContext);

  const stats = [
    { icon: 'fa-users', number: '500+', label: translations.candidatesPlaced },
    { icon: 'fa-building', number: '100+', label: translations.happyClients },
    { icon: 'fa-award', number: '2+', label: translations.yearsExp },
  ];

  return (
    <section className="py-12 px-6 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <i className={`fa-solid ${stat.icon} text-3xl text-primary mb-3 block`}></i>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}