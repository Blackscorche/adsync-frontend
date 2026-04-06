'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Gift, Save, User, Phone, Clock, DollarSign } from 'lucide-react'

interface Referral {
  id: number
  referrer_name: string
  friend_name: string
  friend_phone: string
  status: string
  reward_amount: number
  created_at: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'rewarded', label: 'Rewarded', color: 'bg-purple-100 text-purple-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
]

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [rewardAmount, setRewardAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingAmount, setSavingAmount] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [referralsRes, amountRes] = await Promise.all([
        api.get('/referrals'),
        api.get('/referrals/reward-amount'),
      ])
      setReferrals(referralsRes.data)
      setRewardAmount(amountRes.data.reward_amount.toString())
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const saveRewardAmount = async () => {
    setSavingAmount(true)
    try {
      await api.put('/referrals/settings/reward-amount', { amount: parseFloat(rewardAmount) })
      toast.success('Reward amount updated')
    } catch (error) {
      toast.error('Failed to update reward amount')
    } finally {
      setSavingAmount(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/referrals/${id}`, { status })
      setReferrals(referrals.map(r => r.id === id ? { ...r, status } : r))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
        <p className="text-gray-600 mt-1">Manage referrals and reward settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Reward Amount Setting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div>
              <Label>Reward Amount (£)</Label>
              <Input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="w-32"
                min={0}
                step={0.01}
              />
            </div>
            <Button onClick={saveRewardAmount} disabled={savingAmount}>
              <Save className="h-4 w-4 mr-2" />
              {savingAmount ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This amount will be displayed to owners as the referral reward.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            All Referrals ({referrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Referred by:</span>
                      <span className="font-semibold">{ref.referrer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{ref.friend_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{ref.friend_phone}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(ref.created_at).toLocaleDateString()}</span>
                      <span className="text-green-600 font-medium">£{ref.reward_amount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ref.status)}
                    <Select value={ref.status} onValueChange={(val) => updateStatus(ref.id, val)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
