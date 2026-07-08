"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate, useTransform } from "framer-motion";
import { ChromeInput } from "./ChromeInput";
import { ChromeSelect } from "./ChromeSelect";
import { BrushedTitaniumButton } from "./BrushedTitaniumButton";
import { cn } from "../lib/utils";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: string) => { valid: boolean; error?: string };
}

export interface MetallicFormProps {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void> | void;
  submitLabel?: string;
  className?: string;
}

interface FormError {
  [key: string]: string;
}

export function MetallicForm({
  title,
  subtitle,
  fields,
  onSubmit,
  submitLabel = "Submit",
  className,
}: MetallicFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Track focused state for styling
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [typingFields, setTypingFields] = useState<Set<string>>(new Set());
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Container spotlight coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  // 3D rotation tilt values
  const rotateX = useSpring(useTransform(mouseY, (y) => {
    if (!containerRef.current) return 0;
    const height = containerRef.current.offsetHeight || 400;
    return -((y / height) - 0.5) * 8; // Max 4 degrees tilt
  }), { stiffness: 120, damping: 20 });

  const rotateY = useSpring(useTransform(mouseX, (x) => {
    if (!containerRef.current) return 0;
    const width = containerRef.current.offsetWidth || 600;
    return ((x / width) - 0.5) * 8; // Max 4 degrees tilt
  }), { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightBg = useMotionTemplate`radial-gradient(circle 400px at ${springX}px ${springY}px, rgba(255, 255, 255, 0.04), transparent)`;

  // Textarea spotlight coordinates
  const textareaMouseX = useMotionValue(0);
  const textareaMouseY = useMotionValue(0);
  const textareaSpringX = useSpring(textareaMouseX, { stiffness: 90, damping: 20 });
  const textareaSpringY = useSpring(textareaMouseY, { stiffness: 90, damping: 20 });

  const handleTextareaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    textareaMouseX.set(e.clientX - rect.left);
    textareaMouseY.set(e.clientY - rect.top);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    // Show typing indicator
    setTypingFields((prev) => {
      const newSet = new Set(prev);
      newSet.add(fieldName);
      return newSet;
    });
    
    if (typingTimeoutsRef.current[fieldName]) {
      clearTimeout(typingTimeoutsRef.current[fieldName]);
    }
    
    typingTimeoutsRef.current[fieldName] = setTimeout(() => {
      setTypingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }, 1500);
    
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleFieldSave = (fieldName: string) => {
    if (formData[fieldName].trim()) {
      setSavedFields((prev) => {
        const newSet = new Set(prev);
        newSet.add(fieldName);
        return newSet;
      });
      setTypingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    } else {
      setSavedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    handleFieldSave(fieldName);
  };

  const validateForm = (): boolean => {
    const newErrors: FormError = {};

    fields.forEach((field) => {
      const value = formData[field.name] || "";

      if (field.required && !value.trim()) {
        newErrors[field.name] = "This field is required";
        return;
      }

      if (field.validation && value) {
        const result = field.validation(value);
        if (!result.valid) {
          newErrors[field.name] = result.error || "Invalid input";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setFormData(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}));
      setSavedFields(new Set());
      setTypingFields(new Set());
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textareaSpotlightBg = useMotionTemplate`radial-gradient(circle 120px at ${textareaSpringX}px ${textareaSpringY}px, rgba(255, 255, 255, 0.05), transparent)`;

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-2xl mx-auto rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 select-none metallic-form-container",
        className
      )}
      onMouseMove={handleMouseMove}
      style={{
        backgroundColor: "#1a1a1e", // Charcoal Space Gray Matte Finish
        boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)",
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
    >
      {/* Scoped CSS to handle the fonts, text colors & lowercase preferences */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        .metallic-form-container {
          font-family: 'Inter', sans-serif !important;
        }
        
        .metallic-form-container .form-title {
          font-family: 'Geist Mono', 'JetBrains Mono', monospace !important;
          text-transform: uppercase !important;
          letter-spacing: 0.12em !important;
          color: #ffffff !important;
        }
        
        .metallic-form-container .form-subtitle {
          font-family: 'Inter', sans-serif !important;
          text-transform: none !important;
          color: rgba(255, 255, 255, 0.45) !important;
        }
        
        .metallic-form-container label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 500 !important;
          text-transform: none !important;
          letter-spacing: 0.02em !important;
        }
        
        .metallic-form-container input,
        .metallic-form-container textarea,
        .metallic-form-container select {
          font-family: 'Geist Mono', 'JetBrains Mono', monospace !important;
          text-transform: none !important;
          color: #ffffff !important;
        }
        
        .metallic-form-container input::placeholder,
        .metallic-form-container textarea::placeholder {
          font-family: 'Inter', sans-serif !important;
          text-transform: none !important;
          font-size: 10px !important;
          letter-spacing: 0.02em !important;
          color: rgba(255, 255, 255, 0.25) !important;
        }
        
        .metallic-form-container button,
        .metallic-form-container button * {
          font-family: 'Geist Mono', 'JetBrains Mono', monospace !important;
          letter-spacing: 0.2em !important;
          text-transform: uppercase !important;
        }
      `}} />

      {/* Background spotlight layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: spotlightBg }}
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12" style={{ transform: "translateZ(30px)" }}>
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {title && (
              <h2 className="form-title text-2xl font-bold text-white mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="form-subtitle text-xs">{subtitle}</p>
            )}
            <div className="h-px bg-white/[0.06] mt-4" />
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <AnimatePresence mode="wait">
              {fields.map((field, index) => {
                const isFullWidth = field.type === "textarea";
                return (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className={cn("space-y-2", isFullWidth ? "md:col-span-2" : "col-span-1")}
                  >
                    {/* Field label */}
                    <div className="flex items-center justify-between gap-2">
                      <motion.label
                        className={cn(
                          "block text-[12px] transition-colors duration-300",
                          savedFields.has(field.name)
                            ? "text-white/80"
                            : focusedField === field.name
                            ? "text-white"
                            : errors[field.name]
                            ? "text-red-400"
                            : "text-white/55"
                        )}
                      >
                        {field.label}
                      </motion.label>
                      
                      {/* Typing indicator */}
                      {typingFields.has(field.name) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1"
                        >
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-1 h-1 rounded-full bg-neutral-500"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-1 h-1 rounded-full bg-neutral-500"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-1 h-1 rounded-full bg-neutral-500"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Input field variants */}
                    {field.type === "textarea" ? (
                      <motion.div
                        className={cn(
                          "relative rounded-lg overflow-hidden border transition-all duration-300",
                          errors[field.name]
                            ? "border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                            : focusedField === field.name
                            ? "border-white/15 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),0_0_8px_rgba(255,255,255,0.02)]"
                            : hoveredField === field.name
                            ? "border-white/10"
                            : "border-white/[0.05]"
                        )}
                        onMouseEnter={() => {
                          setFocusedField(field.name);
                          setHoveredField(field.name);
                        }}
                        onMouseLeave={() => {
                          setFocusedField(null);
                          setHoveredField(null);
                        }}
                        onMouseMove={handleTextareaMouseMove}
                        style={{
                          backgroundColor: "#09090b", // Deep black-zinc background
                          boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.8)",
                        }}
                      >
                        {/* Brushed micro-lines texture inside textarea wrapper */}
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 2px)",
                          }}
                        />

                        {/* Spotlight overlay inside textarea wrapper */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          animate={{ opacity: focusedField === field.name || hoveredField === field.name ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ background: textareaSpotlightBg }}
                        />

                        <textarea
                          value={formData[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => {
                            setFocusedField(null);
                            handleFieldBlur(field.name);
                          }}
                          placeholder={field.placeholder}
                          className={cn(
                            "relative z-10 w-full h-32 px-4 py-3 bg-transparent text-white text-sm outline-none border-none resize-none",
                            "placeholder:text-white/25"
                          )}
                        />

                        {/* Bezel inner shadow */}
                        <div className="absolute inset-0 border border-transparent rounded-lg pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]" />
                      </motion.div>
                    ) : field.type === "select" && field.options ? (
                      <div
                        onMouseEnter={() => {
                          setFocusedField(field.name);
                          setHoveredField(field.name);
                        }}
                        onMouseLeave={() => {
                          setFocusedField(null);
                          setHoveredField(null);
                        }}
                      >
                        <ChromeSelect
                          value={formData[field.name]}
                          options={field.options}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => {
                            setFocusedField(null);
                            handleFieldBlur(field.name);
                          }}
                          error={errors[field.name]}
                        />
                      </div>
                    ) : (
                      <div
                        onMouseEnter={() => {
                          setFocusedField(field.name);
                          setHoveredField(field.name);
                        }}
                        onMouseLeave={() => {
                          setFocusedField(null);
                          setHoveredField(null);
                        }}
                      >
                        <ChromeInput
                          type={field.type || "text"}
                          value={formData[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => {
                            setFocusedField(null);
                            handleFieldBlur(field.name);
                          }}
                          placeholder={field.placeholder}
                          error={errors[field.name]}
                        />
                      </div>
                    )}

                    {/* Field error */}
                    <AnimatePresence>
                      {errors[field.name] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-[11px] text-red-400 mt-1"
                        >
                          {errors[field.name]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Submit button with loading state */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: fields.length * 0.08, duration: 0.4 }}
            className="pt-6 border-t border-white/[0.06]"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group cursor-pointer border-none bg-transparent p-0 outline-none"
            >
              <BrushedTitaniumButton className="w-full h-12 text-xs uppercase">
                {isSubmitting ? "Processing..." : submitLabel}
              </BrushedTitaniumButton>
            </button>
          </motion.div>
        </form>

        {/* Success message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="mt-6 p-4 rounded-lg bg-neutral-900/40 border border-neutral-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            >
              <p className="text-xs text-neutral-300 text-center flex items-center justify-center gap-2">
                <span className="text-emerald-500">✓</span> Form submitted successfully
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
