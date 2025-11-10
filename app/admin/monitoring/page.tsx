'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Monitor, 
  Store,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import config from '@/lib/config';
import { toast } from 'sonner';

interface ScreenStatus {
  id: number;
  shopName: string;
  screenName: string;
  deviceId: string;
  location: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

interface MonitoringStats {
  total_screens: number;
  online: number;
  offline: number;
  total_shops: number;
}

export default function MonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [screens, setScreens] = useState<ScreenStatus[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    total_screens: 0,
    online: 0,
    offline: 0,
    total_shops: 0
  });

  useEffect(() => {
    fetchMonitoringData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      // Fetch screens
      const screensResponse = await fetch(`${config.api.baseURL}/api/monitoring/screens`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (screensResponse.ok) {
        const screensData = await screensResponse.json();
        // Calculate status based on last_heartbeat (5 minute threshold)
        const screensWithStatus = screensData.map((screen: any) => ({
          ...screen,
          status: screen.lastSeen && (new Date().getTime() - new Date(screen.lastSeen).getTime() < 5 * 60 * 1000)
            ? 'online'
            : 'offline'
        }));
        setScreens(screensWithStatus);
      }

      // Fetch stats
      const statsResponse = await fetch(`${config.api.baseURL}/api/monitoring/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error('Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchMonitoringData();
  };

  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return 'Never connected';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return date.toLocaleDateString();
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Screen Monitoring</h1>
          <p className="text-muted-foreground">Monitor the status of all digital screens</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Simple Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_screens}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
          </CardContent>
        </Card>
      </div>

      {/* Screen Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Status</CardTitle>
          <CardDescription>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {screens.map((screen) => (
                <TableRow key={screen.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {screen.shopName}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{screen.screenName}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {screen.deviceId || 'Not assigned'}
                    </code>
                  </TableCell>
                  <TableCell>{screen.location}</TableCell>
                  <TableCell>
                    {screen.status === 'online' ? (
                      <Badge className="bg-green-500">Online</Badge>
                    ) : (
                      <Badge variant="destructive">Offline</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastSeen(screen.lastSeen)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {screens.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No screens registered in the system
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}