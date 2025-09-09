'use client';

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
  Eye
} from 'lucide-react';
import { screensAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Screen {
  id: number;
  name: string;
  device_id: string;
  location: string;
  status: string;
  last_heartbeat: string;
  playlist_name?: string;
  current_content_name?: string;
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
  const [shopId, setShopId] = useState<string>('');

  useEffect(() => {
    // Get shop ID from user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.shopId) {
        setShopId(user.shopId);
        fetchScreens(user.shopId);
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
        <CardHeader>
          <CardTitle>Screen Details</CardTitle>
          <CardDescription>View status and current content for each screen</CardDescription>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPlaylist(screen)}
                        disabled={!screen.playlist_name}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Playlist
                      </Button>
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

      {/* Playlist Dialog */}
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
    </div>
  );
}