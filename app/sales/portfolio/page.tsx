'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Store,
  Monitor,
  Search,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Shop {
  id: number;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  screenCount: number;
  activeScreens: number;
  status: 'active' | 'inactive' | 'pending';
  subscriptionPlan: string;
  monthlyRevenue: number;
  registeredDate: string;
  lastActive: string;
}

export default function PortfolioPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      // Simulated data - in production, this would come from the API
      setShops([
        {
          id: 1,
          name: 'Coffee House Central',
          ownerName: 'John Smith',
          ownerEmail: 'john@coffeehouse.com',
          ownerPhone: '+855 12 345 678',
          screenCount: 2,
          activeScreens: 2,
          status: 'active',
          subscriptionPlan: 'Standard',
          monthlyRevenue: 199,
          registeredDate: '2024-01-05',
          lastActive: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          name: 'Fashion Boutique Riverside',
          ownerName: 'Sarah Johnson',
          ownerEmail: 'sarah@fashionboutique.com',
          ownerPhone: '+855 12 987 654',
          screenCount: 1,
          activeScreens: 1,
          status: 'active',
          subscriptionPlan: 'Basic',
          monthlyRevenue: 99,
          registeredDate: '2024-01-08',
          lastActive: '2024-01-15T09:15:00'
        },
        {
          id: 3,
          name: 'Electronics Mega Store',
          ownerName: 'Mike Chen',
          ownerEmail: 'mike@electronicsstore.com',
          ownerPhone: '+855 16 555 888',
          screenCount: 4,
          activeScreens: 3,
          status: 'active',
          subscriptionPlan: 'Premium',
          monthlyRevenue: 399,
          registeredDate: '2023-12-15',
          lastActive: '2024-01-14T16:45:00'
        },
        {
          id: 4,
          name: 'Restaurant Plaza',
          ownerName: 'Lisa Wong',
          ownerEmail: 'lisa@restaurant.com',
          ownerPhone: '+855 17 222 333',
          screenCount: 2,
          activeScreens: 0,
          status: 'inactive',
          subscriptionPlan: 'Standard',
          monthlyRevenue: 0,
          registeredDate: '2023-11-20',
          lastActive: '2023-12-30T14:20:00'
        },
        {
          id: 5,
          name: 'Bookstore Downtown',
          ownerName: 'Tom Davis',
          ownerEmail: 'tom@bookstore.com',
          ownerPhone: '+855 15 777 999',
          screenCount: 1,
          activeScreens: 0,
          status: 'pending',
          subscriptionPlan: 'Basic',
          monthlyRevenue: 0,
          registeredDate: '2024-01-14',
          lastActive: '2024-01-14T11:00:00'
        }
      ]);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Setup</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const totalRevenue = shops.reduce((sum, shop) => sum + shop.monthlyRevenue, 0);
  const activeShops = shops.filter(shop => shop.status === 'active').length;
  const totalScreens = shops.reduce((sum, shop) => sum + shop.screenCount, 0);
  const activeScreens = shops.reduce((sum, shop) => sum + shop.activeScreens, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
        <p className="text-muted-foreground">Manage and track all your registered shops</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shops.length}</div>
            <p className="text-xs text-muted-foreground">{activeShops} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScreens}</div>
            <p className="text-xs text-muted-foreground">{activeScreens} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Recurring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.length > 0 ? Math.round((activeShops / shops.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Active shops</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Portfolio</CardTitle>
          <CardDescription>All shops registered by you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shops or owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading portfolio...</div>
          ) : (
            <Table>
              <TableCaption>Your complete shop portfolio</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Screens</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {shop.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{shop.ownerName}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {shop.ownerEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {shop.ownerPhone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-4 w-4" />
                        {shop.activeScreens}/{shop.screenCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{shop.subscriptionPlan}</Badge>
                    </TableCell>
                    <TableCell>
                      ${shop.monthlyRevenue}/mo
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(shop.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getLastActive(shop.lastActive)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredShops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No shops found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}