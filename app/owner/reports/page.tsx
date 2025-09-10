'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
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
  FileText,
  Monitor,
  PlayCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface ContentReport {
  id: number;
  contentName: string;
  screenName: string;
  playsToday: number;
  totalPlays: number;
  lastPlayed: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  
  // Simplified report data - just play counts
  const [contentReports] = useState<ContentReport[]>([
    {
      id: 1,
      contentName: 'Winter Sale Banner',
      screenName: 'Window Display',
      playsToday: 45,
      totalPlays: 1250,
      lastPlayed: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      contentName: 'Product Showcase Video',
      screenName: 'Window Display',
      playsToday: 38,
      totalPlays: 890,
      lastPlayed: '2024-01-15T10:25:00'
    },
    {
      id: 3,
      contentName: 'New Arrivals',
      screenName: 'Counter Display',
      playsToday: 62,
      totalPlays: 2100,
      lastPlayed: '2024-01-15T10:28:00'
    },
    {
      id: 4,
      contentName: 'Special Offers',
      screenName: 'Counter Display',
      playsToday: 55,
      totalPlays: 1580,
      lastPlayed: '2024-01-15T10:20:00'
    }
  ]);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const formatLastPlayed = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Calculate simple totals
  const totalPlaysToday = contentReports.reduce((sum, item) => sum + item.playsToday, 0);
  const totalPlaysAllTime = contentReports.reduce((sum, item) => sum + item.totalPlays, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Reports</h1>
          <p className="text-muted-foreground">View play counts for your content</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Simple Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plays Today</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaysToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaysAllTime.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Play Count Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>Play counts for each content item</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content Name</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead className="text-right">Plays Today</TableHead>
                <TableHead className="text-right">Total Plays</TableHead>
                <TableHead>Last Played</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.contentName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      {report.screenName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {report.playsToday}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.totalPlays.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatLastPlayed(report.lastPlayed)}
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