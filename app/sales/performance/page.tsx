'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Store,
  DollarSign,
  Calendar,
  Target,
  Award,
  BarChart3,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/constants';

interface PerformanceData {
  period: string;
  shops_registered: number;
  shops_approved: number;
  approval_rate: number;
  commission_earned: number;
  commission_paid: number;
  target: number;
  achievement_rate: number;
}

interface MonthlyBreakdown {
  month: string;
  registrations: number;
  approvals: number;
  earnings: number;
  target: number;
  performance: number;
}

export default function SalesPerformancePage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('current_month');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchPerformance();
  }, [period, year]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        period,
        year
      });

      const response = await api.get(`/sales/performance?${params}`);
      const data = response.data;
      setPerformanceData(data.summary);
      setMonthlyData(data.monthly || []);
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error('Failed to load performance data');
      // Set mock data for demonstration
      setPerformanceData({
        period: 'Current Month',
        shops_registered: 12,
        shops_approved: 10,
        approval_rate: 83.3,
        commission_earned: 1250.00,
        commission_paid: 950.00,
        target: 1500.00,
        achievement_rate: 83.3
      });
      setMonthlyData([
        { month: 'January', registrations: 8, approvals: 7, earnings: 875, target: 1000, performance: 87.5 },
        { month: 'February', registrations: 10, approvals: 8, earnings: 1000, target: 1200, performance: 83.3 },
        { month: 'March', registrations: 12, approvals: 10, earnings: 1250, target: 1500, performance: 83.3 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    toast.success('Generating performance report...');
    // In production, this would generate a PDF report
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 100) return { label: 'Excellent', color: 'bg-green-500' };
    if (rate >= 80) return { label: 'Good', color: 'bg-blue-500' };
    if (rate >= 60) return { label: 'Average', color: 'bg-yellow-500' };
    return { label: 'Needs Improvement', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const performanceBadge = performanceData ? getPerformanceBadge(performanceData.achievement_rate) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Report</h1>
          <p className="text-muted-foreground mt-1">
            Track your sales performance and targets
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="current_quarter">Current Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="current_year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      {performanceData && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shops Registered</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.shops_registered}</div>
                <p className="text-xs text-muted-foreground">
                  {performanceData.shops_approved} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.approval_rate)}`}>
                  {performanceData.approval_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Quality score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(performanceData.commission_earned)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(performanceData.commission_paid)} paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.achievement_rate)}`}>
                  {performanceData.achievement_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {formatCurrency(performanceData.target)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Your performance rating for {performanceData.period}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">Your Rating</p>
                      {performanceBadge && (
                        <Badge className={performanceBadge.color}>
                          {performanceBadge.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Progress</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(performanceData.achievement_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className="text-xl font-semibold">
                        {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">Performance Trend</p>
                  {performanceData.achievement_rate >= 80 ? (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-6 w-6 mr-2" />
                      <span className="text-2xl font-bold">↑</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="h-6 w-6 mr-2" />
                      <span className="text-2xl font-bold">↓</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed performance metrics by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Approvals</TableHead>
                <TableHead>Approval Rate</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell>{month.registrations}</TableCell>
                  <TableCell>{month.approvals}</TableCell>
                  <TableCell>
                    <span className={getPerformanceColor((month.approvals / month.registrations) * 100)}>
                      {((month.approvals / month.registrations) * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(month.earnings)}</TableCell>
                  <TableCell>{formatCurrency(month.target)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${month.performance >= 80 ? 'bg-green-600' : 'bg-yellow-600'}`}
                          style={{ width: `${Math.min(month.performance, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getPerformanceColor(month.performance)}`}>
                        {month.performance.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tips and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
          <CardDescription>Recommendations to improve your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData && performanceData.approval_rate < 80 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Improve Shop Quality</p>
                  <p className="text-sm text-muted-foreground">
                    Focus on qualifying shops better before registration to improve approval rate.
                  </p>
                </div>
              </div>
            )}
            {performanceData && performanceData.achievement_rate < 100 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Increase Outreach</p>
                  <p className="text-sm text-muted-foreground">
                    Expand your network and reach out to more potential shops to meet targets.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Follow Up Regularly</p>
                <p className="text-sm text-muted-foreground">
                  Maintain regular contact with registered shops to ensure smooth approval process.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}