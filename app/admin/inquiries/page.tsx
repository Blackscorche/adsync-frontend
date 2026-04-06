'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Trash2, Phone, Mail, User, Clock } from 'lucide-react'

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string
  status: string
  notes: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
]

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchInquiries()
  }, [filterStatus])

  const fetchInquiries = async () => {
    try {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await api.get(`/inquiries${params}`)
      setInquiries(response.data)
    } catch (error) {
      toast.error('Failed to fetch inquiries')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/inquiries/${id}`, { status })
      setInquiries(inquiries.map(inq =>
        inq.id === id ? { ...inq, status } : inq
      ))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const deleteInquiry = async (id: number) => {
    if (!confirm('Delete this inquiry?')) return
    try {
      await api.delete(`/inquiries/${id}`)
      setInquiries(inquiries.filter(inq => inq.id !== id))
      toast.success('Inquiry deleted')
    } catch (error) {
      toast.error('Failed to delete inquiry')
    }
  }

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status)
    return <Badge className={opt?.color || 'bg-gray-100'}>{opt?.label || status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage incoming customer inquiries</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No inquiries found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {inquiries.map(inq => (
            <Card key={inq.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{inq.name}</span>
                      {getStatusBadge(inq.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{inq.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{inq.email}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(inq.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={inq.status} onValueChange={(val) => updateStatus(inq.id, val)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => deleteInquiry(inq.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
