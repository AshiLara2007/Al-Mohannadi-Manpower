'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function Footer() {
  const { translations } = useContext(AppContext);

  return (
    <footer className="bg-white dark:bg-gray-900 pt-16 pb-8 px-6 md:px-16 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="logo-btn inline-flex mb-4">
            <img src="https://placehold.co/60x60/53B1E0/white?text=AM" alt="Logo" className="h-[50px] w-auto rounded-full" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{translations.footerText}</p>
        </div>
        <div>
          <h3 className="font-bold mb-4">{translations.candidates}</h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><button className="hover:text-primary transition">{translations.home}</button></li>
            <li><button className="hover:text-primary transition">{translations.candidates}</button></li>
            <li><button className="hover:text-primary transition">{translations.about}</button></li>
            <li><button className="hover:text-primary transition">{translations.contact}</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">{translations.contact}</h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><i className="fa-solid fa-location-dot text-primary w-5"></i> Doha, Qatar</li>
            <li><i className="fa-solid fa-phone text-primary w-5"></i> +974 XXXX XXXX</li>
            <li><i className="fa-solid fa-envelope text-primary w-5"></i> info@almohannadimanpower.com</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
        {translations.copyright}
      </div>
    </footer>
  );
}