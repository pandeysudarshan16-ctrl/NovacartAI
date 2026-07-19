"use client";

import React, { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, EyeOff, Layers, X, Mail, Globe } from "lucide-react";

const emptySubscribe = () => () => { };
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Watermark() {
  const [showBgWatermark, setShowBgWatermark] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [glowColor, setGlowColor] = useState<"graphite" | "white" | "dark">("graphite");

  const isMounted = useIsMounted();
  if (!isMounted) return null;

  const glowStyles = {
    graphite: "border-white/10 hover:border-white/20 bg-zinc-950 text-zinc-400 shadow-black/40",
    white: "border-white/20 hover:border-white bg-white text-black shadow-white/5",
    dark: "border-zinc-800 hover:border-zinc-700 bg-black text-zinc-600 shadow-black/80",
  };

  const glowText = {
    graphite: "text-zinc-300",
    white: "text-white font-black",
    dark: "text-zinc-500",
  };

  return (
    <>
      {/* Fullscreen repeating diagonal background watermark */}
      <AnimatePresence>
        {showBgWatermark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.012 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none select-none z-[999] overflow-hidden"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="sudarshan-watermark"
                  width="320"
                  height="220"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(-25)"
                >
                  <text
                    x="0"
                    y="100"
                    fill="currentColor"
                    fontSize="11"
                    fontFamily="var(--font-geist-mono), monospace"
                    fontWeight="600"
                    letterSpacing="0.2em"
                    className="text-foreground"
                  >
                    SUDARSHAN PANDEY
                  </text>
                  <text
                    x="160"
                    y="210"
                    fill="currentColor"
                    fontSize="8"
                    fontFamily="var(--font-geist-mono), monospace"
                    fontWeight="400"
                    letterSpacing="0.15em"
                    className="text-muted-foreground opacity-60"
                  >
                    DESIGN WATERMARK
                  </text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sudarshan-watermark)" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Badge & Modal Container */}
      <div className="fixed bottom-6 left-6 z-[99999] flex flex-col items-start gap-4">
        {/* Toggle Button / Badge */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex h-10 w-10 items-center justify-center border cursor-pointer shadow-xl transition-all duration-300 relative group ${glowStyles[glowColor]}`}
          title="Sudarshan Pandey Design Watermark"
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <span className="text-[10px] font-black tracking-widest uppercase">
              SP
            </span>
          )}
        </motion.button>

        {/* Details Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.3 }}
              className="glass p-5 rounded-none w-80 shadow-2xl flex flex-col gap-4 text-foreground relative overflow-hidden bg-zinc-950 border border-white/5"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 text-zinc-400" /> Design Signature
                  </div>
                  <h4 className={`text-base font-black tracking-wider uppercase mt-1 ${glowText[glowColor]}`}>
                    Sudarshan Pandey
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal uppercase tracking-wider mt-0.5">
                    UI/UX Designer & Architect
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3 py-1">
                {/* Background Watermark Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                    {showBgWatermark ? (
                      <Eye className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-zinc-600" />
                    )}
                    Background Grid
                  </span>

                  <button
                    onClick={() => setShowBgWatermark(!showBgWatermark)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-none transition-colors duration-200 focus:outline-none cursor-pointer border ${showBgWatermark ? "bg-white border-white" : "bg-transparent border-white/10"
                      }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 transform rounded-none transition-transform duration-200 ${showBgWatermark ? "translate-x-4.5 bg-black" : "translate-x-0.5 bg-white"
                        }`}
                    />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-2 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                    <Layers className="h-3.5 w-3.5 text-white" />
                    Signature Theme
                  </span>
                  <div className="flex gap-1.5">
                    {(["graphite", "white", "dark"] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => setGlowColor(color)}
                        className={`h-3 w-3 border cursor-pointer transition ${color === "graphite"
                            ? "bg-zinc-700 border-zinc-600"
                            : color === "white"
                              ? "bg-white border-white"
                              : "bg-black border-zinc-900"
                          } ${glowColor === color
                            ? "scale-120 ring-1 ring-white/50"
                            : "opacity-60 hover:opacity-100"
                          }`}
                        title={`${color} theme`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                <span>&copy; Sudarshan Pandey</span>
                <div className="flex gap-2">
                  <a
                    href="mailto:pandeysudarshan16@gmail.com"
                    className="hover:text-white transition p-1 rounded hover:bg-white/5"
                    title="Contact Designer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://github.com/pandeysudarshan16-ctrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition p-1 rounded hover:bg-white/5"
                    title="GitHub Portfolio"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                  <a
                    href="https://novacart.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition p-1 rounded hover:bg-white/5"
                    title="Website"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
