'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CreditCard, Building2, User, HelpCircle, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface BusinessDetails {
  id: string;
  name: string;
  owner_name: string | null;
  gstin: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}

interface ProfileDetails {
  full_name: string | null;
  role: string;
  plan: string;
  subscription_status: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [businessId, setBusinessId] = useState("");
  
  // States for inputs
  const [fullName, setFullName] = useState("");
  const [bizName, setBizName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("trial");
  const [status, setStatus] = useState("trial");

  const planNames: Record<string, string> = {
    trial: 'Free 14-Day Trial',
    starter: 'Basic Plan',
    growth: 'Intermediate Plan',
    business: 'Advance Plan'
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, plan, subscription_status, business_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || "");
          setPlan(profile.plan || "trial");
          setStatus(profile.subscription_status || "trial");
          
          if (profile.business_id) {
            setBusinessId(profile.business_id);
            const { data: biz } = await supabase
              .from('businesses')
              .select('*')
              .eq('id', profile.business_id)
              .single();

            if (biz) {
              setBizName(biz.name || "");
              setOwnerName(biz.owner_name || "");
              setPhone(biz.phone || "");
              setCity(biz.city || "");
              setGstin(biz.gstin || "");
              setAddress(biz.address || "");
            }
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        toast.error("Settings load nahi ho sake.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Update Business
      if (businessId) {
        const { error: bizError } = await supabase
          .from('businesses')
          .update({
            name: bizName,
            owner_name: ownerName,
            phone: phone,
            city: city,
            gstin: gstin,
            address: address
          })
          .eq('id', businessId);

        if (bizError) throw bizError;
      }

      toast.success("Settings successfully save ho gayi hain!");
    } catch (err: any) {
      console.error("Error saving settings:", err);
      toast.error(err.message || "Save karne mein error aayi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage profile, business info, and active billing plan.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Settings */}
        <Card className="border border-slate-200/80 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Personal Profile</CardTitle>
                <CardDescription>Aapka naam aur credentials settings.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <Input 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ex. Ramesh Kumar"
                required
                className="h-11 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Profile Settings */}
        <Card className="border border-slate-200/80 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Business Profile</CardTitle>
                <CardDescription>Aapki company aur billing details.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
              <Input 
                value={bizName}
                onChange={e => setBizName(e.target.value)}
                placeholder="Ex. Ramesh Kirana Store"
                required
                className="h-11 rounded-xl"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Owner Name</label>
              <Input 
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="Owner's legal name"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <Input 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ex. +91 99999 99999"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">City</label>
              <Input 
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex. Mumbai"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">GSTIN</label>
              <Input 
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                placeholder="15-character GSTIN number"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
              <Input 
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Detailed corporate address"
                className="h-11 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan details */}
        <Card className="border border-slate-200/80 shadow-sm rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Subscription Plan</CardTitle>
                <CardDescription>Aapka current billing details.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plan</p>
              <h3 className="text-xl font-extrabold text-indigo-600 mt-1">{planNames[plan] || plan}</h3>
              <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold text-slate-700 capitalize">{status}</span></p>
            </div>
            
            <Link 
              href="/subscribe"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Plans & Upgrades <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Actions bar */}
        <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 px-8 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

      </form>
    </div>
  );
}
