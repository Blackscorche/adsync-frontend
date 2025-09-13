'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Upload, 
  MonitorPlay, 
  CreditCard,
  BarChart3,
  HeadphonesIcon,
  Menu,
  X,
  LogOut,
  User,
  ListVideo
} from 'lucide-react'

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'owner') {
      router.push('/login')
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) return null

  const navigation = [
    { name: 'Dashboard', href: '/owner', icon: Home },
    { name: 'Content', href: '/owner/content', icon: Upload },
    { name: 'My Screens', href: '/owner/screens', icon: MonitorPlay },
    { name: 'Reports', href: '/owner/reports', icon: BarChart3 },
    { name: 'Billing', href: '/owner/billing', icon: CreditCard },
    { name: 'Support', href: '/owner/support', icon: HeadphonesIcon },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo and Title */}
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/logo.png"
                  alt="Ivaa Media Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 mr-2"
                />
                <h1 className="text-lg sm:text-xl font-bold text-primary">
                  Ivaa Media
                </h1>
                <span className="ml-2 text-sm text-muted-foreground hidden sm:inline">
                  Owner Portal
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {user.name || user.email}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="px-4 py-3 border-t">
              <div className="flex items-center mb-3">
                <User className="w-4 h-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  {user.name || user.email}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}