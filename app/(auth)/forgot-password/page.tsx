"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <Link href="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
      </Link>
      
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset password</h2>
        <p className="text-slate-500 mt-2">
          {success ? "Check your email for the reset link." : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-emerald-800 font-bold text-lg mb-2">Email Sent!</h3>
          <p className="text-emerald-700 text-sm">
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
          </p>
          <Button 
            variant="outline" 
            className="mt-6 w-full h-11 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setSuccess(false)}
          >
            Try another email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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

          <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all" disabled={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
            {!loading && <Send className="ml-2 w-4 h-4" />}
          </Button>
        </form>
      )}
    </div>
  );
}
