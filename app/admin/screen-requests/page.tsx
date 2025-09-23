'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { screenRequestsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/constants'
import {
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  Building,
  Calendar,
  MapPin
} from 'lucide-react'

export default function AdminScreenRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  // Approval dialog
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [deviceId, setDeviceId] = useState('')

  // Rejection dialog
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await screenRequestsAPI.getAll(statusFilter)
      setRequests(data)
    } catch (error) {
      toast.error('Failed to fetch screen requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!deviceId.trim()) {
      toast.error('Device ID is required')
      return
    }

    if (!selectedRequest) return

    try {
      await screenRequestsAPI.approve(selectedRequest.id, deviceId)
      toast.success('Screen request approved and device ID assigned')
      setApprovalDialog(false)
      setDeviceId('')
      setSelectedRequest(null)
      fetchRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve request')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    if (!selectedRequest) return

    try {
      await screenRequestsAPI.reject(selectedRequest.id, rejectionReason)
      toast.success('Screen request rejected and refund processed')
      setRejectionDialog(false)
      setRejectionReason('')
      setSelectedRequest(null)
      fetchRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject request')
    }
  }

  const processExpired = async () => {
    try {
      const result = await screenRequestsAPI.processExpired()
      toast.success(`Processed ${result.expired_count} expired requests`)
      fetchRequests()
    } catch (error) {
      toast.error('Failed to process expired requests')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      cancelled: { color: 'bg-orange-100 text-orange-800', icon: XCircle }
    }

    const variant = variants[status as keyof typeof variants] || variants.pending
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Screen Requests</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={processExpired} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Process Expired
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead>Screen Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time Remaining</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono">#{request.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span className="font-medium">{request.shop_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {request.requester_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      <span className="font-medium">{request.screen_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {request.location || 'Not specified'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {request.screen_type_name} ({request.size_inches}")
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(request.monthly_cost)}/month
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.status)}
                </TableCell>
                <TableCell>
                  {request.status === 'pending' ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(request.expires_at)}
                    </div>
                  ) : request.device_id ? (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Device ID:</span>
                      <code className="ml-1 px-1 bg-muted rounded">{request.device_id}</code>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setApprovalDialog(true)
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request)
                          setRejectionDialog(true)
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {request.status === 'approved' && request.reviewer_name && (
                    <div className="text-xs text-muted-foreground">
                      Approved by {request.reviewer_name}
                    </div>
                  )}
                  {request.status === 'rejected' && (
                    <div className="text-xs">
                      <div className="text-muted-foreground">
                        Rejected by {request.reviewer_name}
                      </div>
                      {request.rejection_reason && (
                        <div className="mt-1 text-red-600">
                          Reason: {request.rejection_reason}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No {statusFilter === 'all' ? '' : statusFilter} requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Screen Request</DialogTitle>
            <DialogDescription>
              Assign a device ID to activate this screen for {selectedRequest?.shop_name}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Screen Name:</span>
                  <span className="text-sm font-medium">{selectedRequest.screen_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="text-sm font-medium">
                    {selectedRequest.screen_type_name} ({selectedRequest.size_inches}")
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium">{selectedRequest.location || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Cost:</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedRequest.monthly_cost)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-id">Device ID *</Label>
                <Input
                  id="device-id"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter unique device identifier"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  This ID will be used by the screen device to connect to the system
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setApprovalDialog(false)
              setDeviceId('')
              setSelectedRequest(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              Approve & Assign Device ID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onOpenChange={setRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Screen Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request. The payment will be automatically refunded.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shop:</span>
                  <span className="text-sm font-medium">{selectedRequest.shop_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Screen:</span>
                  <span className="text-sm font-medium">{selectedRequest.screen_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Refund Amount:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(selectedRequest.payment_amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectionDialog(false)
              setRejectionReason('')
              setSelectedRequest(null)
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}