'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { paymentAPI } from '@/lib/api'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/constants'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  bill: {
    id: string
    invoice_number: string
    total_amount: number
  }
  onPaymentSuccess?: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  bill,
  onPaymentSuccess
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Card details (in production, use Stripe Elements)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      // Validate card details
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        toast.error('Please fill in all card details')
        return
      }
    }

    setProcessing(true)

    try {
      if (paymentMethod === 'card') {
        // In production, you would:
        // 1. Create payment intent
        // 2. Use Stripe.js to confirm payment
        // 3. Handle 3D Secure if required

        // For demo, simulate payment
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock successful payment
        await paymentAPI.confirmPayment(bill.id, {
          payment_method: 'card',
          payment_reference: `CARD-${Date.now()}`
        })

        setPaymentSuccess(true)
        toast.success('Payment successful!')

        setTimeout(() => {
          onPaymentSuccess?.()
          onClose()
        }, 2000)

      } else if (paymentMethod === 'bank_transfer') {
        // Show bank details for manual transfer
        toast.info('Bank transfer details sent to your email')
        onClose()
      }

    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground text-center">
              Your payment for invoice {bill.invoice_number} has been processed successfully.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Pay invoice {bill.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Due */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Due</span>
              <span className="text-2xl font-bold">{formatCurrency(bill.total_amount)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-4 w-4" />
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="h-4 w-4" />
                  Bank Transfer
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Card Details Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card_name">Cardholder Name</Label>
                <Input
                  id="card_name"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_number">Card Number</Label>
                <Input
                  id="card_number"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({
                    ...cardDetails,
                    number: formatCardNumber(e.target.value)
                  })}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({
                      ...cardDetails,
                      expiry: formatExpiry(e.target.value)
                    })}
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({
                      ...cardDetails,
                      cvc: e.target.value.replace(/\D/g, '')
                    })}
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p className="text-sm">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          )}

          {/* Bank Transfer Info */}
          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Bank Transfer Details:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-mono">IVAA AdSync Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sort Code:</span>
                  <span className="font-mono">12-34-56</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono">12345678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-mono">{bill.invoice_number}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Please use the invoice number as your payment reference.
                We'll mark your invoice as paid once we receive the transfer (usually 1-2 business days).
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={processing}>
            {processing ? 'Processing...' : paymentMethod === 'card' ? 'Pay Now' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}