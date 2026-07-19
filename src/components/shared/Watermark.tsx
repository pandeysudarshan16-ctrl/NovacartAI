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
  const [glowColor, setGlowColor] = useState<"primary" | "secondary" | "gold">("primary");

  const isMounted = useIsMounted();
  if (!isMounted) return null;

  const glowStyles = {
    primary: "from-primary to-purple-600 shadow-primary/20 hover:shadow-primary/40",
    secondary: "from-secondary to-teal-500 shadow-secondary/20 hover:shadow-secondary/40",
    gold: "from-amber-500 to-yellow-600 shadow-amber-500/20 hover:shadow-amber-500/40",
  };

  const glowText = {
    primary: "bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent",
    secondary: "bg-gradient-to-r from-secondary to-teal-400 bg-clip-text text-transparent",
    gold: "bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent",
  };

  return (
    <>
      {/* Fullscreen repeating diagonal background watermark */}
      <AnimatePresence>
        {showBgWatermark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.015 }}
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
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr ${glowStyles[glowColor]} p-[1px] cursor-pointer shadow-lg transition-all duration-300 relative group`}
          title="Sudarshan Pandey Design Watermark"
        >
          {/* Outer glow ring */}
          <span className="absolute -inset-1 rounded-full bg-inherit opacity-30 blur-sm group-hover:opacity-60 transition duration-300"></span>

          {/* Inner content */}
          <div className="flex h-full w-full items-center justify-center rounded-full bg-card/90 backdrop-blur-md">
            {isOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <span className="text-sm font-black tracking-wider text-foreground select-none">
                SP
              </span>
            )}
          </div>
        </motion.button>

        {/* Details Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="glass p-5 rounded-2xl w-80 shadow-2xl flex flex-col gap-4 text-foreground relative overflow-hidden"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10 pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 text-amber-400" /> Design Signature
                  </div>
                  <h4 className={`text-lg font-bold tracking-tight ${glowText[glowColor]}`}>
                    Sudarshan Pandey
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                    Creative UI/UX Designer & Technologist
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3 py-1">
                {/* Background Watermark Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {showBgWatermark ? (
                      <Eye className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    Background Grid
                  </span>

                  <button
                    onClick={() => setShowBgWatermark(!showBgWatermark)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${showBgWatermark ? "bg-primary" : "bg-neutral-800"
                      }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${showBgWatermark ? "translate-x-4.5" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Signature Theme
                  </span>
                  <div className="flex gap-1.5">
                    {(["primary", "secondary", "gold"] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => setGlowColor(color)}
                        className={`h-4 w-4 rounded-full border cursor-pointer transition ${color === "primary"
                            ? "bg-primary border-primary/45"
                            : color === "secondary"
                              ? "bg-secondary border-secondary/45"
                              : "bg-amber-500 border-amber-500/45"
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
              <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-muted-foreground">
                <span>&copy; {new Date().getFullYear()} Sudarshan Pandey</span>
                <div className="flex gap-2">
                  <a
                    href="mailto:pandeysudarshan16@gmail.com"
                    className="hover:text-foreground transition p-1 rounded hover:bg-white/5"
                    title="Contact Designer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://github.com/pandeysudarshan16-ctrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition p-1 rounded hover:bg-white/5"
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
                    className="hover:text-foreground transition p-1 rounded hover:bg-white/5"
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
