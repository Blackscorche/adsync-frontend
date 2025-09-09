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
  DollarSign,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Store,
  ArrowUp,
  ArrowDown,
  Trophy,
  Star,
  Clock
} from 'lucide-react';

interface CommissionRecord {
  id: number;
  shopName: string;
  type: 'new_registration' | 'renewal' | 'upgrade' | 'bonus';
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  date: string;
  plan: string;
}

interface MonthlyTarget {
  month: string;
  target: number;
  achieved: number;
  commission: number;
  bonus: number;
}

export default function CommissionPage() {
  const [period, setPeriod] = useState('current_month');
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissionData();
  }, [period]);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      // Simulated data - in production, this would come from the API
      setCommissionRecords([
        {
          id: 1,
          shopName: 'Coffee House Central',
          type: 'new_registration',
          amount: 50,
          status: 'paid',
          date: '2024-01-05',
          plan: 'Standard'
        },
        {
          id: 2,
          shopName: 'Fashion Boutique Riverside',
          type: 'new_registration',
          amount: 30,
          status: 'paid',
          date: '2024-01-08',
          plan: 'Basic'
        },
        {
          id: 3,
          shopName: 'Electronics Mega Store',
          type: 'upgrade',
          amount: 75,
          status: 'approved',
          date: '2024-01-10',
          plan: 'Premium'
        },
        {
          id: 4,
          shopName: 'Restaurant Plaza',
          type: 'renewal',
          amount: 40,
          status: 'pending',
          date: '2024-01-12',
          plan: 'Standard'
        },
        {
          id: 5,
          shopName: 'Bookstore Downtown',
          type: 'new_registration',
          amount: 30,
          status: 'pending',
          date: '2024-01-14',
          plan: 'Basic'
        },
        {
          id: 6,
          shopName: 'Target Achievement',
          type: 'bonus',
          amount: 500,
          status: 'approved',
          date: '2024-01-15',
          plan: 'Bonus'
        }
      ]);

      setMonthlyTargets([
        {
          month: 'January 2024',
          target: 50000,
          achieved: 38500,
          commission: 3850,
          bonus: 500
        },
        {
          month: 'December 2023',
          target: 45000,
          achieved: 52000,
          commission: 5200,
          bonus: 1000
        },
        {
          month: 'November 2023',
          target: 45000,
          achieved: 41000,
          commission: 4100,
          bonus: 0
        }
      ]);
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_registration':
        return <Store className="h-4 w-4 text-green-500" />;
      case 'renewal':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'upgrade':
        return <ArrowUp className="h-4 w-4 text-purple-500" />;
      case 'bonus':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'new_registration':
        return <Badge className="bg-green-500">New Registration</Badge>;
      case 'renewal':
        return <Badge className="bg-blue-500">Renewal</Badge>;
      case 'upgrade':
        return <Badge className="bg-purple-500">Upgrade</Badge>;
      case 'bonus':
        return <Badge className="bg-yellow-500">Bonus</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const currentMonth = monthlyTargets[0];
  const totalEarned = commissionRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalPending = commissionRecords
    .filter(r => r.status !== 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const progressPercentage = currentMonth ? (currentMonth.achieved / currentMonth.target) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commission Tracker</h1>
        <p className="text-muted-foreground">Track your earnings and performance targets</p>
      </div>

      {/* Current Month Overview */}
      {currentMonth && (
        <Card>
          <CardHeader>
            <CardTitle>Current Month Performance</CardTitle>
            <CardDescription>{currentMonth.month}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Sales Target</span>
                  <span className="text-sm text-muted-foreground">
                    ${currentMonth.achieved.toLocaleString()} / ${currentMonth.target.toLocaleString()}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{progressPercentage.toFixed(0)}% achieved</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Base Commission</p>
                  <p className="text-2xl font-bold">${currentMonth.commission.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bonus</p>
                  <p className="text-2xl font-bold text-yellow-600">${currentMonth.bonus.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(currentMonth.commission + currentMonth.bonus).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold">10%</p>
                </div>
              </div>

              {progressPercentage >= 100 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-600">
                    Congratulations! You've exceeded your monthly target!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalEarned}</div>
            <p className="text-xs text-muted-foreground">This month (paid)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {commissionRecords.filter(r => r.type === 'new_registration').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tier Status</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gold</div>
            <p className="text-xs text-muted-foreground">Top 10% performer</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Records */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Commission Records</CardTitle>
              <CardDescription>Detailed breakdown of your commissions</CardDescription>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="year_to_date">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading commission data...</div>
          ) : (
            <Table>
              <TableCaption>Your commission history for the selected period</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        {record.shopName}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(record.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.plan}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${record.amount}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Historical Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Your performance over the past months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTargets.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{month.month}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Target: ${month.target.toLocaleString()}</span>
                    <span>Achieved: ${month.achieved.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(month.commission + month.bonus).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Commission</p>
                </div>
                <div className="ml-4">
                  {month.achieved >= month.target ? (
                    <Badge className="bg-green-500">Target Met</Badge>
                  ) : (
                    <Badge variant="outline">
                      {((month.achieved / month.target) * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}