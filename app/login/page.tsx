'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { authAPI } from '@/lib/api'
import { FileText } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        // Redirect based on role
        if (user.role === 'admin') {
          router.replace('/admin')
        } else if (user.role === 'owner') {
          router.replace('/owner/screens')
        } else if (user.role === 'design') {
          router.replace('/design')
        } else if (user.role === 'sales') {
          router.replace('/sales')
        }
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions to continue')
      return
    }

    setLoading(true)

    try {
      const { token, user } = await authAPI.login(email, password)
      
      // Store token and user info
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Also set as cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}` // 24 hours

      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'owner') {
        router.push('/owner')
      } else if (user.role === 'design') {
        router.push('/design')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 xs:p-6">
      <div className="w-full max-w-sm xs:max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-3 sm:mb-4 group">
            <Image
              src="/logo.png"
              alt="Ivaa Media Logo"
              width={56}
              height={56}
              className="w-12 h-12 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform"
            />
          </Link>
          <Link href="/">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">Ivaa Media</h1>
          </Link>
          <p className="text-slate-600 text-sm sm:text-base">Digital Signage Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-sm text-slate-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
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
                className="text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="text-base sm:text-sm"
              />
            </div>

            <div className="flex items-start space-x-2 py-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                disabled={loading}
                className="mt-0.5 flex-shrink-0"
              />
              <label
                htmlFor="terms"
                className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
              >
                I have read and agree to the{' '}
                <a
                  href="/terms-and-conditions.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms and Conditions
                  <FileText className="h-3 w-3 flex-shrink-0" />
                </a>
              </label>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-sm sm:text-base"
              disabled={loading || !acceptedTerms}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* Links */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm text-slate-600">
            <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1">
              ← Back to Home
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs text-slate-500">
            © 2024 Ivaa Media. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}