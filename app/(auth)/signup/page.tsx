'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    businessName: '', ownerName: '', phone: '', city: 'Surat', gstin: ''
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams?.get('plan') || 'growth'

  const update = (field: string, value: string) => 
    setFormData(prev => ({ ...prev, [field]: value }))

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords match nahi kar rahe')
      return
    }
    if (formData.password.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye')
      return
    }
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    try {
      const selectedPlan = planFromUrl === 'starter' || planFromUrl === 'growth' || planFromUrl === 'business' ? planFromUrl : 'growth'

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          businessName: formData.businessName,
          phone: formData.phone,
          city: formData.city,
          gstin: formData.gstin || null,
          plan: selectedPlan,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Signup fail ho gaya. Dobara try karein.')
      }

      // Automatically sign in the user now that their account is created and auto-confirmed
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      const redirectFromUrl = searchParams?.get('redirect') || '/dashboard'
      router.push(redirectFromUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Kuch gadbad ho gayi. Dobara try karo.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid #E5E7EB', fontSize: 14, outline: 'none',
    background: '#FAFAFA', color: '#111827'
  }
  const labelStyle = { fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="text-sm font-medium text-[#4F46E5] mb-2">Step {step} of 2 — {step === 1 ? 'Account banao' : 'Business details'}</div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">VyaparAI</h1>
          <p className="text-sm text-gray-500 mt-2">Apne business ko smart banayein</p>
        </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-4">
          <div><label style={labelStyle}>Pura naam</label><input required style={inputStyle} value={formData.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Ramesh Sharma" /></div>
          <div><label style={labelStyle}>Email address</label><input required type="email" style={inputStyle} value={formData.email} onChange={e => update('email', e.target.value)} placeholder="ramesh@business.com" /></div>
          <div><label style={labelStyle}>Password</label><input required type="password" style={inputStyle} value={formData.password} onChange={e => update('password', e.target.value)} placeholder="Minimum 6 characters" /></div>
          <div><label style={labelStyle}>Password confirm karo</label><input required type="password" style={inputStyle} value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Same password dobara" /></div>
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#4F46E5', color: 'white', fontWeight: 500, fontSize: 14, marginTop: 10 }}>
            Aage badhein →
          </button>
        </form>
      ) : (
        <form onSubmit={handleStep2} className="space-y-4">
          <div><label style={labelStyle}>Business naam *</label><input required style={inputStyle} value={formData.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Sharma Textiles" /></div>
          <div><label style={labelStyle}>Owner naam *</label><input required style={inputStyle} value={formData.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="Ramesh Sharma" /></div>
          <div><label style={labelStyle}>Phone number *</label><input required style={inputStyle} value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="9876543210" /></div>
          <div><label style={labelStyle}>City</label><input required style={inputStyle} value={formData.city} onChange={e => update('city', e.target.value)} placeholder="Surat" /></div>
          <div><label style={labelStyle}>GSTIN (optional)</label><input style={inputStyle} value={formData.gstin} onChange={e => update('gstin', e.target.value)} placeholder="24XXXXX1234X1ZX" /></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
             <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 14, cursor: 'pointer', color: '#374151' }}>← Wapas</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: 10, background: '#4F46E5', color: 'white', fontWeight: 500, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Account ban raha hai...' : 'Account banao ✓'}
            </button>
          </div>
        </form>
      )}
      
        <p className="mt-8 text-center text-sm text-gray-500">Pehle se account hai? <Link href="/login" className="text-[#4F46E5] font-medium hover:underline">Login karo</Link></p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-gray-500">Thoda ruko...</div>
        </div>
      }>
        <SignupForm />
    </Suspense>
  )
}
