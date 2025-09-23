'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { contentAPI } from '@/lib/api'
import config from '@/lib/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  FileImage,
  FileVideo,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  RefreshCw,
  Palette,
  Upload,
  Send
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from 'sonner'

interface Content {
  id: number
  shop_id: number
  shop_name: string
  original_filename: string
  file_url: string
  designed_file_url?: string
  file_type: string
  status: 'pending' | 'in_design' | 'designed' | 'approved' | 'rejected' | 'published'
  rejection_reason?: string
  uploaded_by_name: string
  designed_by_name?: string
  reviewed_by_name?: string
  published_by_name?: string
  created_at: string
  designed_at?: string
  reviewed_at?: string
  published_at?: string
}

export default function AdminContentPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      setLoading(true)
      const response = await contentAPI.getAll()
      setContents(response)
    } catch (error) {
      console.error('Failed to fetch contents:', error)
      toast.error('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedContent) return

    if (status === 'rejected' && !rejectionReason) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      const response = await fetch(`${config.api.baseURL}/api/content/${selectedContent.id}/review`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to review content')
      }

      toast.success(`Content ${status} successfully`)
      setReviewDialogOpen(false)
      setSelectedContent(null)
      setRejectionReason('')
      fetchContents()
    } catch (error) {
      console.error('Error reviewing content:', error)
      toast.error('Failed to review content')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
      in_design: { color: 'bg-blue-500', icon: Palette, label: 'In Design' },
      designed: { color: 'bg-purple-500', icon: Eye, label: 'Ready for Review' },
      approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
      published: { color: 'bg-emerald-500', icon: Send, label: 'Published' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FileImage className="w-4 h-4" />
    if (fileType.includes('video')) return <FileVideo className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const filteredContents = contents.filter(content => {
    if (activeTab === 'all') return true
    if (activeTab === 'review') return content.status === 'designed'
    if (activeTab === 'approved') return content.status === 'approved'
    if (activeTab === 'rejected') return content.status === 'rejected'
    if (activeTab === 'published') return content.status === 'published'
    return true
  })

  const needsReviewCount = contents.filter(c => c.status === 'designed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Review and manage all content across shops</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Needs Review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{needsReviewCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contents.filter(c => c.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {contents.filter(c => c.status === 'published').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {needsReviewCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {needsReviewCount} content items waiting for review
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="review">
            Needs Review
            {needsReviewCount > 0 && (
              <Badge className="ml-2" variant="destructive">{needsReviewCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredContents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <FileImage className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No content found</p>
                <p className="text-sm text-muted-foreground">Content will appear here when uploaded</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Designer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(content.file_type)}
                          <span className="text-sm">{content.original_filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>{content.shop_name}</TableCell>
                      <TableCell>{getStatusBadge(content.status)}</TableCell>
                      <TableCell>{content.uploaded_by_name}</TableCell>
                      <TableCell>{content.designed_by_name || '-'}</TableCell>
                      <TableCell>
                        {new Date(content.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedContent(content)
                              setViewDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {content.status === 'designed' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedContent(content)
                                setReviewDialogOpen(true)
                              }}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>
              View original and designed versions of the content
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Original File
                  </Label>
                  <div className="mt-2">
                    {selectedContent.file_type.includes('image') ? (
                      <a
                        href={`${config.api.baseURL}${selectedContent.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={`${config.api.baseURL}${selectedContent.file_url}`}
                          alt="Original"
                          className="w-full h-64 object-contain rounded border bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : selectedContent.file_type.includes('video') ? (
                      <video
                        controls
                        className="w-full h-64 rounded border bg-gray-50"
                        src={`${config.api.baseURL}${selectedContent.file_url}`}
                      />
                    ) : (
                      <div className="w-full h-64 rounded border bg-gray-50 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <p className="text-sm mt-2 font-medium">{selectedContent.original_filename}</p>
                    <p className="text-xs text-muted-foreground">Uploaded: {new Date(selectedContent.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {selectedContent.designed_file_url ? 'Designed File' : 'No Design Yet'}
                  </Label>
                  <div className="mt-2">
                    {selectedContent.designed_file_url ? (
                      selectedContent.file_type.includes('image') ? (
                        <a
                          href={`${config.api.baseURL}${selectedContent.designed_file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={`${config.api.baseURL}${selectedContent.designed_file_url}`}
                            alt="Designed"
                            className="w-full h-64 object-contain rounded border bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ) : selectedContent.file_type.includes('video') ? (
                        <video
                          controls
                          className="w-full h-64 rounded border bg-gray-50"
                          src={`${config.api.baseURL}${selectedContent.designed_file_url}`}
                        />
                      ) : (
                        <div className="w-full h-64 rounded border bg-gray-50 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-64 rounded border-2 border-dashed bg-gray-50 flex flex-col items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No design uploaded yet</p>
                      </div>
                    )}
                    {selectedContent.designed_file_url && (
                      <>
                        <p className="text-sm mt-2 font-medium">Designed Version</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedContent.designed_at ? `Designed: ${new Date(selectedContent.designed_at).toLocaleString()}` : ''}
                        </p>
                        {selectedContent.designed_by_name && (
                          <p className="text-xs text-muted-foreground">By: {selectedContent.designed_by_name}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <Label>Shop</Label>
                  <p className="text-sm">{selectedContent.shop_name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedContent.status)}</div>
                </div>
                {selectedContent.rejection_reason && (
                  <div>
                    <Label>Rejection Reason</Label>
                    <p className="text-sm text-red-600">{selectedContent.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
            <DialogDescription>
              Review the designed content and decide whether to approve or reject it
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div>
                <Label>Shop</Label>
                <p className="text-sm">{selectedContent.shop_name}</p>
              </div>

              <div>
                <Label>File</Label>
                <p className="text-sm">{selectedContent.original_filename}</p>
              </div>

              {selectedContent.designed_file_url && (
                <div>
                  <Label>Designed Version</Label>
                  <img
                    src={`${config.api.baseURL}${selectedContent.designed_file_url}`}
                    alt="Designed content"
                    className="w-full h-48 object-cover rounded mt-2 border"
                  />
                </div>
              )}

              <div>
                <Label>Rejection Reason (if rejecting)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide feedback for the designer..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview('rejected')}
            >
              Reject
            </Button>
            <Button
              variant="default"
              onClick={() => handleReview('approved')}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}