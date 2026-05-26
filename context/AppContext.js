'use client';

import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialCandidates = [
  { id: 1, name: "Amina Hassan", role: "House Maid", country: "Indonesia", salary: "1200 QAR", status: "Available", dob: "1990-05-15", gender: "Female", marital: "Single", religion: "Muslim", experience: "3-4 Years" },
  { id: 2, name: "Mohamed Ali", role: "Driver", country: "India", salary: "1500 QAR", status: "Available", dob: "1985-08-20", gender: "Male", marital: "Married", religion: "Muslim", experience: "5-7 Years" },
  { id: 3, name: "Grace Perera", role: "Nurse", country: "Philippines", salary: "2000 QAR", status: "Available", dob: "1992-03-10", gender: "Female", marital: "Single", religion: "Christian", experience: "3-4 Years" },
  { id: 4, name: "Ravi Kumar", role: "Cook", country: "India", salary: "1300 QAR", status: "Available", dob: "1988-11-25", gender: "Male", marital: "Married", religion: "Hindu", experience: "2-3 Years" },
  { id: 5, name: "Fatima Begum", role: "Teacher", country: "Bangladesh", salary: "1800 QAR", status: "Hired", dob: "1995-07-30", gender: "Female", marital: "Single", religion: "Muslim", experience: "1-2 Years" },
  { id: 6, name: "Siti Nurhaliza", role: "House Maid", country: "Indonesia", salary: "1100 QAR", status: "Available", dob: "1998-01-12", gender: "Female", marital: "Single", religion: "Muslim", experience: "0-1 Year" },
];

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('home');
  const [language, setLanguage] = useState('EN');
  const [theme, setTheme] = useState('light');
  const [candidates, setCandidates] = useState(initialCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.body.classList.add('dark');
    }
    
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'AR') {
      setLanguage('AR');
      document.body.classList.add('arabic-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    if (language === 'EN') {
      setLanguage('AR');
      document.body.classList.add('arabic-mode');
      localStorage.setItem('language', 'AR');
    } else {
      setLanguage('EN');
      document.body.classList.remove('arabic-mode');
      localStorage.setItem('language', 'EN');
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (selectedFilter !== 'All' && c.role !== selectedFilter) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.country.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const translations = {
    EN: {
      home: "Home", candidates: "Candidates", about: "About Us", contact: "Contact Us",
      location: "Doha • Qatar • Est. 2020", manpower: "Manpower",
      heroDesc: "We provide skilled and reliable workers for households and businesses across Qatar.",
      viewCandidates: "View Candidates", contactAgency: "Contact Agency",
      candidatesPlaced: "Candidates Placed", happyClients: "Happy Clients", yearsExp: "Years Experience",
      ourServices: "Our Services", servicesTitle: "Professional manpower solutions tailored to your needs",
      housemaids: "House Maids", drivers: "Drivers", nurses: "Nurses", cooks: "Cooks", teachers: "Teachers",
      whyChoose: "Why Choose Us?", whyTitle: "Providing reliable recruitment and staffing solutions",
      whyDesc1: "Fully licensed manpower agency operating in Doha, Qatar with years of experience.",
      whyDesc2: "All our candidates are thoroughly vetted, trained, and background-checked.",
      whyDesc3: "We provide continuous support to both employers and workers.",
      whyDesc4: "Quick and efficient recruitment and visa transfer processing.",
      search: "Search names, country...", filterAll: "All Roles", noResults: "No matching candidates found.",
      footerText: "Professional manpower solutions in Doha, Qatar.",
      copyright: "© 2026 AL-MOHANNADI Manpower. All Rights Reserved."
    },
    AR: {
      home: "الرئيسية", candidates: "المرشحين", about: "من نحن", contact: "اتصل بنا",
      location: "الدوحة • قطر • تأسست 2020", manpower: "القوى العاملة",
      heroDesc: "نقدم عمالاً مهرة وموثوقين للمنازل والشركات في جميع أنحاء قطر.",
      viewCandidates: "عرض المرشحين", contactAgency: "اتصل بالوكالة",
      candidatesPlaced: "مرشح تم تعيينهم", happyClients: "عميل سعيد", yearsExp: "سنوات الخبرة",
      ourServices: "خدماتنا", servicesTitle: "حلول القوى العاملة المهنية المصممة خصيصًا لاحتياجاتك",
      housemaids: "خادمات", drivers: "سائقين", nurses: "ممرضات", cooks: "طهاة", teachers: "معلمين",
      whyChoose: "لماذا تختارنا؟", whyTitle: "نقدم حلول توظيف موثوقة",
      whyDesc1: "وكالة قوى عاملة مرخصة بالكامل تعمل في الدوحة، قطر مع سنوات من الخبرة.",
      whyDesc2: "جميع مرشحينا يتم فحصهم وتدريبهم والتحقق من خلفياتهم بدقة.",
      whyDesc3: "نقدم دعماً مستمراً لكل من أصحاب العمل والعمال.",
      whyDesc4: "معالجة سريعة وفعالة للتوظيف ونقل التأشيرات.",
      search: "ابحث عن الأسماء، البلد...", filterAll: "جميع الأدوار", noResults: "لم يتم العثور على مرشحين متطابقين.",
      footerText: "حلول القوى العاملة المهنية في الدوحة، قطر.",
      copyright: "© 2026 المهندي للقوى العاملة. جميع الحقوق محفوظة."
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      language, translations: translations[language],
      toggleLanguage, toggleTheme, theme,
      candidates: filteredCandidates,
      allCandidates: candidates,
      searchQuery, setSearchQuery,
      selectedFilter, setSelectedFilter
    }}>
      {children}
    </AppContext.Provider>
  );
}