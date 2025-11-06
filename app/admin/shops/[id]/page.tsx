'use client';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ArrowLeft,
  Monitor,
  Trash2,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Activity,
  Settings,
  Check,
  X
} from 'lucide-react';
import { shopsAPI, screensAPI, adPreferencesAPI } from '@/lib/api';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  subscription_status: string;
  owner_name: string;
  owner_email: string;
  screens: Screen[];
}

interface Screen {
  id: number;
  name: string;
  device_id: string;
  location: string;
  status: string;
  last_heartbeat: string;
  playlist_name?: string;
}

interface AdPreferences {
  shopId: number;
  shopName: string;
  allowOutsideAds: boolean;
  blockedAdCategories: string[];
}

export default function ShopScreensPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [screenToDelete, setScreenToDelete] = useState<Screen | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adPreferences, setAdPreferences] = useState<AdPreferences | null>(null);
  const [adPrefLoading, setAdPrefLoading] = useState(true);

  useEffect(() => {
    fetchShopDetails();
    fetchAdPreferences();
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const data = await shopsAPI.getById(shopId);
      setShop(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch shop details');
      console.error('Error fetching shop:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdPreferences = async () => {
    try {
      setAdPrefLoading(true);
      const data = await adPreferencesAPI.getPreferences(shopId);
      setAdPreferences(data);
    } catch (err: any) {
      console.error('Error fetching ad preferences:', err);
      // Don't show error, just leave as null
    } finally {
      setAdPrefLoading(false);
    }
  };


  const handleDeleteScreen = (screen: Screen) => {
    setScreenToDelete(screen);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteScreen = async () => {
    if (!screenToDelete) return;

    try {
      await screensAPI.delete(screenToDelete.id.toString());
      toast.success(`Screen "${screenToDelete.name}" deleted successfully`);
      fetchShopDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete screen');
    } finally {
      setDeleteDialogOpen(false);
      setScreenToDelete(null);
    }
  };


  const getStatusIcon = (status: string) => {
    return status === 'online' ? 
      <Wifi className="h-4 w-4 text-green-500" /> : 
      <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getLastHeartbeat = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!shop) {
    return <div className="text-center">Shop not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/shops')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shops
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{shop.name} - Screens</h1>
          <p className="text-muted-foreground">Manage screens for this shop</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Shop Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Owner</p>
              <p className="text-sm">{shop.owner_name}</p>
              <p className="text-xs text-muted-foreground">{shop.owner_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-sm">{shop.address}</p>
              <p className="text-xs text-muted-foreground">{shop.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subscription</p>
              <Badge className={
                shop.subscription_status === 'active' ? 'bg-green-500' :
                shop.subscription_status === 'trial' ? 'bg-blue-500' :
                'bg-red-500'
              }>
                {shop.subscription_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Ad Preferences</CardTitle>
          </div>
          <CardDescription>Shop owner's preferences for third-party advertisements</CardDescription>
        </CardHeader>
        <CardContent>
          {adPrefLoading ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-sm text-muted-foreground">Loading ad preferences...</p>
            </div>
          ) : adPreferences ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Allow Outside Ads</p>
                  <p className="text-sm text-muted-foreground">
                    Third-party advertisements on screens
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {adPreferences.allowOutsideAds ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <Badge className="bg-green-500">Enabled</Badge>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <Badge variant="destructive">Disabled</Badge>
                    </>
                  )}
                </div>
              </div>

              {adPreferences.allowOutsideAds && adPreferences.blockedAdCategories.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-3">Blocked Ad Categories ({adPreferences.blockedAdCategories.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {adPreferences.blockedAdCategories.map((category) => (
                      <Badge key={category} variant="destructive" className="flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {adPreferences.allowOutsideAds && adPreferences.blockedAdCategories.length === 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    All ad categories are allowed on this shop's screens.
                  </p>
                </div>
              )}

              {!adPreferences.allowOutsideAds && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Outside ads are disabled. Only shop's own content will be displayed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Ad preferences not available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screens Table */}
      <Card>
        <CardHeader>
          <CardTitle>Screens ({shop.screens?.length || 0})</CardTitle>
          <CardDescription>All screens registered for this shop</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Manage and monitor all screens</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Screen Name</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Heartbeat</TableHead>
                <TableHead>Current Playlist</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shop.screens?.map((screen) => (
                <TableRow key={screen.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      {screen.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {screen.device_id || 'Not assigned'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {screen.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(screen.status)}
                      <span className={screen.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                        {screen.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getLastHeartbeat(screen.last_heartbeat)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {screen.playlist_name ? (
                      <Badge variant="outline">{screen.playlist_name}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No playlist</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteScreen(screen)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!shop.screens || shop.screens.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No screens registered yet. Screen requests must be submitted by the shop owner and approved through the Screen Requests panel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screen</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the screen "{screenToDelete?.name}"?
              This action cannot be undone and will permanently remove the screen and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScreenToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteScreen} className="bg-red-600 hover:bg-red-700">
              Delete Screen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}