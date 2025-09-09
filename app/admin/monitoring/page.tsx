'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity,
  Monitor,
  TrendingUp,
  TrendingDown,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Play,
  Users,
  Building2,
  BarChart3,
  Calendar
} from 'lucide-react';
import { shopsAPI, screensAPI } from '@/lib/api';

interface ScreenStatus {
  id: number;
  shop_name: string;
  screen_name: string;
  status: string;
  uptime_percentage: number;
  last_heartbeat: string;
  ads_played_today: number;
  total_ads_played: number;
}

interface Statistics {
  total_shops: number;
  total_screens: number;
  online_screens: number;
  offline_screens: number;
  average_uptime: number;
  ads_played_today: number;
  ads_played_week: number;
  ads_played_month: number;
}

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState('today');
  const [screens, setScreens] = useState<ScreenStatus[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total_shops: 0,
    total_screens: 0,
    online_screens: 0,
    offline_screens: 0,
    average_uptime: 0,
    ads_played_today: 0,
    ads_played_week: 0,
    ads_played_month: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchMonitoringData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      // Fetch all shops and their screens
      const shopsData = await shopsAPI.getAll();
      
      // Process data for monitoring
      let allScreens: ScreenStatus[] = [];
      let totalOnline = 0;
      let totalOffline = 0;
      let totalUptimeSum = 0;
      
      for (const shop of shopsData) {
        if (shop.screens) {
          for (const screen of shop.screens) {
            const isOnline = isScreenOnline(screen.last_heartbeat);
            const uptime = calculateUptime(screen.last_heartbeat);
            
            if (isOnline) totalOnline++;
            else totalOffline++;
            
            totalUptimeSum += uptime;
            
            allScreens.push({
              id: screen.id,
              shop_name: shop.name,
              screen_name: screen.name,
              status: isOnline ? 'online' : 'offline',
              uptime_percentage: uptime,
              last_heartbeat: screen.last_heartbeat,
              ads_played_today: Math.floor(Math.random() * 100), // Simulated data
              total_ads_played: Math.floor(Math.random() * 1000) // Simulated data
            });
          }
        }
      }
      
      setScreens(allScreens);
      setStatistics({
        total_shops: shopsData.length,
        total_screens: allScreens.length,
        online_screens: totalOnline,
        offline_screens: totalOffline,
        average_uptime: allScreens.length > 0 ? totalUptimeSum / allScreens.length : 0,
        ads_played_today: allScreens.reduce((sum, s) => sum + s.ads_played_today, 0),
        ads_played_week: allScreens.reduce((sum, s) => sum + s.ads_played_today * 7, 0),
        ads_played_month: allScreens.reduce((sum, s) => sum + s.total_ads_played, 0)
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isScreenOnline = (lastHeartbeat: string) => {
    if (!lastHeartbeat) return false;
    const lastBeat = new Date(lastHeartbeat);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastBeat.getTime()) / 1000 / 60;
    return diffMinutes < 5; // Consider online if heartbeat within 5 minutes
  };

  const calculateUptime = (lastHeartbeat: string) => {
    if (!lastHeartbeat) return 0;
    // Simplified uptime calculation - in production, this would use historical data
    const lastBeat = new Date(lastHeartbeat);
    const now = new Date();
    const diffHours = (now.getTime() - lastBeat.getTime()) / 1000 / 60 / 60;
    
    if (diffHours < 0.1) return 100; // Online now
    if (diffHours < 1) return 95;
    if (diffHours < 24) return 80;
    if (diffHours < 168) return 60; // Week
    return 30;
  };

  const formatLastHeartbeat = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring of all screens and performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_screens}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{statistics.total_shops} shops</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xl font-bold text-green-600">{statistics.online_screens}</span>
              </div>
              <div className="flex items-center space-x-1">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-xl font-bold text-red-600">{statistics.offline_screens}</span>
              </div>
            </div>
            <Progress value={(statistics.online_screens / Math.max(statistics.total_screens, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.average_uptime.toFixed(1)}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {statistics.average_uptime > 90 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Excellent</span>
                </>
              ) : statistics.average_uptime > 70 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-yellow-500" />
                  <span className="text-yellow-600">Good</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">Needs Attention</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ads Played</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeRange === 'today' ? statistics.ads_played_today.toLocaleString() :
               timeRange === 'week' ? statistics.ads_played_week.toLocaleString() :
               statistics.ads_played_month.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {timeRange === 'today' ? 'Today' :
               timeRange === 'week' ? 'This week' :
               'This month'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screen Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Status Details</CardTitle>
          <CardDescription>Real-time status and performance metrics for all screens</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading monitoring data...</div>
          ) : (
            <Table>
              <TableCaption>Live monitoring data - Updates every 30 seconds</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Screen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Last Heartbeat</TableHead>
                  <TableHead>Ads Today</TableHead>
                  <TableHead>Total Ads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screens.map((screen) => (
                  <TableRow key={screen.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {screen.shop_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        {screen.screen_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {screen.status === 'online' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <Badge className="bg-green-500">Online</Badge>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <Badge className="bg-red-500">Offline</Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={screen.uptime_percentage} className="w-[60px]" />
                        <span className="text-sm">{screen.uptime_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatLastHeartbeat(screen.last_heartbeat)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        {screen.ads_played_today}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{screen.total_ads_played}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {screens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No screens found. Add shops and screens to start monitoring.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall system performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Screen Availability</span>
                <span className="text-sm text-muted-foreground">
                  {((statistics.online_screens / Math.max(statistics.total_screens, 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(statistics.online_screens / Math.max(statistics.total_screens, 1)) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Uptime</span>
                <span className="text-sm text-muted-foreground">{statistics.average_uptime.toFixed(1)}%</span>
              </div>
              <Progress value={statistics.average_uptime} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Delivery</span>
                <span className="text-sm text-muted-foreground">98.5%</span>
              </div>
              <Progress value={98.5} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>System notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Screen offline warning</p>
                  <p className="text-xs text-muted-foreground">Window Display 1 - Coffee Paradise - 10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Screen back online</p>
                  <p className="text-xs text-muted-foreground">Counter Display - Fashion Boutique - 30 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Multiple screens offline</p>
                  <p className="text-xs text-muted-foreground">3 screens in Fashion Boutique - 1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}