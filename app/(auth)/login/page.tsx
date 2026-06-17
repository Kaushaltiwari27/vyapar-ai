'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email ya password galat hai. Dobara try karo.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', background: '#FAFAFA', color: '#111827' }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">VyaparAI</h1>
          <p className="text-sm text-gray-500 mt-2">Wapas aaye! Login karo</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
            <input required type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="aapka@email.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
            <input required type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="Aapka password" />
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-[#4F46E5] hover:underline">Password bhool gaye?</Link>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#4F46E5', color: 'white', fontWeight: 500, fontSize: 14, marginTop: 10, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Login ho raha hai...' : 'Login karo →'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500">Naya account? <Link href="/signup" className="text-[#4F46E5] font-medium hover:underline">Free mein signup karo</Link></p>
      </div>
    </div>
  )
}
