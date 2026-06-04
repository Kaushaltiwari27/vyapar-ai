import Link from "next/link";
import { ShieldCheck, MessageSquare, IndianRupee, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 transition-all duration-300">
        <div className="w-full flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">VyaparAI</span>
          </div>
          <div className="space-x-4 flex items-center">
            <Link href="/login" className="text-slate-600 hover:text-indigo-600 font-medium px-4 py-2 transition-colors">
              Log In
            </Link>
            <Link href="/signup">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 shadow-md transition-transform hover:scale-105">
                Start for Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background mesh and glow */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
          <div className="absolute right-0 bottom-0 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
              India&apos;s First AI Business Brain 🇮🇳
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
              CRM + Invoice + AI Assistant <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                in one place
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              VyaparAI helps Indian SMBs manage customers, track deals, generate GST invoices, and get AI insights. Growth is now in your hands.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold shadow-xl shadow-indigo-500/30 rounded-full transition-all hover:scale-105 border-0">
                  Start for Free &rarr;
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-slate-200 text-slate-700 hover:text-slate-900 text-lg font-semibold rounded-full hover:bg-slate-50 transition-all">
                  Log In
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
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything in one place</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Stop using different apps. VyaparAI has everything you need to run your business smoothly.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Sales Pipeline</h3>
                <p className="text-slate-600">Track all your leads and deals with a visual drag-and-drop Kanban board.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <IndianRupee className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">GST Invoice</h3>
                <p className="text-slate-600">Generate professional GST invoices instantly and track pending payments easily.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">AI Chat Assistant</h3>
                <p className="text-slate-600">Chat with your business data. Ask &quot;What is my total revenue?&quot; and get instant answers.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
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
            
            <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-2xl shadow-indigo-100/50 relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Vyapar Pro</h3>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 mt-4">
                ₹2,499<span className="text-lg text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-slate-600 mb-8 pb-8 border-b border-slate-100">Everything included. No extra charges.</p>
              
              <ul className="space-y-4 text-left max-w-sm mx-auto mb-10">
                {['Unlimited Invoices & Customers', 'Advanced CRM & Kanban Board', 'AI Chat Assistant', 'Priority Support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup">
                <Button size="lg" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-lg font-semibold rounded-full shadow-lg transition-transform hover:scale-105">
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
