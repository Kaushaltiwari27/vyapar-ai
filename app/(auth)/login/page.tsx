"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);

    if (useMagicLink) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Magic link sent! Check your email.");
      }
      setLoading(false);
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-slate-500 mt-2">Enter your details to log in to your account.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="vyapari@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all"
            />
          </div>
        </div>

        {!useMagicLink && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
              <Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!useMagicLink}
                className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all"
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all" disabled={loading}>
          {loading ? "Please wait..." : (useMagicLink ? "Send Magic Link" : "Sign In")}
          {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-50 text-slate-500 font-medium">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-11 bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl transition-all"
          onClick={() => setUseMagicLink(!useMagicLink)}
        >
          {useMagicLink ? (
            <>Login with Password</>
          ) : (
            <>
              <Sparkles className="mr-2 w-4 h-4 text-indigo-500" />
              Magic Link (Email OTP)
            </>
          )}
        </Button>

        <div className="text-center mt-8 text-slate-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Sign up now
          </Link>
        </div>
      </form>
    </div>
  );
}
