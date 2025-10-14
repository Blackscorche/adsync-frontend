'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Award,
  Clock,
  DollarSign
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Monitor className="h-6 w-6" />,
      title: 'Multi-Screen Management',
      description: 'Control unlimited digital screens from a single dashboard. Perfect for retail chains and franchises.'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Real-Time Updates',
      description: 'Push content updates instantly to all screens. No delays, no complications.'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Track performance, engagement, and ROI with comprehensive reporting tools.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and secure cloud infrastructure to protect your content.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Multi-user access with role-based permissions for seamless team management.'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Cloud-Based Platform',
      description: 'Access your dashboard from anywhere. No software installation required.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Active Shops' },
    { value: '10,000+', label: 'Digital Screens' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0">
              <Image
                src="/logo.png"
                alt="Ivaa Media"
                width={28}
                height={28}
                className="h-6 w-6 sm:h-8 sm:w-8 mr-2 flex-shrink-0"
              />
              <span className="text-lg sm:text-xl font-bold text-slate-900 truncate">Ivaa Media</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition text-sm lg:text-base">Features</a>
              <a href="#benefits" className="text-slate-600 hover:text-slate-900 transition text-sm lg:text-base">Benefits</a>
              <Link href="/login">
                <Button className="ml-4 text-sm lg:text-base">Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2 flex-shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block text-slate-600 hover:text-slate-900 py-2 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#benefits"
                className="block text-slate-600 hover:text-slate-900 py-2 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <Link href="/login" className="block pt-2">
                <Button className="w-full text-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <Badge className="inline-flex items-center gap-2 text-xs sm:text-sm" variant="secondary">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Trusted by 500+ UK businesses</span>
              </Badge>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Transform Your Retail Space with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Digital Signage
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                Manage your digital displays across multiple locations from one powerful dashboard.
                Boost sales, enhance customer experience, and stay ahead of the competition.
              </p>

              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                <Link href="/login" className="w-full xs:w-auto">
                  <Button size="lg" className="w-full xs:w-auto min-w-[160px]">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>

            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format&q=75"
                  alt="Digital signage dashboard management interface showing analytics and screen control"
                  width={800}
                  height={600}
                  className="w-full h-auto aspect-[4/3] object-cover"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bsW5tp"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>

              {/* Mobile-friendly stats badge */}
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 lg:-bottom-6 lg:-left-6 lg:right-auto bg-white rounded-lg lg:rounded-xl shadow-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-green-100 rounded-md lg:rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">+47%</p>
                    <p className="text-xs sm:text-sm text-slate-600">Sales increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed for modern retail businesses. Manage content, track performance, and scale effortlessly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-5 sm:p-6">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature showcase images */}
          <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
            <div className="relative group overflow-hidden rounded-xl lg:col-span-2">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&auto=format&q=75"
                alt="Content management dashboard interface with analytics charts"
                className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-4">
                <p className="text-white font-semibold text-sm sm:text-base">Content Management</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl lg:col-span-2">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=75"
                alt="Modern office environment with digital displays"
                className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-4">
                <p className="text-white font-semibold text-sm sm:text-base">Office Displays</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl lg:col-span-2">
              <img
                src="https://images.unsplash.com/photo-1551808525-51a94da548ce?w=400&h=300&fit=crop&auto=format&q=75"
                alt="Control center with multiple digital displays and monitoring systems"
                className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-4">
                <p className="text-white font-semibold text-sm sm:text-base">Control Center</p>
              </div>
            </div>
          </div>

          {/* Additional Business Showcase */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=200&fit=crop&auto=format&q=75"
                alt="Modern business meeting room with digital collaboration displays"
                className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-4 sm:p-6">
                <div>
                  <h3 className="text-white font-bold text-lg sm:text-xl">Meeting Rooms</h3>
                  <p className="text-white/80 text-sm">Interactive presentation displays</p>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=200&fit=crop&auto=format&q=75"
                alt="Retail store with digital price displays and product information"
                className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-4 sm:p-6">
                <div>
                  <h3 className="text-white font-bold text-lg sm:text-xl">Retail Innovation</h3>
                  <p className="text-white/80 text-sm">Smart pricing & product displays</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Why Choose Ivaa Media?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Easy Setup</h3>
                    <p className="text-slate-600">Get started in minutes. No technical expertise required.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Save Time</h3>
                    <p className="text-slate-600">Update all screens simultaneously with one click.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Increase Revenue</h3>
                    <p className="text-slate-600">Dynamic content proven to boost sales by up to 47%.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Industry Leading</h3>
                    <p className="text-slate-600">Trusted by the UK\'s top retail brands.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1493421419110-74f4e85ba126?w=600&h=400&fit=crop&auto=format&q=75"
                alt="Professional digital display showing business information"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Gallery */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Perfect for Every Business Type
            </h2>
            <p className="text-lg sm:text-xl text-slate-600">
              From restaurants to retail stores, our platform adapts to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
            <div className="relative h-56 sm:h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&auto=format&q=75"
                alt="Modern retail store with digital promotional displays"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 sm:p-6">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">Retail Promotions</h3>
                  <p className="text-white/80 text-sm">Dynamic pricing & special offers</p>
                </div>
              </div>
            </div>

            <div className="relative h-56 sm:h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&auto=format&q=75"
                alt="Interactive digital kiosk and wayfinding display"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 sm:p-6">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">Wayfinding & Directory</h3>
                  <p className="text-white/80 text-sm">Interactive maps & information</p>
                </div>
              </div>
            </div>

            <div className="relative h-56 sm:h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop&auto=format&q=75"
                alt="Modern restaurant with digital menu displays"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 sm:p-6">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">QSR Menu Boards</h3>
                  <p className="text-white/80 text-sm">Digital menus & nutritional info</p>
                </div>
              </div>
            </div>

            <div className="relative h-56 sm:h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=400&fit=crop&auto=format&q=75"
                alt="Corporate office lobby with professional digital displays"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 sm:p-6">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">Corporate Communications</h3>
                  <p className="text-white/80 text-sm">Company news & announcements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* About Us Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
            About Ivaa Media
          </h2>
          <div className="text-left space-y-4 text-slate-600 leading-relaxed">
            <p className="text-base sm:text-lg">
              Ivaa Media is a brand of <strong>Ivaa Group UK Ltd</strong>, registered in England and Wales (Company No. 15729281).
              We are a leading provider of digital signage solutions, empowering businesses across the UK to transform their customer experience
              through innovative display technology.
            </p>
            <p className="text-base sm:text-lg">
              Our cloud-based platform enables businesses to manage their digital displays effortlessly, delivering engaging content
              that drives sales and enhances customer engagement. From retail stores to restaurants, our solutions are trusted by
              hundreds of businesses nationwide.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
            Join hundreds of successful businesses using Ivaa Media to enhance their customer experience.
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/login" className="w-full xs:w-auto">
              <Button size="lg" variant="secondary" className="w-full xs:w-auto min-w-[180px] text-sm sm:text-base">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-3 sm:mb-4">
                <Image
                  src="/logo.png"
                  alt="Ivaa Media"
                  width={28}
                  height={28}
                  className="h-6 w-6 sm:h-8 sm:w-8 mr-2"
                />
                <span className="text-lg sm:text-xl font-bold text-white">Ivaa Media</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Ivaa Media is a brand of Ivaa Group UK Ltd, registered in England and Wales (Company No. 15729281).
              </p>
              <div className="space-y-2 text-sm">
                <p><strong className="text-white">Contact:</strong> info@ivaamedia.uk</p>
                <p><strong className="text-white">Business Address:</strong><br />
                128 City Road, London, England, EC1V 2NX</p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="mailto:info@ivaamedia.uk" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2024 Ivaa Group UK Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}