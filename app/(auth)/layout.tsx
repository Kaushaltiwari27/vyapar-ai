import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">VyaparAI</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
