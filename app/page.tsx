'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Store, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Shield,
  Zap,
  Globe,
  PlayCircle,
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

  const testimonials = [
    {
      name: 'James Mitchell',
      role: 'Marketing Director, London Fashion Retail',
      content: 'Ivaa Media transformed how we manage our in-store displays. We can now update promotions across 50 locations instantly.',
      rating: 5
    },
    {
      name: 'Sophie Williams',
      role: 'Owner, Manchester Restaurant Group',
      content: 'The best digital signage solution we\'ve used. Simple, powerful, and reliable. Our sales increased by 30% after implementation.',
      rating: 5
    },
    {
      name: 'David Thompson',
      role: 'Operations Manager, Birmingham Electronics',
      content: 'Outstanding platform with excellent support. The analytics help us understand what content drives the most engagement.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Ivaa Media"
                width={32}
                height={32}
                className="h-8 w-8 mr-2"
              />
              <span className="text-xl font-bold text-slate-900">Ivaa Media</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#benefits" className="text-slate-600 hover:text-slate-900 transition">Benefits</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition">Testimonials</a>
              <Link href="/login">
                <Button className="ml-4">Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-slate-600 hover:text-slate-900">Features</a>
              <a href="#benefits" className="block text-slate-600 hover:text-slate-900">Benefits</a>
              <a href="#testimonials" className="block text-slate-600 hover:text-slate-900">Testimonials</a>
              <Link href="/login" className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="inline-flex items-center gap-2" variant="secondary">
                <Star className="h-3 w-3" />
                Trusted by 500+ businesses across the UK
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Transform Your Retail Space with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Digital Signage
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Manage your digital displays across multiple locations from one powerful dashboard. 
                Boost sales, enhance customer experience, and stay ahead of the competition.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                  alt="Digital signage dashboard management interface"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">+47%</p>
                    <p className="text-sm text-slate-600">Sales increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful features designed for modern retail businesses. Manage content, track performance, and scale effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature showcase images */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop"
                alt="Content management dashboard interface"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Content Management</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&h=300&fit=crop"
                alt="Digital menu boards in restaurant"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Digital Menu Boards</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&h=300&fit=crop"
                alt="Network operations center with multiple screens"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Central Control Room</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
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
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop"
                alt="Digital signage screen showing content"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Perfect for Every Business Type
            </h2>
            <p className="text-xl text-slate-600">
              From restaurants to retail stores, our platform adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=400&fit=crop"
                alt="Digital display showing promotional content"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Retail Promotions</h3>
                  <p className="text-white/80 text-sm">Dynamic pricing & special offers</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1493421419110-74f4e85ba126?w=400&h=400&fit=crop"
                alt="Digital wayfinding display"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Wayfinding & Directory</h3>
                  <p className="text-white/80 text-sm">Interactive maps & information</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=400&fit=crop"
                alt="Digital menu display board"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-lg">QSR Menu Boards</h3>
                  <p className="text-white/80 text-sm">Digital menus & nutritional info</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-64 overflow-hidden rounded-lg group">
              <img
                src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&h=400&fit=crop"
                alt="Corporate lobby digital display"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Corporate Communications</h3>
                  <p className="text-white/80 text-sm">Company news & announcements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Loved by Businesses Across the UK
            </h2>
            <p className="text-xl text-slate-600">
              See what our customers have to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of successful businesses using Ivaa Media to enhance their customer experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="Ivaa Media"
                  width={32}
                  height={32}
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-bold text-white">Ivaa Media</span>
              </div>
              <p className="text-sm">
                The UK\'s leading digital signage platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Ivaa Media. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}