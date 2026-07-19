"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { KeyRound, Mail, ShieldAlert, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "SELLER") {
        router.push("/seller");
      } else if (user.role === "DELIVERY_PARTNER") {
        router.push("/delivery");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 bg-background">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-card shadow-2xl space-y-6">
        
        {/* Brand/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-600 shadow shadow-primary/20 mb-2">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">NovaCart AI</h2>
          <p className="text-xs text-muted-foreground">Sign in to access your dashboard or storefront catalog.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2.5 p-4 rounded-2xl bg-destructive/15 border border-destructive/20 text-xs font-semibold text-destructive">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@novacart.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white transition disabled:opacity-50 shadow shadow-primary/20"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register now
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-[10px] space-y-1 text-muted-foreground leading-relaxed">
          <p className="font-bold text-white uppercase tracking-wider text-[9px] mb-1">Demonstration Credentials:</p>
          <p>• <span className="font-semibold text-white">Customer:</span> customer@novacart.ai / password123</p>
          <p>• <span className="font-semibold text-white">Seller:</span> seller@novacart.ai / password123</p>
          <p>• <span className="font-semibold text-white">Admin:</span> admin@novacart.ai / password123</p>
          <p>• <span className="font-semibold text-white">Delivery:</span> delivery@novacart.ai / password123</p>
        </div>

      </div>
    </div>
  );
}
