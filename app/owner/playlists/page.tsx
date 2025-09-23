'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Play, Pause, Clock, Monitor, Music, FileVideo, SkipForward, SkipBack } from 'lucide-react'
import config from '@/lib/config'

interface PlaylistItem {
  id: number
  content_id: number
  position: number
  duration: number
  content?: {
    title: string
    file_url: string
    file_type: string
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
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showLivePreview, setShowLivePreview] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [itemProgress, setItemProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  // Live preview slideshow effect
  useEffect(() => {
    if (!selectedPlaylist?.items || selectedPlaylist.items.length === 0) {
      return
    }

    const currentItem = selectedPlaylist.items[currentItemIndex]
    const duration = (currentItem?.duration || 5) * 1000 // Convert to milliseconds

    if (!isPlaying) {
      // When paused, keep the progress frozen
      return
    }

    // Check if we've reached 100% progress
    if (itemProgress >= 100) {
      setItemProgress(0) // Reset for next item
      setCurrentItemIndex((prev) => (prev + 1) % (selectedPlaylist.items?.length || 1))
      return
    }

    // Calculate remaining duration based on current progress
    const remainingDuration = duration * (1 - itemProgress / 100)

    // Progress update interval (every 100ms)
    const progressInterval = setInterval(() => {
      setItemProgress(prev => {
        const newProgress = prev + (100 / duration) * 100
        if (newProgress >= 100) {
          return 100
        }
        return newProgress
      })
    }, 100)

    // Item change timer
    const timer = setTimeout(() => {
      setItemProgress(0) // Reset for next item
      setCurrentItemIndex((prev) => (prev + 1) % (selectedPlaylist.items?.length || 1))
    }, remainingDuration)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [isPlaying, currentItemIndex, selectedPlaylist, itemProgress])

  const startLivePreview = async (playlistId: number) => {
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
      setCurrentItemIndex(0)
      setIsPlaying(true)
      setShowLivePreview(true)
    } catch (error) {
      console.error('Error fetching playlist for preview:', error)
      toast.error('Failed to load playlist preview')
    }
  }

  const stopLivePreview = () => {
    setIsPlaying(false)
    setShowLivePreview(false)
    setCurrentItemIndex(0)
    setItemProgress(0)
  }

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
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
                      onClick={() => startLivePreview(playlist.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
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

      {/* Live Preview Dialog */}
      <Dialog open={showLivePreview} onOpenChange={stopLivePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Live Playlist Preview</DialogTitle>
            <DialogDescription>
              Preview of {selectedPlaylist?.name || 'playlist'} with automatic slideshow
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[80vh] bg-black flex items-center justify-center">
            {selectedPlaylist?.items && selectedPlaylist.items.length > 0 && (
              <>
                {/* Current Item Display */}
                <div className="w-full h-full flex items-center justify-center">
                  {(() => {
                    const currentItem = selectedPlaylist.items[currentItemIndex]
                    if (!currentItem?.content) {
                      return (
                        <div className="text-white text-xl">
                          Content not available
                        </div>
                      )
                    }

                    if (currentItem.content.file_type?.includes('image')) {
                      return (
                        <img
                          key={currentItemIndex}
                          src={`${config.api.baseURL}${currentItem.content.file_url}`}
                          alt={currentItem.content.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      )
                    } else if (currentItem.content.file_type?.includes('video')) {
                      return (
                        <video
                          key={currentItemIndex}
                          src={`${config.api.baseURL}${currentItem.content.file_url}`}
                          className="max-w-full max-h-full object-contain"
                          autoPlay
                          muted
                        />
                      )
                    } else {
                      return (
                        <div className="text-white text-center">
                          <FileVideo className="h-24 w-24 mx-auto mb-4" />
                          <p className="text-xl">{currentItem.content.title}</p>
                        </div>
                      )
                    }
                  })()}
                </div>

                {/* Controls Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="bg-black bg-opacity-50 px-3 py-1 rounded">
                    {selectedPlaylist.items[currentItemIndex]?.content?.title || 'Unknown'}
                  </div>
                  <div className="bg-black bg-opacity-50 px-3 py-1 rounded">
                    {currentItemIndex + 1} / {selectedPlaylist.items.length}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black bg-opacity-50 p-3 rounded">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span>
                        {Math.ceil(((selectedPlaylist.items[currentItemIndex]?.duration || 5) * (100 - itemProgress)) / 100)}s remaining
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const prevIndex = currentItemIndex === 0
                              ? (selectedPlaylist.items?.length || 1) - 1
                              : currentItemIndex - 1
                            setCurrentItemIndex(prevIndex)
                            setItemProgress(0)
                          }}
                          disabled={(selectedPlaylist.items?.length || 0) <= 1}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setCurrentItemIndex((prev) => (prev + 1) % (selectedPlaylist.items?.length || 1))
                            setItemProgress(0)
                          }}
                          disabled={(selectedPlaylist.items?.length || 0) <= 1}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={stopLivePreview}>
                          Stop
                        </Button>
                      </div>
                    </div>
                    <div
                      className="w-full bg-gray-600 rounded-full h-3 cursor-pointer relative group"
                      onClick={(e) => {
                        if (isDragging) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const percentage = (x / rect.width) * 100
                        const newProgress = Math.max(0, Math.min(100, percentage))
                        setItemProgress(newProgress)

                        // If seeked to 100%, advance to next item
                        if (newProgress >= 99.9) {
                          setTimeout(() => {
                            setItemProgress(0)
                            setCurrentItemIndex((prev) => (prev + 1) % (selectedPlaylist.items?.length || 1))
                          }, 100)
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!isDragging) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const percentage = (x / rect.width) * 100
                        const newProgress = Math.max(0, Math.min(100, percentage))
                        setItemProgress(newProgress)

                        // If dragged to 100%, advance to next item
                        if (newProgress >= 99.9) {
                          setIsDragging(false)
                          setTimeout(() => {
                            setItemProgress(0)
                            setCurrentItemIndex((prev) => (prev + 1) % (selectedPlaylist.items?.length || 1))
                          }, 100)
                        }
                      }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                    >
                      <div
                        className="bg-blue-500 h-3 rounded-full pointer-events-none"
                        style={{
                          width: `${itemProgress}%`,
                          transition: isDragging ? 'none' : 'width 100ms'
                        }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        style={{
                          left: `calc(${itemProgress}% - 8px)`
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setIsDragging(true)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}