import { ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500/30">
      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left Panel - Branding & Testimonials (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-50 relative overflow-hidden border-r border-blue-100">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 pointer-events-none" />
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[var(--primary-brand)]/10 blur-3xl" />
          <div className="absolute bottom-[10%] right-[0%] w-[50%] h-[50%] rounded-full bg-[var(--accent-brand)]/10 blur-3xl" />
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="VyaparAI" 
                width={180} 
                height={50} 
                className="object-contain"
                priority
              />
            </Link>
            
            <div className="mt-24 max-w-md">
              <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                Smart Business Management for Indian SMBs.
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Join thousands of businesses managing their inventory, deals, and GST invoices with the power of AI.
              </p>
              
              <div className="mt-10 space-y-4">
                {[
                  "AI-Powered WhatsApp Assistant",
                  "Automated GST Invoicing",
                  "Real-time Inventory & HRMS",
                  "Secure Cloud Storage"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12">
            <div className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl max-w-md shadow-xl">
              <p className="text-slate-700 italic font-medium">
                &quot;VyaparAI has completely transformed how we handle our daily billing and inventory. It feels like having a dedicated accountant who never sleeps.&quot;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--grad-button)' }}>
                  SR
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm">Sanjay Rastogi</p>
                  <p className="text-blue-700 text-xs font-bold">Rastogi Enterprises</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50 relative">
          {/* Mobile Logo (Visible only on mobile) */}
          <div className="lg:hidden flex justify-center mb-8 absolute top-8 w-full left-0">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="VyaparAI" 
                width={140} 
                height={40} 
                className="object-contain"
              />
            </Link>
          </div>

          <div className="w-full max-w-[440px] mt-12 lg:mt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
