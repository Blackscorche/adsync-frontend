'use client';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Link,
  Plus
} from 'lucide-react';
import { screensAPI, playlistsAPI, screenRequestsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Screen {
  id: number;
  name: string;
  device_id: string;
  location: string;
  status: string;
  last_heartbeat: string;
  playlist_name?: string;
  playlist_id?: string;
  current_content_name?: string;
}

interface ScreenRequest {
  id: number;
  screen_name: string;
  location: string;
  screen_type_name: string;
  size_inches: number;
  monthly_cost: number;
  status: string;
  created_at: string;
  expires_at: string;
  rejection_reason?: string;
  device_id?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  item_count: number;
  total_duration: number;
}


export default function OwnerScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [screenRequests, setScreenRequests] = useState<ScreenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddScreenDialogOpen, setIsAddScreenDialogOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [newScreenData, setNewScreenData] = useState({
    name: '',
    location: 'Window',
    screenTypeId: null as number | null
  });
  const [addingScreen, setAddingScreen] = useState(false);
  const [screenTypes, setScreenTypes] = useState<any[]>([]);

  useEffect(() => {
    // Get shop ID from user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.shopId) {
        setShopId(user.shopId);
        fetchScreens(user.shopId);
        fetchScreenRequests();
        fetchPlaylists();
        fetchScreenTypes();
      }
    }

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.shopId) {
          fetchScreens(user.shopId);
        }
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchScreens = async (shopId: string) => {
    try {
      setLoading(true);
      const data = await screensAPI.getByShop(shopId);
      setScreens(data);
    } catch (error) {
      console.error('Error fetching screens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScreenTypes = async () => {
    try {
      const data = await screensAPI.getTypes();
      setScreenTypes(data);
      if (data.length > 0 && !newScreenData.screenTypeId) {
        setNewScreenData(prev => ({ ...prev, screenTypeId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching screen types:', error);
    }
  };

  const fetchScreenRequests = async () => {
    try {
      const requests = await screenRequestsAPI.getShopRequests();
      setScreenRequests(requests);
    } catch (error) {
      console.error('Failed to fetch screen requests:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await playlistsAPI.getAll();
      setPlaylists(data.filter((p: Playlist) => p.is_active));
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleAssignPlaylist = async () => {
    if (!selectedScreen || !selectedPlaylistId || selectedPlaylistId === 'none') return;
    try {
      await playlistsAPI.assignToScreen(selectedPlaylistId, String(selectedScreen.id));
      setIsAssignDialogOpen(false);
      setSelectedScreen(null);
      setSelectedPlaylistId('');
      // Refresh screens to show updated playlist assignment
      fetchScreens(shopId);
    } catch (error) {
      console.error('Error assigning playlist:', error);
      toast.error('Failed to assign playlist to screen');
    }
  };

  const openAssignDialog = (screen: Screen) => {
    setSelectedScreen(screen);
    setSelectedPlaylistId(screen.playlist_id || 'none');
    setIsAssignDialogOpen(true);
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await screenRequestsAPI.cancel(requestId);
      toast.success('Screen request cancelled and refund processed');
      fetchScreenRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    }
  };

  const handleAddScreen = async () => {
    if (!newScreenData.name || !newScreenData.location || !newScreenData.screenTypeId) {
      toast.error('Please fill in all fields');
      return;
    }

    setAddingScreen(true);
    try {
      const selectedType = screenTypes.find(t => t.id === newScreenData.screenTypeId);

      await screenRequestsAPI.create({
        screenName: newScreenData.name,
        location: newScreenData.location,
        screenTypeId: newScreenData.screenTypeId
      });

      toast.success(
        `Screen request submitted successfully! ${formatCurrency(selectedType?.monthly_price || 0)} has been deducted from your credit. ` +
        `The request will be reviewed within 2 days. If rejected, you will receive a full refund.`
      );

      setIsAddScreenDialogOpen(false);
      setNewScreenData({
        name: '',
        location: 'Window',
        screenTypeId: screenTypes.length > 0 ? screenTypes[0].id : null
      });
      fetchScreens(shopId);
      fetchScreenRequests();
    } catch (err: any) {
      if (err.response?.status === 402) {
        toast.error(err.response.data.error || "Please top up your credit to request screens");
      } else {
        toast.error(err.response?.data?.error || "Failed to submit screen request");
      }
    } finally {
      setAddingScreen(false);
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
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Screens</h1>
        <p className="text-muted-foreground">Monitor and manage your digital signage screens</p>
      </div>

      {/* Screen Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{screens.length}</div>
            <p className="text-xs text-muted-foreground">Registered screens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {screens.filter(s => s.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">Active screens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {screens.filter(s => s.status !== 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Screens Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Screen Details</CardTitle>
            <CardDescription>View status and current content for each screen</CardDescription>
          </div>
          <Button onClick={() => setIsAddScreenDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Screen
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading screens...</div>
          ) : (
            <Table>
              <TableCaption>Your digital signage screens - Updates every 30 seconds</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Screen ID</TableHead>
                  <TableHead>Screen Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Current Playlist</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screens.map((screen) => (
                  <TableRow key={screen.id}>
                    <TableCell>
                      <Badge variant="outline">{screen.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        {screen.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {screen.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(screen.status)}
                        <Badge className={(screen.status === 'online' || screen.status === 'active') ? 'bg-green-500' : 'bg-red-500'}>
                          {screen.status === 'active' ? 'online' : screen.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getLastHeartbeat(screen.last_heartbeat)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {screen.playlist_name ? (
                        <Badge variant="outline">{screen.playlist_name}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">No playlist</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignDialog(screen)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {screens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No screens registered yet. Screens will be added to your account after approval.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Screen Requests */}
      {screenRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Screen Requests</CardTitle>
            <CardDescription>Track the status of your screen requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Screen Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screenRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.screen_name}</TableCell>
                    <TableCell>
                      {request.screen_type_name} ({request.size_inches}")
                    </TableCell>
                    <TableCell>{request.location}</TableCell>
                    <TableCell>{formatCurrency(request.monthly_cost)}/month</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending Review
                        </Badge>
                      )}
                      {request.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      )}
                      {request.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Rejected (Refunded)
                        </Badge>
                      )}
                      {request.status === 'expired' && (
                        <Badge className="bg-gray-100 text-gray-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Expired (Refunded)
                        </Badge>
                      )}
                      {request.status === 'cancelled' && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Cancelled (Refunded)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {request.status === 'rejected' && request.rejection_reason && (
                        <span className="text-xs text-red-600">
                          Reason: {request.rejection_reason}
                        </span>
                      )}
                      {request.status === 'approved' && request.device_id && (
                        <span className="text-xs text-green-600">
                          Device ID: {request.device_id}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assign Playlist Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Playlist to {selectedScreen?.name}</DialogTitle>
            <DialogDescription>
              Select a playlist to display on this screen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-select">Select Playlist</Label>
              <Select
                value={selectedPlaylistId}
                onValueChange={setSelectedPlaylistId}
              >
                <SelectTrigger id="playlist-select">
                  <SelectValue placeholder="Select a playlist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No playlist</SelectItem>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name} ({playlist.item_count} items, {Math.floor(playlist.total_duration / 60)}m {playlist.total_duration % 60}s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedScreen(null);
                  setSelectedPlaylistId('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAssignPlaylist}
              >
                Assign Playlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

{/* Add Screen Dialog */}
      <Dialog open={isAddScreenDialogOpen} onOpenChange={setIsAddScreenDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request New Screen</DialogTitle>
            <DialogDescription>
              Submit a request for a new screen. Payment will be deducted immediately and refunded if the request is rejected. Requests are reviewed within 2 days.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newScreenData.name}
                onChange={(e) => setNewScreenData({ ...newScreenData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Front Window Display"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select
                value={newScreenData.location}
                onValueChange={(value) => setNewScreenData({ ...newScreenData, location: value })}
              >
                <SelectTrigger id="location" className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Window">Window</SelectItem>
                  <SelectItem value="Till">Till/Counter</SelectItem>
                  <SelectItem value="Aisle">Aisle</SelectItem>
                  <SelectItem value="Entrance">Entrance</SelectItem>
                  <SelectItem value="Lobby">Lobby</SelectItem>
                  <SelectItem value="Waiting Area">Waiting Area</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="screenType" className="text-right">
                Screen Type
              </Label>
              <Select
                value={newScreenData.screenTypeId?.toString() || ''}
                onValueChange={(value) => setNewScreenData({ ...newScreenData, screenTypeId: parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select screen type" />
                </SelectTrigger>
                <SelectContent>
                  {screenTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} ({type.size_inches}") - £{parseFloat(type.monthly_price).toFixed(2)}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newScreenData.screenTypeId && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Immediate charge:</strong> £
                  {parseFloat(
                    screenTypes.find(t => t.id === newScreenData.screenTypeId)?.monthly_price || 0
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This amount will be deducted from your credit balance immediately.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddScreenDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddScreen} disabled={addingScreen}>
              {addingScreen ? 'Submitting Request...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}