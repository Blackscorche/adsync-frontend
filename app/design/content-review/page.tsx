'use client'

import { useState, useEffect, useMemo } from 'react'
import { contentAPI, designAPI, shopsAPI } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileImage,
  FileVideo,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Upload,
  Eye,
  Send,
  AlertCircle,
  Download,
  Plus,
  FileText,
  X,
  Trash,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { DialogTrigger } from '@radix-ui/react-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import config from '@/lib/config'
import { FilterableSearchInput } from '@/components/multi-input/MultiInput'

interface Content {
  id: number
  shop_id: number
  shop_name: string
  original_filename: string
  file_url: string
  file_type: string
  file_size: number
  status:
  | 'pending'
  | 'in_design'
  | 'designed'
  | 'approved'
  | 'rejected'
  | 'published'
  uploaded_by_name: string
  designed_by_name?: string
  reviewed_by_name?: string
  published_by_name?: string
  rejection_reason?: string
  created_at: string
  designed_at?: string
  reviewed_at?: string
  published_at?: string
  designed_file_url?: string
}

interface Shop {
  id: string | number
  name: string
  address?: string
  postcode?: string
  city?: string
  shop_type?: string
  phone?: string
  photo_url?: string | null
  subscription_status?: string
  created_at?: string
  owner_name?: string
  owner_email?: string
  screen_count?: string
}

const shopSelectCategories = [
  { value: 'postcode', label: 'Postcode' },
  { value: 'address', label: 'Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'city', label: 'City' },
]

export default function ContentReviewPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [deleteContentOpen, setDeleteContentOpen] = useState(false)
  const [deleteContentId, setDeleteContentId] = useState<number | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<{url: string, type: string, name: string} | null>(null)

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [freeUploadsRemaining, setFreeUploadsRemaining] = useState(1)
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<string | number>('')
  const [uploadScope, setUploadScope] = useState<'shop' | 'type' | 'all'>('shop')
  const [selectedType, setSelectedType] = useState<string>('')

  const shopTypes = useMemo(() => {
    const types = new Set(shops.map(s => s.shop_type).filter(Boolean))
    return Array.from(types) as string[]
  }, [shops])

  useEffect(() => {
    const userData = localStorage.getItem('user')

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }
  }, [])

  useEffect(() => {
    fetchContent()
    fetchShops()
  }, [])

  const shopSelectData = useMemo(() => {
    return {
      postcode: shops
        .filter((s) => s.postcode)
        .map((s) => ({
          id: s.id,
          label: s.name,
          value: s.postcode || '',
        })),
      address: shops
        .filter((s) => s.address)
        .map((s) => ({
          id: s.id,
          label: s.name,
          value: s.address || '',
        })),
      phone: shops
        .filter((s) => s.phone)
        .map((s) => ({ id: s.id, label: s.name, value: s.phone || '' })),
      city: shops
        .filter((s) => s.city)
        .map((s) => ({ id: s.id, label: s.name, value: s.city || '' })),
    }
  }, [shops])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadFile(files[0])
    const validFiles = files.filter((file) => {
      const isValid = file.size <= 100 * 1024 * 1024 // 100MB limit (matches backend)
      if (!isValid) {
        setUploadError(`${file.name} exceeds 100MB limit`)
      }
      return isValid
    })
    setSelectedFiles(validFiles)
    setUploadError('')
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const handleUpload = async (shopId: string | number) => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError('')

    let content

    try {
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
      let uploadedSize = 0

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('shopId', String(shopId))

        // Check if this is a free upload or extra
        const isExtraUpload = i >= freeUploadsRemaining
        if (isExtraUpload) {
          formData.append('is_extra_upload', 'true')
        }

        // Track real upload progress with axios
        const response = await contentAPI.uploadByDesigner(
          user?.id,
          formData,
          (progressEvent: any) => {
            const fileProgress = progressEvent.loaded
            const totalProgress =
              ((uploadedSize + fileProgress) / totalSize) * 100
            setUploadProgress(Math.round(totalProgress))
          }
        )

        content = response.content

        // Mark this file as fully uploaded
        uploadedSize += file.size
        setUploadProgress(Math.round((uploadedSize / totalSize) * 100))
      }

      // Success - refresh content and close modal
      toast.success(
        selectedFiles.length === 1
          ? 'Content uploaded and added to playlist'
          : `${selectedFiles.length} files uploaded and added to playlist`
      )
      await fetchContent()
      setUploadModalOpen(false)
      setSelectedFiles([])
      setUploadProgress(0)
      return content
    } catch (error: any) {
      console.error('Upload error:', error)
      if (error.response?.status === 402) {
        setUploadError(
          'Insufficient credit balance. Please top up to continue.'
        )
      } else if (error.code === 'ECONNABORTED') {
        setUploadError(
          'Upload timeout. The file might be too large or your connection is slow.'
        )
      } else {
        setUploadError(
          error.response?.data?.error || 'Upload failed. Please try again.'
        )
      }
    } finally {
      setUploading(false)
    }
  }

  const fetchContent = async () => {
    try {
      const data = await designAPI.getPendingContent()
      setContents(data)
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const startDesign = async (contentId: number) => {
    try {
      await contentAPI.startDesign(contentId)
      toast.success('Content marked as in design')
      fetchContent()
    } catch (error) {
      toast.error('Failed to start design process')
    }
  }

  const uploadDesign = async () => {
    if (!selectedContent || !uploadFile) return

    // Validate file size (100MB limit)
    if (uploadFile.size > 100 * 1024 * 1024) {
      setUploadError('File size exceeds 100MB limit')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      await contentAPI.uploadDesign(
        selectedContent.id,
        formData,
        (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(progress)
        }
      )

      toast.success('Design uploaded successfully for admin review')
      setUploadDialogOpen(false)
      setUploadFile(null)
      setSelectedContent(null)
      setUploadProgress(0)
      fetchContent()
    } catch (error: any) {
      console.error('Upload error:', error)
      if (error.code === 'ECONNABORTED') {
        setUploadError(
          'Upload timeout. The file might be too large or your connection is slow.'
        )
      } else if (error.response?.status === 400) {
        setUploadError(
          error.response?.data?.error ||
          'Invalid file or content not in design phase.'
        )
      } else if (error.response?.status === 403) {
        setUploadError('You are not assigned to this shop.')
      } else {
        setUploadError(
          error.response?.data?.error || 'Upload failed. Please try again.'
        )
      }
      toast.error('Failed to upload design')
    } finally {
      setUploading(false)
    }
  }

  const publishContent = async (contentId: number) => {
    try {
      await contentAPI.publish(contentId)
      toast.success('Content published successfully and live on screens!')
      fetchContent()
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || 'Failed to publish content'
      toast.error(errorMsg)
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const uploadDesignByDesigner = async () => {
    if (uploadScope === 'shop' && !selectedShop) {
      toast.error('Please select a shop')
      return
    }
    if (uploadScope === 'type' && !selectedType) {
      toast.error('Please select a shop type')
      return
    }
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadError('')

    try {
      const totalFiles = selectedFiles.length
      let uploadedCount = 0

      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('playlistScope', uploadScope)
        
        if (uploadScope === 'shop') {
          formData.append('shopId', String(selectedShop))
        } else if (uploadScope === 'type') {
          formData.append('playlistScopeValue', selectedType)
        }

        await contentAPI.uploadByDesigner(
          user?.id,
          formData,
          (progressEvent: any) => {
            const fileProgress = progressEvent.loaded / (progressEvent.total || file.size)
            const totalProgress = ((uploadedCount + fileProgress) / totalFiles) * 100
            setUploadProgress(Math.round(totalProgress))
          }
        )
        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
      }

      toast.success('Content uploaded and distributed successfully')
      await fetchContent()
      setUploadModalOpen(false)
      setSelectedFiles([])
      setUploadProgress(0)
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'video') return <FileVideo className="h-5 w-5" />
    if (fileType === 'image') return <FileImage className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
      in_design: { color: 'bg-blue-500', icon: Edit, label: 'In Design' },
      designed: { color: 'bg-purple-500', icon: Send, label: 'For Review' },
      approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
      published: {
        color: 'bg-emerald-600',
        icon: CheckCircle,
        label: 'Published',
      },
    }

    const badge = badges[status as keyof typeof badges] || {
      color: '',
      icon: AlertCircle,
      label: status,
    }
    const Icon = badge.icon

    return (
      <Badge className={badge.color}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  const fetchShops = async () => {
    try {
      const response = await fetch(
        `${config.api.baseURL}/api/design/assigned-shops`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      const data = await response.json()
      setShops(data)
      if (data.length > 0) {
        setSelectedShop(data[0].id)
      }
    } catch (error) {
      toast.error('Failed to fetch assigned shops')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContent = async () => {
    try {
      await contentAPI.delete(Number(deleteContentId))
      toast.success('Content deleted successfully')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const filteredContent = contents.filter((content) => {
    if (filter === 'all') return true
    return content.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Workflow</h1>
        <p className="text-muted-foreground">
          Review owner content, create designs, and publish approved content
        </p>
      </div>

      {/* Workflow Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-xs mt-2 font-medium">Owner Upload</p>
              </div>
              <div className="h-0.5 w-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs mt-2 font-medium">Designer Edit</p>
              </div>
              <div className="h-0.5 w-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs mt-2 font-medium">Admin Review</p>
              </div>
              <div className="h-0.5 w-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs mt-2 font-medium">Designer Publish</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex">
        <div className="flex gap-2 flex-1">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({contents.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            New ({contents.filter((c) => c.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'in_design' ? 'default' : 'outline'}
            onClick={() => setFilter('in_design')}
          >
            In Design ({contents.filter((c) => c.status === 'in_design').length}
            )
          </Button>
          <Button
            variant={filter === 'designed' ? 'default' : 'outline'}
            onClick={() => setFilter('designed')}
          >
            For Review ({contents.filter((c) => c.status === 'designed').length}
            )
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            To Publish ({contents.filter((c) => c.status === 'approved').length}
            )
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            className={
              filter === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''
            }
          >
            <XCircle className="h-4 w-4 mr-1" />
            Rejected ({contents.filter((c) => c.status === 'rejected').length})
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            onClick={() => setFilter('published')}
          >
            Published ({contents.filter((c) => c.status === 'published').length}
            )
          </Button>
        </div>
        {user.role === 'design' && (
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Design
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload Design</DialogTitle>
                <DialogDescription>
                  Select a shop and upload relevant design files.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                <div className="space-y-2">
                  <Label>Distribution Scope:</Label>
                  <Select value={uploadScope} onValueChange={(value: any) => setUploadScope(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shop">Specific Shop</SelectItem>
                      <SelectItem value="type">By Shop Type</SelectItem>
                      <SelectItem value="all">All Shops (Global)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {uploadScope === 'shop' && (
                  <div className="space-y-2">
                    <Label>Select Shop:</Label>
                    <FilterableSearchInput
                      categories={shopSelectCategories}
                      data={shopSelectData}
                      onSelect={(item) => setSelectedShop(item.id)}
                    />
                    {selectedShop && (
                      <p className="text-xs text-muted-foreground">
                        Selected: <span className="font-medium text-foreground">{shops.find(s => String(s.id) === String(selectedShop))?.name || `Shop #${selectedShop}`}</span>
                      </p>
                    )}
                  </div>
                )}

                {uploadScope === 'type' && (
                  <div className="space-y-2">
                    <Label>Select Shop Type:</Label>
                    <RadioGroup value={selectedType} onValueChange={setSelectedType} className="grid grid-cols-2 gap-2">
                      {shopTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <RadioGroupItem value={type} id={`shop-type-${type}`} />
                          <Label htmlFor={`shop-type-${type}`} className="cursor-pointer">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {selectedType && (
                      <p className="text-xs text-muted-foreground">
                        Will upload to all <span className="font-medium text-foreground">{selectedType}</span> shops.
                      </p>
                    )}
                  </div>
                )}

                {uploadScope === 'all' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will distribute content to <strong>EVERY</strong> approved shop in the system.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                {/* File Selection */}
                {selectedFiles.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <Label
                        htmlFor="file-upload"
                        className="mt-2 block text-sm font-medium text-gray-700"
                      >
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
                        Images, videos, and PDFs up to 100MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {file.type.startsWith('image/') ? (
                            <FileImage className="h-4 w-4" />
                          ) : file.type.startsWith('video/') ? (
                            <FileVideo className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          {index >= freeUploadsRemaining && (
                            <Badge variant="secondary" className="text-xs">
                              Extra
                            </Badge>
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
                      onClick={() =>
                        document.getElementById('file-upload')?.click()
                      }
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
                      You're uploading{' '}
                      {selectedFiles.length - freeUploadsRemaining} extra
                      file(s). Extra uploads may incur additional charges.
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
                  onClick={uploadDesignByDesigner}
                  disabled={selectedFiles.length === 0 || uploading}
                >
                  {uploading
                    ? 'Uploading...'
                    : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Content Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(content.file_type)}
                      <div>
                        <p className="font-medium">
                          {content.original_filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded by {content.uploaded_by_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{content.shop_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{content.file_type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(content.status)}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <p>
                        Uploaded:{' '}
                        {new Date(content.created_at).toLocaleDateString()}
                      </p>
                      {content.designed_at && (
                        <p>
                          Designed:{' '}
                          {new Date(content.designed_at).toLocaleDateString()}
                        </p>
                      )}
                      {content.reviewed_at && (
                        <p>
                          Reviewed:{' '}
                          {new Date(content.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                      {content.published_at && (
                        <p>
                          Published:{' '}
                          {new Date(content.published_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {/* View Original Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewContent({
                            url: content.file_url,
                            type: content.file_type,
                            name: content.original_filename
                          })
                          setPreviewOpen(true)
                        }}
                        title="View original content"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Download Original Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadFile(
                            content.file_url,
                            content.original_filename
                          )
                        }
                        title="Download original content"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {/* Delete Uploaded content */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>{
                          setDeleteContentId(content.id)
                          setDeleteContentOpen(true)
                        }}
                        title="Delete content"
                      >
                        <Trash2 className="h-4 w-4" color='red' />
                      </Button>

                      {content.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => startDesign(content.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Start Design
                        </Button>
                      )}

                      {content.status === 'rejected' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => startDesign(content.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Re-Design
                          </Button>
                          {content.rejection_reason && (
                            <Badge
                              variant="destructive"
                              className="max-w-xs"
                              title={content.rejection_reason}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Feedback
                            </Badge>
                          )}
                        </div>
                      )}

                      {content.status === 'in_design' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedContent(content)
                            setUploadDialogOpen(true)
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Design
                        </Button>
                      )}

                      {content.status === 'approved' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => publishContent(content.id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Publish
                        </Button>
                      )}

                      {content.designed_file_url && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPreviewContent({
                                url: content.designed_file_url!,
                                type: 'video', // Assume video for designed files or detect from extension
                                name: `Designed: ${content.original_filename}`
                              })
                              setPreviewOpen(true)
                            }}
                            title="View designed content"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Design
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              downloadFile(
                                content.designed_file_url!,
                                `designed_${content.original_filename}`
                              )
                            }
                            title="Download designed content"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Design
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No content found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Design Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Designed Content</DialogTitle>
            <DialogDescription>
              Upload the edited version of "{selectedContent?.original_filename}
              "
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Design File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setUploadFile(file)
                  setUploadError('')
                  // Show file size
                  if (file && file.size > 100 * 1024 * 1024) {
                    setUploadError(
                      `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds 100MB limit`
                    )
                  }
                }}
                accept="image/*,video/*,.pdf"
                disabled={uploading}
              />
              {uploadFile && !uploadError && (
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadFile.name} (
                  {(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
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

            {/* Info about file limits */}
            {!uploading && !uploadError && (
              <p className="text-xs text-muted-foreground">
                Maximum file size: 100MB. Supported formats: Images, Videos
                (MP4, AVI, MOV), and PDFs.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false)
                setUploadFile(null)
                setUploadError('')
                setUploadProgress(0)
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadDesign}
              disabled={!uploadFile || uploading || !!uploadError}
            >
              {uploading ? `Uploading ${uploadProgress}%...` : 'Upload Design'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Content Dialog */}
      <Dialog open={deleteContentOpen} onOpenChange={setDeleteContentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteContentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDeleteContent()
                setDeleteContentOpen(false)
              }}
              variant="destructive"
            >
              Delete Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewContent?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4 bg-black rounded-lg overflow-hidden min-h-[400px]">
            {previewContent?.type === 'video' ? (
              <video 
                src={previewContent.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[60vh]"
              />
            ) : previewContent?.type === 'image' ? (
              <img 
                src={previewContent.url} 
                alt={previewContent.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : previewContent?.url.endsWith('.pdf') ? (
              <iframe 
                src={previewContent.url} 
                className="w-full h-[60vh]"
              />
            ) : (
              <div className="text-white flex flex-col items-center gap-4">
                <FileText className="h-16 w-16" />
                <p>Preview not available for this file type.</p>
                <Button variant="outline" onClick={() => window.open(previewContent?.url, '_blank')}>
                  Download/View Externally
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button variant="outline" onClick={() => window.open(previewContent?.url, '_blank')}>
              Open in New Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
