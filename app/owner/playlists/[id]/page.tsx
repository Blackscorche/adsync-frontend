'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { playlistsAPI, contentAPI } from '@/lib/api'
import { ArrowLeft, Plus, Trash2, GripVertical, Clock, Image, Film, FileText, X } from 'lucide-react'

interface PlaylistItem {
  id: string
  playlist_id: string
  content_id: string
  position: number
  duration: number
  filename: string
  file_url: string
  file_type: string
  thumbnail_url: string
}

interface Playlist {
  id: string
  name: string
  description: string | null
  shop_id: string
  is_active: boolean
  created_at: string
  items: PlaylistItem[]
}

interface Content {
  id: string
  filename: string
  file_type: string
  file_url: string
  thumbnail_url: string
  status: string
}

export default function PlaylistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [availableContent, setAvailableContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [duration, setDuration] = useState(10)
  const [draggedItem, setDraggedItem] = useState<PlaylistItem | null>(null)

  useEffect(() => {
    fetchPlaylist()
    fetchAvailableContent()
  }, [playlistId])

  const fetchPlaylist = async () => {
    try {
      const data = await playlistsAPI.getById(playlistId)
      setPlaylist(data)
    } catch (error) {
      console.error('Error fetching playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableContent = async () => {
    try {
      const data = await contentAPI.getAll()
      setAvailableContent(data.filter((c: Content) => c.status === 'approved'))
    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }

  const handleAddContent = async () => {
    if (!selectedContent) return
    try {
      await playlistsAPI.addItem(playlistId, selectedContent.id, duration)
      setShowAddModal(false)
      setSelectedContent(null)
      setDuration(10)
      fetchPlaylist()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error adding content')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this item from the playlist?')) return
    try {
      await playlistsAPI.removeItem(playlistId, itemId)
      fetchPlaylist()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, item: PlaylistItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetItem: PlaylistItem) => {
    e.preventDefault()
    if (!draggedItem || !playlist) return
    if (draggedItem.id === targetItem.id) return

    const items = [...playlist.items]
    const draggedIndex = items.findIndex(item => item.id === draggedItem.id)
    const targetIndex = items.findIndex(item => item.id === targetItem.id)

    // Reorder items
    items.splice(draggedIndex, 1)
    items.splice(targetIndex, 0, draggedItem)

    // Update positions
    const reorderedItems = items.map((item, index) => ({
      id: item.id,
      position: index + 1
    }))

    try {
      await playlistsAPI.reorderItems(playlistId, reorderedItems)
      fetchPlaylist()
    } catch (error) {
      console.error('Error reordering items:', error)
    }

    setDraggedItem(null)
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Film className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTotalDuration = () => {
    if (!playlist) return '0s'
    const totalSeconds = playlist.items.reduce((sum, item) => sum + item.duration, 0)
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="p-6">
        <p className="text-red-600">Playlist not found</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/owner/playlists')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-gray-600 mt-1">{playlist.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-800">{playlist.items.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Duration</p>
            <p className="text-2xl font-bold text-gray-800">{getTotalDuration()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold">
              <span className={playlist.is_active ? 'text-green-600' : 'text-gray-400'}>
                {playlist.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Playlist Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Playlist Items</h2>
        </div>
        
        {playlist.items.length > 0 ? (
          <div className="divide-y">
            {playlist.items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-move"
              >
                <div className="text-gray-400">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div className="text-2xl font-bold text-gray-400 w-8">
                  {index + 1}
                </div>

                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {item.file_type === 'image' ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.thumbnail_url}`}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      {getFileIcon(item.file_type)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getFileIcon(item.file_type)}
                    <span className="font-medium text-gray-800">{item.filename}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{item.duration}s</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No items in this playlist yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Content to Playlist</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedContent(null)
                  setDuration(10)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Duration Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Duration (seconds)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                min="1"
                max="300"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {availableContent.map(content => {
                const isInPlaylist = playlist.items.some(item => item.content_id === content.id)
                
                return (
                  <div
                    key={content.id}
                    onClick={() => !isInPlaylist && setSelectedContent(content)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedContent?.id === content.id
                        ? 'border-blue-500 bg-blue-50'
                        : isInPlaylist
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                      {content.file_type === 'image' ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${content.thumbnail_url}`}
                          alt={content.filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getFileIcon(content.file_type)}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {content.filename}
                    </p>
                    {isInPlaylist && (
                      <p className="text-xs text-gray-500 mt-1">Already in playlist</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedContent(null)
                  setDuration(10)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                disabled={!selectedContent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}