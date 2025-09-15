'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  HeadphonesIcon,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Monitor,
  Upload,
  CreditCard,
  Calendar,
  User,
  Building,
  TrendingUp,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'

interface Ticket {
  id: number
  ticket_number: string
  shop_name?: string
  created_by_name: string
  created_by_email: string
  assigned_to_name?: string
  category: string
  priority: string
  status: string
  subject: string
  description: string
  created_at: string
  updated_at: string
  resolved_at?: string
  comment_count: number
  attachment_count: number
  // Additional fields
  screen_size?: string
  screen_quantity?: number
  installation_address?: string
  preferred_installation_date?: string
  content_type?: string
  play_duration?: string
  target_screens?: string[]
  start_date?: string
  end_date?: string
  resolution_notes?: string
}

interface TicketStats {
  total_tickets: number
  open_tickets: number
  in_progress_tickets: number
  resolved_tickets: number
  closed_tickets: number
  urgent_tickets: number
  high_priority_tickets: number
  screen_requests: number
  content_requests: number
  new_this_week: number
  resolved_this_week: number
  avg_resolution_hours: number
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showTicketDialog, setShowTicketDialog] = useState(false)

  // Filters
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Update ticket form
  const [updateStatus, setUpdateStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [internalComment, setInternalComment] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [filterStatus, filterCategory, filterPriority])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const params = new URLSearchParams()
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory && filterCategory !== 'all') params.append('category', filterCategory)
      if (filterPriority && filterPriority !== 'all') params.append('priority', filterPriority)

      const response = await fetch(`/api/support/all?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support/stats/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.overview)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return

    setUpdating(true)
    try {
      const token = localStorage.getItem('token')

      // Update status
      if (updateStatus && updateStatus !== selectedTicket.status) {
        await fetch(`/api/support/${selectedTicket.id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: updateStatus,
            resolution_notes: resolutionNotes,
            assigned_to: assignedTo
          })
        })
      }

      // Add internal comment if provided
      if (internalComment) {
        await fetch(`/api/support/${selectedTicket.id}/comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: internalComment,
            is_internal: true
          })
        })
      }

      setShowTicketDialog(false)
      fetchTickets()
      fetchStats()
    } catch (error) {
      console.error('Error updating ticket:', error)
    } finally {
      setUpdating(false)
    }
  }

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setUpdateStatus(ticket.status)
    setResolutionNotes(ticket.resolution_notes || '')
    setInternalComment('')
    setShowTicketDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-blue-500', icon: AlertCircle },
      in_progress: { color: 'bg-yellow-500', icon: Clock },
      waiting_owner: { color: 'bg-orange-500', icon: MessageSquare },
      waiting_admin: { color: 'bg-purple-500', icon: Clock },
      resolved: { color: 'bg-green-500', icon: CheckCircle },
      closed: { color: 'bg-gray-500', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    }
    return <Badge className={`${colors[priority as keyof typeof colors]} text-white`}>{priority.toUpperCase()}</Badge>
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      screen_request: Monitor,
      content_request: Upload,
      technical_issue: AlertCircle,
      billing_inquiry: CreditCard,
      content_removal: XCircle,
      schedule_change: Calendar,
      general_inquiry: MessageSquare
    }
    const Icon = icons[category as keyof typeof icons] || MessageSquare
    return <Icon className="h-4 w-4" />
  }

  const filteredTickets = tickets.filter(ticket => {
    if (searchTerm && !ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ticket.created_by_email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (activeTab !== 'all') {
      if (activeTab === 'urgent' && ticket.priority !== 'urgent' && ticket.priority !== 'high') return false
      if (activeTab === 'open' && ticket.status !== 'open') return false
      if (activeTab === 'in_progress' && ticket.status !== 'in_progress') return false
    }
    return true
  })

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading support tickets...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Management</h1>
        <p className="text-muted-foreground">Manage customer support tickets and requests</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.open_tickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.in_progress_tickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent/High</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.urgent_tickets + stats.high_priority_tickets}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Screen Req</CardTitle>
              <Monitor className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.screen_requests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_resolution_hours || 0}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                prefix={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_owner">Waiting Owner</SelectItem>
                <SelectItem value="waiting_admin">Waiting Admin</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="screen_request">Screen Request</SelectItem>
                <SelectItem value="content_request">Content Request</SelectItem>
                <SelectItem value="technical_issue">Technical Issue</SelectItem>
                <SelectItem value="billing_inquiry">Billing</SelectItem>
                <SelectItem value="content_removal">Content Removal</SelectItem>
                <SelectItem value="schedule_change">Schedule Change</SelectItem>
                <SelectItem value="general_inquiry">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {(filterStatus !== 'all' || filterCategory !== 'all' || filterPriority !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterStatus('all')
                  setFilterCategory('all')
                  setFilterPriority('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="urgent">Urgent/High</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono">#{ticket.ticket_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(ticket.category)}
                          <span className="text-xs">{ticket.category.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{ticket.created_by_name}</p>
                          <p className="text-xs text-muted-foreground">{ticket.created_by_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.shop_name || '-'}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{format(new Date(ticket.created_at), 'MMM dd')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openTicket(ticket)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tickets found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ticket Management Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Manage Ticket #{selectedTicket.ticket_number}</DialogTitle>
                <DialogDescription>{selectedTicket.subject}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Ticket Details */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="ml-2 font-medium">{selectedTicket.created_by_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2 font-medium">{selectedTicket.created_by_email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Shop:</span>
                      <span className="ml-2 font-medium">{selectedTicket.shop_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium">{selectedTicket.category.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="ml-2">{getPriorityBadge(selectedTicket.priority)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedTicket.status)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Description:</span>
                      <p className="mt-1">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {/* Special fields for screen/content requests */}
                  {selectedTicket.category === 'screen_request' && selectedTicket.screen_size && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Screen Request Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Size: {selectedTicket.screen_size} inch</div>
                        <div>Quantity: {selectedTicket.screen_quantity}</div>
                        {selectedTicket.installation_address && (
                          <div className="col-span-2">Address: {selectedTicket.installation_address}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTicket.category === 'content_request' && selectedTicket.content_type && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Content Request Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Type: {selectedTicket.content_type}</div>
                        <div>Duration: {selectedTicket.play_duration}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Update Status</Label>
                      <Select value={updateStatus} onValueChange={setUpdateStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting_owner">Waiting for Owner</SelectItem>
                          <SelectItem value="waiting_admin">Waiting for Admin</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Assign To</Label>
                      <Input
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        placeholder="Admin user ID"
                      />
                    </div>
                  </div>

                  {(updateStatus === 'resolved' || updateStatus === 'closed') && (
                    <div>
                      <Label>Resolution Notes</Label>
                      <Textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Describe how the issue was resolved..."
                        rows={3}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Internal Comment (Optional)</Label>
                    <Textarea
                      value={internalComment}
                      onChange={(e) => setInternalComment(e.target.value)}
                      placeholder="Add an internal note..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTicketDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateTicket}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Ticket'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}