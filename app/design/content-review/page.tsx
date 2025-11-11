'use client';

import { useState, useEffect } from 'react';
import { contentAPI, designAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface Content {
  id: number;
  shop_id: number;
  shop_name: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'in_design' | 'designed' | 'approved' | 'rejected' | 'published';
  uploaded_by_name: string;
  designed_by_name?: string;
  reviewed_by_name?: string;
  published_by_name?: string;
  rejection_reason?: string;
  created_at: string;
  designed_at?: string;
  reviewed_at?: string;
  published_at?: string;
  designed_file_url?: string;
}

export default function ContentReviewPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await designAPI.getPendingContent();
      setContents(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const startDesign = async (contentId: number) => {
    try {
      await contentAPI.startDesign(contentId);
      toast.success('Content marked as in design');
      fetchContent();
    } catch (error) {
      toast.error('Failed to start design process');
    }
  };

  const uploadDesign = async () => {
    if (!selectedContent || !uploadFile) return;

    // Validate file size (100MB limit)
    if (uploadFile.size > 100 * 1024 * 1024) {
      setUploadError('File size exceeds 100MB limit');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await contentAPI.uploadDesign(selectedContent.id, formData, (progressEvent: any) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      toast.success('Design uploaded successfully for admin review');
      setUploadDialogOpen(false);
      setUploadFile(null);
      setSelectedContent(null);
      setUploadProgress(0);
      fetchContent();
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.code === 'ECONNABORTED') {
        setUploadError('Upload timeout. The file might be too large or your connection is slow.');
      } else if (error.response?.status === 400) {
        setUploadError(error.response?.data?.error || 'Invalid file or content not in design phase.');
      } else if (error.response?.status === 403) {
        setUploadError('You are not assigned to this shop.');
      } else {
        setUploadError(error.response?.data?.error || 'Upload failed. Please try again.');
      }
      toast.error('Failed to upload design');
    } finally {
      setUploading(false);
    }
  };

  const publishContent = async (contentId: number) => {
    try {
      await contentAPI.publish(contentId);
      toast.success('Content published successfully and live on screens!');
      fetchContent();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to publish content';
      toast.error(errorMsg);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'video') return <FileVideo className="h-5 w-5" />;
    if (fileType === 'image') return <FileImage className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
      'in_design': { color: 'bg-blue-500', icon: Edit, label: 'In Design' },
      'designed': { color: 'bg-purple-500', icon: Send, label: 'For Review' },
      'approved': { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
      'rejected': { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
      'published': { color: 'bg-emerald-600', icon: CheckCircle, label: 'Published' }
    };

    const badge = badges[status as keyof typeof badges] || { color: '', icon: AlertCircle, label: status };
    const Icon = badge.icon;

    return (
      <Badge className={badge.color}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const filteredContent = contents.filter(content => {
    if (filter === 'all') return true;
    return content.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
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
          New ({contents.filter(c => c.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'in_design' ? 'default' : 'outline'}
          onClick={() => setFilter('in_design')}
        >
          In Design ({contents.filter(c => c.status === 'in_design').length})
        </Button>
        <Button
          variant={filter === 'designed' ? 'default' : 'outline'}
          onClick={() => setFilter('designed')}
        >
          For Review ({contents.filter(c => c.status === 'designed').length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          To Publish ({contents.filter(c => c.status === 'approved').length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
          className={filter === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Rejected ({contents.filter(c => c.status === 'rejected').length})
        </Button>
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          onClick={() => setFilter('published')}
        >
          Published ({contents.filter(c => c.status === 'published').length})
        </Button>
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
                        <p className="font-medium">{content.original_filename}</p>
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
                      <p>Uploaded: {new Date(content.created_at).toLocaleDateString()}</p>
                      {content.designed_at && (
                        <p>Designed: {new Date(content.designed_at).toLocaleDateString()}</p>
                      )}
                      {content.reviewed_at && (
                        <p>Reviewed: {new Date(content.reviewed_at).toLocaleDateString()}</p>
                      )}
                      {content.published_at && (
                        <p>Published: {new Date(content.published_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {/* View Original Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(content.file_url, '_blank')}
                        title="View original content"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Download Original Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(content.file_url, content.original_filename)}
                        title="Download original content"
                      >
                        <Download className="h-4 w-4" />
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
                            <Badge variant="destructive" className="max-w-xs" title={content.rejection_reason}>
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
                            setSelectedContent(content);
                            setUploadDialogOpen(true);
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
                            onClick={() => window.open(content.designed_file_url, '_blank')}
                            title="View designed content"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Design
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(content.designed_file_url!, `designed_${content.original_filename}`)}
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
              Upload the edited version of "{selectedContent?.original_filename}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Design File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setUploadFile(file);
                  setUploadError('');
                  // Show file size
                  if (file && file.size > 100 * 1024 * 1024) {
                    setUploadError(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds 100MB limit`);
                  }
                }}
                accept="image/*,video/*,.pdf"
                disabled={uploading}
              />
              {uploadFile && !uploadError && (
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
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
                Maximum file size: 100MB. Supported formats: Images, Videos (MP4, AVI, MOV), and PDFs.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadFile(null);
                setUploadError('');
                setUploadProgress(0);
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
    </div>
  );
}