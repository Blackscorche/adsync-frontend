'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Play, Clock, Monitor, Eye, Music, FileVideo, Image, CheckCircle } from 'lucide-react'
import config from '@/lib/config'

interface PlaylistItem {
  id: number
  content_id: number
  position: number
  duration: number
  content?: {
    id: number
    file_url: string
    file_type: string
    original_filename: string
    status: string
  }
}

interface Playlist {
  id: number
  name: string
  status: string
  is_active: boolean
  item_count: number
  total_duration: number
  created_by_name: string
  assigned_screens?: string
  items?: PlaylistItem[]
  created_at: string
  updated_at: string
}

interface Screen {
  id: number
  name: string
  location: string
  status: string
  current_playlist_id?: number
  playlist_name?: string
}

export default function OwnerPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [selectedScreen, setSelectedScreen] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')

      if (user.shopId) {
        // Fetch playlists
        const playlistsRes = await fetch(
          `${config.api.baseURL}/api/playlists/owner/${user.shopId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )
        const playlistsData = await playlistsRes.json()
        setPlaylists(playlistsData)

        // Fetch screens
        const screensRes = await fetch(
          `${config.api.baseURL}/api/screens/shop/${user.shopId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )
        const screensData = await screensRes.json()
        setScreens(screensData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlaylistDetails = async (playlistId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${config.api.baseURL}/api/playlists/${playlistId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      const data = await response.json()
      setSelectedPlaylist(data)
      setShowPreview(true)
    } catch (error) {
      console.error('Error fetching playlist details:', error)
      toast.error('Failed to load playlist details')
    }
  }

  const handleAssignPlaylist = async () => {
    if (!selectedPlaylist || !selectedScreen) return

    setAssigning(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${config.api.baseURL}/api/playlists/assign`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playlist_id: selectedPlaylist.id,
            screen_id: parseInt(selectedScreen)
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to assign playlist')
      }

      toast.success('Playlist assigned successfully')
      setShowAssignModal(false)
      setSelectedScreen('')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error assigning playlist:', error)
      toast.error('Failed to assign playlist')
    } finally {
      setAssigning(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) return <Image className="h-4 w-4" />
    if (fileType?.includes('video')) return <FileVideo className="h-4 w-4" />
    return <Music className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
        <p className="text-muted-foreground">
          View and assign playlists to your screens
        </p>
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No playlists available</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your designer will create playlists for your content.<br />
              Once published, they'll appear here for you to assign to screens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => {
            const assignedScreens = playlist.assigned_screens?.split(',').filter(Boolean) || []
            return (
              <Card key={playlist.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    </div>
                    <Badge variant="default" className="ml-2">
                      {playlist.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <span>{playlist.item_count} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(playlist.total_duration)}</span>
                      </div>
                    </div>
                  </div>

                  {assignedScreens.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Monitor className="h-4 w-4" />
                      <span>Assigned to {assignedScreens.length} screen(s)</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Created by {playlist.created_by_name}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => fetchPlaylistDetails(playlist.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPlaylist(playlist)
                        setShowAssignModal(true)
                      }}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlaylist?.name}</DialogTitle>
          </DialogHeader>

          {selectedPlaylist?.items && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total duration: {formatDuration(selectedPlaylist.total_duration)}
              </div>

              <div className="space-y-2">
                {selectedPlaylist.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>

                    <div className="flex-shrink-0">
                      {getFileIcon(item.content?.file_type || '')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.content?.original_filename || 'Unknown content'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {item.duration}s
                      </p>
                    </div>

                    {item.content?.status === 'published' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign to Screen Dialog */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Playlist to Screen</DialogTitle>
            <DialogDescription>
              Select a screen to display "{selectedPlaylist?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Screen</label>
              <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a screen..." />
                </SelectTrigger>
                <SelectContent>
                  {screens.map(screen => (
                    <SelectItem key={screen.id} value={screen.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{screen.name}</span>
                        {screen.location && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({screen.location})
                          </span>
                        )}
                        {screen.current_playlist_id && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Has playlist
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedScreen && screens.find(s => s.id === parseInt(selectedScreen))?.current_playlist_id && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This screen already has a playlist assigned. Assigning a new playlist will replace it.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedScreen('')
                }}
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignPlaylist}
                disabled={!selectedScreen || assigning}
              >
                {assigning ? 'Assigning...' : 'Assign Playlist'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}