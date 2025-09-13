'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface DashboardData {
  shops: any[];
  stats: {
    total_shops: number;
    approved_shops: number;
    total_earned: number;
    total_paid: number;
  };
  recentActivity: any[];
}

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/sales/dashboard');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const approvalRate = data?.stats.total_shops
    ? ((data.stats.approved_shops / data.stats.total_shops) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your performance and commissions</p>
        </div>
        <Link href="/sales/shops/register">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register New Shop
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.total_shops || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered by you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.stats.approved_shops || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{data?.stats.total_earned || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Commission earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{data?.stats.total_paid || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Commission received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No shops registered yet</p>
              ) : (
                data?.recentActivity.map((shop: any) => (
                  <div key={shop.created_at} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {shop.approval_status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : shop.approval_status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{shop.shop_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(shop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        shop.approval_status === 'approved'
                          ? 'default'
                          : shop.approval_status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {shop.approval_status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            {data?.recentActivity && data.recentActivity.length > 0 && (
              <Link href="/sales/shops">
                <Button variant="link" className="w-full mt-4">
                  View All Shops →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/sales/shops/register" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Register New Shop
              </Button>
            </Link>
            <Link href="/sales/shops" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Store className="mr-2 h-4 w-4" />
                View My Shops
              </Button>
            </Link>
            <Link href="/sales/commissions" className="block">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Check Commissions
              </Button>
            </Link>
            <Link href="/sales/performance" className="block">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}