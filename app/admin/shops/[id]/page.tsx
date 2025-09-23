'use client';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Plus, 
  Monitor,
  Edit,
  Trash2,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Activity
} from 'lucide-react';
import { shopsAPI, screensAPI } from '@/lib/api';
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

export default function ShopScreensPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [screenToDelete, setScreenToDelete] = useState<Screen | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: 'Window',
    deviceId: ''
  });

  useEffect(() => {
    fetchShopDetails();
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

  const handleAddScreen = async () => {
    try {
      await screensAPI.create({
        shopId: parseInt(shopId),
        name: formData.name,
        location: formData.location,
        deviceId: formData.deviceId || undefined
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        location: 'Window',
        deviceId: ''
      });
      fetchShopDetails();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create screen');
    }
  };

  const handleUpdateScreen = async () => {
    if (!selectedScreen) return;
    
    try {
      await screensAPI.update(selectedScreen.id.toString(), {
        name: formData.name,
        location: formData.location
      });
      setIsEditDialogOpen(false);
      setSelectedScreen(null);
      fetchShopDetails();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update screen');
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

  const handleEditClick = (screen: Screen) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name,
      location: screen.location,
      deviceId: screen.device_id
    });
    setIsEditDialogOpen(true);
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
    <div className="space-y-6">
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Screen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Screen</DialogTitle>
              <DialogDescription>
                Register a new screen for {shop.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="screen-name">Screen Name</Label>
                <Input
                  id="screen-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Window Display 1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger id="location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Window">Window</SelectItem>
                    <SelectItem value="Till">Till/Counter</SelectItem>
                    <SelectItem value="Aisle">Aisle</SelectItem>
                    <SelectItem value="Entrance">Entrance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="device-id">Device ID (Optional)</Label>
                <Input
                  id="device-id"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  placeholder="Unique device identifier"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddScreen}>Create Screen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(screen)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScreen(screen)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!shop.screens || shop.screens.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No screens registered yet. Click "Add Screen" to register a new screen.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Screen</DialogTitle>
            <DialogDescription>
              Update screen information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-screen-name">Screen Name</Label>
              <Input
                id="edit-screen-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="edit-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Window">Window</SelectItem>
                  <SelectItem value="Till">Till/Counter</SelectItem>
                  <SelectItem value="Aisle">Aisle</SelectItem>
                  <SelectItem value="Entrance">Entrance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateScreen}>Update Screen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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