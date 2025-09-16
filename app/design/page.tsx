'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contentAPI, shopsAPI } from '@/lib/api';
import config from '@/lib/config';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  TrendingUp,
  Palette,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContentStats {
  total: number;
  pending: number;
  inDesign: number;
  designed: number;
  approved: number;
  rejected: number;
  published: number;
}

export default function DesignDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    pending: 0,
    inDesign: 0,
    designed: 0,
    approved: 0,
    rejected: 0,
    published: 0
  });
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [assignedShops, setAssignedShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [dashboardRes, shopsRes, contentRes] = await Promise.all([
        fetch(`${config.api.baseURL}/api/design/dashboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`${config.api.baseURL}/api/design/my-shops`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`${config.api.baseURL}/api/design/pending-content`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        // Get content stats from the response
        const contentStats = dashboardData.content_stats || {};

        // Note: The backend provides these stats:
        // - pending: Content uploaded by owner, needs design
        // - in_design: Currently being worked on by designer
        // - awaiting_review: Submitted for admin review (designed state)
        // - published_this_week: Recently published content

        // For a complete picture, we'll get all statuses from the content list
        let allContent: any[] = [];
        if (contentRes.ok) {
          allContent = await contentRes.json();
          setRecentContent(allContent.slice(0, 5));
        }

        // Count all statuses from actual content
        const approved = allContent.filter((c: any) => c.status === 'approved').length;
        const rejected = allContent.filter((c: any) => c.status === 'rejected').length;
        const published = allContent.filter((c: any) => c.status === 'published').length;

        setStats({
          total: (contentStats.pending || 0) + (contentStats.in_design || 0) +
                 (contentStats.awaiting_review || 0) + approved + rejected + published,
          pending: contentStats.pending || 0,           // Owner uploaded, needs design
          inDesign: contentStats.in_design || 0,        // Designer working on it
          designed: contentStats.awaiting_review || 0,   // Ready for admin review (designed state)
          approved: approved,                            // Admin approved, ready to publish
          rejected: rejected,                            // Admin rejected
          published: published                           // Published to screens
        });
      }

      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        setAssignedShops(shopsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design Team Dashboard</h1>
        <p className="text-muted-foreground">Review content and manage design templates</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Design</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Owner uploads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Palette className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inDesign}</div>
            <p className="text-xs text-muted-foreground">Being designed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Publish</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Admin approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Live on screens</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Content for Review */}
        <Card>
          <CardHeader>
            <CardTitle>Content Needing Design</CardTitle>
            <CardDescription>Recent uploads from shop owners</CardDescription>
          </CardHeader>
          <CardContent>
            {recentContent.length > 0 ? (
              <div className="space-y-3">
                {recentContent.map((content: any) => (
                  <div key={content.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{content.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {content.shop_name} • {new Date(content.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push('/design/content-review')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No content pending review</p>
            )}
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => router.push('/design/content-review')}
            >
              View All Content
            </Button>
          </CardContent>
        </Card>

        {/* Assigned Shops */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Shops</CardTitle>
            <CardDescription>Shops you're managing designs for</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedShops.length > 0 ? (
              <div className="space-y-3">
                {assignedShops.map((shop: any) => (
                  <div key={shop.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {shop.screen_count || 0} screens • {shop.shop_type || 'Retail'}
                        </p>
                      </div>
                    </div>
                    <Badge>
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No shops assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">Contact admin for shop assignments</p>
              </div>
            )}
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => router.push('/design/shops')}
            >
              Manage Shops
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/design/content-review')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileCheck className="h-8 w-8 text-primary" />
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle>Content Review</CardTitle>
            <CardDescription>Review and approve uploaded content</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/design/templates')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Palette className="h-8 w-8 text-primary" />
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle>Design Templates</CardTitle>
            <CardDescription>Create and manage design templates</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/design/shops')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Store className="h-8 w-8 text-primary" />
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle>My Shops</CardTitle>
            <CardDescription>View shops you're assigned to</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}