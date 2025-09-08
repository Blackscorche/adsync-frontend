import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Store, MonitorPlay, FileCheck, TrendingUp, Shield, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Ivaa Media Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">Ivaa Media</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Digital Signage Made Simple
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Transform your retail displays with Ivaa Media - the complete cloud-based digital signage solution 
            for modern shops. Manage content, monitor screens, and grow your business.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 h-96 flex items-center justify-center">
          <div className="text-center">
            <MonitorPlay className="w-24 h-24 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">Digital Signage Dashboard Preview</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Digital Displays
            </h2>
            <p className="text-lg text-slate-600">
              Powerful features designed for retail businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-ivaa-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-ivaa-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Shop Management</h3>
              <p className="text-slate-600">
                Manage multiple shop locations from a single dashboard with centralized control.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-ivaa-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MonitorPlay className="w-6 h-6 text-ivaa-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Screen Support</h3>
              <p className="text-slate-600">
                Control multiple screens per shop - window displays, till screens, and more.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-ivaa-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-ivaa-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Content Approval Workflow</h3>
              <p className="text-slate-600">
                Upload content for review and approval before publishing to screens.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-ivaa-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-ivaa-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Monitoring</h3>
              <p className="text-slate-600">
                Real-time screen status, content preview, and performance analytics.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-ivaa-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-ivaa-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Offline Support</h3>
              <p className="text-slate-600">
                Content caching ensures displays continue working even without internet.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-ivaa-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-ivaa-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Billing</h3>
              <p className="text-slate-600">
                Monthly subscriptions with automated invoicing and payment reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-ivaa-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-slate-600">
                Register your shop and receive your Android display device
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-ivaa-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Content</h3>
              <p className="text-slate-600">
                Upload your promotional materials for review and approval
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-ivaa-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Go Live</h3>
              <p className="text-slate-600">
                Your content displays automatically on your screens
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-ivaa-primary to-ivaa-secondary py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Retail Display?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of shops already using Ivaa Media
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="Ivaa Media Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold">Ivaa Media</span>
              </div>
              <p className="text-slate-400">
                Digital signage solution for modern retail
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2024 Ivaa Media. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}