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
import { billingAPI, screenRequestsAPI } from '@/lib/api'
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
import { formatCurrency } from '@/lib/constants'
import StripePaymentModal from '@/components/payment/StripePaymentModal'

export default function OwnerBilling() {
  const [billingData, setBillingData] = useState<any>(null)
  const [screenRequests, setScreenRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [shopId, setShopId] = useState<string>('')

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.shopId) {
        setShopId(user.shopId)
        const [billingData, requests] = await Promise.all([
          billingAPI.getShopBilling(user.shopId),
          screenRequestsAPI.getShopRequests()
        ])
        setBillingData(billingData)
        setScreenRequests(requests)
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

  const handlePayNow = (bill: any) => {
    setSelectedBill(bill)
    setIsPaymentModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    } as const

    const variant = variants[status as keyof typeof variants] || variants.pending
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
            <p className="text-2xl font-bold">{formatCurrency(billingData.currentMonth.screenCharges)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Content Charges</p>
            <p className="text-2xl font-bold">{formatCurrency(billingData.currentMonth.contentCharges)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total This Month</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(billingData.currentMonth.totalCharges)}
            </p>
          </div>
        </div>
      </Card>

      {/* Screen Subscription Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Screen Subscriptions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {billingData.screenTypes && billingData.screenTypes.length > 0 ? (
            billingData.screenTypes.map((screenType: any) => (
              <div key={screenType.screen_type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{screenType.screen_type}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(screenType.monthly_price)}/month each</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{screenType.count || 0}</span>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-muted-foreground py-8">
              No active screen subscriptions
            </div>
          )}
        </div>
        {billingData.screenTypes && billingData.screenTypes.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              Total Monthly Screen Cost: {formatCurrency(
                billingData.screenTypes.reduce((sum: number, st: any) => sum + (st.count * st.monthly_price), 0)
              )}
            </p>
          </div>
        )}
      </Card>

      {/* Purchase History Tabs */}
      <Card>
        <div className="p-6">
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="screen-requests">Screen Requests</TabsTrigger>
              <TabsTrigger value="screens">Active Screens</TabsTrigger>
              <TabsTrigger value="content">Content Uploads</TabsTrigger>
              <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            </TabsList>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Billing History</h3>
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
            {billingData.bills.map((bill: any) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono">{bill.invoice_number}</TableCell>
                <TableCell>
                  {bill.billing_month
                    ? new Date(bill.billing_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'}
                </TableCell>
                <TableCell className="font-semibold">{formatCurrency(bill.total_amount || 0)}</TableCell>
                <TableCell>{getStatusBadge(bill.status)}</TableCell>
                <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
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
                      <Button
                        size="sm"
                        onClick={() => handlePayNow(bill)}
                      >
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
            </TabsContent>

            {/* Screen Requests Tab */}
            <TabsContent value="screen-requests" className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Screen Request History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Screen Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Monthly Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{request.screen_name}</TableCell>
                      <TableCell>{request.screen_type_name} ({request.size_inches}")</TableCell>
                      <TableCell>{request.location || 'Not specified'}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(request.monthly_cost)}/month</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending Review
                          </Badge>
                        )}
                        {request.status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                        {request.status === 'expired' && (
                          <Badge className="bg-gray-100 text-gray-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Expired
                          </Badge>
                        )}
                        {request.status === 'cancelled' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Cancelled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' || request.status === 'approved' ? (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(request.payment_amount)} Paid
                          </span>
                        ) : (
                          <span className="text-blue-600 font-medium">
                            {formatCurrency(request.payment_amount)} Refunded
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.status === 'approved' && request.device_id && (
                          <span className="text-green-600">Device ID: {request.device_id}</span>
                        )}
                        {request.status === 'rejected' && request.rejection_reason && (
                          <span className="text-red-600">Reason: {request.rejection_reason}</span>
                        )}
                        {request.status === 'pending' && (
                          <span className="text-muted-foreground">
                            Expires: {new Date(request.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {screenRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No screen requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Active Screens Tab */}
            <TabsContent value="screens" className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Active Screens</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Screen Name</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Monthly Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.screenPurchases?.map((screen: any) => (
                    <TableRow key={screen.id}>
                      <TableCell>{screen.screen_name || `Screen ${screen.id}`}</TableCell>
                      <TableCell className="font-mono">{screen.device_id || 'Not assigned'}</TableCell>
                      <TableCell>{screen.screen_type_name || screen.size || 'Standard'}</TableCell>
                      <TableCell>{screen.location || 'Not set'}</TableCell>
                      <TableCell>
                        <Badge className={(screen.status === 'online' || screen.status === 'active') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {screen.status === 'active' ? 'online' : (screen.status || 'offline')}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(screen.purchase_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(screen.screen_price || screen.monthly_cost || 0)}/month
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!billingData.screenPurchases || billingData.screenPurchases.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No screen purchases yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Content Uploads Tab */}
            <TabsContent value="content" className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Paid Content Uploads</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Charge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.contentPurchases?.map((content: any) => (
                    <TableRow key={content.id}>
                      <TableCell>{content.original_filename}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {content.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(content.upload_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(content.charge_amount || 3)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!billingData.contentPurchases || billingData.contentPurchases.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No paid content uploads yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* All Transactions Tab */}
            <TabsContent value="transactions" className="mt-4">
              <h3 className="text-lg font-semibold mb-3">All Credit Transactions</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.transactions?.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.type === 'refund' ? 'border-blue-500 text-blue-600' :
                            transaction.type === 'credit' ? 'border-green-500 text-green-600' :
                            transaction.type === 'screen_request' ? 'border-purple-500 text-purple-600' :
                            'border-red-500 text-red-600'
                          }
                        >
                          {transaction.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount || 0))}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.balance_after || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!billingData.transactions || billingData.transactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Pricing Information */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Pricing Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span>Screen requests: <strong>Immediate payment, refund if rejected</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Review period: <strong>2 days</strong> (auto-refund if expired)</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span>First content upload each month: <strong>Free</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span>Additional content uploads: <strong>Charged per upload</strong></span>
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

      {/* Payment Modal */}
      {selectedBill && (
        <StripePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedBill(null)
          }}
          bill={{
            id: selectedBill.id,
            invoice_number: selectedBill.invoice_number,
            total_amount: selectedBill.total_amount,
            shop_id: shopId
          }}
          onPaymentSuccess={() => {
            fetchBillingData()
            setIsPaymentModalOpen(false)
            setSelectedBill(null)
          }}
        />
      )}
    </div>
  )
}