'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  HeadphonesIcon,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Monitor,
  Upload,
  CreditCard,
  Calendar,
  MapPin,
  Package,
  PlayCircle,
  XCircle,
  Paperclip,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'

interface Ticket {
  id: number
  ticket_number: string
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
  // Screen request fields
  screen_size?: string
  screen_quantity?: number
  installation_address?: string
  preferred_installation_date?: string
  // Content request fields
  content_type?: string
  play_duration?: string
  target_screens?: string[]
  start_date?: string
  end_date?: string
}

interface TicketComment {
  id: number
  user_name: string
  user_role: string
  comment: string
  created_at: string
  is_internal: boolean
}

export default function OwnerSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketComments, setTicketComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [showTicketDetails, setShowTicketDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Form state for new ticket
  const [ticketForm, setTicketForm] = useState({
    category: 'general_inquiry',
    priority: 'medium',
    subject: '',
    description: '',
    // Screen request
    screen_size: '',
    screen_quantity: '',
    installation_address: '',
    preferred_installation_date: '',
    // Content request
    content_type: '',
    play_duration: '',
    target_screens: '',
    start_date: '',
    end_date: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support/my-tickets', {
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

  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/support/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedTicket(data.ticket)
        setTicketComments(data.comments)
        setShowTicketDetails(true)
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      // Add form fields
      Object.entries(ticketForm).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString())
      })

      const response = await fetch('/api/support/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        setShowNewTicket(false)
        fetchTickets()
        // Reset form
        setTicketForm({
          category: 'general_inquiry',
          priority: 'medium',
          subject: '',
          description: '',
          screen_size: '',
          screen_quantity: '',
          installation_address: '',
          preferred_installation_date: '',
          content_type: '',
          play_duration: '',
          target_screens: '',
          start_date: '',
          end_date: ''
        })
      } else {
        alert('Failed to create ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return

    setSubmittingComment(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/support/${selectedTicket.id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: newComment })
      })

      if (response.ok) {
        setNewComment('')
        fetchTicketDetails(selectedTicket.id)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmittingComment(false)
    }
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

  const filteredTickets = activeTab === 'all'
    ? tickets
    : tickets.filter(t => t.status === activeTab)

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading support tickets...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Request screens, content changes, and get help</p>
        </div>
        <Button onClick={() => setShowNewTicket(true)}>
          <Send className="h-4 w-4 mr-2" />
          New Support Ticket
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Track your requests and issues</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => fetchTicketDetails(ticket.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getCategoryIcon(ticket.category)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">#{ticket.ticket_number}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="font-medium">{ticket.subject}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created {format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                          {ticket.comment_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {ticket.comment_count} comments
                              </span>
                            </>
                          )}
                          {ticket.attachment_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {ticket.attachment_count} files
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Request screens, content changes, or report issues
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(v) => setTicketForm({...ticketForm, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screen_request">Request New Screens</SelectItem>
                    <SelectItem value="content_request">Request Content Play</SelectItem>
                    <SelectItem value="technical_issue">Technical Issue</SelectItem>
                    <SelectItem value="billing_inquiry">Billing Question</SelectItem>
                    <SelectItem value="content_removal">Remove Content</SelectItem>
                    <SelectItem value="schedule_change">Schedule Change</SelectItem>
                    <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(v) => setTicketForm({...ticketForm, priority: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                placeholder="Brief description of your request"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                placeholder="Provide detailed information about your request..."
                rows={4}
                required
              />
            </div>

            {/* Screen Request Fields */}
            {ticketForm.category === 'screen_request' && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Screen Request Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Screen Size</Label>
                    <Select
                      value={ticketForm.screen_size}
                      onValueChange={(v) => setTicketForm({...ticketForm, screen_size: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="32">32 inch</SelectItem>
                        <SelectItem value="43">43 inch</SelectItem>
                        <SelectItem value="55">55 inch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={ticketForm.screen_quantity}
                      onChange={(e) => setTicketForm({...ticketForm, screen_quantity: e.target.value})}
                      placeholder="Number of screens"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Installation Address</Label>
                  <Textarea
                    value={ticketForm.installation_address}
                    onChange={(e) => setTicketForm({...ticketForm, installation_address: e.target.value})}
                    placeholder="Where should the screens be installed?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Preferred Installation Date</Label>
                  <Input
                    type="date"
                    value={ticketForm.preferred_installation_date}
                    onChange={(e) => setTicketForm({...ticketForm, preferred_installation_date: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Content Request Fields */}
            {ticketForm.category === 'content_request' && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Content Request Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Content Type</Label>
                    <Select
                      value={ticketForm.content_type}
                      onValueChange={(v) => setTicketForm({...ticketForm, content_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="informational">Informational</SelectItem>
                        <SelectItem value="special_offer">Special Offer</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Play Duration</Label>
                    <Input
                      value={ticketForm.play_duration}
                      onChange={(e) => setTicketForm({...ticketForm, play_duration: e.target.value})}
                      placeholder="e.g., 30 seconds"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={ticketForm.start_date}
                      onChange={(e) => setTicketForm({...ticketForm, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={ticketForm.end_date}
                      onChange={(e) => setTicketForm({...ticketForm, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Target Screens</Label>
                  <Input
                    value={ticketForm.target_screens}
                    onChange={(e) => setTicketForm({...ticketForm, target_screens: e.target.value})}
                    placeholder="Which screens should play this content?"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showTicketDetails} onOpenChange={setShowTicketDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Ticket #{selectedTicket.ticket_number}</DialogTitle>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>
                <DialogDescription>{selectedTicket.subject}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Ticket Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium">{selectedTicket.category.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(selectedTicket.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {selectedTicket.resolved_at && (
                      <div>
                        <span className="text-muted-foreground">Resolved:</span>
                        <span className="ml-2 font-medium">
                          {format(new Date(selectedTicket.resolved_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Description:</p>
                    <p className="text-sm">{selectedTicket.description}</p>
                  </div>

                  {/* Additional Details for Special Categories */}
                  {selectedTicket.category === 'screen_request' && selectedTicket.screen_size && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Screen Request Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Size: {selectedTicket.screen_size} inch</div>
                        <div>Quantity: {selectedTicket.screen_quantity}</div>
                        {selectedTicket.installation_address && (
                          <div className="col-span-2">Address: {selectedTicket.installation_address}</div>
                        )}
                        {selectedTicket.preferred_installation_date && (
                          <div>Preferred Date: {format(new Date(selectedTicket.preferred_installation_date), 'MMM dd, yyyy')}</div>
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
                        {selectedTicket.start_date && (
                          <div>Start: {format(new Date(selectedTicket.start_date), 'MMM dd, yyyy')}</div>
                        )}
                        {selectedTicket.end_date && (
                          <div>End: {format(new Date(selectedTicket.end_date), 'MMM dd, yyyy')}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-medium mb-3">Comments</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {ticketComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-1 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.user_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      </div>
                    ))}
                    {ticketComments.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                    )}
                  </div>
                </div>

                {/* Add Comment */}
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <div className="space-y-2">
                    <Label>Add Comment</Label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="w-full"
                    >
                      {submittingComment ? 'Sending...' : 'Send Comment'}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}