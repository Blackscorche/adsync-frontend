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
  PlayCircle,
  ListVideo,
  AlertCircle,
  CheckCircle2,
  Eye,
  Link,
  Plus
} from 'lucide-react';
import { screensAPI, playlistsAPI } from '@/lib/api';
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

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  item_count: number;
  total_duration: number;
}

interface PlaylistItem {
  id: number;
  name: string;
  type: string;
  duration: number;
  url?: string;
}

export default function OwnerScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistItem[]>([]);
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAddScreenDialogOpen, setIsAddScreenDialogOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [newScreenData, setNewScreenData] = useState({
    name: '',
    location: '',
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

  const fetchPlaylists = async () => {
    try {
      const data = await playlistsAPI.getAll();
      setPlaylists(data.filter((p: Playlist) => p.is_active));
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleAssignPlaylist = async () => {
    if (!selectedScreen || !selectedPlaylistId) return;
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
    setSelectedPlaylistId(screen.playlist_id || '');
    setIsAssignDialogOpen(true);
  };

  const handleAddScreen = async () => {
    if (!newScreenData.name || !newScreenData.location || !newScreenData.screenTypeId) {
      toast.error('Please fill in all fields');
      return;
    }

    setAddingScreen(true);
    try {
      const selectedType = screenTypes.find(t => t.id === newScreenData.screenTypeId);

      await screensAPI.create({
        shopId: parseInt(shopId),
        name: newScreenData.name,
        location: newScreenData.location,
        screenTypeId: newScreenData.screenTypeId
      });

      toast.success(`${newScreenData.name} has been added. £${parseFloat(selectedType?.monthly_price || 0).toFixed(2)} charged to your account.`);

      setIsAddScreenDialogOpen(false);
      setNewScreenData({
        name: '',
        location: '',
        screenTypeId: screenTypes.length > 0 ? screenTypes[0].id : null
      });
      fetchScreens(shopId);
    } catch (err: any) {
      if (err.response?.status === 402) {
        toast.error(err.response.data.error || "Please top up your credit to add screens");
      } else {
        toast.error(err.response?.data?.error || "Failed to add screen");
      }
    } finally {
      setAddingScreen(false);
    }
  };

  const viewPlaylist = (screen: Screen) => {
    setSelectedScreen(screen);
    // Simulated playlist data - in production, this would come from the API
    setCurrentPlaylist([
      { id: 1, name: 'Summer Sale Banner', type: 'image', duration: 10 },
      { id: 2, name: 'Product Showcase Video', type: 'video', duration: 30 },
      { id: 3, name: 'Welcome Message', type: 'image', duration: 5 },
      { id: 4, name: 'Special Offers', type: 'image', duration: 8 },
      { id: 5, name: 'Brand Story Video', type: 'video', duration: 45 },
    ]);
    setIsPlaylistDialogOpen(true);
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

  const getContentTypeIcon = (type: string) => {
    return type === 'video' ? 
      <PlayCircle className="h-4 w-4 text-blue-500" /> : 
      <ListVideo className="h-4 w-4 text-green-500" />;
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
              {screens.filter(s => s.status === 'offline').length}
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
            Add Screen
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
                        <Badge className={screen.status === 'online' ? 'bg-green-500' : 'bg-red-500'}>
                          {screen.status}
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignDialog(screen)}
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                        {screen.playlist_name && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewPlaylist(screen)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {screens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No screens registered yet. Contact support to add screens to your account.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
              <label className="text-sm font-medium">Select Playlist</label>
              <select
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">No playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name} ({playlist.item_count} items, {Math.floor(playlist.total_duration / 60)}m {playlist.total_duration % 60}s)
                  </option>
                ))}
              </select>
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

      {/* View Playlist Dialog */}
      <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Current Playlist - {selectedScreen?.name}</DialogTitle>
            <DialogDescription>
              Content currently playing on this screen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Content Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPlaylist.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(item.type)}
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.duration}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total items: {currentPlaylist.length}</span>
              <span>Total duration: {currentPlaylist.reduce((sum, item) => sum + item.duration, 0)}s</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Screen Dialog */}
      <Dialog open={isAddScreenDialogOpen} onOpenChange={setIsAddScreenDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Screen</DialogTitle>
            <DialogDescription>
              Add a new digital display screen to your shop. You will be charged immediately based on screen size.
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
              <Input
                id="location"
                value={newScreenData.location}
                onChange={(e) => setNewScreenData({ ...newScreenData, location: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Main Entrance"
              />
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
              {addingScreen ? 'Adding...' : 'Add Screen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}