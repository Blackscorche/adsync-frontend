'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Mail, Lock, Phone, MapPin, Search, FileText, AlertCircle, Home, Camera, Upload, X } from 'lucide-react';
import { authAPI, postcodeAPI } from '@/lib/api';
import TermsModal from '@/components/terms-modal';

const SHOP_TYPES = [
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'convenience', label: 'Convenience Store' },
  { value: 'phone_shop', label: 'Phone Shop' },
  { value: 'electronics', label: 'Electronics Store' },
  { value: 'clothing', label: 'Clothing Store' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'pizza', label: 'Pizza Shop' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar/Pub' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'salon', label: 'Beauty Salon' },
  { value: 'barber', label: 'Barber Shop' },
  { value: 'gym', label: 'Gym/Fitness' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'clinic', label: 'Clinic/Medical' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' }
];

export default function RegisterPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    shopName: '',
    shopType: 'supermarket',
    addressLine1: '',
    addressLine2: '',
    postcode: '',
    city: '',
    county: '',
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
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', 'owner');
      formDataToSend.append('shopName', formData.shopName);
      formDataToSend.append('shopType', formData.shopType);
      formDataToSend.append('address', `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}`);
      formDataToSend.append('postcode', formData.postcode);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('county', formData.county);
      formDataToSend.append('termsAccepted', String(formData.termsAccepted));
      formDataToSend.append('termsAcceptedDate', formData.termsAcceptedDate);
      
      if (shopPhoto) {
        formDataToSend.append('shopPhoto', shopPhoto);
      }

      const { token, user } = await authAPI.registerWithPhoto(formDataToSend);

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
    setShowAddressDropdown(false);

    try {
      const addressResult = await postcodeAPI.getAddresses(formData.postcode);
      
      if (addressResult.success && addressResult.addresses.length > 0) {
        const firstAddress = addressResult.addresses[0];
        setFormData({
          ...formData,
          city: firstAddress.city || '',
          county: firstAddress.county || ''
        });
        
        setAddressList(addressResult.addresses);
        setShowAddressDropdown(true);
        setPostcodeError('');
      } else if (addressResult.note) {
        setPostcodeError('Daily limit reached. Please enter address manually.');
      } else {
        setPostcodeError('Invalid postcode');
      }
    } catch (error) {
      setPostcodeError('Invalid postcode');
    } finally {
      setPostcodeLoading(false);
    }
  };


  const handleTermsAccept = async () => {
    const updatedFormData = {
      ...formData,
      termsAccepted: true,
      termsAcceptedDate: new Date().toISOString()
    };
    setFormData(updatedFormData);
    setShowTerms(false);
    
    setTimeout(() => {
      document.getElementById('register-form')?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    }, 100);
  };

  const handleAddressSelect = (addressId: string) => {
    const address = addressList.find(addr => addr.id === addressId);
    if (address) {
      setFormData({
        ...formData,
        addressLine1: address.line1,
        addressLine2: address.line2 || '',
        city: address.city,
        county: address.county || ''
      });
      setShowAddressDropdown(false);
    }
  };

  const handleTermsDecline = () => {
    setFormData({
      ...formData,
      termsAccepted: false
    });
    setShowTerms(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressDropdown]);

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
          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="shopPhoto">Shop Photo</Label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative w-24 h-24">
                      <img
                        src={photoPreview}
                        alt="Shop preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShopPhoto(null);
                          setPhotoPreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="shopPhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setShopPhoto(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Label
                      htmlFor="shopPhoto"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a photo of the shop front (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

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
                    title="Look up address"
                  >
                    <Search className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Find Address</span>
                  </Button>
                </div>
                {postcodeError && (
                  <p className="text-xs text-destructive">{postcodeError}</p>
                )}
                
                {/* Address Dropdown */}
                {showAddressDropdown && addressList.length > 0 && (
                  <div ref={dropdownRef} className="mt-2 p-2 border rounded-md bg-background shadow-lg max-h-60 overflow-y-auto">
                    <p className="text-sm font-medium mb-2">Select your address:</p>
                    <div className="space-y-1">
                      {addressList.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => handleAddressSelect(address.id)}
                          className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
                        >
                          <div className="font-medium">{address.line1}</div>
                          {address.line2 && (
                            <div className="text-muted-foreground text-xs">{address.line2}</div>
                          )}
                          <div className="text-muted-foreground text-xs">
                            {address.city}, {address.postcode}
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm text-primary"
                      >
                        <Home className="inline h-3 w-3 mr-1" />
                        Enter address manually
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      placeholder="123 Main Street"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    placeholder="Floor 2, Suite 5"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    name="county"
                    placeholder="Greater London"
                    value={formData.county}
                    onChange={handleChange}
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