'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { billingAPI } from '@/lib/api'
import { toast } from 'sonner'
import {
  FileText,
  Download,
  CreditCard,
  TrendingUp,
  Monitor,
  Upload,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function OwnerBilling() {
  const [billingData, setBillingData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.shopId) {
        const data = await billingAPI.getShopBilling(user.shopId)
        setBillingData(data)
      }
    } catch (error) {
      toast.error('Failed to fetch billing information')
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await billingAPI.downloadInvoicePDF(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const variant = variants[status] || variants.pending
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No billing information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {billingData.shop.subscription_status === 'active' ? (
            <span className="text-green-600">Active Subscription</span>
          ) : (
            <span className="text-yellow-600">Trial Period</span>
          )}
        </Badge>
      </div>

      {/* Current Month Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Month Usage</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Content Uploads</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{billingData.currentMonth.contentUploads}</span>
              <span className="text-sm text-muted-foreground">
                ({billingData.currentMonth.freeUploads} free included)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Screen Charges</p>
            <p className="text-2xl font-bold">£{billingData.currentMonth.screenCharges.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Content Charges</p>
            <p className="text-2xl font-bold">£{billingData.currentMonth.contentCharges.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total This Month</p>
            <p className="text-2xl font-bold text-primary">
              £{billingData.currentMonth.totalCharges.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Screen Subscription Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Screen Subscriptions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">32" Screens</p>
                <p className="text-sm text-muted-foreground">£{billingData.shop.screen_32_price}/month each</p>
              </div>
            </div>
            <span className="text-2xl font-bold">{billingData.shop.screen_32_count || 0}</span>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">43" Screens</p>
                <p className="text-sm text-muted-foreground">£{billingData.shop.screen_43_price}/month each</p>
              </div>
            </div>
            <span className="text-2xl font-bold">{billingData.shop.screen_43_count || 0}</span>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">55" Screens</p>
                <p className="text-sm text-muted-foreground">£{billingData.shop.screen_55_price}/month each</p>
              </div>
            </div>
            <span className="text-2xl font-bold">{billingData.shop.screen_55_count || 0}</span>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Billing Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingData.bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono">{bill.invoice_number}</TableCell>
                <TableCell>
                  {new Date(bill.billing_period_start).toLocaleDateString()} -
                  {new Date(bill.billing_period_end).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-semibold">£{bill.total_amount?.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(bill.status)}</TableCell>
                <TableCell>{new Date(bill.payment_due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadInvoice(bill.id, bill.invoice_number)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {bill.status === 'pending' && (
                      <Button size="sm">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {billingData.bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No billing history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pricing Information */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Pricing Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span>First content upload each month: <strong>Free</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span>Additional content uploads: <strong>£3.00 each</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>Payment terms: <strong>14 days</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>VAT: <strong>20%</strong> (included in total)</span>
          </div>
        </div>
      </Card>
    </div>
  )
}