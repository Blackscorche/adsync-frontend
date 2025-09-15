'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { billingAPI } from '@/lib/api'
import { toast } from 'sonner'
import {
  FileText,
  Download,
  CreditCard,
  AlertCircle,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

export default function BillingManagement() {
  const [unpaidBills, setUnpaidBills] = useState([])
  const [selectedShop, setSelectedShop] = useState(null)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)

  useEffect(() => {
    fetchUnpaidBills()
    fetchShops()
  }, [])

  const fetchUnpaidBills = async () => {
    try {
      const data = await billingAPI.getUnpaidBills()
      setUnpaidBills(data)
    } catch (error) {
      toast.error('Failed to fetch unpaid bills')
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shops', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setShops(data)
    } catch (error) {
      toast.error('Failed to fetch shops')
    } finally {
      setLoading(false)
    }
  }

  const generateInvoice = async (shopId: string, month: number, year: number) => {
    setGeneratingInvoice(true)
    try {
      await billingAPI.generateInvoice(shopId, month, year)
      toast.success('Invoice generated successfully')
      fetchUnpaidBills()
    } catch (error) {
      toast.error('Failed to generate invoice')
    } finally {
      setGeneratingInvoice(false)
    }
  }

  const markAsPaid = async (billId: string) => {
    try {
      await billingAPI.updatePaymentStatus(billId, {
        status: 'paid',
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString()
      })
      toast.success('Payment recorded successfully')
      fetchUnpaidBills()
    } catch (error) {
      toast.error('Failed to update payment status')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate Monthly Invoice</DialogTitle>
              <DialogDescription>
                Select a shop and billing period to generate an invoice
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="shop">Shop</Label>
                <Select onValueChange={setSelectedShop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="month">Month</Label>
                  <Select defaultValue={String(new Date().getMonth() + 1)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Select defaultValue={String(new Date().getFullYear())}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (selectedShop) {
                    generateInvoice(
                      selectedShop,
                      new Date().getMonth() + 1,
                      new Date().getFullYear()
                    )
                  }
                }}
                disabled={!selectedShop || generatingInvoice}
              >
                {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList>
          <TabsTrigger value="unpaid">Unpaid Bills</TabsTrigger>
          <TabsTrigger value="all">All Bills</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono">{bill.invoice_number}</TableCell>
                    <TableCell>{bill.shop_name}</TableCell>
                    <TableCell>{bill.owner_name}</TableCell>
                    <TableCell>{formatCurrency(bill.total_amount || 0)}</TableCell>
                    <TableCell>
                      {new Date(bill.payment_due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoice(bill.id, bill.invoice_number)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPaid(bill.id)}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card className="p-6">
            <p className="text-muted-foreground">All bills view coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Overdue bills will be shown here</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold">
                {formatCurrency(unpaidBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
              <p className="text-2xl font-bold">{unpaidBills.length}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {unpaidBills.filter(bill =>
                  new Date(bill.payment_due_date) < new Date()
                ).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>
    </div>
  )
}