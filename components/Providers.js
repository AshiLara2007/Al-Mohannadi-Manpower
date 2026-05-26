'use client';

import { AppProvider } from '@/context/AppContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Providers({ children }) {
  return (
    <AppProvider>
      <Navbar />
      <main className="pt-[95px] min-h-screen">{children}</main>
      <Footer />
    </AppProvider>
  );
}