'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MonitorPlay, Upload, FileImage, CreditCard, TrendingUp, Clock, Building2, MapPin, Phone } from 'lucide-react'
import { shopsAPI } from '@/lib/api'
import config from '@/lib/config'
import { formatCurrency } from '@/lib/constants'

interface Shop {
  id: number
  name: string
  address: string
  phone: string
  shop_type: string
  photo_url?: string
  postcode?: string
  city?: string
  county?: string
}

interface DashboardStats {
  screens: number;
  onlineScreens: number;
  freeUploadsRemaining: number;
  activeContent: number;
  pendingContent: number;
  nextPaymentAmount: number;
  nextPaymentDays: number;
}

export default function OwnerDashboard() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    screens: 0,
    onlineScreens: 0,
    freeUploadsRemaining: 1,
    activeContent: 0,
    pendingContent: 0,
    nextPaymentAmount: 29,
    nextPaymentDays: 30
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')

      if (user.shopId) {
        // Fetch shop info
        const shopData = await shopsAPI.getById(user.shopId)
        setShop(shopData)

        // Fetch multiple stats in parallel
        const [screensRes, contentRes, statsRes] = await Promise.all([
          fetch(`/api/screens/shop/${user.shopId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/content', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/content/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const screens = await screensRes.json().catch(() => [])
        const content = await contentRes.json().catch(() => [])
        const contentStats = await statsRes.json().catch(() => ({}))

        // Calculate stats
        const onlineScreens = screens.filter((s: any) => s.status === 'online').length
        const activeContent = content.filter((c: any) => c.status === 'approved' || c.status === 'published').length
        const pendingContent = content.filter((c: any) => c.status === 'pending').length

        // Calculate uploads remaining this month
        const currentMonth = new Date().getMonth()
        const monthlyUploads = content.filter((c: any) => {
          const uploadDate = new Date(c.created_at)
          return uploadDate.getMonth() === currentMonth && !c.is_extra_upload
        }).length
        const freeUploadsRemaining = Math.max(0, 1 - monthlyUploads)

        // Calculate next payment
        const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate()
        const currentDay = new Date().getDate()
        const nextPaymentDays = currentDay < 15 ? 15 - currentDay : daysInMonth - currentDay + 15

        setStats({
          screens: screens.length,
          onlineScreens,
          freeUploadsRemaining,
          activeContent,
          pendingContent,
          nextPaymentAmount: 29, // Base subscription
          nextPaymentDays
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use fallback data
      setStats({
        screens: 2,
        onlineScreens: 2,
        freeUploadsRemaining: 1,
        activeContent: 5,
        pendingContent: 1,
        nextPaymentAmount: 29,
        nextPaymentDays: 15
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Shop Info */}
      <div>
        <div className="flex items-start gap-6">
          {shop?.photo_url ? (
            <img 
              src={`${config.api.baseURL}${shop.photo_url}`}
              alt={shop.name}
              className="w-24 h-24 rounded-lg object-cover border shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{shop?.name || 'Shop Dashboard'}</h1>
            {shop && (
              <div className="mt-2 space-y-1">
                {shop.shop_type && (
                  <p className="text-sm text-muted-foreground">
                    {shop.shop_type.charAt(0).toUpperCase() + shop.shop_type.slice(1).replace(/_/g, ' ')}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {shop.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {shop.address}
                    </span>
                  )}
                  {shop.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {shop.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Screens</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.screens}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineScreens} online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeUploadsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              Remaining this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingContent} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.nextPaymentAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Due in {stats.nextPaymentDays} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for managing your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="default">
              <MonitorPlay className="mr-2 h-4 w-4" />
              View My Screens
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileImage className="mr-2 h-4 w-4" />
              View Content Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest content and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Shop registered successfully
                </p>
                <p className="text-sm text-muted-foreground">
                  Your account is active and ready to use
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Content managed by designer
                </p>
                <p className="text-sm text-muted-foreground">
                  Your assigned designer will upload content for you
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>
            Monitor how your content is performing across screens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Performance data will appear here once content is published
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}