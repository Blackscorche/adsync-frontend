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
  RefreshCw
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

interface Content {
  id: number
  shop_id: number
  shop_name: string
  filename: string
  file_url: string
  file_type: string
  file_size: number
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  uploaded_by_name: string
  reviewed_by_name?: string
  created_at: string
  reviewed_at?: string
}

export default function AdminContentPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      setLoading(true)
      const data = await contentAPI.getAll()
      setContents(data)
    } catch (error) {
      console.error('Error fetching contents:', error)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (content: Content, action: 'approve' | 'reject') => {
    setSelectedContent(content)
    setReviewAction(action)
    setRejectionReason('')
    setReviewDialogOpen(true)
  }

  const submitReview = async () => {
    if (!selectedContent || !reviewAction) return

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    try {
      setLoading(true)
      await contentAPI.review(selectedContent.id, {
        status: reviewAction === 'approve' ? 'approved' : 'rejected',
        rejection_reason: reviewAction === 'reject' ? rejectionReason : undefined
      })
      setSuccess(`Content ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`)
      setReviewDialogOpen(false)
      fetchContents()
    } catch (error: any) {
      setError(error.response?.data?.error || 'Review failed')
    } finally {
      setLoading(false)
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

  const filteredContents = contents.filter(content => {
    if (activeTab === 'all') return true
    return content.status === activeTab
  })

  const stats = {
    total: contents.length,
    pending: contents.filter(c => c.status === 'pending').length,
    approved: contents.filter(c => c.status === 'approved').length,
    rejected: contents.filter(c => c.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Approval</h1>
        <Button onClick={fetchContents} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

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

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Content Library</CardTitle>
          <CardDescription>Review and approve content uploaded by shops</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {filteredContents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No content found in this category
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredContents.map((content) => (
                    <div key={content.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-muted rounded">
                            {getFileIcon(content.file_type)}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{content.filename}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Shop: {content.shop_name}</span>
                              <span>Size: {formatFileSize(content.file_size)}</span>
                              <span>Uploaded by: {content.uploaded_by_name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Uploaded: {new Date(content.created_at).toLocaleString()}
                            </div>
                            {content.reviewed_at && (
                              <div className="text-sm text-muted-foreground">
                                Reviewed by {content.reviewed_by_name} on {new Date(content.reviewed_at).toLocaleString()}
                              </div>
                            )}
                            {content.rejection_reason && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                                <strong>Rejection reason:</strong> {content.rejection_reason}
                              </div>
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
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`${config.api.baseURL}${content.file_url}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleReview(content, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReview(content, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {content.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`${config.api.baseURL}${content.file_url}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Content' : 'Reject Content'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? `Are you sure you want to approve "${selectedContent?.filename}"? This will make it available for display on screens.`
                : `Please provide a reason for rejecting "${selectedContent?.filename}".`
              }
            </DialogDescription>
          </DialogHeader>
          
          {reviewAction === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitReview} 
              disabled={loading || (reviewAction === 'reject' && !rejectionReason.trim())}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {loading ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}