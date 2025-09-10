'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
  Store,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommissionRecord {
  id: number;
  shopName: string;
  type: 'new_registration' | 'monthly_maintenance';
  amount: number;
  status: 'pending' | 'paid';
  date: string;
}

export default function CommissionPage() {
  const [period, setPeriod] = useState('current_month');
  const [loading, setLoading] = useState(false);
  
  // Simplified commission data - flat rates only
  const [commissionRecords] = useState<CommissionRecord[]>([
    {
      id: 1,
      shopName: 'London Fashion Store',
      type: 'new_registration',
      amount: 50,
      status: 'paid',
      date: '2024-01-05'
    },
    {
      id: 2,
      shopName: 'Manchester Electronics',
      type: 'new_registration',
      amount: 50,
      status: 'paid',
      date: '2024-01-08'
    },
    {
      id: 3,
      shopName: 'Birmingham Restaurant',
      type: 'new_registration',
      amount: 50,
      status: 'pending',
      date: '2024-01-12'
    },
    {
      id: 4,
      shopName: 'London Fashion Store',
      type: 'monthly_maintenance',
      amount: 10,
      status: 'paid',
      date: '2024-01-15'
    },
    {
      id: 5,
      shopName: 'Manchester Electronics',
      type: 'monthly_maintenance',
      amount: 10,
      status: 'paid',
      date: '2024-01-15'
    }
  ]);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'new_registration':
        return 'New Shop Registration';
      case 'monthly_maintenance':
        return 'Monthly Maintenance';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Simple calculations
  const totalEarned = commissionRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalPending = commissionRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const newRegistrations = commissionRecords
    .filter(r => r.type === 'new_registration').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Tracker</h1>
          <p className="text-muted-foreground">Track your earnings from shop registrations</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Simple Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">£{totalEarned}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newRegistrations}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>New Shop: £50</p>
              <p>Monthly: £10/shop</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Records */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Commission Records</CardTitle>
              <CardDescription>Your earnings breakdown</CardDescription>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Commission records for the selected period</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {record.shopName}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeLabel(record.type)}</TableCell>
                  <TableCell className="text-right font-medium">£{record.amount}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}