"use client";

import { useEffect } from 'react';
import { Architects_Daughter } from 'next/font/google';
import Hero from '@/components/hero/Hero';

const architectsDaughter = Architects_Daughter({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-handwritten',
  display: 'swap',
});

export default function HeroDemoPage() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const hasDark = html.classList.contains('dark');
    
    // Remove dark mode for clean light notebook look
    html.classList.remove('dark');
    
    return () => {
      // Re-enable dark mode when leaving this page
      if (hasDark) {
        html.classList.add('dark');
      }
    };
  }, []);

  return (
    <main className={`${architectsDaughter.variable} w-full min-h-screen relative font-body`}>
      {/* Dynamic Style Override to hide root site header and adjust margins */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide the documentation site global header */
        header { 
          display: none !important; 
        }
        
        /* Remove padding top from the root layout container for this route */
        body > div.pt-16 { 
          padding-top: 0px !important; 
        }

        /* Set overall html and body bg to white on this page only */
        html, body {
          background-color: #ffffff !important;
          color: #171717 !important;
        }
      `}} />
      
      <Hero />
    </main>
  );
}
