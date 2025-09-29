'use client'

import { ReactNode } from 'react'
import SideNav from './SideNav'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SideNav />
      <div className="md:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}