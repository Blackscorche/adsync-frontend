'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Store,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Commission {
  id: number;
  shop_name: string;
  shop_type: string;
  registration_date: string;
  approval_date: string;
  commission_type: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  invoice_number?: string;
}

interface CommissionStats {
  total_earned: number;
  total_paid: number;
  pending_amount: number;
  this_month: number;
  last_month: number;
  shops_registered: number;
  shops_approved: number;
}

export default function SalesCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchCommissions();
  }, [filter, period]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (period !== 'all') params.append('period', period);

      const response = await fetch(`/api/sales/commissions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch commissions');

      const data = await response.json();
      setCommissions(data.commissions || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // In production, this would generate a PDF/CSV report
    toast.success('Downloading commission report...');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
      'approved': { color: 'bg-blue-500', icon: CheckCircle, label: 'Approved' },
      'paid': { color: 'bg-green-500', icon: DollarSign, label: 'Paid' }
    };

    const badge = badges[status as keyof typeof badges] || {
      color: 'bg-gray-500',
      icon: AlertCircle,
      label: status
    };
    const Icon = badge.icon;

    return (
      <Badge className={badge.color}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getCommissionTypeBadge = (type: string) => {
    const types: { [key: string]: string } = {
      'registration': 'New Registration',
      'monthly': 'Monthly Recurring',
      'upsell': 'Upsell',
      'bonus': 'Performance Bonus'
    };

    return (
      <Badge variant="outline">
        {types[type] || type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Commission Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and payment history
          </p>
        </div>
        <Button onClick={downloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.total_earned.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                £{stats.total_paid.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Received to date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                £{stats.pending_amount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.this_month.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.last_month > 0 && (
                  <span className={stats.this_month > stats.last_month ? 'text-green-600' : 'text-red-600'}>
                    {((stats.this_month - stats.last_month) / stats.last_month * 100).toFixed(0)}% vs last
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shops_approved}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.shops_registered} approved
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commission Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
          <CardDescription>
            Your commission history and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Commission Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.length > 0 ? (
                commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{commission.shop_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {commission.shop_type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCommissionTypeBadge(commission.commission_type)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(commission.registration_date).toLocaleDateString()}</p>
                        {commission.approval_date && (
                          <p className="text-xs text-muted-foreground">
                            Approved: {new Date(commission.approval_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {commission.commission_type === 'registration' ? '10%' : '5%'}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">£{commission.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(commission.status)}
                    </TableCell>
                    <TableCell>
                      {commission.payment_date ? (
                        <div>
                          <p className="text-sm">
                            {new Date(commission.payment_date).toLocaleDateString()}
                          </p>
                          {commission.invoice_number && (
                            <p className="text-xs text-muted-foreground">
                              #{commission.invoice_number}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No commissions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>
            Commissions are paid monthly on the 15th for the previous month's approved shops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Next Payment Date</p>
                <p className="text-sm text-muted-foreground">For approved commissions</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">15th {new Date().getMonth() === 11 ? 'January' : 'of next month'}</p>
                <p className="text-sm text-muted-foreground">
                  Pending: £{stats?.pending_amount.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}