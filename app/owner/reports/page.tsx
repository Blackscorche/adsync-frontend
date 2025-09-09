'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  BarChart3,
  PlayCircle,
  Clock,
  TrendingUp,
  Calendar,
  Monitor,
  Eye,
  Users,
  FileImage,
  Video,
  Activity
} from 'lucide-react';

interface ContentReport {
  id: number;
  content_name: string;
  type: string;
  plays_today: number;
  total_plays: number;
  avg_watch_time: number;
  screen_name: string;
  last_played: string;
}

interface ScreenPerformance {
  screen_name: string;
  uptime_percentage: number;
  content_played: number;
  total_play_time: number;
  viewer_engagement: number;
}

export default function OwnerReportsPage() {
  const [timeRange, setTimeRange] = useState('today');
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [screenPerformance, setScreenPerformance] = useState<ScreenPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Simulated data - in production, this would come from the API
      setContentReports([
        {
          id: 1,
          content_name: 'Summer Sale Banner',
          type: 'image',
          plays_today: 245,
          total_plays: 1523,
          avg_watch_time: 10,
          screen_name: 'Window Display',
          last_played: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          content_name: 'Product Showcase Video',
          type: 'video',
          plays_today: 89,
          total_plays: 678,
          avg_watch_time: 28,
          screen_name: 'Window Display',
          last_played: '2024-01-15T10:25:00'
        },
        {
          id: 3,
          content_name: 'Welcome Message',
          type: 'image',
          plays_today: 312,
          total_plays: 2145,
          avg_watch_time: 5,
          screen_name: 'Counter Display',
          last_played: '2024-01-15T10:32:00'
        },
        {
          id: 4,
          content_name: 'Special Offers',
          type: 'image',
          plays_today: 178,
          total_plays: 987,
          avg_watch_time: 8,
          screen_name: 'Window Display',
          last_played: '2024-01-15T10:20:00'
        }
      ]);

      setScreenPerformance([
        {
          screen_name: 'Window Display',
          uptime_percentage: 98.5,
          content_played: 512,
          total_play_time: 4320,
          viewer_engagement: 85
        },
        {
          screen_name: 'Counter Display',
          uptime_percentage: 99.2,
          content_played: 312,
          total_play_time: 1560,
          viewer_engagement: 72
        }
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastPlayed = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getTotalStats = () => {
    const totalPlays = contentReports.reduce((sum, item) => sum + item.plays_today, 0);
    const avgEngagement = screenPerformance.reduce((sum, item) => sum + item.viewer_engagement, 0) / screenPerformance.length;
    const avgUptime = screenPerformance.reduce((sum, item) => sum + item.uptime_percentage, 0) / screenPerformance.length;
    
    return { totalPlays, avgEngagement, avgUptime };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Track your content performance and screen analytics</p>
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

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlays}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'today' ? 'Today' : `This ${timeRange}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viewer Engagement</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEngagement.toFixed(0)}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUptime.toFixed(1)}%</div>
            <Progress value={stats.avgUptime} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Items in rotation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>Detailed analytics for each content item</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : (
            <Table>
              <TableCaption>Content performance metrics for {timeRange}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Content Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Screen</TableHead>
                  <TableHead>Plays Today</TableHead>
                  <TableHead>Total Plays</TableHead>
                  <TableHead>Avg. View Time</TableHead>
                  <TableHead>Last Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {report.type === 'video' ? 
                          <Video className="h-4 w-4 text-blue-500" /> : 
                          <FileImage className="h-4 w-4 text-green-500" />
                        }
                        {report.content_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {report.screen_name}
                      </div>
                    </TableCell>
                    <TableCell>{report.plays_today}</TableCell>
                    <TableCell>{report.total_plays.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {report.avg_watch_time}s
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatLastPlayed(report.last_played)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Screen Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Performance</CardTitle>
          <CardDescription>Performance metrics for each screen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {screenPerformance.map((screen) => (
              <div key={screen.screen_name} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{screen.screen_name}</span>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-medium">{screen.uptime_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Content Played</p>
                    <p className="font-medium">{screen.content_played}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Play Time</p>
                    <p className="font-medium">{Math.floor(screen.total_play_time / 60)} min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engagement</p>
                    <p className="font-medium">{screen.viewer_engagement}%</p>
                  </div>
                </div>
                <Progress value={screen.uptime_percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}