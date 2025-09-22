'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Store,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ShopApprovals() {
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingShops();
    fetchDesigners();
  }, []);

  const fetchPendingShops = async () => {
    try {
      const response = await api.get('/admin/shops/pending');
      setPendingShops(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pending shops');
    } finally {
      setLoading(false);
    }
  };

  const fetchDesigners = async () => {
    try {
      const response = await api.get('/admin/designers');
      setDesigners(response.data);
    } catch (err: any) {
      console.error('Failed to load designers:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedDesigner) {
      toast.error('Please select a designer');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/admin/shops/${selectedShop.id}/approve`, {
        status: 'approved',
        designer_id: selectedDesigner
      });

      // Refresh list
      await fetchPendingShops();
      setApprovalDialog(false);
      setSelectedShop(null);
      setSelectedDesigner('');
      toast.success('Shop approved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve shop');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/admin/shops/${selectedShop.id}/approve`, {
        status: 'rejected',
        rejection_reason: rejectionReason
      });

      // Refresh list
      await fetchPendingShops();
      setRejectDialog(false);
      setSelectedShop(null);
      setRejectionReason('');
      toast.success('Shop rejected');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject shop');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shop Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve pending shop registrations</p>
      </div>

      {pendingShops.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending shop approvals at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingShops.map((shop) => (
            <Card key={shop.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {shop.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending Approval
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Registered {new Date(shop.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Shop Details */}
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700">Shop Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{shop.address || 'No address provided'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{shop.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Store className="mr-2 h-4 w-4 text-gray-400" />
                        <span>Type: {shop.shop_type || 'Retail'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Details */}
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-700">Owner Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{shop.owner_name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{shop.owner_email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-gray-400" />
                        <span>Registered by: {shop.registered_by_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedShop(shop);
                      setRejectDialog(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedShop(shop);
                      setApprovalDialog(true);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Shop</DialogTitle>
            <DialogDescription>
              Assign a designer to manage {selectedShop?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="designer">Select Designer *</Label>
              <Select value={selectedDesigner} onValueChange={setSelectedDesigner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a designer" />
                </SelectTrigger>
                <SelectContent>
                  {designers.map((designer) => (
                    <SelectItem key={designer.id} value={designer.id.toString()}>
                      <div className="flex justify-between items-center w-full">
                        <span>{designer.full_name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({designer.assigned_shops} shops)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {designers.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Designer with fewer shops: {
                    designers.reduce((min, d) =>
                      d.assigned_shops < min.assigned_shops ? d : min
                    ).full_name
                  }
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing || !selectedDesigner}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Approving...' : 'Approve Shop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Shop</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedShop?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Rejecting...' : 'Reject Shop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}