"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
          email,
          password,
          fullName,
          businessName,
          phone,
          city,
          gstin
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Automatically sign in the user after successful creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.success("Account created! Please log in.");
        router.push("/login");
      } else {
        toast.success("Account created successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full shadow-lg border-slate-200/60">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl font-bold">Free mein shuru karo</CardTitle>
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            Step {step} of 2
          </span>
        </div>
        <CardDescription>
          {step === 1 ? "Apni basic details dalein account banane ke liye" : "Apne business ki details dalein"}
        </CardDescription>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300 ease-in-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </CardHeader>
      
      {step === 1 ? (
        <form onSubmit={handleNextStep}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="rajesh@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base">
              Next Step &rarr;
            </Button>
            <div className="text-sm text-center text-slate-500">
              Pehle se account hai?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                Login karo
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Kumar Electronics"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone / WhatsApp Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input
                  id="gstin"
                  type="text"
                  placeholder="27ABCDE1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="w-1/3 h-11" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
            <Button type="submit" className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
