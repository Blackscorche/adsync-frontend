'use client';
import { toast } from 'sonner';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api, { postcodeAPI } from '@/lib/api';
import { SHOP_TYPES, PROMOTION_TYPES, DISPLAY_FIXED_AT } from '@/lib/constants';

export default function RegisterShop() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    city: '',
    postcode: '',
    shopPhone: '',
    shopType: 'retail',
    vatNumber: '',
    promotionType: '',
    displayFixedAt: '',
    wifiConnection: 'true',
    wifiDistance: '',
    cableSupport: 'false',
    cableLength: '',

    ownerEmail: '',
    ownerPassword: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: ''
  });

  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [windowsPhoto, setWindowsPhoto] = useState<File | null>(null);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePostcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const postcode = e.target.value;
    setFormData({
      ...formData,
      postcode: postcode
    });

    if (!postcode) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    if (postcodePattern.test(postcode.replace(/\s/g, ''))) {
      await lookupPostcode(postcode);
    }
  };

  const lookupPostcode = async (postcode: string) => {
    setPostcodeLoading(true);
    try {
      const addressResponse = await postcodeAPI.getAddresses(postcode);
      if (addressResponse.success && addressResponse.addresses?.length > 0) {
        setAddressSuggestions(addressResponse.addresses);
        setShowAddressSuggestions(true);
      } else {
        const basicResponse = await postcodeAPI.lookup(postcode);
        if (basicResponse.success && basicResponse.data) {
          const data = basicResponse.data;
          setFormData(prev => ({
            ...prev,
            city: data.city || '',
          }));
        }
      }
    } catch (error) {
      console.error('Postcode lookup failed:', error);
    } finally {
      setPostcodeLoading(false);
    }
  };

  const selectAddress = (address: any) => {
    setFormData(prev => ({
      ...prev,
      address: address.line1 || '',
      city: address.city || '',
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (shopPhoto) {
        submitData.append('shopPhoto', shopPhoto);
      }
      if (windowsPhoto) {
        submitData.append('windowsPhoto', windowsPhoto);
      }

      const response = await api.post('/sales/register-shop', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Shop registered successfully! Pending admin approval.');

      router.push('/sales/shops');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Register New Shop</h1>
        <p className="text-gray-600 mt-1">Register a shop and create owner account</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  placeholder="Enter shop name"
                />
              </div>

              <div>
                <Label htmlFor="shopType">Shop Type</Label>
                <Select
                  value={formData.shopType}
                  onValueChange={(value) => setFormData({ ...formData, shopType: value })}
                >
                  <SelectTrigger>
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

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="relative" ref={addressDropdownRef}>
                <Label htmlFor="postcode">Postcode</Label>
                <div className="relative">
                  <Input
                    id="postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handlePostcodeChange}
                    placeholder="Enter postcode (e.g. SW1A 1AA)"
                    className="pr-10"
                  />
                  {postcodeLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-500 border-b">
                      Select an address or continue typing manually:
                    </div>
                    {addressSuggestions.map((address, index) => (
                      <button
                        key={address.id || index}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => selectAddress(address)}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {address.line1}
                        </div>
                        {address.line2 && (
                          <div className="text-sm text-gray-600">{address.line2}</div>
                        )}
                        <div className="text-sm text-gray-500">
                          {address.city}, {address.postcode}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="shopPhone">Shop Phone</Label>
                <Input
                  id="shopPhone"
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <Label htmlFor="vatNumber">VAT Number *</Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  placeholder="GB123456789"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  UK VAT registration number (required for invoicing)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="promotionType">Promotion Type *</Label>
                <Select
                  value={formData.promotionType}
                  onValueChange={(value) => setFormData({ ...formData, promotionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select promotion type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMOTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="displayFixedAt">Display Fixed At *</Label>
                <Select
                  value={formData.displayFixedAt}
                  onValueChange={(value) => setFormData({ ...formData, displayFixedAt: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPLAY_FIXED_AT.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="wifiConnection">WiFi Connection *</Label>
                <Select
                  value={formData.wifiConnection}
                  onValueChange={(value) => setFormData({ ...formData, wifiConnection: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="wifiDistance">WiFi Distance (meters) *</Label>
                <Input
                  id="wifiDistance"
                  name="wifiDistance"
                  type="number"
                  value={formData.wifiDistance}
                  onChange={handleChange}
                  placeholder="Distance in meters"
                />
              </div>

              <div>
                <Label htmlFor="cableSupport">Cable Support *</Label>
                <Select
                  value={formData.cableSupport}
                  onValueChange={(value) => setFormData({ ...formData, cableSupport: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cableLength">Cable Length (meters)</Label>
                <Input
                  id="cableLength"
                  name="cableLength"
                  type="number"
                  value={formData.cableLength}
                  onChange={handleChange}
                  placeholder="Length in meters (optional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shop Owner Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerFirstName">First Name *</Label>
                <Input
                  id="ownerFirstName"
                  name="ownerFirstName"
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                />
              </div>

              <div>
                <Label htmlFor="ownerLastName">Last Name *</Label>
                <Input
                  id="ownerLastName"
                  name="ownerLastName"
                  value={formData.ownerLastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerEmail">Email Address *</Label>
                <Input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  required
                  placeholder="owner@example.com"
                />
              </div>

              <div>
                <Label htmlFor="ownerPassword">Password *</Label>
                <Input
                  id="ownerPassword"
                  name="ownerPassword"
                  type="password"
                  value={formData.ownerPassword}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input
                id="ownerPhone"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shopPhoto">Shop Photo (Optional)</Label>
                <div className="mt-2">
                  <label
                    htmlFor="shopPhoto"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                  >
                    {shopPhoto ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="text-sm text-green-700 font-medium">{shopPhoto.name}</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
                      </div>
                    )}
                    <Input
                      id="shopPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setShopPhoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {shopPhoto && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2">
                      <span className="text-sm text-green-700 font-medium truncate">
                        {shopPhoto.name} ({(shopPhoto.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShopPhoto(null)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="windowsPhoto">Windows Photo (Optional)</Label>
                <div className="mt-2">
                  <label
                    htmlFor="windowsPhoto"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                  >
                    {windowsPhoto ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="text-sm text-green-700 font-medium">{windowsPhoto.name}</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
                      </div>
                    )}
                    <Input
                      id="windowsPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setWindowsPhoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {windowsPhoto && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2">
                      <span className="text-sm text-green-700 font-medium truncate">
                        {windowsPhoto.name} ({(windowsPhoto.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setWindowsPhoto(null)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/sales/shops')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Registering...' : 'Register Shop'}
          </Button>
        </div>
      </form>
    </div>
  );
}