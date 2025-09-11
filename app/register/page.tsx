'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Mail, Lock, Phone, MapPin, Search, FileText, AlertCircle } from 'lucide-react';
import { authAPI, postcodeAPI } from '@/lib/api';
import TermsModal from '@/components/terms-modal';

const SHOP_TYPES = [
  { value: 'retail', label: 'Retail Store' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'salon', label: 'Salon' },
  { value: 'gym', label: 'Gym' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' }
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    shopName: '',
    shopType: 'retail',
    address: '',
    postcode: '',
    city: '',
    country: 'UK',
    termsAccepted: false,
    termsAcceptedDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.termsAccepted) {
      setShowTerms(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { token, user } = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'owner',
        shopName: formData.shopName,
        shopType: formData.shopType,
        address: formData.address,
        postcode: formData.postcode,
        city: formData.city,
        country: formData.country,
        termsAccepted: formData.termsAccepted,
        termsAcceptedDate: formData.termsAcceptedDate
      });

      // Store token and redirect
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/owner');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePostcodeLookup = async () => {
    if (!formData.postcode) {
      setPostcodeError('Please enter a postcode');
      return;
    }

    setPostcodeLoading(true);
    setPostcodeError('');

    try {
      const result = await postcodeAPI.lookup(formData.postcode);
      
      if (result.success) {
        const city = result.data.city || result.data.district || '';
        setFormData({
          ...formData,
          city: city
        });
      } else {
        setPostcodeError('Postcode not found');
      }
    } catch (error) {
      setPostcodeError('Invalid postcode or lookup failed');
    } finally {
      setPostcodeLoading(false);
    }
  };

  const handleTermsAccept = () => {
    setFormData({
      ...formData,
      termsAccepted: true,
      termsAcceptedDate: new Date().toISOString()
    });
    setShowTerms(false);
  };

  const handleTermsDecline = () => {
    setFormData({
      ...formData,
      termsAccepted: false
    });
    setShowTerms(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="group">
              <Image
                src="/logo.png"
                alt="Ivaa Media"
                width={60}
                height={60}
                className="w-12 h-12 group-hover:scale-110 transition-transform"
              />
            </Link>
          </div>
          <Link href="/">
            <CardTitle className="text-2xl font-bold hover:text-blue-600 transition-colors cursor-pointer">Register Your Shop</CardTitle>
          </Link>
          <CardDescription>
            Create your account to start managing digital signage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+44 20 1234 5678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Information */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Shop Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="shopName"
                      name="shopName"
                      placeholder="My Shop"
                      value={formData.shopName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopType">Shop Type *</Label>
                  <Select
                    value={formData.shopType}
                    onValueChange={(value) => setFormData({ ...formData, shopType: value })}
                  >
                    <SelectTrigger id="shopType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode">UK Postcode *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="postcode"
                      name="postcode"
                      placeholder="SW1A 1AA"
                      value={formData.postcode}
                      onChange={handleChange}
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePostcodeLookup}
                      disabled={postcodeLoading}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {postcodeError && (
                    <p className="text-xs text-destructive">{postcodeError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="London"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Terms and Conditions</p>
                  <p className="text-xs text-muted-foreground">
                    {formData.termsAccepted 
                      ? `Accepted on ${new Date(formData.termsAcceptedDate).toLocaleDateString()}`
                      : 'You must accept the terms to continue'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={formData.termsAccepted ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowTerms(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {formData.termsAccepted ? 'Review' : 'View Terms'}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground text-center w-full space-y-2">
            <div>
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            <div>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                ← Back to Home
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>

      <TermsModal 
        open={showTerms}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    </div>
  );
}