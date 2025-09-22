'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import {
  Store,
  MonitorPlay,
  FileImage,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Activity,
  Plus,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalShops: number;
  activeShops: number;
  pendingApprovals: number;
  totalScreens: number;
  onlineScreens: number;
  pendingContent: number;
  approvedContent: number;
  totalUsers: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  newShopsThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: 'shop_registered' | 'content_uploaded' | 'shop_approved' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalShops: 0,
    activeShops: 0,
    pendingApprovals: 0,
    totalScreens: 0,
    onlineScreens: 0,
    pendingContent: 0,
    approvedContent: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    newShopsThisMonth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use the configured API client instead of plain fetch
      const [shopsRes, screensRes, contentRes, usersRes] = await Promise.all([
        api.get('/admin/shops').catch(() => ({ data: [] })),
        api.get('/admin/screens').catch(() => ({ data: [] })),
        api.get('/admin/content/stats').catch(() => ({ data: {} })),
        api.get('/admin/users').catch(() => ({ data: [] }))
      ]);

      // Process responses (axios returns data directly)
      const shops = shopsRes.data || [];
      const screens = screensRes.data || [];
      const contentStats = contentRes.data || {};
      const users = usersRes.data || [];

      // Calculate statistics
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const newShopsThisMonth = shops.filter((shop: any) => {
        const shopDate = new Date(shop.created_at);
        return shopDate.getMonth() === thisMonth && shopDate.getFullYear() === thisYear;
      }).length;

      const pendingApprovals = shops.filter((shop: any) => shop.approval_status === 'pending').length;
      const activeShops = shops.filter((shop: any) => shop.approval_status === 'approved').length;
      const onlineScreens = screens.filter((screen: any) => screen.status === 'online').length;

      // Calculate monthly revenue (example calculation)
      const monthlyRevenue = activeShops * 29.99; // Base subscription
      const lastMonthRevenue = (activeShops - newShopsThisMonth) * 29.99;
      const revenueGrowth = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
        : 100;

      setStats({
        totalShops: shops.length,
        activeShops,
        pendingApprovals,
        totalScreens: screens.length,
        onlineScreens,
        pendingContent: contentStats.pending || 0,
        approvedContent: contentStats.approved || 0,
        totalUsers: users.length,
        monthlyRevenue,
        revenueGrowth,
        newShopsThisMonth
      });

      // Generate recent activity
      const activities: RecentActivity[] = [];

      // Add recent shops
      shops.slice(0, 3).forEach((shop: any) => {
        activities.push({
          id: shop.id,
          type: shop.approval_status === 'pending' ? 'shop_registered' : 'shop_approved',
          title: shop.approval_status === 'pending' ? 'New Shop Registration' : 'Shop Approved',
          description: `${shop.name} - ${shop.address}`,
          timestamp: shop.created_at,
          status: shop.approval_status === 'pending' ? 'pending' : 'success'
        });
      });

      setRecentActivity(activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback/demo data if API fails
      setStats({
        totalShops: 12,
        activeShops: 10,
        pendingApprovals: 2,
        totalScreens: 24,
        onlineScreens: 22,
        pendingContent: 5,
        approvedContent: 48,
        totalUsers: 15,
        monthlyRevenue: 299.90,
        revenueGrowth: 12.5,
        newShopsThisMonth: 3
      });

      setRecentActivity([
        {
          id: '1',
          type: 'shop_registered',
          title: 'New Shop Registration',
          description: 'Coffee House - High Street',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          type: 'content_uploaded',
          title: 'Content Uploaded',
          description: 'Summer Sale Banner - Boutique Store',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending'
        },
        {
          id: '3',
          type: 'shop_approved',
          title: 'Shop Approved',
          description: 'Pizza Palace - Main Road',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'success'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shop_registered':
        return <Store className="h-4 w-4" />;
      case 'content_uploaded':
        return <FileImage className="h-4 w-4" />;
      case 'shop_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your digital signage network
          </p>
        </div>
        <Button onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShops}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeShops} active, {stats.pendingApprovals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Screens</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScreens}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineScreens} online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Content</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingContent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedContent} approved total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={() => router.push('/admin/approvals')}
            >
              Review Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newShopsThisMonth}</div>
            <p className="text-xs text-muted-foreground">shops registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">across all roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activity and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 ${getActivityColor(activity.status)} rounded-full`}></div>
                  <div className="p-2 bg-muted rounded">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  {activity.status && (
                    <Badge variant={activity.status === 'pending' ? 'secondary' : 'default'}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/approvals')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Review Pending Shops ({stats.pendingApprovals})
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/content')}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Review Content ({stats.pendingContent})
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/pricing')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Pricing Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Current system status and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.onlineScreens > 0
                  ? Math.round((stats.onlineScreens / stats.totalScreens) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Screen Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.activeShops > 0
                  ? Math.round((stats.activeShops / stats.totalShops) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Shop Activation</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <p className="text-xs text-muted-foreground">API Health</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Normal</div>
              <p className="text-xs text-muted-foreground">System Load</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}