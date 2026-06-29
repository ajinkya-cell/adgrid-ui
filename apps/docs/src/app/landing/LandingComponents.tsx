"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@adgrid-ui/ui";

// ─── FeatureCard ───
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
    className={cn(
      "relative p-8 rounded-2xl border bg-white transition-all duration-500",
      "border-neutral-200 hover:border-neutral-300",
      "shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
      "hover:-translate-y-1"
    )}
  >
    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 mb-6">
      {icon}
    </div>
    <h3 className="font-body text-xl font-semibold text-neutral-900 mb-3 tracking-tight">
      {title}
    </h3>
    <p className="font-body text-neutral-600 leading-relaxed text-base">
      {description}
    </p>
  </motion.div>
);

// ─── StatItem ───
interface StatItemProps {
  number: string;
  label: string;
}

export const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="font-handwritten text-4xl md:text-5xl font-medium text-neutral-900 tracking-wide">
      {number}
    </div>
    <div className="font-body text-sm text-neutral-500 font-medium tracking-wide uppercase">
      {label}
    </div>
  </div>
);

// ─── FooterLight ───
export const FooterLight: React.FC = () => (
  <footer className="bg-neutral-100 border-t border-neutral-200 py-16 px-6">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-black overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <span className="font-mono text-white text-sm font-black">▲</span>
            </div>
            <span className="font-body font-bold text-xl tracking-tight text-black">
              adgrid.
            </span>
          </div>
          <p className="font-body text-neutral-600 text-base leading-relaxed max-w-md">
            The growth engine for modern creators. Automate editing, distribution, and analytics — so you can focus on creating.
          </p>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Product</h4>
          <ul className="space-y-2 font-body text-sm text-neutral-600">
            <li><a href="#" className="hover:text-black transition-colors">Engine</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Showcase</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Growth OS</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2 font-body text-sm text-neutral-600">
            <li><a href="#" className="hover:text-black transition-colors">About</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-sm text-neutral-500">
          © {new Date().getFullYear()} adgrid. All rights reserved.
        </p>
        <div className="flex items-center gap-6 font-body text-sm text-neutral-500">
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
          <a href="#" className="hover:text-black transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);