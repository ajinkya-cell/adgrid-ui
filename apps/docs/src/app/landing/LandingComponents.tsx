"use client";

import React from "react";
import { motion } from "framer-motion";

// ─── FeatureCard (Dark Theme) ───
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    className="relative p-8 rounded-2xl border bg-white/[0.03] backdrop-blur-sm transition-all duration-500 border-white/10 hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1"
  >
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-300 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-100 mb-3 tracking-tight">
      {title}
    </h3>
    <p className="text-gray-400 leading-relaxed text-base">
      {description}
    </p>
  </motion.div>
);

// ─── StatItem (Dark Theme) ───
interface StatItemProps {
  number: string;
  label: string;
}

export const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="text-4xl md:text-5xl font-medium text-gray-100 tracking-wide font-serif">
      {number}
    </div>
    <div className="text-sm text-gray-500 font-medium tracking-wide uppercase">
      {label}
    </div>
  </div>
);

// ─── FooterDark ───
export const FooterDark: React.FC = () => (
  <footer className="bg-[#030305] border-t border-white/5 py-16 px-6">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white overflow-hidden shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span className="font-mono text-black text-sm font-black">▲</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              adgrid.
            </span>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-md">
            The growth engine for modern creators. Automate editing, distribution, and analytics — so you can focus on creating.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-white transition-colors">Engine</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Showcase</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Growth OS</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} adgrid. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);