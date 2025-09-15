'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  Building2,
  Users,
  MonitorPlay,
  FileImage,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  TrendingUp,
  Upload,
  Shield,
  Palette,
  Store,
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon: any
  children?: NavItem[]
  roles?: string[]
}

const navigation: NavItem[] = [
  // Dashboard/Home for each role
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    roles: ['admin']
  },
  {
    title: 'Dashboard',
    href: '/sales',
    icon: Home,
    roles: ['sales']
  },
  {
    title: 'Dashboard',
    href: '/design',
    icon: Home,
    roles: ['design']
  },
  {
    title: 'Dashboard',
    href: '/owner',
    icon: Home,
    roles: ['owner']
  },

  // Shop Management
  {
    title: 'Shops',
    icon: Building2,
    roles: ['admin', 'sales', 'design'],
    children: [
      { title: 'All Shops', href: '/admin/shops', icon: Store, roles: ['admin'] },
      { title: 'Register Shop', href: '/sales/shops/register', icon: UserPlus, roles: ['sales'] },
      { title: 'My Shops', href: '/sales/shops', icon: Store, roles: ['sales'] },
      { title: 'My Shops', href: '/design/shops', icon: Store, roles: ['design'] }
    ]
  },

  // Screen Management
  {
    title: 'Screens',
    icon: MonitorPlay,
    roles: ['admin', 'owner'],
    children: [
      { title: 'All Screens', href: '/admin/screens', icon: MonitorPlay, roles: ['admin'] },
      { title: 'Monitoring', href: '/admin/monitoring', icon: MonitorPlay, roles: ['admin'] },
      { title: 'My Screens', href: '/owner/screens', icon: MonitorPlay, roles: ['owner'] }
    ]
  },

  // Content Management
  {
    title: 'Content',
    icon: FileImage,
    roles: ['admin', 'design', 'owner'],
    children: [
      { title: 'All Content', href: '/admin/content', icon: FileImage, roles: ['admin'] },
      { title: 'Pending Review', href: '/admin/content/pending', icon: Shield, roles: ['admin'] },
      { title: 'Content Review', href: '/design/content-review', icon: FileImage, roles: ['design'] },
      { title: 'Playlists', href: '/design/playlists', icon: FileText, roles: ['design'] },
      { title: 'My Content', href: '/owner/content', icon: FileImage, roles: ['owner'] },
      { title: 'Upload Content', href: '/owner/content/upload', icon: Upload, roles: ['owner'] }
    ]
  },

  // User Management
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin']
  },

  // Sales Performance
  {
    title: 'Sales',
    icon: TrendingUp,
    roles: ['sales'],
    children: [
      { title: 'Performance', href: '/sales/performance', icon: BarChart3 },
      { title: 'Commissions', href: '/sales/commissions', icon: DollarSign }
    ]
  },

  // Billing
  {
    title: 'Billing',
    icon: CreditCard,
    roles: ['admin', 'owner'],
    children: [
      { title: 'All Bills', href: '/admin/billing', icon: FileText, roles: ['admin'] },
      { title: 'My Bills', href: '/owner/billing', icon: CreditCard, roles: ['owner'] }
    ]
  },

  // Reports
  {
    title: 'Reports',
    icon: BarChart3,
    roles: ['admin', 'owner'],
    children: [
      { title: 'Admin Reports', href: '/admin/reports', icon: BarChart3, roles: ['admin'] },
      { title: 'My Reports', href: '/owner/reports', icon: BarChart3, roles: ['owner'] }
    ]
  },

  // Settings
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin']
  },

  // Support
  {
    title: 'Support',
    icon: HelpCircle,
    roles: ['admin', 'owner'],
    children: [
      { title: 'Support Tickets', href: '/admin/support', icon: HelpCircle, roles: ['admin'] },
      { title: 'Get Support', href: '/owner/support', icon: HelpCircle, roles: ['owner'] }
    ]
  }
]

export default function SideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Auto-expand active sections
    const activeParent = navigation.find(item => 
      item.children?.some(child => child.href === pathname)
    )
    if (activeParent) {
      setExpandedItems([activeParent.title])
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  )

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="IVAA Logo"
            className="h-8 w-8"
          />
          <span className="font-bold text-lg">IVAA AdSync</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isExpanded = expandedItems.includes(item.title)
            const hasActiveChild = item.children?.some(child => child.href === pathname)
            const isActive = item.href === pathname || hasActiveChild

            if (item.children) {
              const filteredChildren = item.children.filter(child =>
                !child.roles || child.roles.includes(user?.role)
              )

              if (filteredChildren.length === 0) return null

              // If only one child, render it as a direct link instead of collapsible
              if (filteredChildren.length === 1) {
                const child = filteredChildren[0]
                const ChildIcon = child.icon
                return (
                  <Link key={child.href} href={child.href!}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === child.href && "bg-muted font-medium"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <ChildIcon className="mr-2 h-4 w-4" />
                      {child.title}
                    </Button>
                  </Link>
                )
              }

              // Multiple children - use collapsible section
              return (
                <div key={item.title}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-muted"
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {filteredChildren.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <Link key={child.href} href={child.href!}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start pl-6",
                                pathname === child.href && "bg-muted font-medium"
                              )}
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <ChildIcon className="mr-2 h-3 w-3" />
                              {child.title}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-muted font-medium"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background">
        <NavContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r bg-background md:hidden">
            <NavContent />
          </div>
        </>
      )}
    </>
  )
}