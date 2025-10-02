'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid reset link')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err: any) {
      setError('Network error. Please try again.')
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

        {/* Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8">
          {!success ? (
            <>
              <div className="mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">Reset Your Password</h2>
                <p className="text-sm text-slate-600">
                  Enter your new password below.
                </p>
              </div>

              {!token && (
                <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Invalid or missing reset token. Please request a new password reset link.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      disabled={loading || !token}
                      className="pl-10 text-base sm:text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Minimum 6 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      disabled={loading || !token}
                      className="pl-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full text-sm sm:text-base"
                  disabled={loading || !token}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Password Reset Successful!</h2>
              <p className="text-slate-600 mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>

        {/* Back to Login */}
        {!success && (
          <div className="text-center mt-4 sm:mt-6">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Back to Login
            </Link>
          </div>
        )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
