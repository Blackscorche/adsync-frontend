'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { contentAPI } from '@/lib/api'
import config from '@/lib/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileImage, FileVideo, FileText, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Content {
  id: number
  filename: string
  file_url: string
  file_type: string
  file_size: number
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
}

interface UploadStats {
  free_uploads_limit: number
  monthly_uploads: number
  pending_count: number
  approved_count: number
  rejected_count: number
  extra_uploads_remaining: number
}

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [stats, setStats] = useState<UploadStats | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchContents()
    fetchStats()
  }, [])

  const fetchContents = async () => {
    try {
      const data = await contentAPI.getAll()
      setContents(data)
    } catch (error) {
      console.error('Error fetching contents:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await contentAPI.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const maxSize = 100 * 1024 * 1024 // 100MB
      
      if (file.size > maxSize) {
        setError('File size must be less than 100MB')
        return
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/quicktime', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images, videos, and PDFs are allowed.')
        return
      }

      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    if (stats && stats.monthly_uploads >= stats.free_uploads_limit && stats.extra_uploads_remaining <= 0) {
      setError('Monthly upload limit reached. Please purchase additional uploads.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // Simulate progress (real progress would require XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const data = await contentAPI.upload(formData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      setSuccess('Content uploaded successfully! It will be reviewed by admin.')
      setSelectedFile(null)
      fetchContents()
      fetchStats()
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      setError(error.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      await contentAPI.delete(id)
      setSuccess('Content deleted successfully')
      fetchContents()
      fetchStats()
    } catch (error) {
      setError('Failed to delete content')
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <FileImage className="h-4 w-4" />
      case 'video':
        return <FileVideo className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Management</h1>

      {/* Upload Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Statistics</CardTitle>
            <CardDescription>Your monthly upload usage and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Uploads</p>
                <p className="text-2xl font-bold">{stats.monthly_uploads}/{stats.free_uploads_limit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Extra Uploads</p>
                <p className="text-2xl font-bold">{stats.extra_uploads_remaining}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected_count}</p>
              </div>
            </div>
            {stats.monthly_uploads >= stats.free_uploads_limit && stats.extra_uploads_remaining <= 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your monthly upload limit. Purchase additional uploads to continue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Content</CardTitle>
          <CardDescription>Upload images, videos, or PDFs for your digital signage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*,video/*,application/pdf"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size: 100MB. Supported formats: JPEG, PNG, GIF, MP4, AVI, MOV, PDF
            </p>
          </div>

          {selectedFile && (
            <div className="p-4 border rounded-lg space-y-2">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                Size: {formatFileSize(selectedFile.size)} | Type: {selectedFile.type}
              </p>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </CardContent>
      </Card>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Content</CardTitle>
          <CardDescription>All your uploaded content and their approval status</CardDescription>
        </CardHeader>
        <CardContent>
          {contents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No content uploaded yet</p>
          ) : (
            <div className="space-y-4">
              {contents.map((content) => (
                <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded">
                      {getFileIcon(content.file_type)}
                    </div>
                    <div>
                      <p className="font-medium">{content.filename}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(content.file_size)}</span>
                        <span>{new Date(content.created_at).toLocaleDateString()}</span>
                      </div>
                      {content.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">
                          Rejection reason: {content.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(content.status)}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(content.status)}
                        <span>{content.status}</span>
                      </span>
                    </Badge>
                    {content.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(content.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}