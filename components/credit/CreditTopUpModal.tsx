'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/constants'
import config from '@/lib/config'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CreditTopUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function TopUpForm({ amount, onSuccess, onClose }: {
  amount: number,
  onSuccess: () => void,
  onClose: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [billingPostcode, setBillingPostcode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    if (!billingPostcode || billingPostcode.trim().length < 3) {
      toast.error('Please enter your billing postal/zip code')
      return
    }

    setProcessing(true)

    try {
      // Create payment intent
      const response = await fetch(`${config.api.baseURL}/api/payment/credit/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const { clientSecret } = await response.json()

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      // Get user details for billing
      const user = JSON.parse(localStorage.getItem('user') || '{}')

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.full_name || 'Customer',
            email: user.email || undefined,
            address: {
              postal_code: billingPostcode,
              country: 'GB'
            }
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm top-up in backend
        const confirmResponse = await fetch(`${config.api.baseURL}/api/payment/credit/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            amount
          })
        })

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm top-up')
        }

        toast.success(`Successfully added ${formatCurrency(amount)} to your credit balance`)
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="billing-postcode">Billing Postal/Zip Code</Label>
          <Input
            id="billing-postcode"
            type="text"
            placeholder="Enter your billing postal code (e.g., SW1A 1AA)"
            value={billingPostcode}
            onChange={(e) => setBillingPostcode(e.target.value)}
            required
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Required for card verification
          </p>
        </div>

        <div>
          <Label>Card Details</Label>
          <div className="p-3 border rounded-lg mt-1">
            <CardElement options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                  fontSmoothing: 'antialiased',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                  iconColor: '#fa755a',
                },
              },
              hidePostalCode: true, // Hide the postal code field in CardElement since we have our own
            }} />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!stripe || processing}>
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount)}
          </>
        )}
      </Button>
    </form>
  )
}

export default function CreditTopUpModal({ isOpen, onClose, onSuccess }: CreditTopUpModalProps) {
  const [amount, setAmount] = useState(20)

  const presetAmounts = [10, 20, 50, 100]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Credit Balance</DialogTitle>
          <DialogDescription>
            Add credit to upload content and add screens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Select Amount</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset)}
                >
                  £{preset}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-amount">Or enter custom amount</Label>
            <Input
              id="custom-amount"
              type="number"
              min="5"
              max="500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum £5, Maximum £500
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">You will receive:</p>
            <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Credit never expires
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <TopUpForm
              amount={amount}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  )
}