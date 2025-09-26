'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import config from '@/lib/config'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Clock,
  Image,
  Video,
  GripVertical,
  Play,
  Pause
} from 'lucide-react'

interface PlaylistItem {
  id: string
  content_id: string
  position: number
  duration: number
  content: {
    title: string
    file_url: string
    file_type?: string
  }
}

interface Content {
  id: string
  title: string
  file_url: string
  file_type: string
}

function SortableItem({ item, onRemove, onDurationChange }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden">
        {item.content?.file_url && item.content?.file_type?.includes('image') ? (
          <img
            src={item.content.file_url}
            alt={item.content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.content?.file_type?.includes('video') ? (
              <Video className="h-6 w-6 text-gray-400" />
            ) : (
              <Image className="h-6 w-6 text-gray-400" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{item.content?.title || 'Unknown content'}</p>
        <p className="text-sm text-muted-foreground">
          Position {item.position + 1}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={item.duration}
          onChange={(e) => onDurationChange(item.id, parseInt(e.target.value))}
          className="w-20 text-center"
          min={1}
          max={300}
        />
        <span className="text-sm text-muted-foreground">sec</span>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}

export default function EditPlaylistPage() {
  const params = useParams()
  const router = useRouter()
  const playlistId = params.id as string

  const [playlist, setPlaylist] = useState<any>(null)
  const [items, setItems] = useState<PlaylistItem[]>([])
  const [availableContent, setAvailableContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchPlaylistDetails()
  }, [playlistId])

  const fetchPlaylistDetails = async () => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setPlaylist(data)
      setItems(data.items || [])

      // Fetch available content after playlist data is loaded
      if (data.shop_id) {
        fetchAvailableContent(data.shop_id)
      }
    } catch (error) {
      toast.error('Failed to fetch playlist details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableContent = async (shopId: string) => {
    try {
      // Get shop content
      const response = await fetch(`${config.api.baseURL}/api/design/shop/${shopId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setAvailableContent(data.filter((c: Content) =>
        c.file_type?.includes('image') || c.file_type?.includes('video')
      ))
    } catch (error) {
      console.error('Failed to fetch content')
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update positions
        return newItems.map((item, index) => ({
          ...item,
          position: index
        }))
      })
    }
  }

  const addContentToPlaylist = async (contentId: string) => {
    const content = availableContent.find(c => c.id === contentId)
    if (!content) return

    const newItem: PlaylistItem = {
      id: `temp-${Date.now()}`,
      content_id: contentId,
      position: items.length,
      duration: content.file_type?.includes('video') ? 30 : 10,
      content: {
        title: content.title,
        file_url: content.file_url,
        file_type: content.file_type
      }
    }

    setItems([...items, newItem])
    toast.success('Content added to playlist')
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const updateDuration = (itemId: string, duration: number) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, duration } : item
    ))
  }

  const savePlaylist = async () => {
    setSaving(true)
    try {
      // Update playlist items
      const response = await fetch(`${config.api.baseURL}/api/playlists/${playlistId}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: items.map((item, index) => ({
            content_id: item.content_id,
            position: index,
            duration: item.duration
          }))
        })
      })

      if (response.ok) {
        toast.success('Playlist saved successfully')
      } else {
        toast.error('Failed to save playlist')
      }
    } catch (error) {
      toast.error('Failed to save playlist')
    } finally {
      setSaving(false)
    }
  }

  const publishPlaylist = async () => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/playlists/${playlistId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast.success('Playlist published to screens')
        router.push('/design/playlists')
      } else {
        toast.error('Failed to publish playlist')
      }
    } catch (error) {
      toast.error('Failed to publish playlist')
    }
  }

  const getTotalDuration = () => {
    return items.reduce((sum, item) => sum + item.duration, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/design/playlists')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{playlist?.name}</h1>
            <p className="text-muted-foreground">Edit playlist content and order</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={savePlaylist}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={publishPlaylist}>
            <Play className="h-4 w-4 mr-2" />
            Publish to Screens
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Playlist Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Playlist Content</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Total: {Math.floor(getTotalDuration() / 60)}:{(getTotalDuration() % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {items.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {items.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onRemove={removeItem}
                        onDurationChange={updateDuration}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="mx-auto h-12 w-12 mb-4" />
                <p>No content in playlist</p>
                <p className="text-sm mt-2">Add content from the right panel</p>
              </div>
            )}
          </Card>
        </div>

        {/* Available Content */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Available Content</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {availableContent.map(content => (
                <div
                  key={content.id}
                  className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                    {content.file_url && content.file_type?.includes('image') ? (
                      <img
                        src={content.file_url}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {content.file_type?.includes('video') ? (
                          <Video className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Image className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{content.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {content.file_type}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addContentToPlaylist(content.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}