'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Monitor,
  FileCheck,
  ListVideo,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'
import config from '@/lib/config'

interface Shop {
  id: string
  name: string
  address: string
  phone: string
  email: string
  shop_type: string
  photo_url?: string
  postcode?: string
  city?: string
  county?: string
  created_at: string
  owner_name: string
  screen_count: number
  content_count: number
  playlist_count: number
}

export default function DesignShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignedShops()
  }, [])

  const fetchAssignedShops = async () => {
    try {
      const response = await fetch('/api/design/assigned-shops', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shops')
      }

      const data = await response.json()
      setShops(data)
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('Failed to load assigned shops')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Shops Assigned</h3>
        <p className="text-gray-500">You haven't been assigned to any shops yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Assigned Shops</h1>
        <p className="text-muted-foreground mt-1">
          Shops you're responsible for managing content and playlists
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shops.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Screens</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.reduce((sum, shop) => sum + (shop.screen_count || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Playlists</CardTitle>
            <ListVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.reduce((sum, shop) => sum + (shop.playlist_count || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Items</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.reduce((sum, shop) => sum + (shop.content_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shops Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <Card key={shop.id} className="overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-purple-500 to-purple-600 relative">
              {shop.photo_url ? (
                <img
                  src={`${config.api.baseURL}${shop.photo_url}`}
                  alt={shop.name}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-white/50" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-semibold text-lg">{shop.name}</h3>
                {shop.shop_type && (
                  <Badge variant="secondary" className="mt-1">
                    {shop.shop_type.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                {shop.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {shop.address}
                      {shop.city && `, ${shop.city}`}
                      {shop.postcode && ` ${shop.postcode}`}
                    </span>
                  </div>
                )}

                {shop.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{shop.phone}</span>
                  </div>
                )}

                {shop.owner_name && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{shop.owner_name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold">{shop.screen_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Screens</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold">{shop.playlist_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Playlists</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold">{shop.content_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Content</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.location.href = `/design/playlists?shop=${shop.id}`}
                >
                  <ListVideo className="h-4 w-4 mr-1" />
                  Playlists
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.href = `/design/content-review?shop=${shop.id}`}
                >
                  <FileCheck className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}