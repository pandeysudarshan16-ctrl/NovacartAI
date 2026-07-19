"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@prisma/client";
import { User, Mail, KeyRound, Phone, ShieldAlert, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<Role>(Role.CUSTOMER);
  
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
      await register({
        name,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] px-4 py-10 bg-background">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-card shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-600 shadow shadow-primary/20 mb-2">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-muted-foreground">Join the NovaCart AI multi-vendor marketplace.</p>
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
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Customer", value: Role.CUSTOMER },
                { name: "Merchant", value: Role.SELLER },
                { name: "Delivery", value: Role.DELIVERY_PARTNER },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition ${
                    role === item.value
                      ? "bg-primary border-primary text-white"
                      : "bg-muted border-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+919876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Min 8 characters"
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
                Registering...
              </>
            ) : (
              <>
                Register
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
