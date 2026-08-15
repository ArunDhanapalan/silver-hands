import React from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import Footer from './Footer';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content antialiased">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
