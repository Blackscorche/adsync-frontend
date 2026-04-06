'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Gift, Send, Phone, User, Clock } from 'lucide-react'

interface Referral {
  id: number
  friend_name: string
  friend_phone: string
  status: string
  reward_amount: number
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  converted: 'bg-green-100 text-green-800',
  rewarded: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function ReferralsPage() {
  const [rewardAmount, setRewardAmount] = useState(25)
  const [friendName, setFriendName] = useState('')
  const [friendPhone, setFriendPhone] = useState('')
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [amountRes, referralsRes] = await Promise.all([
        api.get('/referrals/reward-amount'),
        api.get('/referrals/my'),
      ])
      setRewardAmount(amountRes.data.reward_amount)
      setReferrals(referralsRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/referrals', { friendName, friendPhone })
      toast.success('Referral submitted successfully!')
      setFriendName('')
      setFriendPhone('')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit referral')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-600 mt-1">Refer a shop and earn rewards</p>
      </div>

      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Gift className="h-5 w-5" />
            Refer a Shop – Earn £{rewardAmount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Friend's Name *</Label>
                <Input
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="Enter friend's name"
                  required
                />
              </div>
              <div>
                <Label>Friend's WhatsApp Number *</Label>
                <Input
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900000"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Referral'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : referrals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No referrals yet. Refer a friend to get started!</p>
          ) : (
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{ref.friend_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{ref.friend_phone}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(ref.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-green-600">£{ref.reward_amount}</span>
                    <Badge className={STATUS_COLORS[ref.status] || 'bg-gray-100'}>{ref.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
