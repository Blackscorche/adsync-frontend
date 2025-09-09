'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Store,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Monitor,
  Calendar,
  Award,
  BarChart3,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface SalesStats {
  totalShops: number;
  activeShops: number;
  totalScreens: number;
  monthlyTarget: number;
  currentSales: number;
  commissionEarned: number;
}

export default function SalesDashboard() {
  const [stats, setStats] = useState<SalesStats>({
    totalShops: 12,
    activeShops: 10,
    totalScreens: 24,
    monthlyTarget: 50000,
    currentSales: 38500,
    commissionEarned: 3850
  });
  const [loading, setLoading] = useState(false);

  const progressPercentage = (stats.currentSales / stats.monthlyTarget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">Manage your shop portfolio and track performance</p>
        </div>
        <Link href="/sales/register-shop">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register New Shop
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShops}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeShops} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScreens}</div>
            <p className="text-xs text-muted-foreground">
              Across all shops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyTarget.toLocaleString()}</div>
            <div className="mt-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progressPercentage.toFixed(0)}% achieved
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.commissionEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/sales/portfolio">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                My Portfolio
              </CardTitle>
              <CardDescription>View and manage your shops</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sales/commission">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Commission Tracker
              </CardTitle>
              <CardDescription>Track earnings and targets</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sales/register-shop">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Register Shop
              </CardTitle>
              <CardDescription>Add new shop to portfolio</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest shop registrations and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { shop: 'Coffee House', action: 'Registered', date: '2 hours ago', screens: 2 },
              { shop: 'Fashion Boutique', action: 'Updated', date: '1 day ago', screens: 1 },
              { shop: 'Electronics Store', action: 'Registered', date: '3 days ago', screens: 3 },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{activity.shop}</p>
                    <p className="text-sm text-muted-foreground">{activity.action} • {activity.screens} screens</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}