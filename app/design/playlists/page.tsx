'use client'

import React, { useState, useEffect } from 'react'
import config from '@/lib/config'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Clock,
  Film,
  Image,
  List,
  Monitor,
  Upload
} from 'lucide-react'

interface Shop {
  id: string
  name: string
}

interface Playlist {
  id: string
  name: string
  shop_id: string
  shop_name: string
  is_active: boolean
  item_count: number
  total_duration: number
  created_at: string
}

interface Content {
  id: string
  title: string
  file_url: string
  file_type: string
  status: string
}

export default function DesignerPlaylistsPage() {
  const [assignedShops, setAssignedShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<string>('')
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [shopContent, setShopContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    shopId: ''
  })

  useEffect(() => {
    fetchAssignedShops()
  }, [])

  useEffect(() => {
    if (selectedShop) {
      fetchShopPlaylists(selectedShop)
      fetchShopContent(selectedShop)
    }
  }, [selectedShop])

  const fetchAssignedShops = async () => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/design/assigned-shops`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setAssignedShops(data)
      if (data.length > 0) {
        setSelectedShop(data[0].id)
      }
    } catch (error) {
      toast.error('Failed to fetch assigned shops')
    } finally {
      setLoading(false)
    }
  }

  const fetchShopPlaylists = async (shopId: string) => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/playlists?shop_id=${shopId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setPlaylists(data)
    } catch (error) {
      toast.error('Failed to fetch playlists')
    }
  }

  const fetchShopContent = async (shopId: string) => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/design/shop/${shopId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setShopContent(data.filter((c: Content) =>
        c.file_type?.includes('image') || c.file_type?.includes('video')
      ))
    } catch (error) {
      toast.error('Failed to fetch shop content')
    }
  }

  const handleCreatePlaylist = async () => {
    if (!formData.name || !formData.shopId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch(`${config.api.baseURL}/api/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          shopId: formData.shopId
        })
      })

      if (response.ok) {
        toast.success('Playlist created successfully')
        setShowCreateDialog(false)
        fetchShopPlaylists(formData.shopId)
        setFormData({ name: '', shopId: '' })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create playlist')
      }
    } catch (error) {
      toast.error('Failed to create playlist')
    }
  }

  const handleDeletePlaylist = (playlist: any) => {
    setPlaylistToDelete(playlist)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePlaylist = async () => {
    if (!playlistToDelete) return

    try {
      const response = await fetch(`${config.api.baseURL}/api/playlists/${playlistToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast.success('Playlist deleted successfully')
        fetchShopPlaylists(selectedShop)
      } else {
        toast.error('Failed to delete playlist')
      }
    } catch (error) {
      toast.error('Failed to delete playlist')
    } finally {
      setDeleteDialogOpen(false)
      setPlaylistToDelete(null)
    }
  }

  const handlePublishPlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/playlists/${playlistId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast.success('Playlist published to screens')
        fetchShopPlaylists(selectedShop)
      } else {
        toast.error('Failed to publish playlist')
      }
    } catch (error) {
      toast.error('Failed to publish playlist')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (assignedShops.length === 0) {
    return (
      <div className="text-center py-12">
        <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Shops Assigned</h3>
        <p className="text-gray-500">You haven't been assigned to any shops yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Playlist Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage playlists for your assigned shops</p>
        </div>
        <Button onClick={() => {
          setFormData({ ...formData, shopId: selectedShop })
          setShowCreateDialog(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Playlist
        </Button>
      </div>

      {/* Shop Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Label>Select Shop:</Label>
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent>
              {assignedShops.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">
            {shopContent.length} content items available
          </div>
        </div>
      </Card>

      {/* Playlists Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map(playlist => (
          <Card key={playlist.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{playlist.name}</h3>
              </div>
              <Badge variant={playlist.is_active ? 'default' : 'secondary'}>
                {playlist.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <List className="h-4 w-4" />
                <span>{playlist.item_count} items</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(playlist.total_duration)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = `/design/playlists/${playlist.id}`}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handlePublishPlaylist(playlist.id)}
              >
                <Play className="h-4 w-4 mr-1" />
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeletePlaylist(playlist)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {playlists.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Playlists Yet</h3>
            <p className="text-gray-500 mb-4">Create your first playlist for this shop</p>
            <Button onClick={() => {
              setFormData({ ...formData, shopId: selectedShop })
              setShowCreateDialog(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Playlist
            </Button>
          </Card>
        )}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a playlist to organize content for display on screens
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Promotions"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="shop">Shop *</Label>
              <Select value={formData.shopId} onValueChange={(value) => setFormData({ ...formData, shopId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {assignedShops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist}>
              Create Playlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the playlist "{playlistToDelete?.name}"?
              This action cannot be undone and will remove all content assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlaylistToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePlaylist} className="bg-red-600 hover:bg-red-700">
              Delete Playlist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}