'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertOctagon, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import api from '@/lib/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shop } from '@/app/admin/page'
import MultiShopSelect from '@/components/multi-select/MultiShopSelect'

export interface ScreenType {
  id: number
  is_active: boolean
  monthly_price: string
  name: string
  shop_ids: number[]
  size_inches: string
  created_at: string
  updated_at: string
}

export default function PricingSettings() {
  const [settings, setSettings] = useState<any>({})
  const [screenTypes, setScreenTypes] = useState<ScreenType[]>([])
  const [filteredScreenTypes, setFilteredScreenTypes] = useState<ScreenType[]>(
    []
  )
  const [editingScreen, setEditingScreen] = useState<ScreenType | null>(null)
  const [screenToDelete, setScreenToDelete] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addScreenOpen, setAddScreenOpen] = useState(false)
  const [newScreen, setNewScreen] = useState<Partial<ScreenType> | null>(null)
  const [loading, setLoading] = useState(true)
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState('')

  console.log('newScreen', newScreen)

  useEffect(() => {
    fetchPricingSettings()
    fetchShops()
  }, [])

  useEffect(() => {
    setFilteredScreenTypes(
      screenTypes.filter((screenType: ScreenType) =>
        screenType.shop_ids?.includes(parseInt(selectedShop))
      )
    )
  }, [screenTypes, selectedShop])

  const fetchPricingSettings = async () => {
    try {
      const response = await api.get('/admin/pricing-settings')
      const settingsMap: any = {}
      response.data.settings.forEach((s: any) => {
        settingsMap[s.setting_key] = s.setting_value
      })
      setSettings(settingsMap)
      setScreenTypes(response.data.screenTypes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load pricing settings')
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      await api.put(`/admin/pricing-settings/${key}`, { value })
      toast.success('Setting updated successfully')
      setSettings({ ...settings, [key]: value })
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Failed to update setting')
    }
  }

  const addScreenType = async () => {
    if (
      !newScreen?.name ||
      !newScreen?.size_inches ||
      !newScreen?.monthly_price
    ) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const response = await api.post('/admin/screen-types', newScreen)
      toast.success('Screen type added successfully')
      setScreenTypes([...screenTypes, response.data.screenType])
      setNewScreen(null)
    } catch (error) {
      console.error('Error adding screen type:', error)
      toast.error('Failed to add screen type')
    }
  }

  const updateScreenType = async (id: number) => {
    try {
      const response = await api.put(`/admin/screen-types/${id}`, editingScreen)
      toast.success('Screen type updated successfully')
      setScreenTypes(
        screenTypes.map((st) => (st.id === id ? response.data.screenType : st))
      )
      setEditingScreen(null)
    } catch (error) {
      console.error('Error updating screen type:', error)
      toast.error('Failed to update screen type')
    }
  }

  const deleteScreenType = (screenType: any) => {
    setScreenToDelete(screenType)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteScreenType = async () => {
    if (!screenToDelete) return

    try {
      await api.delete(`/admin/screen-types/${screenToDelete.id}`)
      toast.success('Screen type deleted successfully')
      setScreenTypes(
        screenTypes.filter((st: any) => st.id !== screenToDelete.id)
      )
    } catch (error: any) {
      console.error('Error deleting screen type:', error)
      toast.error(error.response?.data?.error || 'Failed to delete screen type')
    } finally {
      setDeleteDialogOpen(false)
      setScreenToDelete(null)
    }
  }

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops')
      setShops(response.data)
    } catch (error) {
      console.error('Error while fetching shops', error)
    }
  }

  const shop = useMemo(
    () => shops.find((shop) => shop.id === parseInt(selectedShop)),
    [shops, selectedShop]
  )

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pricing Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Commission Percentage (%)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.commission_percentage || '10'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      commission_percentage: e.target.value,
                    })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
                <Button
                  onClick={() =>
                    updateSetting(
                      'commission_percentage',
                      settings.commission_percentage
                    )
                  }
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Sales team commission on shop payments
              </p>
            </div>

            <div>
              <Label>Content Upload Price (£)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.content_upload_price || '3.00'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      content_upload_price: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                />
                <Button
                  onClick={() =>
                    updateSetting(
                      'content_upload_price',
                      settings.content_upload_price
                    )
                  }
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Price per content upload after free monthly upload
              </p>
            </div>

            <div>
              <Label>Content Monthly Price (£)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.content_monthly_price || '1.00'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      content_monthly_price: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                />
                <Button
                  onClick={() =>
                    updateSetting(
                      'content_monthly_price',
                      settings.content_monthly_price
                    )
                  }
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Monthly charge per content item in billing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Screen Types Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Screen Types</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setNewScreen({
                  name: '',
                  size_inches: '',
                  monthly_price: '',
                  shop_ids: [],
                })
                setAddScreenOpen(true)
              }}
              disabled={addScreenOpen || selectedShop === ''}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Type
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Shop Select */}
              {!editingScreen && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="shop">Select Shop *</Label>
                    <Select
                      value={selectedShop}
                      onValueChange={(value: string) => {
                        setSelectedShop(value)
                        setNewScreen({
                          ...newScreen,
                          shop_ids: [parseInt(value)],
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a shop" />
                      </SelectTrigger>
                      <SelectContent>
                        {shops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id.toString()}>
                            <div className="flex justify-between items-center w-full">
                              <span>{shop.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({shop.shop_type})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {/* New Screen Type Form */}
              {addScreenOpen && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Name (e.g., 32 inch)"
                      value={newScreen?.name}
                      onChange={(e) =>
                        setNewScreen({
                          ...newScreen,
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Size (inches)"
                      value={newScreen?.size_inches}
                      onChange={(e) =>
                        setNewScreen({
                          ...newScreen,
                          size_inches: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Price (£)"
                      value={newScreen?.monthly_price}
                      onChange={(e) =>
                        setNewScreen({
                          ...newScreen,
                          monthly_price: e.target.value,
                        })
                      }
                      step="0.01"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={addScreenType}
                      className="flex-1"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewScreen(null)
                        setAddScreenOpen(false)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* No shop selected */}
              {selectedShop === '' && (
                <Card className="flex flex-row items-center p-4 border-orange-300">
                  <AlertOctagon className="text-orange-300 h-4 w-4 mr-1" />
                  <p className="text-orange-300">Please select a shop</p>
                </Card>
              )}

              {/* No screens assigned to selected shop */}
              {selectedShop !== '' && filteredScreenTypes.length === 0 && (
                <Card className="flex flex-row items-center p-4 border-orange-300">
                  <AlertOctagon className="text-orange-300 h-4 w-4 mr-1" />
                  <p className="text-orange-300">
                    No screens were assigned to the selected shop
                  </p>
                </Card>
              )}

              {/* Existing Screen Types */}
              {filteredScreenTypes.map((screenType) => (
                <div key={screenType.id} className="border rounded-lg p-3">
                  {editingScreen?.id === screenType.id ? (
                    <>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <Input
                          value={editingScreen.name}
                          onChange={(e) =>
                            setEditingScreen({
                              ...editingScreen,
                              name: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="number"
                          value={editingScreen.size_inches}
                          onChange={(e) =>
                            setEditingScreen({
                              ...editingScreen,
                              size_inches: e.target.value,
                            })
                          }
                        />
                        <Input
                          type="number"
                          value={editingScreen.monthly_price}
                          onChange={(e) =>
                            setEditingScreen({
                              ...editingScreen,
                              monthly_price: e.target.value,
                            })
                          }
                          step="0.01"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2 mb-2">
                        <MultiShopSelect
                          shops={shops}
                          shop_ids={screenType?.shop_ids || []}
                          setNewScreen={setNewScreen}
                          setEditingScreen={setEditingScreen}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateScreenType(screenType.id)}
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingScreen(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{screenType.name}</span>
                        <span className="text-gray-500 ml-2">
                          ({screenType.size_inches}" - £
                          {parseFloat(screenType.monthly_price).toFixed(2)}
                          /month)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingScreen(screenType)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteScreenType(screenType)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Commission Rate</p>
              <p className="text-xl font-semibold">
                {settings.commission_percentage || 10}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Content Upload</p>
              <p className="text-xl font-semibold">
                £{parseFloat(settings.content_upload_price || 3).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Content Monthly</p>
              <p className="text-xl font-semibold">
                £{parseFloat(settings.content_monthly_price || 1).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Screen Types</p>
              <p className="text-xl font-semibold">{screenTypes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screen Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{screenToDelete?.name}"? This
              action cannot be undone. Make sure no shops are using this screen
              type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScreenToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteScreenType}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
