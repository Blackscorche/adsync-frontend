'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/constants'
import config from '@/lib/config'

// Initialize Stripe - you'll need to set this in your environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OHJGxSJZRvNQz1eXrYgLqMz1zXqHfKJ0KqLZAJYFhXx5X0XqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq')

interface StripePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  bill: {
    id: string
    invoice_number: string
    total_amount: number
    shop_id: string
  }
  onPaymentSuccess?: () => void
}

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
}

function PaymentForm({ bill, onSuccess, onClose }: {
  bill: StripePaymentModalProps['bill'],
  onSuccess: () => void,
  onClose: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [succeeded, setSucceeded] = useState(false)

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(`${config.api.baseURL}/api/payment/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ billId: bill.id })
        })

        if (!response.ok) {
          throw new Error('Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Error creating payment intent:', err)
        setError('Failed to initialize payment. Please try again.')
        toast.error('Failed to initialize payment')
      }
    }

    if (bill.id) {
      createPaymentIntent()
    }
  }, [bill.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // You can add billing details here if needed
            },
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        toast.error(stripeError.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        setSucceeded(true)
        toast.success('Payment successful!')

        // Update the bill status in backend
        await fetch(`${config.api.baseURL}/api/payment/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            billId: bill.id,
            paymentIntentId: paymentIntent.id
          })
        })

        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An unexpected error occurred')
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground text-center">
          Your payment for invoice {bill.invoice_number} has been processed successfully.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Due */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount Due</span>
          <span className="text-2xl font-bold">{formatCurrency(bill.total_amount)}</span>
        </div>
      </div>

      {/* Card Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-lg">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <p className="text-sm">
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(bill.total_amount)}`
          )}
        </Button>
      </div>
    </form>
  )
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  bill,
  onPaymentSuccess
}: StripePaymentModalProps) {
  const handleSuccess = () => {
    onPaymentSuccess?.()
    onClose()
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

        <Elements stripe={stripePromise}>
          <PaymentForm
            bill={bill}
            onSuccess={handleSuccess}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}