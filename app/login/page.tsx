'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authAPI } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { token, user } = await authAPI.login(email, password)
      
      // Store token and user info
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'owner') {
        router.push('/owner')
      } else if (user.role === 'sales') {
        router.push('/sales')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Ivaa Media Logo"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ivaa Media</h1>
          <p className="text-slate-600">Digital Signage Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-600">Sign in with your admin, owner, or sales account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            © 2024 Ivaa Media. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}