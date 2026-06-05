import Link from "next/link";
import { ShieldCheck, MessageSquare, IndianRupee, BarChart3, TrendingUp, CheckCircle2, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F2F2] flex flex-col font-sans selection:bg-[#0176D3] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 bg-white border-b border-[#dddbda] shadow-sm">
        <div className="w-full flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0176D3] rounded flex items-center justify-center">
              <Cloud className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">VyaparAI</span>
          </div>
          <div className="space-x-4 flex items-center">
            <Link href="/login" className="text-[#0176D3] hover:underline font-semibold px-4 py-2 text-sm">
              Log In
            </Link>
            <Link href="/signup">
              <Button className="bg-[#0176D3] text-white hover:bg-[#014486] rounded-[4px] px-6 h-9 font-semibold transition-colors shadow-sm">
                Try for Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-14">
        <section className="relative bg-white border-b border-[#dddbda] pt-24 pb-20 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{ backgroundImage: 'url("/hero_bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          
          <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Grow Your Business with the World's #1 <br className="hidden md:block"/>
              AI-Powered CRM for Indian SMBs.
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              VyaparAI brings customer management, invoicing, and intelligent insights together in one integrated platform. Work smarter, not harder.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 bg-[#0176D3] hover:bg-[#014486] text-white text-base font-semibold rounded-[4px] transition-colors shadow-sm">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 border-[#0176D3] text-[#0176D3] hover:bg-[#F3F2F2] text-base font-semibold rounded-[4px] transition-colors">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[#F3F2F2]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">A complete view of your customers.</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">Connect sales, service, and finance on a single platform.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-[4px] border border-[#dddbda] shadow-[0_2px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#0176D3]/10 text-[#0176D3] rounded flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">Sales Pipeline</h3>
                <p className="text-slate-600 text-sm">Track all your leads and deals with a visual drag-and-drop Kanban board.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-[4px] border border-[#dddbda] shadow-[0_2px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#0176D3]/10 text-[#0176D3] rounded flex items-center justify-center mb-4">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">GST Invoice</h3>
                <p className="text-slate-600 text-sm">Generate professional GST invoices instantly and track pending payments easily.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-[4px] border border-[#dddbda] shadow-[0_2px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#0176D3]/10 text-[#0176D3] rounded flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">AI Chat Assistant</h3>
                <p className="text-slate-600 text-sm">Chat with your business data. Ask &quot;What is my total revenue?&quot; and get instant answers.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-[4px] border border-[#dddbda] shadow-[0_2px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#0176D3]/10 text-[#0176D3] rounded flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">Smart Dashboard</h3>
                <p className="text-slate-600 text-sm">Get a bird&apos;s eye view of your entire business performance with real-time metrics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-white border-t border-b border-[#dddbda]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-10">Transparent pricing for growing businesses</h2>
            
            <div className="bg-white p-8 rounded-[4px] border-2 border-[#0176D3] shadow-md relative max-w-md mx-auto">
              <div className="absolute top-0 right-0 bg-[#0176D3] text-white text-xs font-bold px-3 py-1 rounded-bl-[4px]">
                ENTERPRISE READY
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 mt-2">Professional Edition</h3>
              <div className="text-4xl font-bold text-slate-900 mb-6 mt-4">
                ₹2,499<span className="text-sm text-slate-500 font-medium ml-1">/ user / month</span>
              </div>
              <p className="text-slate-600 mb-6 pb-6 border-b border-slate-200 text-sm">Billed annually. Complete CRM, Sales, and Service.</p>
              
              <ul className="space-y-3 text-left mb-8">
                {['Unlimited Accounts & Contacts', 'Opportunity Tracking (Kanban)', 'AI Analytics & Forecasting', '24/7 Enterprise Support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#0176D3] flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup">
                <Button className="w-full h-10 bg-[#0176D3] hover:bg-[#014486] text-white font-semibold rounded-[4px] transition-colors">
                  Try for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#032D60] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="text-white w-6 h-6" />
            <span className="font-bold text-lg">VyaparAI</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-300">
            <a href="#" className="hover:text-white hover:underline">Privacy</a>
            <a href="#" className="hover:text-white hover:underline">Terms of Service</a>
            <a href="#" className="hover:text-white hover:underline">Contact</a>
          </div>
          <div className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} VyaparAI, Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
