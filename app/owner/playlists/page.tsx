'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { playlistsAPI, contentAPI } from '@/lib/api'
import { Plus, Edit, Trash2, Play, Clock, Film, Image } from 'lucide-react'

interface Playlist {
  id: string
  name: string
  description: string | null
  shop_id: string
  is_active: boolean
  created_at: string
  item_count: number
  total_duration: number
}

interface Content {
  id: string
  filename: string
  file_type: string
  file_url: string
  thumbnail_url: string
  status: string
}

export default function PlaylistsPage() {
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [approvedContent, setApprovedContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchPlaylists()
    fetchApprovedContent()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const data = await playlistsAPI.getAll()
      setPlaylists(data)
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApprovedContent = async () => {
    try {
      const data = await contentAPI.getAll()
      setApprovedContent(data.filter((c: Content) => c.status === 'approved'))
    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await playlistsAPI.create(formData)
      setShowCreateModal(false)
      setFormData({ name: '', description: '' })
      fetchPlaylists()
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedPlaylist) return
    try {
      await playlistsAPI.update(selectedPlaylist.id, formData)
      setShowEditModal(false)
      setSelectedPlaylist(null)
      setFormData({ name: '', description: '' })
      fetchPlaylists()
    } catch (error) {
      console.error('Error updating playlist:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return
    try {
      await playlistsAPI.delete(id)
      fetchPlaylists()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting playlist')
    }
  }

  const handleToggleActive = async (playlist: Playlist) => {
    try {
      await playlistsAPI.update(playlist.id, { is_active: !playlist.is_active })
      fetchPlaylists()
    } catch (error) {
      console.error('Error toggling playlist status:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map(playlist => (
          <div key={playlist.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{playlist.name}</h3>
                {playlist.description && (
                  <p className="text-sm text-gray-600 mt-1">{playlist.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/owner/playlists/${playlist.id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Manage Items"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedPlaylist(playlist)
                    setFormData({
                      name: playlist.name,
                      description: playlist.description || ''
                    })
                    setShowEditModal(true)
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Film className="h-4 w-4" />
                <span>{playlist.item_count || 0} items</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(playlist.total_duration || 0)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => handleToggleActive(playlist)}
                className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                  playlist.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {playlist.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No playlists created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Playlist
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter playlist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ name: '', description: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter playlist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedPlaylist(null)
                  setFormData({ name: '', description: '' })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}