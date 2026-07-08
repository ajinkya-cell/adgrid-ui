"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "../lib/utils";

// Types
export interface PookieFormField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  validation?: (value: string) => { valid: boolean; error?: string };
}

export interface PookieFormProps {
  title?: string;
  serialNumber?: string;
  buttonText?: string;
  fields?: PookieFormField[];
  footerText?: string;
  backgroundColor?: string;     // E.g. #ECE9DF
  paperTexture?: boolean;       // Enable subtle grain
  showScrews?: boolean;         // Show corner screws
  shadowIntensity?: "low" | "medium" | "high";
  rounded?: "sm" | "md" | "lg" | "xl" | "none";
  onSubmit?: (data: Record<string, string>) => void | Promise<void>;
  className?: string;
}

// Corner Screw Sub-component
function Screw({ angle }: { angle: number }) {
  return (
    <div
      className="relative w-3.5 h-3.5 rounded-full border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)] flex items-center justify-center select-none"
      style={{
        background: "radial-gradient(circle at 35% 35%, #f1f0ea 20%, #dcdad0 60%, #b8b6ad 100%)",
      }}
    >
      <div className="absolute inset-[0.5px] rounded-full border border-white/20 pointer-events-none" />
      <div
        className="w-2.5 h-[1.5px] bg-[#5c5b56] rounded-sm shadow-[0_0.5px_0.5px_rgba(255,255,255,0.2)]"
        style={{ transform: `rotate(${angle}deg)` }}
      />
    </div>
  );
}

const DEFAULT_FIELDS: PookieFormField[] = [
  { name: "name", label: "IDENTIFIER / NAME", placeholder: "Enter name...", required: true },
  { name: "email", label: "DIGITAL PROTOCOL / EMAIL", type: "email", placeholder: "email@address.com", required: true },
  { name: "context", label: "IMAGINATIVE CONTEXT", type: "textarea", placeholder: "What will you build?", required: true },
];

export function PookieForm({
  title = "Workshop Entry",
  serialNumber = "REGISTRY",
  buttonText = "SUBMIT PLATE",
  fields = DEFAULT_FIELDS,
  footerText = "Processed by organic, free-range algorithms.\nExpect a response when the sun aligns with the servers.",
  backgroundColor = "#ECE9DF",
  paperTexture = true,
  showScrews = true,
  shadowIntensity = "medium",
  rounded = "lg",
  onSubmit,
  className,
}: PookieFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track form values and errors
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize form fields
  useEffect(() => {
    const initialData: Record<string, string> = {};
    fields.forEach((f) => {
      initialData[f.name] = f.defaultValue ?? "";
    });
    setFormData(initialData);
  }, [fields]);

  // Screw rotation angles generated once on mount
  const [screwAngles, setScrewAngles] = useState<number[]>([45, 45, 45, 45]);
  useEffect(() => {
    setScrewAngles(Array.from({ length: 4 }, () => Math.floor(Math.random() * 180)));
  }, []);

  // Cursor spotlight coordinates for paper texture shine
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightBg = useMotionTemplate`radial-gradient(circle 350px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.15), transparent)`;

  const handleInputChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    // Simple validation
    fields.forEach((f) => {
      const val = formData[f.name] || "";
      if (f.required && !val.trim()) {
        newErrors[f.name] = `${f.label} is required`;
      } else if (f.validation && val) {
        const check = f.validation(val);
        if (!check.valid) {
          newErrors[f.name] = check.error || "Invalid input";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSubmitSuccess(true);
      // Reset form
      const resetData: Record<string, string> = {};
      fields.forEach((f) => {
        resetData[f.name] = "";
      });
      setFormData(resetData);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error("Form submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shadow class mappings (refined 3D shadows)
  const shadowClasses = {
    low: "shadow-[0_8px_20px_rgba(0,0,0,0.03),inset_0_0_0_1px_rgba(255,255,255,0.4),inset_0_1px_0_rgba(255,255,255,0.6)]",
    medium: "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,0.65),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-2px_6px_rgba(0,0,0,0.04)]",
    high: "shadow-[0_45px_100px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.8),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-3px_10px_rgba(0,0,0,0.06)]",
  };

  // Rounded class mappings
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-[4px]",
    md: "rounded-[8px]",
    lg: "rounded-[10px]",
    xl: "rounded-[16px]",
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "pookie-form-container relative w-full max-w-[900px] p-6 sm:p-12 border-y border-black/[0.08] select-none overflow-hidden transition-all duration-300 flex flex-col justify-between",
        shadowClasses[shadowIntensity],
        roundedClasses[rounded],
        className
      )}
      style={{ backgroundColor }}
    >
      {/* Force Plus Jakarta Sans font stack */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pookie-form-container, .pookie-form-container * {
          font-family: var(--font-plus-jakarta), sans-serif !important;
        }
      `}} />

      {/* Recycled paper grain texture */}
      {paperTexture && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.4) 1px, transparent 0)`,
            backgroundSize: "8px 8px",
          }}
        />
      )}

      {/* Interactive lighting following cursor */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: spotlightBg }}
      />

      {/* Decorative corner screws */}
      {showScrews && (
        <>
          <div className="absolute top-4 left-4 z-[2]"><Screw angle={screwAngles[0]!} /></div>
          <div className="absolute top-4 right-4 z-[2]"><Screw angle={screwAngles[1]!} /></div>
          <div className="absolute bottom-4 left-4 z-[2]"><Screw angle={screwAngles[2]!} /></div>
          <div className="absolute bottom-4 right-4 z-[2]"><Screw angle={screwAngles[3]!} /></div>
        </>
      )}

      {/* Header */}
      <div className="mb-10 text-left relative z-[2]">
        <div className="font-mono text-[13px] text-[#696969] tracking-[0.22em] font-bold uppercase">
          {serialNumber}
        </div>
        <h1 className="text-[36px] sm:text-[54px] font-bold leading-none text-[#1A1A1A] tracking-tight mt-2 select-none">
          {title}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-8 relative z-[2]">
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label
                htmlFor={field.name}
                className="text-[12px] font-semibold text-[#696969] tracking-[0.18em] uppercase text-left"
              >
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full bg-[#EBE8DD] text-[18px] sm:text-[20px] font-normal text-[#1A1A1A] rounded-[4px] px-5 py-4 placeholder-[#a3a195] shadow-[inset_0_4px_8px_rgba(0,0,0,0.14),inset_0_0_0_1px_rgba(0,0,0,0.03),0_1.5px_0_rgba(255,255,255,0.7)] outline-none focus:shadow-[inset_0_4px_10px_rgba(0,0,0,0.18),inset_0_0_0_1px_rgba(0,0,0,0.05),0_1.5px_0_rgba(255,255,255,0.85)] focus:bg-white focus:text-black transition-all duration-200 resize-none"
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full h-[58px] bg-[#EBE8DD] text-[18px] sm:text-[20px] font-normal text-[#1A1A1A] rounded-[4px] px-5 placeholder-[#a3a195] shadow-[inset_0_4px_8px_rgba(0,0,0,0.14),inset_0_0_0_1px_rgba(0,0,0,0.03),0_1.5px_0_rgba(255,255,255,0.7)] outline-none focus:shadow-[inset_0_4px_10px_rgba(0,0,0,0.18),inset_0_0_0_1px_rgba(0,0,0,0.05),0_1.5px_0_rgba(255,255,255,0.85)] focus:bg-white focus:text-black transition-all duration-200"
                />
              )}

              {errors[field.name] && (
                <span className="text-[11px] text-red-500 font-mono text-left tracking-wide mt-0.5">
                  * {errors[field.name]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-black/[0.04]">
          {/* Muted paragraph info */}
          <div className="text-left max-w-[260px] text-[11px] leading-[1.6] text-[#696969] whitespace-pre-line font-medium">
            {footerText}
          </div>

          {/* 3D Mechanical Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{
              boxShadow: "0 1px 0 rgba(255,255,255,0.6), 0 12px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 2px rgba(0,0,0,0.04)",
              transition: {
                duration: 0.22,
                ease: "easeOut",
              },
            }}
            whileTap={{
              scale: 0.95,
              y: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
            className="w-full sm:w-[220px] h-[64px] bg-[#F0EEE5] text-[#171717] rounded-[6px] border border-black/[0.05] shadow-[0_1px_0_rgba(255,255,255,0.6),0_8px_18px_rgba(0,0,0,0.08),0_18px_35px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_2px_rgba(0,0,0,0.04)] text-[18px] font-bold uppercase tracking-[0.04em] cursor-pointer outline-none transition-colors duration-150 flex items-center justify-center disabled:opacity-50 hover:brightness-[1.02] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08),0_8px_18px_rgba(0,0,0,0.08)]"
            style={{
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))",
              padding: "0 32px",
            }}
          >
            {isSubmitting ? "PROCESSING..." : buttonText}
          </motion.button>
        </div>
      </form>

      {/* Success Banner */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 shadow-sm relative z-[2]"
        >
          <p className="text-[12px] font-semibold text-green-700 text-center uppercase tracking-wider">
            ✓ Registration Placed Successfully
          </p>
        </motion.div>
      )}
    </div>
  );
}
