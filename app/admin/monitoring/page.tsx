'use client';

import { useState } from 'react';
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

interface ScreenStatus {
  id: number;
  shopName: string;
  screenName: string;
  status: 'online' | 'offline';
  lastSeen: string;
  currentContent: string;
}

export default function MonitoringPage() {
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Simplified screen status data
  const [screens, setScreens] = useState<ScreenStatus[]>([
    {
      id: 1,
      shopName: 'London Fashion Store',
      screenName: 'Window Display',
      status: 'online',
      lastSeen: '2024-01-15T10:30:00',
      currentContent: 'Winter Sale Promotion'
    },
    {
      id: 2,
      shopName: 'London Fashion Store',
      screenName: 'Counter Display',
      status: 'online',
      lastSeen: '2024-01-15T10:29:30',
      currentContent: 'New Arrivals'
    },
    {
      id: 3,
      shopName: 'Manchester Electronics',
      screenName: 'Main Display',
      status: 'offline',
      lastSeen: '2024-01-15T08:15:00',
      currentContent: 'Tech Deals'
    },
    {
      id: 4,
      shopName: 'Birmingham Restaurant',
      screenName: 'Menu Board 1',
      status: 'online',
      lastSeen: '2024-01-15T10:30:00',
      currentContent: 'Lunch Menu'
    },
    {
      id: 5,
      shopName: 'Birmingham Restaurant',
      screenName: 'Menu Board 2',
      status: 'online',
      lastSeen: '2024-01-15T10:30:00',
      currentContent: 'Daily Specials'
    }
  ]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setLoading(false);
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const onlineCount = screens.filter(s => s.status === 'online').length;
  const offlineCount = screens.filter(s => s.status === 'offline').length;

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{screens.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineCount}</div>
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
                <TableHead>Status</TableHead>
                <TableHead>Current Content</TableHead>
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
                    {screen.status === 'online' ? (
                      <Badge className="bg-green-500">Online</Badge>
                    ) : (
                      <Badge variant="destructive">Offline</Badge>
                    )}
                  </TableCell>
                  <TableCell>{screen.currentContent}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastSeen(screen.lastSeen)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}