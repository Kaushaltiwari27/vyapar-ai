"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Mail, Lock, User, Phone, Building, MapPin, FileText, ArrowRight, ArrowLeft } from "lucide-react";

function SignupForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const supabase = createClient();

  // Step 1 State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 State
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gstin, setGstin] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName,
          businessName,
          phone,
          city,
          gstin,
          plan
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Automatically sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        toast.success("Account created! Please log in.");
        router.push("/login");
      } else {
        toast.success("Account created successfully!");
        router.push("/select-plan");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            Step {step} of 2
          </span>
        </div>
        <p className="text-slate-500">
          {step === 1 ? "Enter your basic details to get started." : "Tell us about your business."}
        </p>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full mt-6 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-700 font-semibold">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="rajesh@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all">
              Next Step <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-11 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all shadow-sm"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/api/auth/callback`
                }
              });
              if (error) toast.error(error.message);
            }}
          >
            <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
          
          <div className="text-center mt-6 text-slate-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Log In
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-slate-700 font-semibold">Business Name *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="businessName"
                type="text"
                placeholder="Kumar Electronics"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 font-semibold">Phone / WhatsApp *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-slate-700 font-semibold">City *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="city"
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin" className="text-slate-700 font-semibold">GSTIN (Optional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="gstin"
                  type="text"
                  placeholder="27ABCDE1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="w-1/3 h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-all" onClick={() => setStep(1)} disabled={loading}>
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button type="submit" className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading setup...</div>}>
      <SignupForm />
    </Suspense>
  );
}
