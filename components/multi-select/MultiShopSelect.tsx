import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { Shop } from '@/app/admin/page'
import { ScreenType } from '@/app/admin/pricing/page'
import { Checkbox } from '@/components/ui/checkbox'

import { Card, CardContent, CardDescription } from '../ui/card'

interface IMultiShopSelect {
  shops: Shop[]
  shop_ids: number[]
  setNewScreen: Dispatch<SetStateAction<Partial<ScreenType> | null>>
  setEditingScreen: Dispatch<SetStateAction<ScreenType | null>>
}

export default function MultiShopSelect({
  shops,
  shop_ids,
  setNewScreen,
  setEditingScreen,
}: IMultiShopSelect) {
  const [assignedShopIds, setAssignedShopIds] = useState<number[]>(shop_ids)

  const handleShopSelection = (shopId: number) => {
    if (assignedShopIds.includes(shopId)) {
      setAssignedShopIds((prev) => prev.filter((id) => id !== shopId))
    } else {
      setAssignedShopIds((prev) => [...prev, shopId])
    }
  }

  useEffect(() => {
    setNewScreen((newScreen) => ({
      ...newScreen,
      shop_ids: assignedShopIds,
    }))
    setEditingScreen((editingScreen: ScreenType | null) => {
      if (editingScreen) {
        return {
          ...editingScreen,
          shop_ids: assignedShopIds,
        }
      } else {
        return null
      }
    })
  }, [assignedShopIds])

  return (
    <Card className="p-2">
      <CardDescription>Select Shops</CardDescription>
      <CardContent className="grid grid-cols-3 mt-2">
        {shops.map((shop) => (
          <div className="flex flex-row items-center gap-2">
            <Checkbox
              id={shop.id.toString()}
              key={shop.id}
              checked={assignedShopIds.includes(shop.id)}
              onCheckedChange={() => handleShopSelection(shop.id)}
              className="mt-0.5 flex-shrink-0"
            />
            <label
              htmlFor={shop.id.toString()}
              className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
            >
              {shop.name}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
