'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OwnerDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/owner/screens')
  }, [router])

  return null
}