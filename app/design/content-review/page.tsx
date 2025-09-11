'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { contentAPI } from '@/lib/api';
import { 
  FileImage, 
  FileVideo, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Download
} from 'lucide-react';

interface Content {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  shop_id: number;
  shop_name: string;
  created_at: string;
  file_url: string;
}

export default function ContentReviewPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await contentAPI.getAll();
      setContents(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (content: Content) => {
    try {
      await contentAPI.review(content.id, { status: 'approved' });
      await fetchContent();
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedContent || !rejectionReason.trim()) return;
    
    try {
      await contentAPI.review(selectedContent.id, { 
        status: 'rejected',
        rejection_reason: rejectionReason 
      });
      setReviewDialog(false);
      setRejectionReason('');
      setSelectedContent(null);
      await fetchContent();
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  const openRejectDialog = (content: Content) => {
    setSelectedContent(content);
    setReviewDialog(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-5 w-5" />;
    }
    if (fileType.startsWith('video/')) {
      return <FileVideo className="h-5 w-5" />;
    }
    return <FileImage className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredContent = contents.filter(content => {
    if (filter === 'all') return true;
    return content.status === filter;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Review</h1>
        <p className="text-muted-foreground">Review and approve content uploaded by shops</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
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
          Pending ({contents.filter(c => c.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approved ({contents.filter(c => c.status === 'approved').length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({contents.filter(c => c.status === 'rejected').length})
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getFileIcon(content.file_type)}
                  <div>
                    <CardTitle className="text-sm">{content.filename}</CardTitle>
                    <CardDescription className="text-xs">
                      {content.shop_name}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(content.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Preview */}
                <div className="bg-muted rounded-lg p-4 h-32 flex items-center justify-center">
                  {content.file_type.startsWith('image/') ? (
                    <img 
                      src={content.file_url} 
                      alt={content.filename}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      {getFileIcon(content.file_type)}
                      <p className="text-xs text-muted-foreground mt-2">
                        {content.file_type}
                      </p>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Size: {formatFileSize(content.file_size)}</p>
                  <p>Uploaded: {new Date(content.created_at).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                {content.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(content.file_url, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => handleApprove(content)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => openRejectDialog(content)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {content.status !== 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(content.file_url, '_blank')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Content
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No content to display</p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Content</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this content. This will be sent to the shop owner.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}