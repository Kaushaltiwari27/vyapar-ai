import Link from "next/link";
import { ShieldCheck, MessageSquare, IndianRupee, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="w-full flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">VyaparAI</span>
        </div>
        <div className="space-x-4 flex items-center">
          <Link href="/login" className="text-slate-600 hover:text-indigo-600 font-medium px-4 py-2 transition-colors">
            Login karo
          </Link>
          <Link href="/signup">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md">
              Free mein shuru karo
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white pt-24 pb-32">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
              India ka pehla AI Business Brain 🇮🇳
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
              CRM + Invoice + AI Assistant <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                ek hi jagah
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              VyaparAI helps Indian SMBs manage customers, track deals, generate GST invoices, and get AI insights in Hinglish. Growth ab aapki mutthi mein.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold shadow-xl shadow-indigo-200/50 rounded-xl transition-all hover:scale-105">
                  Free mein shuru karo &rarr;
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 text-lg font-semibold rounded-xl hover:bg-slate-50 transition-all">
                  Login karo
                </Button>
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-slate-500 font-medium">No credit card required. Setup in 2 minutes.</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Sab kuch ek jagah par</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Different apps use karna band karein. VyaparAI has everything you need to run your business smoothly.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Sales Pipeline</h3>
                <p className="text-slate-600">Track all your leads and deals with a visual drag-and-drop Kanban board.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">GST Invoice</h3>
                <p className="text-slate-600">Generate professional GST invoices instantly and track pending payments easily.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Hindi AI Chat</h3>
                <p className="text-slate-600">Chat with your business data in Hinglish. Ask &quot;Mera total revenue kya hai?&quot; and get instant answers.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Smart Dashboard</h3>
                <p className="text-slate-600">Get a bird&apos;s eye view of your entire business performance with real-time metrics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Simple Pricing, No Hidden Fees</h2>
            
            <div className="bg-white p-10 rounded-3xl border-2 border-indigo-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Vyapar Pro</h3>
              <div className="text-5xl font-extrabold text-slate-900 mb-6 mt-4">
                ₹2,499<span className="text-lg text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-slate-600 mb-8 pb-8 border-b border-slate-100">Sab kuch included. Koi extra charges nahi.</p>
              
              <ul className="space-y-4 text-left max-w-sm mx-auto mb-10">
                {['Unlimited Invoices & Customers', 'Advanced CRM & Kanban Board', 'AI Assistant (Vyapaar Mitra)', 'Priority Support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup">
                <Button size="lg" className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold rounded-xl">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-600 w-5 h-5" />
            <span className="font-bold text-slate-900">VyaparAI</span>
          </div>
          <p className="text-slate-500 font-medium">Made with ❤️ for Indian SMBs</p>
          <div className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} VyaparAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
