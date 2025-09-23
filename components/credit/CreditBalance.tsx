'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingDown, Upload, Monitor } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import config from '@/lib/config'
import CreditTopUpModal from './CreditTopUpModal'

export default function CreditBalance() {
  const [creditData, setCreditData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTopUp, setShowTopUp] = useState(false)

  useEffect(() => {
    fetchCreditBalance()
  }, [])

  const fetchCreditBalance = async () => {
    try {
      const response = await fetch(`${config.api.baseURL}/api/payment/credit/balance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCreditData(data)
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Card className="animate-pulse h-48" />
  }

  if (!creditData) {
    return null
  }

  const isLowBalance = creditData.credit_balance < 10

  return (
    <>
      <Card className={isLowBalance ? 'border-orange-500' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          {creditData.payment_status === 'inactive' && (
            <Badge variant="destructive">Shop Inactive</Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(creditData.credit_balance)}
          </div>
          {isLowBalance && (
            <p className="text-xs text-orange-500 mt-1">
              Low balance - top up to continue uploading
            </p>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Content Upload
              </span>
              <span>{formatCurrency(creditData.pricing.upload_cost)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                New Screen (monthly)
              </span>
              <span>From {formatCurrency(creditData.pricing.screen_32_monthly)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() => setShowTopUp(true)}
            disabled={creditData.payment_status === 'inactive'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Top Up Credit
          </Button>

          {creditData.payment_status === 'inactive' && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Pay outstanding bills to reactivate shop
            </p>
          )}
        </CardContent>
      </Card>

      {showTopUp && (
        <CreditTopUpModal
          isOpen={showTopUp}
          onClose={() => setShowTopUp(false)}
          onSuccess={() => {
            fetchCreditBalance()
            setShowTopUp(false)
          }}
        />
      )}
    </>
  )
}