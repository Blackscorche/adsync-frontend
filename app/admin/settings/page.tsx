'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Settings,
  DollarSign,
  Monitor,
  Percent,
  Upload,
  Save,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
}

interface ScreenSize {
  id: number;
  size_inches: number;
  width_px: number;
  height_px: number;
  monthly_fee: number;
  description: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [screenSizes, setScreenSizes] = useState<ScreenSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingScreen, setEditingScreen] = useState<ScreenSize | null>(null);
  const [newScreen, setNewScreen] = useState({
    size_inches: '',
    width_px: '',
    height_px: '',
    monthly_fee: '',
    description: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchScreenSizes();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      // Set default values for demonstration
      setSettings([
        { key: 'currency_symbol', value: '£', description: 'Currency symbol' },
        { key: 'free_uploads_per_month', value: '1', description: 'Free content uploads per shop per month' },
        { key: 'extra_upload_price', value: '3.00', description: 'Price for each extra upload' },
        { key: 'commission_percentage', value: '10', description: 'Sales team commission percentage' },
        { key: 'payment_day', value: '15', description: 'Day of month for commission payments' },
        { key: 'support_email', value: 'support@ivaa.com', description: 'Support email address' },
        { key: 'max_file_size_mb', value: '100', description: 'Maximum upload file size in MB' },
        { key: 'auto_approve_delay_hours', value: '48', description: 'Hours before auto-approval (0 to disable)' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchScreenSizes = async () => {
    try {
      const response = await fetch('/api/admin/screen-sizes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch screen sizes');

      const data = await response.json();
      setScreenSizes(data);
    } catch (error) {
      console.error('Error fetching screen sizes:', error);
      // Set default values for demonstration
      setScreenSizes([
        { id: 1, size_inches: 32, width_px: 1920, height_px: 1080, monthly_fee: 29.99, description: 'Standard HD Display' },
        { id: 2, size_inches: 43, width_px: 3840, height_px: 2160, monthly_fee: 49.99, description: '4K Display' },
        { id: 3, size_inches: 55, width_px: 3840, height_px: 2160, monthly_fee: 79.99, description: 'Large 4K Display' },
        { id: 4, size_inches: 65, width_px: 3840, height_px: 2160, monthly_fee: 99.99, description: 'Premium Large Display' }
      ]);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value })
      });

      if (!response.ok) throw new Error('Failed to update setting');

      toast.success('Setting updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  const saveAllSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('All settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addScreenSize = async () => {
    if (!newScreen.size_inches || !newScreen.monthly_fee) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/screen-sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newScreen)
      });

      if (!response.ok) throw new Error('Failed to add screen size');

      toast.success('Screen size added successfully');
      setNewScreen({
        size_inches: '',
        width_px: '',
        height_px: '',
        monthly_fee: '',
        description: ''
      });
      fetchScreenSizes();
    } catch (error) {
      toast.error('Failed to add screen size');
    }
  };

  const updateScreenSize = async (id: number, data: Partial<ScreenSize>) => {
    try {
      const response = await fetch(`/api/admin/screen-sizes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update screen size');

      toast.success('Screen size updated successfully');
      setEditingScreen(null);
      fetchScreenSizes();
    } catch (error) {
      toast.error('Failed to update screen size');
    }
  };

  const deleteScreenSize = async (id: number) => {
    if (!confirm('Are you sure you want to delete this screen size?')) return;

    try {
      const response = await fetch(`/api/admin/screen-sizes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete screen size');

      toast.success('Screen size deleted successfully');
      fetchScreenSizes();
    } catch (error) {
      toast.error('Failed to delete screen size');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and pricing
          </p>
        </div>
        <Button onClick={saveAllSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="screens">Screen Sizes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Basic system settings and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings
                  .filter(s => !s.key.includes('price') && !s.key.includes('commission') && !s.key.includes('payment'))
                  .map((setting) => (
                    <div key={setting.key} className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Label className="font-medium">{setting.key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Input
                        value={setting.value}
                        onChange={(e) => {
                          const updated = settings.map(s =>
                            s.key === setting.key ? { ...s, value: e.target.value } : s
                          );
                          setSettings(updated);
                        }}
                        className="col-span-2"
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Commission rates and pricing settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings
                  .filter(s => s.key.includes('price') || s.key.includes('commission') || s.key.includes('payment'))
                  .map((setting) => (
                    <div key={setting.key} className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Label className="font-medium">{setting.key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        {setting.key.includes('price') && <DollarSign className="h-4 w-4 text-muted-foreground" />}
                        {setting.key.includes('percentage') && <Percent className="h-4 w-4 text-muted-foreground" />}
                        <Input
                          value={setting.value}
                          onChange={(e) => {
                            const updated = settings.map(s =>
                              s.key === setting.key ? { ...s, value: e.target.value } : s
                            );
                            setSettings(updated);
                          }}
                          type={setting.key.includes('price') || setting.key.includes('percentage') ? 'number' : 'text'}
                          step="0.01"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screen Sizes */}
        <TabsContent value="screens">
          <Card>
            <CardHeader>
              <CardTitle>Screen Size Pricing</CardTitle>
              <CardDescription>Configure pricing for different screen sizes</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add New Screen Size */}
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-3">Add New Screen Size</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <Label>Size (inches)</Label>
                    <Input
                      placeholder="32"
                      value={newScreen.size_inches}
                      onChange={(e) => setNewScreen({ ...newScreen, size_inches: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Width (px)</Label>
                    <Input
                      placeholder="1920"
                      value={newScreen.width_px}
                      onChange={(e) => setNewScreen({ ...newScreen, width_px: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Height (px)</Label>
                    <Input
                      placeholder="1080"
                      value={newScreen.height_px}
                      onChange={(e) => setNewScreen({ ...newScreen, height_px: e.target.value })}
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>Monthly Fee (£)</Label>
                    <Input
                      placeholder="29.99"
                      value={newScreen.monthly_fee}
                      onChange={(e) => setNewScreen({ ...newScreen, monthly_fee: e.target.value })}
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Standard HD"
                      value={newScreen.description}
                      onChange={(e) => setNewScreen({ ...newScreen, description: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="mt-3" onClick={addScreenSize}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Screen Size
                </Button>
              </div>

              {/* Screen Sizes Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Resolution</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenSizes.map((screen) => (
                    <TableRow key={screen.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{screen.size_inches}"</span>
                        </div>
                      </TableCell>
                      <TableCell>{screen.width_px} × {screen.height_px}</TableCell>
                      <TableCell>
                        <Badge variant="outline">£{screen.monthly_fee.toFixed(2)}</Badge>
                      </TableCell>
                      <TableCell>{screen.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingScreen(screen)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteScreenSize(screen.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">Email Integration</p>
                    <p className="text-sm text-muted-foreground">
                      System is configured to use Resend for email notifications.
                      Update API keys in environment variables.
                    </p>
                  </div>
                </Alert>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">New Shop Registration</p>
                      <p className="text-sm text-muted-foreground">Notify admin when new shop registers</p>
                    </div>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Content Approval</p>
                      <p className="text-sm text-muted-foreground">Notify shop owner when content is reviewed</p>
                    </div>
                    <Badge>Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Commission Payment</p>
                      <p className="text-sm text-muted-foreground">Notify sales team when commission is paid</p>
                    </div>
                    <Badge>Enabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}