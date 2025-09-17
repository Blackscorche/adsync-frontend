'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  FileImage,
  FileVideo,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Upload,
  Plus,
  X
} from 'lucide-react'
import { contentAPI } from '@/lib/api'
import config from '@/lib/config'

interface Content {
  id: number
  original_filename: string
  file_url: string
  file_type: string
  thumbnail_url?: string
  status: 'pending' | 'in_design' | 'designed' | 'approved' | 'rejected' | 'published'
  rejection_reason?: string
  created_at: string
  designed_at?: string
  reviewed_at?: string
  published_at?: string
  designed_by?: string
  designer_name?: string
  reviewed_by?: string
  reviewer_name?: string
}

export default function OwnerContentPage() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [freeUploadsRemaining, setFreeUploadsRemaining] = useState(1)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)

      // Fetch content - backend filters by shop automatically for owners
      const response = await contentAPI.getAll()

      // Map the backend response to match our interface
      const mappedContent = response.map((item: any) => ({
        id: item.id,
        original_filename: item.original_filename,
        file_url: item.file_url,
        file_type: item.file_type || 'image',
        thumbnail_url: item.thumbnail_url,
        status: item.status,
        rejection_reason: item.rejection_reason,
        created_at: item.created_at,
        designed_at: item.designed_at,
        reviewed_at: item.reviewed_at,
        published_at: item.published_at,
        designed_by: item.designed_by,
        designer_name: item.designed_by_name || item.designer_name,
        reviewed_by: item.reviewed_by,
        reviewer_name: item.reviewed_by_name || item.reviewer_name
      }))

      setContent(mappedContent)

      // Also fetch upload stats
      try {
        const stats = await contentAPI.getStats()
        setFreeUploadsRemaining(stats.free_uploads_remaining || 1)
      } catch (statsError) {
        console.error('Failed to fetch upload stats:', statsError)
        // Default to 1 free upload if stats fail
        setFreeUploadsRemaining(1)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
      setContent([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isValid = file.size <= 50 * 1024 * 1024 // 50MB limit
      if (!isValid) {
        setUploadError(`${file.name} exceeds 50MB limit`)
      }
      return isValid
    })
    setSelectedFiles(validFiles)
    setUploadError('')
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError('')

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('file', file)

        // Check if this is a free upload or extra
        const isExtraUpload = i >= freeUploadsRemaining
        if (isExtraUpload) {
          formData.append('is_extra_upload', 'true')
        }

        await contentAPI.upload(formData)
        setUploadProgress((i + 1) / selectedFiles.length * 100)
      }

      // Success - refresh content and close modal
      await fetchContent()
      setUploadModalOpen(false)
      setSelectedFiles([])
      setUploadProgress(0)
    } catch (error: any) {
      // Handle payment-related errors specifically
      if (error.response?.status === 402) {
        setUploadError('Insufficient credit balance. Please top up to continue.')
        // Optionally open credit top-up modal
      } else {
        setUploadError(error.response?.data?.error || 'Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileType: string) => {
    // Handle both MIME types and simple types from backend
    if (fileType.startsWith('image') || fileType === 'image') return <FileImage className="h-4 w-4" />
    if (fileType.startsWith('video') || fileType === 'video') return <FileVideo className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case 'in_design':
        return <Badge className="bg-yellow-100 text-yellow-800">In Design</Badge>
      case 'designed':
        return <Badge className="bg-purple-100 text-purple-800">Designed</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_design':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredContent = filter === 'all'
    ? content
    : content.filter(c => c.status === filter)

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    inProgress: content.filter(c => ['in_design', 'designed', 'approved'].includes(c.status)).length,
    rejected: content.filter(c => c.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Content</h1>
          <p className="text-muted-foreground">
            Upload original files for your designer to enhance
          </p>
        </div>
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload Content</DialogTitle>
              <DialogDescription>
                Upload original files for your designer to work on. You have {freeUploadsRemaining} free upload{freeUploadsRemaining !== 1 ? 's' : ''} remaining this month.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* File Selection */}
              {selectedFiles.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <Label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-gray-700">
                      <span className="cursor-pointer text-blue-600 hover:text-blue-500">
                        Click to select files
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,application/pdf"
                        onChange={handleFileSelect}
                        className="sr-only"
                      />
                    </Label>
                    <p className="mt-1 text-xs text-gray-500">
                      Images, videos, and PDFs up to 50MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') ? <FileImage className="h-4 w-4" /> :
                         file.type.startsWith('video/') ? <FileVideo className="h-4 w-4" /> :
                         <FileText className="h-4 w-4" />}
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        {index >= freeUploadsRemaining && (
                          <Badge variant="secondary" className="text-xs">Extra</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add More Files
                  </Button>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-500">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {/* Info about extra uploads */}
              {selectedFiles.length > freeUploadsRemaining && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're uploading {selectedFiles.length - freeUploadsRemaining} extra file(s).
                    Extra uploads may incur additional charges.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadModalOpen(false)
                  setSelectedFiles([])
                  setUploadError('')
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('published')}
        >
          Published
        </Button>
        <Button
          variant={filter === 'in_design' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('in_design')}
        >
          In Design
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Approved
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </Button>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Library</CardTitle>
          <CardDescription>
            Your designer manages and uploads content on your behalf
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {filteredContent.length === 0
                ? 'No content found. Your designer will upload content for you.'
                : `Showing ${filteredContent.length} content items`
              }
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Designer</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.thumbnail_url ? (
                        <img
                          src={`${config.api.baseURL}${item.thumbnail_url}`}
                          alt={item.original_filename}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          {getFileIcon(item.file_type)}
                        </div>
                      )}
                      <span className="truncate max-w-[200px]">
                        {item.original_filename}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getFileIcon(item.file_type)}
                      <span className="text-sm text-muted-foreground">
                        {item.file_type === 'image' ? 'IMAGE' :
                         item.file_type === 'video' ? 'VIDEO' :
                         item.file_type === 'pdf' ? 'PDF' :
                         item.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        {getStatusBadge(item.status)}
                      </div>
                      {item.status === 'rejected' && item.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {item.rejection_reason}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {item.designer_name || 'Pending'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString()
                        : item.reviewed_at
                        ? new Date(item.reviewed_at).toLocaleDateString()
                        : item.designed_at
                        ? new Date(item.designed_at).toLocaleDateString()
                        : '-'
                      }
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`${config.api.baseURL}${item.file_url}`, '_blank')}
                        title="View original file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.designed_file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`${config.api.baseURL}${item.designed_file_url}`, '_blank')}
                          title="View designed version"
                        >
                          <FileImage className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-900">Content Workflow Status Guide</p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start gap-2">
                  <Badge className="bg-yellow-500 text-white mt-0.5">Pending</Badge>
                  <span>Your file is waiting for designer to pick up</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-blue-500 text-white mt-0.5">In Design</Badge>
                  <span>Designer is working on enhancing your content</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-500 text-white mt-0.5">Designed</Badge>
                  <span>Design complete, waiting for admin review</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-green-500 text-white mt-0.5">Approved</Badge>
                  <span>Approved! Ready for designer to publish</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-red-500 text-white mt-0.5">Rejected</Badge>
                  <span>Needs revision - check feedback and designer will re-work</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-emerald-500 text-white mt-0.5">Published</Badge>
                  <span>Live on your screens!</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">
                Monthly limit: {freeUploadsRemaining} of 1 free upload remaining this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}