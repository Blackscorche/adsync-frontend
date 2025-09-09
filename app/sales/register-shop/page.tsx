'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Monitor,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { shopsAPI } from '@/lib/api';

export default function RegisterShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    screenCount: '1',
    subscriptionPlan: 'basic',
    notes: ''
  });

  const [ownerCredentials, setOwnerCredentials] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Generate credentials for the owner
      const generatedPassword = generatePassword();
      
      // In production, this would call the API
      // const response = await shopsAPI.create({
      //   ...formData,
      //   ownerPassword: generatedPassword,
      //   salesRepId: getUserId() // Get from auth context
      // });

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));

      setOwnerCredentials({
        email: formData.ownerEmail,
        password: generatedPassword
      });
      
      setSuccess(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        router.push('/sales/portfolio');
      }, 5000);
      
    } catch (err) {
      setError('Failed to register shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register New Shop</h1>
        <p className="text-muted-foreground">Add a new shop to your portfolio</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Shop registered successfully!</p>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm font-medium mb-2">Owner Login Credentials:</p>
                <p className="text-sm">Email: <span className="font-mono">{ownerCredentials.email}</span></p>
                <p className="text-sm">Password: <span className="font-mono">{ownerCredentials.password}</span></p>
                <p className="text-xs text-muted-foreground mt-2">Please share these credentials with the shop owner securely.</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
            <CardDescription>Basic details about the shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name *</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shopName"
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    placeholder="Enter shop name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenCount">Number of Screens *</Label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="screenCount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.screenCount}
                    onChange={(e) => handleInputChange('screenCount', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Shop Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete shop address"
                  className="pl-10 min-h-[80px]"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Owner Information</CardTitle>
            <CardDescription>Contact details for the shop owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="Enter owner name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ownerPhone"
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    placeholder="+855 XX XXX XXX"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  placeholder="owner@example.com"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Login credentials will be generated and sent to this email</p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>Select the appropriate plan for this shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plan Type *</Label>
              <Select value={formData.subscriptionPlan} onValueChange={(value) => handleInputChange('subscriptionPlan', value)}>
                <SelectTrigger id="plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - $99/month (1-2 screens)</SelectItem>
                  <SelectItem value="standard">Standard - $199/month (3-5 screens)</SelectItem>
                  <SelectItem value="premium">Premium - $399/month (6-10 screens)</SelectItem>
                  <SelectItem value="enterprise">Enterprise - Custom pricing (10+ screens)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/sales')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Shop'}
          </Button>
        </div>
      </form>
    </div>
  );
}