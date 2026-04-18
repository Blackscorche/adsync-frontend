'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart2,
  Play,
  Store,
  TrendingUp,
  RefreshCw,
  CreditCard,
  Monitor,
  Film,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Banknote,
} from 'lucide-react'
import { reportsAPI } from '@/lib/api'

function StatCard({ title, value, icon: Icon, color = 'text-foreground', loading }: {
  title: string
  value: string | number
  icon: any
  color?: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 rounded bg-muted animate-pulse" />
        ) : (
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default function AdminReportsPage() {
  const [adsData, setAdsData] = useState<any>(null)
  const [subsData, setSubsData] = useState<any>(null)
  const [loadingAds, setLoadingAds] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(true)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAdsReport()
    fetchSubsReport()
  }, [])

  const fetchAdsReport = async () => {
    try {
      setLoadingAds(true)
      const data = await reportsAPI.getAdsPlayed({ from: fromDate, to: toDate })
      setAdsData(data)
    } catch {
      setAdsData(null)
    } finally {
      setLoadingAds(false)
    }
  }

  const fetchSubsReport = async () => {
    try {
      setLoadingSubs(true)
      const data = await reportsAPI.getSubscriptions()
      setSubsData(data)
    } catch {
      setSubsData(null)
    } finally {
      setLoadingSubs(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Ads played and subscription analytics</p>
      </div>

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex">
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>Ads Played</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Ads Played ── */}
        <TabsContent value="ads" className="space-y-4">
          {/* Date filter */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <div className="w-full sm:w-auto space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>
                <div className="w-full sm:w-auto space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    min={fromDate}
                    className="w-full sm:w-40"
                  />
                </div>
                <Button onClick={fetchAdsReport} disabled={loadingAds} className="w-full sm:w-auto">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingAds ? 'animate-spin' : ''}`} />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title="Total Plays"
              value={Number(adsData?.summary?.total_plays || 0).toLocaleString()}
              icon={Play}
              color="text-blue-600"
              loading={loadingAds}
            />
            <StatCard
              title="Unique Content"
              value={adsData?.summary?.unique_content || 0}
              icon={Film}
              loading={loadingAds}
            />
            <StatCard
              title="Active Shops"
              value={adsData?.summary?.active_shops || 0}
              icon={Store}
              loading={loadingAds}
            />
            <StatCard
              title="Active Screens"
              value={adsData?.summary?.active_screens || 0}
              icon={Monitor}
              loading={loadingAds}
            />
          </div>

          {/* Daily plays */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Daily Plays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAds ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-10 w-full rounded bg-muted animate-pulse" />)}
                </div>
              ) : !adsData?.daily_totals?.length ? (
                <EmptyState message="No playback data for this period" />
              ) : (
                <div className="overflow-x-auto -mx-4 px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total Plays</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adsData.daily_totals.map((row: any) => (
                        <TableRow key={row.date}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {Number(row.total_plays).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-4 w-4" />
                Top Content
              </CardTitle>
              <CardDescription>Most played content in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAds ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-10 w-full rounded bg-muted animate-pulse" />)}
                </div>
              ) : !adsData?.top_content?.length ? (
                <EmptyState message="No playback data for this period" />
              ) : (
                <div className="overflow-x-auto -mx-4 px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="hidden sm:table-cell">Shop</TableHead>
                        <TableHead className="text-right">Plays</TableHead>
                        <TableHead className="hidden md:table-cell">Last Played</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adsData.top_content.map((row: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-medium max-w-[140px] truncate">
                            {row.original_filename || row.content_name || `Content #${row.content_id}`}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {row.shop_name || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-bold">
                              {Number(row.play_count).toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {row.last_played ? new Date(row.last_played).toLocaleDateString('en-GB') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Subscriptions ── */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={fetchSubsReport} disabled={loadingSubs} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingSubs ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title="Total Shops"
              value={subsData?.summary?.total_shops || 0}
              icon={Store}
              loading={loadingSubs}
            />
            <StatCard
              title="Active"
              value={subsData?.summary?.active_shops || 0}
              icon={CheckCircle2}
              color="text-green-600"
              loading={loadingSubs}
            />
            <StatCard
              title="Inactive"
              value={subsData?.summary?.inactive_shops || 0}
              icon={XCircle}
              color="text-red-500"
              loading={loadingSubs}
            />
            <StatCard
              title="Total Credit Held"
              value={`£${parseFloat(subsData?.summary?.total_credit_held || 0).toFixed(2)}`}
              icon={Banknote}
              color="text-blue-600"
              loading={loadingSubs}
            />
          </div>

          {/* Monthly revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>Last 12 months billing summary</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubs ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-full rounded bg-muted animate-pulse" />)}
                </div>
              ) : !subsData?.monthly_revenue?.length ? (
                <EmptyState message="No billing data available" />
              ) : (
                <div className="overflow-x-auto -mx-4 px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Billed</TableHead>
                        <TableHead className="text-right">Collected</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Bills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subsData.monthly_revenue.map((row: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {new Date(row.month).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}
                          </TableCell>
                          <TableCell className="text-right">
                            £{parseFloat(row.total_billed || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">
                            £{parseFloat(row.total_collected || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                            {row.bill_count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shop list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="h-4 w-4" />
                Shop Subscriptions
              </CardTitle>
              <CardDescription>All active shops and their subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubs ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-14 w-full rounded bg-muted animate-pulse" />)}
                </div>
              ) : !subsData?.shops?.length ? (
                <EmptyState message="No shops found" />
              ) : (
                <div className="space-y-3 md:hidden">
                  {subsData.shops.map((shop: any) => (
                    <div key={shop.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{shop.name}</span>
                        <Badge className={shop.payment_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {shop.payment_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground">{shop.screen_count}</p>
                          <p>Screens</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">£{parseFloat(shop.monthly_revenue || 0).toFixed(2)}</p>
                          <p>Monthly</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">£{parseFloat(shop.credit_balance || 0).toFixed(2)}</p>
                          <p>Credit</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loadingSubs && subsData?.shops?.length > 0 && (
                <div className="overflow-x-auto -mx-4 px-4 hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Screens</TableHead>
                        <TableHead className="text-right">Monthly</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Last Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subsData.shops.map((shop: any) => (
                        <TableRow key={shop.id}>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell className="capitalize text-sm text-muted-foreground">{shop.shop_type || '-'}</TableCell>
                          <TableCell>
                            <Badge className={shop.payment_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {shop.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{shop.screen_count}</TableCell>
                          <TableCell className="text-right">£{parseFloat(shop.monthly_revenue || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right">£{parseFloat(shop.credit_balance || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {shop.last_payment_date ? new Date(shop.last_payment_date).toLocaleDateString('en-GB') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
